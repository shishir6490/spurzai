import { Types } from 'mongoose';
import NextBestAction, { INextBestAction } from '../models/NextBestAction';
import { DataCompleteness } from './ScenarioService';
import SpendingCategory from '../models/SpendingCategory';
import CardRecommendation from '../models/CardRecommendation';
import Deal from '../models/Deal';
import logger from '../utils/logger';

class NextBestActionService {
  /**
   * Generate next best actions based on data completeness and context
   * TODO: Replace with state machine logic later
   */
  async generateActions(
    userId: Types.ObjectId,
    snapshotId: Types.ObjectId,
    completeness: DataCompleteness
  ): Promise<INextBestAction[]> {
    try {
      const actions: Partial<INextBestAction>[] = [];

      // 1. Onboarding actions (high priority)
      actions.push(...await this.generateOnboardingActions(userId, completeness));

      // 2. Card optimization actions
      actions.push(...await this.generateCardOptimizationActions(userId));

      // 3. Deal actions
      actions.push(...await this.generateDealActions(userId));

      // 4. Savings actions
      actions.push(...await this.generateSavingsActions(userId));

      // Create actions in database
      const created = await NextBestAction.insertMany(
        actions.map(action => ({
          ...action,
          userId,
          snapshotId,
          status: 'pending',
        }))
      );

      logger.info(`Generated ${created.length} actions for user ${userId}`);
      return created as any;
    } catch (error) {
      logger.error('Error generating actions:', error);
      return [];
    }
  }

  /**
   * Generate onboarding-related actions
   */
  private async generateOnboardingActions(
    _userId: Types.ObjectId,
    completeness: DataCompleteness
  ): Promise<Partial<INextBestAction>[]> {
    const actions: Partial<INextBestAction>[] = [];

    // Add salary info
    if (!completeness.hasSalaryInfo) {
      actions.push({
        type: 'other',
        title: 'Add Your Income',
        description: 'Tell us about your income sources to get personalized insights',
        icon: 'income',
        priority: 10,
        estimatedImpact: 'high',
        metadata: {
          targetScreen: 'AddIncome',
        },
      });
    }

    // Add credit cards
    if (!completeness.hasCardInfo) {
      actions.push({
        type: 'credit',
        title: 'Add Your Credit Cards',
        description: 'Track your cards and discover better rewards opportunities',
        icon: 'card',
        priority: 9,
        estimatedImpact: 'high',
        metadata: {
          targetScreen: 'AddCard',
        },
      });
    }

    // Link email
    if (!completeness.hasEmailLinkage) {
      actions.push({
        type: 'other',
        title: 'Connect Your Email',
        description: 'Automatically track transactions from email receipts',
        icon: 'email',
        priority: 5,
        estimatedImpact: 'medium',
        metadata: {
          targetScreen: 'EmailPermission',
        },
      });
    }

    return actions;
  }

  /**
   * Generate card optimization actions
   */
  private async generateCardOptimizationActions(
    userId: Types.ObjectId
  ): Promise<Partial<INextBestAction>[]> {
    const actions: Partial<INextBestAction>[] = [];

    // Check for high-value card recommendations
    const topRecommendations = await CardRecommendation.find({
      userId,
      isActive: true,
      isDismissed: false,
    }).sort({ priority: -1, score: -1 }).limit(3);

    for (const recommendation of topRecommendations) {
      if ((recommendation.estimatedMonthlySavings || 0) > 200) {
        actions.push({
          type: 'credit',
          title: `Get ${recommendation.cardName}`,
          description: recommendation.reasons[0] || `Save ₹${Math.round(recommendation.estimatedMonthlySavings || 0)}/month`,
          icon: 'card-new',
          priority: 7,
          estimatedImpact: 'high',
          estimatedSavings: recommendation.estimatedMonthlySavings,
          metadata: {
            recommendationId: recommendation._id,
            cardName: recommendation.cardName,
            bankName: recommendation.bankName,
          },
        });
      }
    }

    // Check for categories with high potential savings
    const categoriesWithSavings = await SpendingCategory.find({
      userId,
      potentialSavings: { $gte: 150 },
    }).sort({ potentialSavings: -1 }).limit(2);

    for (const category of categoriesWithSavings) {
      const bestCard = category.recommendedCards[0];
      if (bestCard) {
        actions.push({
          type: 'saving',
          title: `Optimize ${category.category.charAt(0).toUpperCase() + category.category.slice(1)} Spending`,
          description: `Get ${bestCard.cardName} to save ₹${Math.round(category.potentialSavings || 0)}/month on ${category.category}`,
          icon: 'optimize',
          priority: 6,
          estimatedImpact: 'medium',
          estimatedSavings: category.potentialSavings,
          metadata: {
            category: category.category,
            cardId: bestCard.cardId,
          },
        });
      }
    }

    return actions;
  }

  /**
   * Generate deal-related actions
   */
  private async generateDealActions(
    userId: Types.ObjectId
  ): Promise<Partial<INextBestAction>[]> {
    const actions: Partial<INextBestAction>[] = [];

    // Get user's top spending categories
    const topCategories = await SpendingCategory.find({ userId })
      .sort({ currentMonthSpending: -1 })
      .limit(3)
      .select('category');

    const categoryList = topCategories.map(c => c.category);

    // Find featured deals in relevant categories
    const featuredDeals = await Deal.find({
      category: { $in: categoryList },
      isFeatured: true,
      status: 'active',
      isActive: true,
      endDate: { $gte: new Date() },
      value: { $gte: 10 }, // At least 10% discount
    }).sort({ value: -1 }).limit(2);

    for (const deal of featuredDeals) {
      actions.push({
        type: 'other',
        title: `${deal.merchantName} Deal`,
        description: `${deal.title} - ${deal.value}% ${deal.dealType}`,
        icon: 'deal',
        priority: 4,
        estimatedImpact: 'low',
        dueDate: deal.endDate,
        metadata: {
          dealId: deal._id,
          merchantName: deal.merchantName,
          dealUrl: deal.dealUrl,
        },
      });
    }

    return actions;
  }

  /**
   * Generate savings-related actions
   */
  private async generateSavingsActions(
    userId: Types.ObjectId
  ): Promise<Partial<INextBestAction>[]> {
    const actions: Partial<INextBestAction>[] = [];

    // Check for high spending categories to reduce
    const highSpendingCategories = await SpendingCategory.find({
      userId,
      currentMonthSpending: { $gte: 10000 },
      trend: 'up',
    }).sort({ currentMonthSpending: -1 }).limit(1);

    for (const category of highSpendingCategories) {
      // Suggest reducing spending by 10%
      const targetReduction = Math.round(category.currentMonthSpending * 0.1);
      
      actions.push({
        type: 'saving',
        title: `Reduce ${category.category.charAt(0).toUpperCase() + category.category.slice(1)} Expenses`,
        description: `Try reducing ${category.category} spending by ₹${targetReduction.toLocaleString()} this month`,
        icon: 'savings',
        priority: 5,
        estimatedImpact: 'medium',
        estimatedSavings: targetReduction,
        metadata: {
          category: category.category,
          currentSpending: category.currentMonthSpending,
          targetSpending: category.currentMonthSpending - targetReduction,
        },
      });
    }

    return actions;
  }
}

export default new NextBestActionService();
