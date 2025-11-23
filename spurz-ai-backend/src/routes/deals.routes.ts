import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import Deal from '../models/Deal';
import DealMatchingService from '../services/DealMatchingService';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /deals
 * Get personalized deals for user
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id as any;
    const { category, city, isFeatured, limit = '20' } = req.query;

    // Build filter
    const filter: any = {
      isActive: true,
      status: 'active',
      endDate: { $gte: new Date() },
    };

    if (category) {
      filter.category = category;
    }

    if (city) {
      filter.$or = [
        { isOnline: true },
        { locations: city },
      ];
    }

    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }

    // Get personalized deals
    const personalizedDeals = await DealMatchingService.getPersonalizedDeals(
      userId,
      filter,
      parseInt(limit as string, 10)
    );

    res.json({
      deals: personalizedDeals.map(deal => ({
        id: deal._id,
        merchantName: deal.merchantName,
        merchantLogo: deal.merchantLogo,
        category: deal.category,
        dealType: deal.dealType,
        title: deal.title,
        description: deal.description,
        value: deal.value,
        maxDiscount: deal.maxDiscount,
        minTransaction: deal.minTransaction,
        startDate: deal.startDate,
        endDate: deal.endDate,
        isOnline: deal.isOnline,
        dealUrl: deal.dealUrl,
        locations: deal.locations,
        termsAndConditions: deal.termsAndConditions,
        isFeatured: deal.isFeatured,
        cardOffers: deal.cardOffers.map(offer => ({
          bankName: offer.bankName,
          cardName: offer.cardName,
          additionalDiscount: offer.additionalDiscount,
        })),
        engagement: {
          views: deal.views,
          clicks: deal.clicks,
          redemptions: deal.redemptions,
          popularityScore: deal.popularity,
        },
      })),
      meta: {
        total: personalizedDeals.length,
        filters: { category, city, isFeatured },
      },
    });
  } catch (error) {
    logger.error('Error getting deals:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get deals',
    });
  }
});

/**
 * GET /deals/:id
 * Get deal details with best card recommendation
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id as any;

    const deal = await Deal.findById(id);

    if (!deal || !deal.isActive) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Deal not found',
      });
      return;
    }

    // Track view
    await DealMatchingService.trackDealView(id, userId);

    // Get best card match
    const cardMatch = await DealMatchingService.matchDealsWithUserCards(userId, deal._id);

    res.json({
      deal: {
        id: deal._id,
        merchantName: deal.merchantName,
        merchantLogo: deal.merchantLogo,
        category: deal.category,
        dealType: deal.dealType,
        title: deal.title,
        description: deal.description,
        value: deal.value,
        maxDiscount: deal.maxDiscount,
        minTransaction: deal.minTransaction,
        startDate: deal.startDate,
        endDate: deal.endDate,
        isOnline: deal.isOnline,
        dealUrl: deal.dealUrl,
        locations: deal.locations,
        termsAndConditions: deal.termsAndConditions,
        isFeatured: deal.isFeatured,
        cardOffers: deal.cardOffers,
      },
      cardRecommendation: cardMatch ? {
        userCard: cardMatch.bestUserCard ? {
          id: cardMatch.bestUserCard._id,
          name: cardMatch.bestUserCard.cardName,
          bank: cardMatch.bestUserCard.bankName,
          savings: cardMatch.additionalCardSavings,
        } : null,
        marketCard: cardMatch.bestMarketCard ? {
          id: cardMatch.bestMarketCard._id,
          name: cardMatch.bestMarketCard.cardName,
          bank: cardMatch.bestMarketCard.bankName,
          savings: cardMatch.additionalCardSavings,
        } : null,
        baseSavings: cardMatch.baseSavings,
        additionalCardSavings: cardMatch.additionalCardSavings,
        totalSavings: cardMatch.totalSavings,
        bestOption: cardMatch.bestUserCard ? 'user' : (cardMatch.bestMarketCard ? 'market' : 'none'),
      } : null,
    });
  } catch (error) {
    logger.error('Error getting deal details:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get deal details',
    });
  }
});

/**
 * GET /deals/:id/best-card
 * Get best card for a specific deal
 */
router.get('/:id/best-card', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id as any;

    const deal = await Deal.findById(id);

    if (!deal) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Deal not found',
      });
      return;
    }

    const cardMatch = await DealMatchingService.matchDealsWithUserCards(userId, deal._id);

    if (!cardMatch) {
      res.json({
        message: 'No card recommendations available for this deal',
        deal: {
          id: deal._id,
          merchantName: deal.merchantName,
          category: deal.category,
        },
      });
      return;
    }

    res.json({
      bestCard: cardMatch.bestUserCard || cardMatch.bestMarketCard,
      allOptions: {
        userCard: cardMatch.bestUserCard,
        marketCard: cardMatch.bestMarketCard,
      },
      savings: {
        baseSavings: cardMatch.baseSavings,
        additionalCardSavings: cardMatch.additionalCardSavings,
        totalSavings: cardMatch.totalSavings,
      },
    });
  } catch (error) {
    logger.error('Error getting best card for deal:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get best card',
    });
  }
});

/**
 * POST /deals/:id/click
 * Track deal click
 */
router.post('/:id/click', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id as any;

    await DealMatchingService.trackDealClick(id, userId);

    res.json({
      message: 'Click tracked successfully',
    });
  } catch (error) {
    logger.error('Error tracking deal click:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to track click',
    });
  }
});

/**
 * POST /deals/:id/redeem
 * Track deal redemption
 */
router.post('/:id/redeem', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id as any;

    await DealMatchingService.trackDealRedemption(id, userId);

    res.json({
      message: 'Redemption tracked successfully',
    });
  } catch (error) {
    logger.error('Error tracking deal redemption:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to track redemption',
    });
  }
});

/**
 * GET /deals/category/:category/best-combos
 * Get optimal card-deal combinations for a category
 */
router.get('/category/:category/best-combos', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { category } = req.params;
    const { limit = '10' } = req.query;
    const userId = req.user.id as any;

    const combos = await DealMatchingService.findOptimalCardDealCombos(
      userId,
      category as any,
      parseInt(limit as string, 10)
    );

    res.json({
      category,
      combos: combos.map(combo => ({
        deal: {
          id: combo.deal._id,
          merchantName: combo.deal.merchantName,
          title: combo.deal.title,
          value: combo.deal.value,
        },
        card: {
          id: combo.isUserCard ? (combo.card as any)._id : (combo.card as any)._id,
          name: combo.isUserCard ? (combo.card as any).cardName : (combo.card as any).cardName,
          bank: combo.isUserCard ? (combo.card as any).bankName : (combo.card as any).bankName,
          isUserCard: combo.isUserCard,
        },
        totalValue: combo.totalValue,
        dealValue: combo.baseDealValue,
        cardBonus: combo.cardBonusValue,
      })),
      meta: {
        total: combos.length,
        category,
      },
    });
  } catch (error) {
    logger.error('Error getting card-deal combos:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get combos',
    });
  }
});

export default router;
