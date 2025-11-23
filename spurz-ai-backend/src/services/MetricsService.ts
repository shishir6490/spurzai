import { Types } from 'mongoose';
import crypto from 'crypto';
import IncomeSource from '../models/IncomeSource';
import CreditCard from '../models/CreditCard';
import UserProfile from '../models/UserProfile';
import logger from '../utils/logger';

export interface FinancialMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyInvestments: number;
  monthlyLoans: number;
  monthlySavings: number;
  savingsRate: number;
  potentialSavingsPercent: number;
  creditUtilization: number;
  debtToIncomeRatio: number;
  totalCreditLimit: number;
  totalCreditUsed: number;
  availableCredit: number;
  cardCount: number;
}

class MetricsService {
  /**
   * Calculate total monthly income from all active sources
   */
  async calculateMonthlyIncome(userId: Types.ObjectId): Promise<number> {
    try {
      const incomeSources = await IncomeSource.find({ 
        userId, 
        isActive: true 
      });

      logger.info('📊 All Income Sources:', JSON.stringify(incomeSources.map(s => ({
        name: s.name,
        source: s.source,
        type: s.type,
        amount: s.amount,
        frequency: s.frequency
      })), null, 2));

      let monthlyTotal = 0;
      const investmentKeywords = ['stock', 'mutual', 'sip', 'investment', 'crypto', 'gold', 'fd', 'deposit', 'bond'];
      const loanKeywords = ['loan', 'emi'];

      for (const source of incomeSources) {
        // Skip expenses, investments, and loans - only count actual income
        const sourceName = (source.name || source.source || '').toLowerCase();
        const isExpense = sourceName.startsWith('expense:');
        const isInvestment = investmentKeywords.some(keyword => sourceName.includes(keyword));
        const isLoan = loanKeywords.some(keyword => sourceName.includes(keyword));
        
        logger.info(`🔍 Checking source: ${source.name || source.source} - isExpense: ${isExpense}, isInvestment: ${isInvestment}, isLoan: ${isLoan}`);
        
        if (isExpense || isInvestment || isLoan) {
          continue;
        }

        let monthlyAmount = source.amount;

        // Convert to monthly based on frequency
        switch (source.frequency) {
          case 'weekly':
            monthlyAmount = source.amount * 4.33; // Average weeks per month
            break;
          case 'bi-weekly':
            monthlyAmount = source.amount * 2.17; // Average bi-weeks per month
            break;
          case 'monthly':
            monthlyAmount = source.amount;
            break;
          case 'one-time':
            monthlyAmount = 0; // Don't count one-time income in monthly
            break;
        }

        monthlyTotal += monthlyAmount;
        logger.info(`✅ Added to income: ${source.name || source.source} = ${monthlyAmount}`);
      }

      logger.info(`💰 Total Monthly Income: ${Math.round(monthlyTotal)}`);
      return Math.round(monthlyTotal);
    } catch (error) {
      logger.error('Error calculating monthly income:', error);
      return 0;
    }
  }

  /**
   * Calculate monthly expenses (only regular expenses, excluding investments and loans)
   */
  async calculateMonthlyExpenses(userId: Types.ObjectId): Promise<number> {
    try {
      const incomeSources = await IncomeSource.find({ 
        userId, 
        isActive: true 
      });

      let monthlyTotal = 0;
      const investmentKeywords = ['stock', 'mutual', 'sip', 'investment', 'crypto', 'gold', 'fd', 'deposit', 'bond'];
      const loanKeywords = ['loan', 'emi'];

      for (const source of incomeSources) {
        const sourceName = (source.name || source.source || '').toLowerCase();
        
        // Only count items that start with "Expense:" but exclude investments and loans
        if (!sourceName.startsWith('expense:')) {
          continue;
        }

        const isInvestment = investmentKeywords.some(keyword => sourceName.includes(keyword));
        const isLoan = loanKeywords.some(keyword => sourceName.includes(keyword));
        
        // Skip investments and loans
        if (isInvestment || isLoan) {
          continue;
        }

        let monthlyAmount = source.amount;

        // Convert to monthly based on frequency
        switch (source.frequency) {
          case 'weekly':
            monthlyAmount = source.amount * 4.33;
            break;
          case 'bi-weekly':
            monthlyAmount = source.amount * 2.17;
            break;
          case 'monthly':
            monthlyAmount = source.amount;
            break;
          case 'one-time':
            monthlyAmount = 0;
            break;
        }

        monthlyTotal += monthlyAmount;
        logger.info(`✅ Added to expenses: ${source.name || source.source} = ${monthlyAmount}`);
      }

      logger.info(`💸 Total Monthly Expenses: ${Math.round(monthlyTotal)}`);
      return Math.round(monthlyTotal);
    } catch (error) {
      logger.error('Error calculating monthly expenses:', error);
      return 0;
    }
  }

