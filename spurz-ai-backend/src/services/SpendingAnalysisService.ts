import { Types } from 'mongoose';
import SpendingCategory, { ISpendingCategory, SpendingCategoryType, IRecommendedCard } from '../models/SpendingCategory';
import MarketCreditCard from '../models/MarketCreditCard';
import CreditCard from '../models/CreditCard';
import logger from '../utils/logger';

class SpendingAnalysisService {
  /**
   * Analyze user's spending patterns across categories
   * TODO: Replace with actual transaction data when available
   */
  async analyzeSpendingPatterns(userId: Types.ObjectId): Promise<ISpendingCategory[]> {
    try {
      // For now, return existing categories or create placeholder data
      let categories = await SpendingCategory.find({ userId });

      if (categories.length === 0) {
        // Create initial placeholder categories for new users
        // In production, this would be populated from transaction data
        categories = await this.initializePlaceholderCategories(userId);
      }

      return categories;
    } catch (error) {
      logger.error('Error analyzing spending patterns:', error);
      return [];
    }
  }

  /**
   * Initialize placeholder spending categories for new users
   */
  private async initializePlaceholderCategories(userId: Types.ObjectId) {
    const commonCategories: SpendingCategoryType[] = [
      'dining',
      'groceries',
      'fuel',
      'shopping',
      'entertainment',
    ];

    const categories = [];

    for (const category of commonCategories) {
      const newCategory = await SpendingCategory.create({
        userId,
        category,
        currentMonthSpending: 0,
        previousMonthSpending: 0,
        totalSpending: 0,
        averageMonthlySpending: 0,
        trend: 'stable',
        trendPercentage: 0,
        totalTransactions: 0,
        averageTransactionAmount: 0,
        monthlyBreakdown: [],
        recommendedCards: [],
        isHighSpendingCategory: false,
      });
      categories.push(newCategory);
    }

    return categories;
  }

  /**
   * Update spending for a category
   * This would be called when processing transactions
   */
  async updateCategorySpending(
    userId: Types.ObjectId,
    category: SpendingCategoryType,
    amount: number
  ): Promise<void> {
    try {
      const existingCategory = await SpendingCategory.findOne({ userId, category });

      if (!existingCategory) {
        // Create new category
        await SpendingCategory.create({
          userId,
          category,
          currentMonthSpending: amount,
          previousMonthSpending: 0,
          totalSpending: amount,
          averageMonthlySpending: amount,
          totalTransactions: 1,
          averageTransactionAmount: amount,
          trend: 'stable',
        });
      } else {
        // Update existing category
        existingCategory.currentMonthSpending += amount;
        existingCategory.totalSpending += amount;
        existingCategory.totalTransactions += 1;
        existingCategory.averageTransactionAmount = 
          existingCategory.totalSpending / existingCategory.totalTransactions;
        existingCategory.lastTransactionDate = new Date();
        existingCategory.lastCalculated = new Date();

        await existingCategory.save();
      }
    } catch (error) {
      logger.error('Error updating category spending:', error);
    }
  }

  /**
   * Get top spending categories for user
   */
  async getTopSpendingCategories(
    userId: Types.ObjectId,
    limit: number = 3
  ): Promise<ISpendingCategory[]> {
    try {
      return await SpendingCategory.find({ userId })
        .sort({ currentMonthSpending: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error getting top spending categories:', error);
      return [];
    }
  }

  /**
   * Calculate potential savings if user switches to optimal card
   */
  async calculatePotentialSavings(
    userId: Types.ObjectId,
    category: SpendingCategoryType
  ): Promise<number> {
    try {
      const spendingCategory = await SpendingCategory.findOne({ userId, category });
      if (!spendingCategory) return 0;

      const { currentMonthSpending, cardsUsed, recommendedCards } = spendingCategory;

      if (recommendedCards.length === 0 || !cardsUsed || cardsUsed.length === 0) {
        return 0;
      }

      // Current reward from cards used
      const currentReward = cardsUsed.reduce((sum, card) => sum + (card.rewardEarned || 0), 0);

      // Potential reward from best recommended card
      const bestRecommendation = recommendedCards[0];
      const potentialReward = (currentMonthSpending * bestRecommendation.rewardRate) / 100;

      return Math.max(0, potentialReward - currentReward);
    } catch (error) {
      logger.error('Error calculating potential savings:', error);
      return 0;
    }
  }

  /**
   * Recommend best cards for a spending category
   */
  async recommendCardsForCategory(
    userId: Types.ObjectId,
    category: SpendingCategoryType
  ): Promise<IRecommendedCard[]> {
    try {
      // Find market cards with good rewards for this category
      const marketCards = await MarketCreditCard.find({
        isActive: true,
        'rewardCategories.category': category,
      }).sort({ popularity: -1 }).limit(5);

      // Get user's current cards to check if they already have any
      const userCards = await CreditCard.find({ userId, isActive: true });
      const userCardBanks = new Set(userCards.map(card => card.bankName));

      const recommendations: IRecommendedCard[] = [];

      for (const marketCard of marketCards) {
        // Find the reward rate for this specific category
        const categoryReward = marketCard.rewardCategories.find(
          rc => rc.category === category
        );

        if (!categoryReward) continue;

        // Skip if user already has a card from this bank (for now)
        if (userCardBanks.has(marketCard.bankName)) continue;

        // Get spending amount for this category
        const spendingCategory = await SpendingCategory.findOne({ userId, category });
        const monthlySpending = spendingCategory?.currentMonthSpending || 0;

        recommendations.push({
          cardId: marketCard._id,
          bankName: marketCard.bankName,
          cardName: marketCard.cardName,
          rewardRate: categoryReward.rewardRate,
          estimatedReward: (monthlySpending * categoryReward.rewardRate) / 100,
          reason: `Get ${categoryReward.rewardRate}% ${marketCard.rewardType} on ${category}`,
        });
      }

      return recommendations.sort((a, b) => b.estimatedReward - a.estimatedReward);
    } catch (error) {
      logger.error('Error recommending cards for category:', error);
      return [];
    }
  }

  /**
   * Update recommendations for all user's spending categories
   */
  async updateAllCategoryRecommendations(userId: Types.ObjectId): Promise<void> {
    try {
      const categories = await SpendingCategory.find({ userId });

      for (const category of categories) {
        const recommendations = await this.recommendCardsForCategory(
          userId,
          category.category
        );

        category.recommendedCards = recommendations;
        category.lastCalculated = new Date();

        // Calculate potential savings
        if (recommendations.length > 0 && category.currentMonthSpending > 0) {
          const potentialSavings = await this.calculatePotentialSavings(
            userId,
            category.category
          );
          category.potentialSavings = potentialSavings;
        }

        await category.save();
      }

      logger.info(`Updated recommendations for ${categories.length} categories for user ${userId}`);
    } catch (error) {
      logger.error('Error updating all category recommendations:', error);
    }
  }
}

export default new SpendingAnalysisService();
