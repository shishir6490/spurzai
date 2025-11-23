import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import CardRecommendation from '../models/CardRecommendation';
import CardRecommendationService from '../services/CardRecommendationService';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /recommendations/cards
 * Get personalized card recommendations
 */
router.get('/cards', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id as any;
    const { type, includeViewed = 'false' } = req.query;

    // Build filter
    const filter: any = {
      userId,
      isActive: true,
      isDismissed: false,
      expiresAt: { $gt: new Date() },
    };

    if (type) {
      filter.type = type;
    }

    if (includeViewed !== 'true') {
      filter.isViewed = false;
    }

    // Get recommendations
    const recommendations = await CardRecommendation.find(filter)
      .sort({ priority: -1, score: -1 })
      .limit(20);

    res.json({
      recommendations: recommendations.map(rec => ({
        id: rec._id,
        type: rec.type,
        card: {
          id: rec.marketCardId || rec.userCardId,
          bankName: rec.bankName,
          cardName: rec.cardName,
          cardImageUrl: rec.cardImageUrl,
        },
        reasoning: {
          primaryReason: rec.primaryReason,
          reasons: rec.reasons,
        },
        impact: {
          estimatedMonthlySavings: rec.estimatedMonthlySavings,
          estimatedYearlySavings: rec.estimatedYearlySavings,
          estimatedRewards: rec.estimatedRewards,
        },
        context: {
          relevantCategories: rec.relevantCategories,
          relevantDeals: rec.relevantDeals,
        },
        score: rec.score,
        priority: rec.priority,
        isViewed: rec.isViewed,
        expiresAt: rec.expiresAt,
        daysUntilExpiry: (rec as any).daysUntilExpiry,
      })),
      meta: {
        total: recommendations.length,
        filters: { type, includeViewed },
      },
    });
  } catch (error) {
    logger.error('Error getting card recommendations:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get recommendations',
    });
  }
});

/**
 * GET /recommendations/cards/:id
 * Get single card recommendation details
 */
router.get('/cards/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id as any;

    const recommendation = await CardRecommendation.findOne({
      _id: id,
      userId,
    });

    if (!recommendation) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Recommendation not found',
      });
      return;
    }

    // Mark as viewed if not already
    if (!recommendation.isViewed) {
      recommendation.isViewed = true;
      recommendation.viewedAt = new Date();
      await recommendation.save();
    }

    res.json({
      recommendation: {
        id: recommendation._id,
        type: recommendation.type,
        card: {
          id: recommendation.marketCardId || recommendation.userCardId,
          bankName: recommendation.bankName,
          cardName: recommendation.cardName,
          cardImageUrl: recommendation.cardImageUrl,
        },
        reasoning: {
          primaryReason: recommendation.primaryReason,
          reasons: recommendation.reasons,
        },
        impact: {
          estimatedMonthlySavings: recommendation.estimatedMonthlySavings,
          estimatedYearlySavings: recommendation.estimatedYearlySavings,
          estimatedRewards: recommendation.estimatedRewards,
        },
        context: {
          relevantCategories: recommendation.relevantCategories,
          relevantDeals: recommendation.relevantDeals,
        },
        score: recommendation.score,
        priority: recommendation.priority,
        isViewed: recommendation.isViewed,
        isDismissed: recommendation.isDismissed,
        isApplied: recommendation.isApplied,
        expiresAt: recommendation.expiresAt,
        daysUntilExpiry: (recommendation as any).daysUntilExpiry,
      },
    });
  } catch (error) {
    logger.error('Error getting recommendation details:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get recommendation',
    });
  }
});

/**
 * POST /recommendations/cards/:id/dismiss
 * Dismiss a card recommendation
 */
router.post('/cards/:id/dismiss', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id as any;

    const recommendation = await CardRecommendation.findOne({
      _id: id,
      userId,
    });

    if (!recommendation) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Recommendation not found',
      });
      return;
    }

    recommendation.isDismissed = true;
    recommendation.dismissedAt = new Date();
    if (reason) {
      recommendation.dismissReason = reason;
    }

    await recommendation.save();

    res.json({
      message: 'Recommendation dismissed successfully',
    });
  } catch (error) {
    logger.error('Error dismissing recommendation:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to dismiss recommendation',
    });
  }
});

/**
 * POST /recommendations/cards/:id/apply
 * Mark recommendation as applied (user clicked to apply)
 */
router.post('/cards/:id/apply', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id as any;

    const recommendation = await CardRecommendation.findOne({
      _id: id,
      userId,
    });

    if (!recommendation) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Recommendation not found',
      });
      return;
    }

    recommendation.isApplied = true;
    recommendation.appliedAt = new Date();

    await recommendation.save();

    res.json({
      message: 'Application tracked successfully',
      card: {
        bankName: recommendation.bankName,
        cardName: recommendation.cardName,
      },
    });
  } catch (error) {
    logger.error('Error tracking application:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to track application',
    });
  }
});

/**
 * POST /recommendations/cards/refresh
 * Generate fresh card recommendations
 */
router.post('/cards/refresh', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id as any;

    await CardRecommendationService.generateRecommendations(userId);

    res.json({
      message: 'Recommendations refreshed successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error refreshing recommendations:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to refresh recommendations',
    });
  }
});

export default router;