  /**
   * Calculate monthly investments
   */
  async calculateMonthlyInvestments(userId: Types.ObjectId): Promise<number> {
    try {
      const incomeSources = await IncomeSource.find({ 
        userId, 
        isActive: true 
      });

      let monthlyTotal = 0;
      const investmentKeywords = ['stock', 'mutual', 'sip', 'investment', 'crypto', 'gold', 'fd', 'deposit', 'bond'];

      for (const source of incomeSources) {
        const sourceName = (source.name || source.source || '').toLowerCase();
        
        // Only count expense items that are investments
        if (!sourceName.startsWith('expense:')) {
          continue;
        }

        const isInvestment = investmentKeywords.some(keyword => sourceName.includes(keyword));
        
        if (!isInvestment) {
          continue;
        }

        let monthlyAmount = source.amount;

        switch (source.frequency) {
          case 'weekly':
            monthlyAmount = source.amount * 4.33;
            break;
          case 'bi-weekly':
            monthlyAmount = source.amount * 2.17;
            break;
          case 'monthly':
            monthlyAmount = source.amount;
            break;
          case 'one-time':
            monthlyAmount = 0;
            break;
        }

        monthlyTotal += monthlyAmount;
        logger.info(`✅ Added to investments: ${source.name || source.source} = ${monthlyAmount}`);
      }

      logger.info(`📈 Total Monthly Investments: ${Math.round(monthlyTotal)}`);
      return Math.round(monthlyTotal);
    } catch (error) {
      logger.error('Error calculating monthly investments:', error);
      return 0;
    }
  }

  /**
   * Calculate monthly loan payments
   */
  async calculateMonthlyLoans(userId: Types.ObjectId): Promise<number> {
    try {
      const incomeSources = await IncomeSource.find({ 
        userId, 
        isActive: true 
      });

      let monthlyTotal = 0;
      const loanKeywords = ['loan', 'emi'];

      for (const source of incomeSources) {
        const sourceName = (source.name || source.source || '').toLowerCase();
        
        // Only count expense items that are loans
        if (!sourceName.startsWith('expense:')) {
          continue;
        }

        const isLoan = loanKeywords.some(keyword => sourceName.includes(keyword));
        
        if (!isLoan) {
          continue;
        }

        let monthlyAmount = source.amount;

        switch (source.frequency) {
          case 'weekly':
            monthlyAmount = source.amount * 4.33;
            break;
          case 'bi-weekly':
            monthlyAmount = source.amount * 2.17;
            break;
          case 'monthly':
            monthlyAmount = source.amount;
            break;
          case 'one-time':
            monthlyAmount = 0;
            break;
        }

        monthlyTotal += monthlyAmount;
        logger.info(`✅ Added to loans: ${source.name || source.source} = ${monthlyAmount}`);
      }

      logger.info(`🏦 Total Monthly Loans: ${Math.round(monthlyTotal)}`);
      return Math.round(monthlyTotal);
    } catch (error) {
      logger.error('Error calculating monthly loans:', error);
      return 0;
    }
  }

  /**
   * Calculate monthly savings (income - expenses - investments - loans)
   */
  async calculateMonthlySavings(userId: Types.ObjectId): Promise<number> {
    const income = await this.calculateMonthlyIncome(userId);
    const expenses = await this.calculateMonthlyExpenses(userId);
    const investments = await this.calculateMonthlyInvestments(userId);
    const loans = await this.calculateMonthlyLoans(userId);
    return Math.max(0, income - expenses - investments - loans);
  }

  /**
   * Calculate savings rate (0-1)
   */
  async calculateSavingsRate(userId: Types.ObjectId): Promise<number> {
    const income = await this.calculateMonthlyIncome(userId);
    if (income === 0) return 0;

    const savings = await this.calculateMonthlySavings(userId);
    return Math.min(1, Math.max(0, savings / income));
  }

