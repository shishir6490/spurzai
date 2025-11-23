import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import HomeEngineService from '../services/HomeEngineService';
import InsightEngineService from '../services/InsightEngineService';
import NextBestActionService from '../services/NextBestActionService';
import MetricsService from '../services/MetricsService';
import UserProfile from '../models/UserProfile';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /home
 * Get comprehensive home dashboard data
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id as any;

    // Get user profile
    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User profile not found',
      });
      return;
    }

    // Generate snapshot
    const snapshot = await HomeEngineService.generateSnapshot(userId);

    // Get data completeness
    const completeness = await HomeEngineService.computeDataCompleteness(userId);

    // Get hero content
    const hero = await HomeEngineService.getHeroContent((snapshot.scenario as any) || 'unknown');

    // Get key stats
    const keyStats = await HomeEngineService.getKeyStats(userId);

    // Get snapshot metrics
    const metrics = await MetricsService.getMetrics(userId);

    // Generate insights
    const insights = await InsightEngineService.generateInsights(userId, snapshot._id, metrics);

    // Generate actions
    const actions = await NextBestActionService.generateActions(userId, snapshot._id, completeness);

    // Get best cards for categories
    const bestCardsForCategories = await HomeEngineService.getBestCardsForCategories(userId);

    // Response
    res.json({
      meta: {
        userId: userId.toString(),
        userName: profile.fullName || 'User',
        scenarioCode: snapshot.scenario || 'unknown',
        healthBand: snapshot.healthStatus,
        healthScore: snapshot.healthScore,
        lastUpdated: snapshot.updatedAt,
      },
      settings: {
        trackingEnabled: profile.settings?.trackingEnabled !== false, // Default to true
      },
      dataCompleteness: completeness,
      snapshot: {
        metrics,
      },
      hero: {
        title: hero.title,
        subtitle: hero.subtitle,
        pillText: hero.pillText,
        color: hero.color,
        priority: hero.priority,
      },
      keyStats,
      nudges: {
        message: completeness.completionPercentage < 100
          ? `Complete ${100 - completeness.completionPercentage}% more to unlock personalized insights`
          : 'All data complete! Explore your personalized recommendations.',
        showOnboarding: !completeness.hasBasicInfo || !completeness.hasSalaryInfo || !completeness.hasCardInfo,
      },
      insights: insights.map(insight => ({
        category: insight.category,
        priority: insight.priority,
        title: insight.title,
        description: insight.description,
        value: insight.value,
        trend: insight.trend,
        actionable: insight.actionable,
      })),
      nextBestActions: actions.map(action => ({
        id: action._id,
        type: action.type,
        title: action.title,
        description: action.description,
        icon: action.icon,
        priority: action.priority,
        estimatedImpact: action.estimatedImpact,
        estimatedSavings: action.estimatedSavings,
        status: action.status,
        metadata: action.metadata,
      })),
      bestCardsForCategories: bestCardsForCategories.map((cat: any) => ({
        category: cat.category,
        monthlySpending: cat.monthlySpending,
        currentCard: cat.currentCard ? {
          name: cat.currentCard.name,
          rewardRate: cat.currentCard.rewardRate,
          estimatedReward: cat.currentCard.estimatedReward,
        } : null,
        recommendedCard: cat.recommendedCard ? {
          id: cat.recommendedCard.id,
          name: cat.recommendedCard.name,
          bank: cat.recommendedCard.bank,
          rewardRate: cat.recommendedCard.rewardRate,
          estimatedReward: cat.recommendedCard.estimatedReward,
        } : null,
        potentialSavings: cat.potentialSavings,
      })),
    });
  } catch (error) {
    logger.error('Error getting home data:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get home data',
    });
  }
});

/**
 * POST /home/refresh
 * Force refresh snapshot and insights
 */
router.post('/refresh', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id as any;

    // Regenerate everything
    const snapshot = await HomeEngineService.generateSnapshot(userId);
    const metrics = await MetricsService.getMetrics(userId);
    const completeness = await HomeEngineService.computeDataCompleteness(userId);
    await InsightEngineService.generateInsights(userId, snapshot._id, metrics);
    await NextBestActionService.generateActions(userId, snapshot._id, completeness);

    res.json({
      message: 'Home data refreshed successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error refreshing home data:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to refresh home data',
    });
  }
});

export default router;
