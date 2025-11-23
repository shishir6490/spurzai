import { Types } from 'mongoose';
import Deal, { IDeal, DealCategory } from '../models/Deal';
import CreditCard, { ICreditCard } from '../models/CreditCard';
import MarketCreditCard, { IMarketCreditCard } from '../models/MarketCreditCard';
import SpendingCategory from '../models/SpendingCategory';
import logger from '../utils/logger';

export interface DealCardMatch {
  deal: IDeal;
  bestUserCard?: ICreditCard;
  bestMarketCard?: IMarketCreditCard;
  baseSavings: number; // Without card
  additionalCardSavings: number; // Extra with card
  totalSavings: number;
  totalDiscount: number; // Percentage
}

export interface OptimalCombo {
  deal: IDeal;
  card: IMarketCreditCard | ICreditCard;
  isUserCard: boolean;
  totalDiscount: number;
  baseDealValue: number;
  cardBonusValue: number;
  totalValue: number;
}

class DealMatchingService {
  /**
   * Get personalized deals for user based on spending patterns
   */
  async getPersonalizedDeals(
    userId: Types.ObjectId,
    category?: DealCategory,
    limit: number = 20
  ): Promise<IDeal[]> {
    try {
      const query: any = {
        status: 'active',
        isActive: true,
        endDate: { $gte: new Date() },
      };

      if (category) {
        query.category = category;
      }

      // Get user's top spending categories to prioritize relevant deals
      const topCategories = await SpendingCategory.find({ userId })
        .sort({ currentMonthSpending: -1 })
        .limit(5)
        .select('category');

      const categoryList = topCategories.map(c => c.category);

      // Prioritize deals in user's high-spending categories
      const deals = await Deal.find(query)
        .sort({ 
          isFeatured: -1,
          popularity: -1,
          value: -1 
        })
        .limit(limit * 2); // Get more to filter

      // Score deals based on relevance
      const scoredDeals = deals.map(deal => {
        let score = deal.popularity;
        
        // Boost score if in user's spending categories
        if (categoryList.includes(deal.category as any)) {
          score += 50;
        }

        // Boost featured deals
        if (deal.isFeatured) {
          score += 30;
        }

        // Boost deals with better value
        score += deal.value;

        return { deal, score };
      });

      // Sort by score and return
      return scoredDeals
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.deal);

    } catch (error) {
      logger.error('Error getting personalized deals:', error);
      return [];
    }
  }

  /**
   * Match a deal with user's cards and find best option
   */
  async matchDealsWithUserCards(
    userId: Types.ObjectId,
    dealId: Types.ObjectId
  ): Promise<DealCardMatch | null> {
    try {
      const deal = await Deal.findById(dealId);
      if (!deal || deal.status !== 'active') return null;

      // Get user's cards
      const userCards = await CreditCard.find({ userId, isActive: true });

      // Calculate base deal savings
      const baseSavings = this.calculateDealValue(deal, 1000); // Base on ₹1000 transaction

      let bestUserCard: ICreditCard | undefined;
      let bestUserCardSavings = 0;

      // Check which user card gives best offer for this deal
      for (const userCard of userCards) {
        const cardOffer = deal.cardOffers.find(
          offer => offer.bankName === userCard.bankName
        );

        if (cardOffer && cardOffer.additionalDiscount) {
          const additionalSavings = (1000 * cardOffer.additionalDiscount) / 100;
          
          if (additionalSavings > bestUserCardSavings) {
            bestUserCardSavings = additionalSavings;
            bestUserCard = userCard;
          }
        }
      }

      // Find best market card for this deal
      let bestMarketCard: IMarketCreditCard | undefined;
      let bestMarketCardSavings = 0;

      if (deal.cardOffers.length > 0) {
        // Sort card offers by additional discount
        const sortedOffers = [...deal.cardOffers].sort(
          (a, b) => (b.additionalDiscount || 0) - (a.additionalDiscount || 0)
        );

        const bestOffer = sortedOffers[0];
        
        if (bestOffer.cardId) {
          bestMarketCard = await MarketCreditCard.findById(bestOffer.cardId) || undefined;
          bestMarketCardSavings = (1000 * (bestOffer.additionalDiscount || 0)) / 100;
        }
      }

      const totalSavings = baseSavings + Math.max(bestUserCardSavings, bestMarketCardSavings);
      const totalDiscount = (totalSavings / 1000) * 100;

      return {
        deal,
        bestUserCard,
        bestMarketCard,
        baseSavings,
        additionalCardSavings: Math.max(bestUserCardSavings, bestMarketCardSavings),
        totalSavings,
        totalDiscount,
      };
    } catch (error) {
      logger.error('Error matching deals with user cards:', error);
      return null;
    }
  }

  /**
   * Find optimal card-deal combinations for a category
   */
  async findOptimalCardDealCombos(
    userId: Types.ObjectId,
    category: DealCategory,
    limit: number = 10
  ): Promise<OptimalCombo[]> {
    try {
      // Get active deals in category
      const deals = await Deal.find({
        category,
        status: 'active',
        isActive: true,
        endDate: { $gte: new Date() },
      }).sort({ value: -1, popularity: -1 }).limit(20);

      const combos: OptimalCombo[] = [];

      for (const deal of deals) {
        // Find best card for this deal
        const match = await this.matchDealsWithUserCards(userId, deal._id);
        
        if (!match) continue;

        const baseDealValue = match.baseSavings;
        const cardBonusValue = match.additionalCardSavings;

        // Add user's best card combo
        if (match.bestUserCard) {
          combos.push({
            deal,
            card: match.bestUserCard,
            isUserCard: true,
            totalDiscount: match.totalDiscount,
            baseDealValue,
            cardBonusValue,
            totalValue: baseDealValue + cardBonusValue,
          });
        }

        // Add market's best card combo (if better than user's)
        if (match.bestMarketCard && (!match.bestUserCard || match.additionalCardSavings > 0)) {
          combos.push({
            deal,
            card: match.bestMarketCard,
            isUserCard: false,
            totalDiscount: match.totalDiscount,
            baseDealValue,
            cardBonusValue,
            totalValue: baseDealValue + cardBonusValue,
          });
        }
      }

      // Sort by total value and return top combos
      return combos
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, limit);

    } catch (error) {
      logger.error('Error finding optimal card-deal combos:', error);
      return [];
    }
  }

  /**
   * Calculate deal value based on transaction amount
   */
  private calculateDealValue(deal: IDeal, transactionAmount: number): number {
    switch (deal.dealType) {
      case 'cashback':
      case 'discount':
        const discountValue = (transactionAmount * deal.value) / 100;
        return Math.min(discountValue, deal.maxDiscount || discountValue);
      
      case 'points':
        // Assume 1 point = ₹0.25
        return deal.value * 0.25;
      
      case 'bogo':
      case 'freebie':
      case 'voucher':
        return deal.value; // Fixed value
      
      default:
        return 0;
    }
  }

  /**
   * Track deal view for analytics
   */
  async trackDealView(dealId: string, _userId: Types.ObjectId): Promise<void> {
    try {
      await Deal.findByIdAndUpdate(dealId, {
        $inc: { views: 1 },
      });
    } catch (error) {
      logger.error('Error tracking deal view:', error);
    }
  }

  /**
   * Track deal click for analytics
   */
  async trackDealClick(dealId: string, _userId: Types.ObjectId): Promise<void> {
    try {
      await Deal.findByIdAndUpdate(dealId, {
        $inc: { clicks: 1 },
      });
    } catch (error) {
      logger.error('Error tracking deal click:', error);
    }
  }

  /**
   * Track deal redemption for analytics
   */
  async trackDealRedemption(dealId: string, _userId: Types.ObjectId): Promise<void> {
    try {
      await Deal.findByIdAndUpdate(dealId, {
        $inc: { redemptions: 1 },
      });
    } catch (error) {
      logger.error('Error tracking deal redemption:', error);
    }
  }

  /**
   * Get deals that work with specific card
   */
  async getDealsForCard(
    cardId: Types.ObjectId,
    isMarketCard: boolean = false
  ): Promise<IDeal[]> {
    try {
      let bankName: string;
      let cardName: string;

      if (isMarketCard) {
        const card = await MarketCreditCard.findById(cardId);
        if (!card) return [];
        bankName = card.bankName;
        cardName = card.cardName;
      } else {
        const card = await CreditCard.findById(cardId);
        if (!card) return [];
        bankName = card.bankName;
        cardName = card.cardName;
      }

      // Find deals with offers for this card
      return await Deal.find({
        status: 'active',
        isActive: true,
        endDate: { $gte: new Date() },
        $or: [
          { 'cardOffers.bankName': bankName },
          { 'cardOffers.cardName': cardName },
        ],
      }).sort({ value: -1, popularity: -1 });

    } catch (error) {
      logger.error('Error getting deals for card:', error);
      return [];
    }
  }
}

export default new DealMatchingService();