  /**
   * Calculate credit card utilization (0-1)
   */
  async calculateCardUtilization(userId: Types.ObjectId): Promise<number> {
    try {
      const cards = await CreditCard.find({ userId, isActive: true });
      
      if (cards.length === 0) return 0;

      const totalLimit = cards.reduce((sum, card) => sum + card.creditLimit, 0);
      const totalUsed = cards.reduce((sum, card) => sum + card.currentBalance, 0);

      if (totalLimit === 0) return 0;

      return Math.min(1, Math.max(0, totalUsed / totalLimit));
    } catch (error) {
      logger.error('Error calculating card utilization:', error);
      return 0;
    }
  }

  /**
   * Calculate debt-to-income ratio
   */
  async calculateDebtToIncomeRatio(userId: Types.ObjectId): Promise<number> {
    const income = await this.calculateMonthlyIncome(userId);
    if (income === 0) return 0;

    const cards = await CreditCard.find({ userId, isActive: true });
    const totalDebt = cards.reduce((sum, card) => sum + card.currentBalance, 0);

    return Math.min(1, Math.max(0, totalDebt / income));
  }

  /**
   * Calculate and persist potential savings percentage
   * Only regenerates if expenses or investments change
   */
  async calculatePotentialSavings(userId: Types.ObjectId): Promise<number> {
    try {
      const profile = await UserProfile.findOne({ userId });
      
      // Get current expenses and investments
      const expenses = await this.calculateMonthlyExpenses(userId);
      const investments = await this.calculateMonthlyInvestments(userId);
      
      // Create hash of current financial state
      const currentHash = crypto
        .createHash('md5')
        .update(`${expenses}-${investments}`)
        .digest('hex');
      
      const lastHash = profile?.financialSnapshot?.lastExpensesHash;
      const existingPercent = profile?.financialSnapshot?.potentialSavingsPercent;
      
      // If nothing changed and we have a stored value, return it
      if (lastHash === currentHash && existingPercent !== undefined) {
        return existingPercent;
      }
      
      // Generate new random potential savings between 3% and 12%
      const newPercent = Math.floor(Math.random() * 10) + 3; // 3-12%
      
      // Store in profile
      await UserProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            'financialSnapshot.potentialSavingsPercent': newPercent,
            'financialSnapshot.lastExpensesHash': currentHash,
          },
        },
        { upsert: true, new: true }
      );
      
      logger.info(`💡 Generated new potential savings: ${newPercent}% for user ${userId}`);
      return newPercent;
    } catch (error) {
      logger.error('Error calculating potential savings:', error);
      return 5; // Default fallback
    }
  }

  /**
   * Get comprehensive financial metrics
   */
  async getMetrics(userId: Types.ObjectId): Promise<FinancialMetrics> {
    try {
      const [
        monthlyIncome,
        monthlyExpenses,
        monthlyInvestments,
        monthlyLoans,
        monthlySavings,
        savingsRate,
        potentialSavingsPercent,
        creditUtilization,
        debtToIncomeRatio
      ] = await Promise.all([
        this.calculateMonthlyIncome(userId),
        this.calculateMonthlyExpenses(userId),
        this.calculateMonthlyInvestments(userId),
        this.calculateMonthlyLoans(userId),
        this.calculateMonthlySavings(userId),
        this.calculateSavingsRate(userId),
        this.calculatePotentialSavings(userId),
        this.calculateCardUtilization(userId),
        this.calculateDebtToIncomeRatio(userId)
      ]);

      const cards = await CreditCard.find({ userId, isActive: true });
      const totalCreditLimit = cards.reduce((sum, card) => sum + card.creditLimit, 0);
      const totalCreditUsed = cards.reduce((sum, card) => sum + card.currentBalance, 0);

      return {
        monthlyIncome,
        monthlyExpenses,
        monthlyInvestments,
        monthlyLoans,
        monthlySavings,
        savingsRate,
        potentialSavingsPercent,
        creditUtilization,
        debtToIncomeRatio,
        totalCreditLimit,
        totalCreditUsed,
        availableCredit: totalCreditLimit - totalCreditUsed,
        cardCount: cards.length,
      };
    } catch (error) {
      logger.error('Error getting metrics:', error);
      throw error;
    }
  }
}

export default new MetricsService();
