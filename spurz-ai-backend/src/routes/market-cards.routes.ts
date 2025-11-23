import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import MarketCreditCard from '../models/MarketCreditCard';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /market-cards
 * Browse all available credit cards in the market
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      category,
      bank,
      tier,
      network,
      rewardType,
      minRewardRate,
      maxAnnualFee,
      hasLounge,
      search,
      sortBy = 'popularity',
      limit = '50',
      page = '1',
    } = req.query;

    // Build filter
    const filter: any = { isActive: true };

    if (bank) {
      filter.bankName = { $regex: new RegExp(bank as string, 'i') };
    }

    if (tier) {
      filter.tier = tier;
    }

    if (network) {
      filter.network = network;
    }

    if (rewardType) {
      filter.rewardType = rewardType;
    }

    if (minRewardRate) {
      filter.baseRewardRate = { $gte: parseFloat(minRewardRate as string) };
    }

    if (maxAnnualFee) {
      filter.annualFee = { $lte: parseFloat(maxAnnualFee as string) };
    }

    if (category) {
      filter['rewardCategories.category'] = category;
    }

    if (hasLounge === 'true') {
      filter.features = 'lounge_access';
    }

    if (search) {
      filter.$text = { $search: search as string };
    }

    // Build sort
    const sort: any = {};
    switch (sortBy) {
      case 'popularity':
        sort.popularity = -1;
        break;
      case 'reward':
        sort.baseRewardRate = -1;
        break;
      case 'fee':
        sort.annualFee = 1;
        break;
      case 'name':
        sort.cardName = 1;
        break;
      default:
        sort.popularity = -1;
    }

    // Pagination
    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [cards, total] = await Promise.all([
      MarketCreditCard.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      MarketCreditCard.countDocuments(filter),
    ]);

    res.json({
      cards: cards.map(card => ({
        id: card._id,
        bankName: card.bankName,
        cardName: card.cardName,
        cardImageUrl: card.imageUrl,
        network: card.network,
        tier: card.tier,
        annualFee: card.annualFee,
        joiningFee: card.joiningFee,
        rewardType: card.rewardType,
        baseRewardRate: card.baseRewardRate,
        rewardCategories: card.rewardCategories.map(cat => ({
          category: cat.category,
          rewardRate: cat.rewardRate,
          cap: cat.cap,
        })),
        features: card.features,
        popularity: card.popularity,
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrevious: pageNum > 1,
      },
      filters: {
        category,
        bank,
        tier,
        network,
        rewardType,
        sortBy,
      },
    });
  } catch (error) {
    logger.error('Error getting market cards:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get market cards',
    });
  }
});

/**
 * GET /market-cards/:id
 * Get detailed information about a specific market card
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const card = await MarketCreditCard.findById(id);

    if (!card || !card.isActive) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Credit card not found',
      });
      return;
    }

    res.json({
      card: {
        id: card._id,
        bankName: card.bankName,
        cardName: card.cardName,
        cardImageUrl: card.imageUrl,
        cardUrl: (card as any).applyUrl || card.applyUrl,
        network: card.network,
        tier: card.tier,
        annualFee: card.annualFee,
        joiningFee: card.joiningFee,
        joiningBenefits: (card as any).joiningBenefits || card.welcomeBenefits,
        interestRate: card.interestRate,
        rewardType: card.rewardType,
        baseRewardRate: card.baseRewardRate,
        rewardCategories: card.rewardCategories.map(cat => ({
          category: cat.category,
          rewardRate: cat.rewardRate,
          cap: cat.cap,
          description: (cat as any).description || '',
        })),
        partnerMerchants: (card.partnerMerchants || []).map(partner => ({
          merchantName: partner.merchantName,
          category: partner.category,
          rewardRate: partner.specialRewardRate || 0,
          description: partner.offerDescription || '',
        })),
        features: card.features,
        eligibility: {
          minIncome: card.minIncome,
          minCreditScore: card.minCreditScore,
          ageRequirement: (card as any).ageRequirement || '18+',
          employmentTypes: (card as any).employmentTypes || [],
        },
        additionalInfo: {
          redemptionOptions: (card as any).redemptionOptions || [],
          redemptionMinimum: (card as any).redemptionMinimum || 0,
          statementCycle: (card as any).statementCycle || 'monthly',
          gracePeriod: (card as any).gracePeriod || 20,
          foreignExchangeMarkup: (card as any).foreignExchangeMarkup || 3.5,
        },
        metadata: {
          launchDate: (card as any).launchDate || card.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting market card details:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get card details',
    });
  }
});

/**
 * GET /market-cards/category/:category
 * Get best cards for a specific category
 */
router.get('/category/:category', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { category } = req.params;
    const { limit = '10' } = req.query;

    const cards = await MarketCreditCard.find({
      isActive: true,
      'rewardCategories.category': category,
    })
      .sort({ 'rewardCategories.rewardRate': -1, popularity: -1 })
      .limit(parseInt(limit as string, 10));

    res.json({
      category,
      cards: cards.map(card => {
        const categoryReward = card.rewardCategories.find(cat => cat.category === category);
        return {
          id: card._id,
          bankName: card.bankName,
          cardName: card.cardName,
          cardImageUrl: card.imageUrl,
          tier: card.tier,
          annualFee: card.annualFee,
          rewardRate: categoryReward?.rewardRate || card.baseRewardRate,
          rewardCap: categoryReward?.cap,
          features: card.features,
        };
      }),
    });
  } catch (error) {
    logger.error('Error getting cards by category:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get cards',
    });
  }
});

/**
 * GET /market-cards/compare
 * Compare multiple cards
 */
router.post('/compare', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { cardIds } = req.body;

    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'cardIds array is required',
      });
      return;
    }

    if (cardIds.length > 5) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Maximum 5 cards can be compared at once',
      });
      return;
    }

    const cards = await MarketCreditCard.find({
      _id: { $in: cardIds },
      isActive: true,
    });

    res.json({
      cards: cards.map(card => ({
        id: card._id,
        bankName: card.bankName,
        cardName: card.cardName,
        cardImageUrl: card.imageUrl,
        tier: card.tier,
        annualFee: card.annualFee,
        joiningFee: card.joiningFee,
        baseRewardRate: card.baseRewardRate,
        rewardCategories: card.rewardCategories,
        features: card.features,
        minIncome: card.minIncome,
        interestRate: card.interestRate,
      })),
      comparisonDate: new Date(),
    });
  } catch (error) {
    logger.error('Error comparing cards:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to compare cards',
    });
  }
});

export default router;
