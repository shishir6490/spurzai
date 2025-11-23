import { Types } from 'mongoose';
import CardRecommendation, { ICardRecommendation } from '../models/CardRecommendation';
import MarketCreditCard, { IMarketCreditCard } from '../models/MarketCreditCard';
import CreditCard, { ICreditCard } from '../models/CreditCard';
import SpendingCategory, { SpendingCategoryType } from '../models/SpendingCategory';
import logger from '../utils/logger';

class CardRecommendationService {
  /**
   * Generate personalized card recommendations for user
   */
  async generateRecommendations(userId: Types.ObjectId): Promise<ICardRecommendation[]> {
    try {
      // Clear old recommendations
      await CardRecommendation.deleteMany({ userId, isActive: true });

      const recommendations: Partial<ICardRecommendation>[] = [];

      // 1. High spending category recommendations
      const highSpendingRecs = await this.generateHighSpendingCategoryRecommendations(userId);
      recommendations.push(...highSpendingRecs);

      // 2. Better rewards recommendations
      const betterRewardsRecs = await this.generateBetterRewardsRecommendations(userId);
      recommendations.push(...betterRewardsRecs);

      // 3. Low utilization optimization
      const lowUtilizationRecs = await this.generateLowUtilizationRecommendations(userId);
      recommendations.push(...lowUtilizationRecs);

      // Create recommendations in database
      const created = await CardRecommendation.insertMany(recommendations);
      
      logger.info(`Generated ${created.length} recommendations for user ${userId}`);
      return created as any;
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Recommend cards for high spending categories
   */
  private async generateHighSpendingCategoryRecommendations(
    userId: Types.ObjectId
  ): Promise<Partial<ICardRecommendation>[]> {
    const recommendations: Partial<ICardRecommendation>[] = [];

    // Get top 3 spending categories
    const topCategories = await SpendingCategory.find({ userId })
      .sort({ currentMonthSpending: -1 })
      .limit(3);

    for (const category of topCategories) {
      if (category.currentMonthSpending < 5000) continue; // Skip low spend categories

      const bestCard = await this.findBestCardForCategory(
        category.category,
        category.currentMonthSpending
      );

      if (!bestCard) continue;

      // Calculate savings
      const estimatedMonthlyReward = 
        (category.currentMonthSpending * bestCard.baseRewardRate) / 100;

      recommendations.push({
        userId,
        marketCardId: bestCard._id,
        type: 'new_card',
        bankName: bestCard.bankName,
        cardName: bestCard.cardName,
        cardImageUrl: bestCard.imageUrl,
        primaryReason: 'high_spending_category',
        reasons: [
          `You spend ₹${category.currentMonthSpending.toLocaleString()}/month on ${category.category}`,
          `Get ${bestCard.baseRewardRate}% ${bestCard.rewardType} on ${category.category}`,
          `Save ₹${Math.round(estimatedMonthlyReward)}/month`,
        ],
        estimatedMonthlySavings: estimatedMonthlyReward,
        estimatedYearlySavings: estimatedMonthlyReward * 12,
        estimatedRewards: estimatedMonthlyReward,
        relevantCategories: [category.category],
        score: Math.min(100, (estimatedMonthlyReward / 100) * 10), // Higher savings = higher score
        priority: estimatedMonthlyReward > 500 ? 9 : estimatedMonthlyReward > 200 ? 7 : 5,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    }

    return recommendations;
  }

  /**
   * Recommend better cards than what user currently uses
   */
  private async generateBetterRewardsRecommendations(
    userId: Types.ObjectId
  ): Promise<Partial<ICardRecommendation>[]> {
    const recommendations: Partial<ICardRecommendation>[] = [];

    // Get user's current cards
    const userCards = await CreditCard.find({ userId, isActive: true });
    
    if (userCards.length === 0) return recommendations;

    // Get spending categories
    const categories = await SpendingCategory.find({ userId })
      .sort({ currentMonthSpending: -1 })
      .limit(5);

    for (const category of categories) {
      if (category.currentMonthSpending < 3000) continue;

      // Find better card
      const betterCard = await this.findBestCardForCategory(
        category.category,
        category.currentMonthSpending
      );

      if (!betterCard) continue;

      // Calculate potential improvement
      const currentReward = category.cardsUsed?.[0]?.rewardEarned || 0;
      const potentialReward = (category.currentMonthSpending * betterCard.baseRewardRate) / 100;
      const improvement = potentialReward - currentReward;

      if (improvement > 100) { // Only recommend if savings > ₹100/month
        recommendations.push({
          userId,
          marketCardId: betterCard._id,
          type: 'new_card',
          bankName: betterCard.bankName,
          cardName: betterCard.cardName,
          cardImageUrl: betterCard.imageUrl,
          primaryReason: 'better_rewards',
          reasons: [
            `Currently earning ₹${Math.round(currentReward)}/month on ${category.category}`,
            `Could earn ₹${Math.round(potentialReward)}/month with this card`,
            `Additional savings: ₹${Math.round(improvement)}/month`,
          ],
          estimatedMonthlySavings: improvement,
          estimatedYearlySavings: improvement * 12,
          estimatedRewards: potentialReward,
          relevantCategories: [category.category],
          score: Math.min(100, (improvement / 50) * 10),
          priority: improvement > 300 ? 8 : 6,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      }
    }

    return recommendations;
  }

  /**
   * Recommend using existing cards more optimally
   */
  private async generateLowUtilizationRecommendations(
    userId: Types.ObjectId
  ): Promise<Partial<ICardRecommendation>[]> {
    const recommendations: Partial<ICardRecommendation>[] = [];

    // Find cards with low utilization (<10%)
    const userCards = await CreditCard.find({ userId, isActive: true });
    
    for (const card of userCards) {
      const utilization = (card.currentBalance / card.creditLimit) * 100;
      
      if (utilization < 10 && card.creditLimit > 50000) {
        recommendations.push({
          userId,
          userCardId: card._id,
          type: 'existing_card',
          bankName: card.bankName,
          cardName: card.cardName,
          primaryReason: 'low_utilization',
          reasons: [
            `Your ${card.bankName} card has ₹${card.availableCredit.toLocaleString()} available`,
            `Only ${Math.round(utilization)}% utilized`,
            `Use this card more to build credit history`,
          ],
          relevantCategories: [],
          score: 60,
          priority: 4,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      }
    }

    return recommendations;
  }

  /**
   * Find best card for a specific category
   */
  async findBestCardForCategory(
    category: SpendingCategoryType,
    monthlySpending: number
  ): Promise<IMarketCreditCard | null> {
    try {
      // Find cards with rewards in this category
      const cards = await MarketCreditCard.find({
        isActive: true,
        'rewardCategories.category': category,
      }).sort({ 'rewardCategories.rewardRate': -1, popularity: -1 });

      if (cards.length === 0) return null;

      // Score each card based on rewards and fees
      let bestCard = cards[0];
      let bestScore = -Infinity;

      for (const card of cards) {
        const categoryReward = card.rewardCategories.find(rc => rc.category === category);
        if (!categoryReward) continue;

        // Calculate annual reward
        const annualReward = (monthlySpending * 12 * categoryReward.rewardRate) / 100;
        
        // Subtract annual fee
        const netBenefit = annualReward - card.annualFee;

        if (netBenefit > bestScore) {
          bestScore = netBenefit;
          bestCard = card;
        }
      }

      return bestScore > 0 ? bestCard : null;
    } catch (error) {
      logger.error('Error finding best card for category:', error);
      return null;
    }
  }

  /**
   * Recommend best card (existing or market) for a specific transaction
   */
  async recommendCardForTransaction(
    userId: Types.ObjectId,
    category: SpendingCategoryType,
    amount: number
  ): Promise<ICreditCard | IMarketCreditCard | null> {
    try {
      // First check user's existing cards
      const userCards = await CreditCard.find({ userId, isActive: true });
      
      // Simple heuristic: recommend card with most available credit
      // TODO: Enhance with reward rate matching
      if (userCards.length > 0) {
        const bestUserCard = userCards.reduce((best, card) => 
          card.availableCredit > best.availableCredit ? card : best
        );
        
        if (bestUserCard.availableCredit >= amount) {
          return bestUserCard;
        }
      }

      // If no suitable user card, recommend market card
      return await this.findBestCardForCategory(category, amount);
    } catch (error) {
      logger.error('Error recommending card for transaction:', error);
      return null;
    }
  }

  /**
   * Calculate potential reward for a card across all spending categories
   */
  async calculateRewardPotential(
    cardId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<number> {
    try {
      const card = await MarketCreditCard.findById(cardId);
      if (!card) return 0;

      const categories = await SpendingCategory.find({ userId });
      
      let totalReward = 0;

      for (const category of categories) {
        const categoryReward = card.rewardCategories.find(
          rc => rc.category === category.category
        );

        const rewardRate = categoryReward?.rewardRate || card.baseRewardRate;
        totalReward += (category.currentMonthSpending * rewardRate) / 100;
      }

      return totalReward;
    } catch (error) {
      logger.error('Error calculating reward potential:', error);
      return 0;
    }
  }

  /**
   * Identify upgrade opportunities from current cards
   */
  async identifyUpgradeOpportunities(
    userId: Types.ObjectId
  ): Promise<ICardRecommendation[]> {
    try {
      const userCards = await CreditCard.find({ userId, isActive: true });
      const recommendations: Partial<ICardRecommendation>[] = [];

      for (const userCard of userCards) {
        // Find premium versions of the same bank's cards
        const upgrades = await MarketCreditCard.find({
          bankName: userCard.bankName,
          tier: { $in: ['platinum', 'signature', 'infinite'] },
          isActive: true,
        });

        for (const upgrade of upgrades) {
          const potentialReward = await this.calculateRewardPotential(upgrade._id, userId);
          
          if (potentialReward > upgrade.annualFee) {
            recommendations.push({
              userId,
              marketCardId: upgrade._id,
              userCardId: userCard._id,
              type: 'upgrade',
              bankName: upgrade.bankName,
              cardName: upgrade.cardName,
              cardImageUrl: upgrade.imageUrl,
              primaryReason: 'better_rewards',
              reasons: [
                `Upgrade from your current ${userCard.bankName} card`,
                `Get ${upgrade.baseRewardRate}% rewards (higher than current)`,
                `Earn ₹${Math.round(potentialReward)}/month`,
              ],
              estimatedMonthlySavings: potentialReward - (upgrade.annualFee / 12),
              estimatedYearlySavings: potentialReward * 12 - upgrade.annualFee,
              estimatedRewards: potentialReward,
              score: 70,
              priority: 6,
              isActive: true,
            });
          }
        }
      }

      return (await CardRecommendation.insertMany(recommendations)) as any;
    } catch (error) {
      logger.error('Error identifying upgrade opportunities:', error);
      return [];
    }
  }
}

export default new CardRecommendationService();
