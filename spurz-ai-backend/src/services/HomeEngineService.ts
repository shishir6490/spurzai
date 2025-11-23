import { Types } from 'mongoose';
import UserProfile from '../models/UserProfile';
import IncomeSource from '../models/IncomeSource';
import CreditCard from '../models/CreditCard';
import FinancialSnapshot, { IFinancialSnapshot } from '../models/FinancialSnapshot';
import MetricsService from './MetricsService';
import ScenarioService, { DataCompleteness, ScenarioCode } from './ScenarioService';
import SpendingCategory from '../models/SpendingCategory';
import logger from '../utils/logger';

interface HeroContent {
  title: string;
  subtitle: string;
  pillText?: string;
  color?: string;
  priority?: number;
}

interface KeyStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

interface BestCardForCategory {
  category: string;
  monthlySpending: number;
  currentCard: {
    name: string;
    rewardRate: number;
    estimatedReward: number;
  } | null;
  recommendedCard: {
    id: string;
    name: string;
    bank: string;
    rewardRate: number;
    estimatedReward: number;
  } | null;
  potentialSavings: number;
}

class HomeEngineService {
  /**
   * Compute data completeness for onboarding tracking
   */
  async computeDataCompleteness(userId: Types.ObjectId): Promise<DataCompleteness> {
    const profile = await UserProfile.findOne({ userId });
    const incomeSources = await IncomeSource.find({ userId, isActive: true });
    const cards = await CreditCard.find({ userId, isActive: true });

    return {
      hasBasicInfo: !!(profile?.fullName && profile?.occupation),
      hasSalaryInfo: incomeSources.length > 0,
      hasCardInfo: cards.length > 0,
      completionPercentage: this.calculateCompletionPercentage(
        !!profile?.fullName,
        incomeSources.length > 0,
        cards.length > 0
      ),
    };
  }

  private calculateCompletionPercentage(
    hasBasic: boolean,
    hasSalary: boolean,
    hasCards: boolean
  ): number {
    const steps = [hasBasic, hasSalary, hasCards];
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  }

  /**
   * Generate financial snapshot for user
   */
  async generateSnapshot(userId: Types.ObjectId): Promise<IFinancialSnapshot> {
    try {
      const metrics = await MetricsService.getMetrics(userId);
      const completeness = await this.computeDataCompleteness(userId);
      const healthBand = ScenarioService.deriveHealthBand(metrics);
      const scenarioCode = ScenarioService.deriveScenarioCode(completeness, healthBand);
      const healthScore = this.calculateHealthScore(metrics);

      // Create or update snapshot
      const snapshot = await FinancialSnapshot.findOneAndUpdate(
        { userId },
        {
          userId,
          healthScore,
          healthBand,
          scenarioCode,
          metrics,
          timestamp: new Date(),
        },
        { upsert: true, new: true }
      );

      return snapshot;
    } catch (error) {
      logger.error('Error generating snapshot:', error);
      throw error;
    }
  }

