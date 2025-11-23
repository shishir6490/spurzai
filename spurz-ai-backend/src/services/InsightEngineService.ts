import { Types } from 'mongoose';
import Insight, { IInsight } from '../models/Insight';
import { FinancialMetrics } from './MetricsService';
import SpendingCategory from '../models/SpendingCategory';
import Deal from '../models/Deal';
import logger from '../utils/logger';

class InsightEngineService {
  /**
   * Generate insights based on financial snapshot
   * TODO: Replace with ML/AI-driven insights later
   */
  async generateInsights(
    userId: Types.ObjectId,
    snapshotId: Types.ObjectId,
    metrics: FinancialMetrics
  ): Promise<IInsight[]> {
    try {
      const insights: Partial<IInsight>[] = [];

      // 1. Savings insights
      insights.push(...await this.generateSavingsInsights(userId, metrics));

      // 2. Credit utilization insights
      insights.push(...await this.generateCreditInsights(userId, metrics));

      // 3. Card optimization insights
      insights.push(...await this.generateCardOptimizationInsights(userId));

      // 4. Deal opportunity insights
      insights.push(...await this.generateDealInsights(userId));

      // 5. Spending pattern insights
      insights.push(...await this.generateSpendingInsights(userId));

      // Create insights in database
      const created = await Insight.insertMany(
        insights.map(insight => ({
          ...insight,
          userId,
          snapshotId,
          isRead: false,
        }))
      );

      logger.info(`Generated ${created.length} insights for user ${userId}`);
      return created as any;
    } catch (error) {
      logger.error('Error generating insights:', error);
      return [];
    }
  }

  /**
   * Generate savings-related insights
   */
  private async generateSavingsInsights(
    _userId: Types.ObjectId,
    metrics: FinancialMetrics
  ): Promise<Partial<IInsight>[]> {
    const insights: Partial<IInsight>[] = [];

    // Low savings rate
    if (metrics.savingsRate < 0.1 && metrics.monthlyIncome > 0) {
      insights.push({
        category: 'saving',
        priority: 'high',
        title: 'Savings Rate Below Target',
        description: `You're saving only ${Math.round(metrics.savingsRate * 100)}% of your income. Aim for at least 20% to build financial security.`,
        value: Math.round(metrics.savingsRate * 100),
        valueLabel: '% saved',
        trend: 'down',
        actionable: true,
      });
    }

    // Good savings rate
    if (metrics.savingsRate >= 0.3) {
      insights.push({
        category: 'saving',
        priority: 'low',
        title: 'Excellent Savings Habit',
        description: `You're saving ${Math.round(metrics.savingsRate * 100)}% of your income. Keep up the great work!`,
        value: Math.round(metrics.savingsRate * 100),
        valueLabel: '% saved',
        trend: 'up',
        actionable: false,
      });
    }

    return insights;
  }

  /**
   * Generate credit-related insights
   */
  private async generateCreditInsights(
    _userId: Types.ObjectId,
    metrics: FinancialMetrics
  ): Promise<Partial<IInsight>[]> {
    const insights: Partial<IInsight>[] = [];

    // High credit utilization
    if (metrics.creditUtilization > 0.8) {
      insights.push({
        category: 'credit',
        priority: 'high',
        title: 'High Credit Utilization',
        description: `You're using ${Math.round(metrics.creditUtilization * 100)}% of your credit limit. This can negatively impact your credit score. Try to keep it below 30%.`,
        value: Math.round(metrics.creditUtilization * 100),
        valueLabel: '% used',
        trend: 'down',
        actionable: true,
      });
    }

    // Good credit utilization
    if (metrics.creditUtilization > 0 && metrics.creditUtilization < 0.3) {
      insights.push({
        category: 'credit',
        priority: 'low',
        title: 'Healthy Credit Utilization',
        description: `Your credit utilization is ${Math.round(metrics.creditUtilization * 100)}%. This is excellent for your credit score!`,
        value: Math.round(metrics.creditUtilization * 100),
        valueLabel: '% used',
        trend: 'up',
        actionable: false,
      });
    }

    // High debt-to-income ratio
    if (metrics.debtToIncomeRatio > 0.5) {
      insights.push({
        category: 'debt',
        priority: 'high',
        title: 'High Debt Burden',
        description: `Your debt is ${Math.round(metrics.debtToIncomeRatio * 100)}% of your income. Focus on paying down high-interest debt first.`,
        value: Math.round(metrics.debtToIncomeRatio * 100),
        valueLabel: '% of income',
        trend: 'down',
        actionable: true,
      });
    }

    return insights;
  }