  /**
   * Calculate health score (0-100)
   */
  private calculateHealthScore(metrics: any): number {
    let score = 0;

    // Savings rate (30 points)
    const savingsRate = metrics.savingsRate || 0;
    if (savingsRate >= 0.3) score += 30;
    else if (savingsRate >= 0.2) score += 20;
    else if (savingsRate >= 0.1) score += 10;

    // Credit utilization (25 points)
    const utilization = metrics.creditUtilization || 0;
    if (utilization <= 0.3) score += 25;
    else if (utilization <= 0.5) score += 15;
    else if (utilization <= 0.7) score += 8;

    // Debt to income (20 points)
    const dti = metrics.debtToIncomeRatio || 0;
    if (dti <= 0.3) score += 20;
    else if (dti <= 0.4) score += 15;
    else if (dti <= 0.5) score += 8;

    // Income (15 points)
    if (metrics.monthlyIncome > 0) score += 15;

    // Has cards (10 points)
    if (metrics.monthlyIncome > 0) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get hero content based on scenario
   */
  getHeroContent(
    scenarioCode: ScenarioCode,
    _userName?: string
  ): Promise<HeroContent> {
    const name = _userName || 'there';

    switch (scenarioCode) {
      case 'ONBOARDING_NO_SALARY':
        return Promise.resolve({
          title: `Welcome, ${name}!`,
          subtitle: 'Let us start by adding your income sources',
          pillText: 'SETUP REQUIRED',
        });

      case 'ONBOARDING_NO_CARDS':
        return Promise.resolve({
          title: 'Great start!',
          subtitle: 'Now add your credit cards to track and optimize',
          pillText: 'SETUP REQUIRED',
        });

      case 'ONBOARDING_PARTIAL':
        return Promise.resolve({
          title: 'Almost there!',
          subtitle: 'Complete your profile for personalized insights',
          pillText: 'SETUP IN PROGRESS',
        });

      case 'READY_NO_HEALTH':
        return Promise.resolve({
          title: 'Profile complete!',
          subtitle: 'We are analyzing your financial health',
        });

      case 'CRITICAL_RED':
        return Promise.resolve({
          title: 'Attention needed',
          subtitle: 'Your financial health needs immediate action',
          pillText: 'CRITICAL',
        });

      case 'STRESSED_AMBER':
        return Promise.resolve({
          title: 'Stay cautious',
          subtitle: 'Time to improve your financial situation',
          pillText: 'STRESSED',
        });

      case 'BALANCED_GREEN':
        return Promise.resolve({
          title: `Looking good, ${name}!`,
          subtitle: 'Your finances are on track',
          pillText: 'BALANCED',
        });

      case 'OPTIMIZER_BLUE':
        return Promise.resolve({
          title: `Excellent, ${name}!`,
          subtitle: 'You are maximizing your financial potential',
          pillText: 'OPTIMIZER',
        });

      default:
        return Promise.resolve({
          title: 'Welcome back!',
          subtitle: 'Track your financial health',
        });
    }
  }

  /**
   * Get key stats for dashboard
   */
  async getKeyStats(
    _userId: Types.ObjectId
  ): Promise<KeyStat[]> {
    const metrics = await MetricsService.getMetrics(_userId);

    return [
      {
        label: 'Monthly Income',
        value: `₹${Math.round(metrics.monthlyIncome).toLocaleString('en-IN')}`,
        icon: 'trending-up',
      },
      {
        label: 'Savings Rate',
        value: `${Math.round((metrics.savingsRate || 0) * 100)}%`,
        icon: 'piggy-bank',
      },
      {
        label: 'Credit Used',
        value: `${Math.round((metrics.creditUtilization || 0) * 100)}%`,
        icon: 'credit-card',
      },
      {
        label: 'Available Credit',
        value: `₹${Math.round(metrics.monthlyIncome * 2).toLocaleString('en-IN')}`,
        icon: 'wallet',
      },
    ];
  }

  /**
   * Get best cards for user's top spending categories
   */
  async getBestCardsForCategories(
    userId: Types.ObjectId,
    limit: number = 3
  ): Promise<BestCardForCategory[]> {
    try {
      const categories = await SpendingCategory.find({ userId })
        .sort({ currentMonthSpending: -1 })
        .limit(limit);

      return categories.map(cat => ({
        category: cat.category,
        monthlySpending: cat.currentMonthSpending,
        currentCard: cat.cardsUsed && cat.cardsUsed.length > 0 ? {
          name: 'Current Card',
          rewardRate: 0,
          estimatedReward: cat.cardsUsed[0].rewardEarned || 0,
        } : null,
        recommendedCard: cat.recommendedCards && cat.recommendedCards.length > 0 ? {
          id: cat.recommendedCards[0].cardId.toString(),
          name: cat.recommendedCards[0].cardName,
          bank: cat.recommendedCards[0].bankName,
          rewardRate: cat.recommendedCards[0].rewardRate,
          estimatedReward: cat.recommendedCards[0].estimatedReward,
        } : null,
        potentialSavings: cat.potentialSavings || 0,
      }));
    } catch (error) {
      logger.error('Error getting best cards for categories:', error);
      return [];
    }
  }
}

export default new HomeEngineService();