  /**
   * Generate card optimization insights
   */
  private async generateCardOptimizationInsights(
    userId: Types.ObjectId
  ): Promise<Partial<IInsight>[]> {
    const insights: Partial<IInsight>[] = [];

    // Check for spending categories with better card options
    const topCategories = await SpendingCategory.find({ userId })
      .sort({ potentialSavings: -1 })
      .limit(3);

    for (const category of topCategories) {
      if ((category.potentialSavings || 0) > 200) {
        insights.push({
          category: 'spending',
          priority: 'medium',
          title: `Optimize ${category.category.charAt(0).toUpperCase() + category.category.slice(1)} Spending`,
          description: `You could save ₹${Math.round(category.potentialSavings || 0)}/month on ${category.category} with a better credit card.`,
          value: category.potentialSavings,
          valueLabel: '₹/month',
          trend: 'up',
          actionable: true,
          metadata: {
            category: category.category,
            currentSpending: category.currentMonthSpending,
          },
        });
      }
    }

    return insights;
  }

  /**
   * Generate deal opportunity insights
   */
  private async generateDealInsights(userId: Types.ObjectId): Promise<Partial<IInsight>[]> {
    const insights: Partial<IInsight>[] = [];

    // Check for featured deals in user's top spending categories
    const topCategories = await SpendingCategory.find({ userId })
      .sort({ currentMonthSpending: -1 })
      .limit(5)
      .select('category');

    const categoryList = topCategories.map(c => c.category);

    const featuredDeals = await Deal.find({
      category: { $in: categoryList },
      isFeatured: true,
      status: 'active',
      isActive: true,
      endDate: { $gte: new Date() },
    }).limit(2);

    for (const deal of featuredDeals) {
      insights.push({
        category: 'spending',
        priority: 'medium',
        title: `Deal Alert: ${deal.merchantName}`,
        description: `${deal.title} - Get ${deal.value}% ${deal.dealType} at ${deal.merchantName}. Valid till ${deal.endDate.toLocaleDateString()}.`,
        value: deal.value,
        valueLabel: `% ${deal.dealType}`,
        actionable: true,
        metadata: {
          dealId: deal._id,
          merchantName: deal.merchantName,
        },
        expiresAt: deal.endDate,
      });
    }

    return insights;
  }

  /**
   * Generate spending pattern insights
   */
  private async generateSpendingInsights(
    userId: Types.ObjectId
  ): Promise<Partial<IInsight>[]> {
    const insights: Partial<IInsight>[] = [];

    // Check for categories with increasing spending
    const categories = await SpendingCategory.find({
      userId,
      trend: 'up',
      trendPercentage: { $gte: 20 }, // 20% increase
    }).sort({ trendPercentage: -1 });

    for (const category of categories.slice(0, 2)) {
      insights.push({
        category: 'spending',
        priority: 'medium',
        title: `Rising ${category.category.charAt(0).toUpperCase() + category.category.slice(1)} Expenses`,
        description: `Your ${category.category} spending increased by ${Math.round(category.trendPercentage)}% this month. Current: ₹${category.currentMonthSpending.toLocaleString()}.`,
        value: category.trendPercentage,
        valueLabel: '% increase',
        trend: 'down',
        actionable: true,
        metadata: {
          category: category.category,
        },
      });
    }

    return insights;
  }
}

export default new InsightEngineService();
