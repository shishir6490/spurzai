import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import CreditCard from '../models/CreditCard';
import HomeEngineService from '../services/HomeEngineService';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /cards
 * Get all credit cards for user
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const cards = await CreditCard.find({ 
      userId: req.user.id,
      isActive: true 
    }).sort({ isPrimary: -1, createdAt: -1 });

    const totalLimit = cards.reduce((sum, card) => sum + card.creditLimit, 0);
    const totalUsed = cards.reduce((sum, card) => sum + card.currentBalance, 0);
    const totalAvailable = cards.reduce((sum, card) => sum + card.availableCredit, 0);
    const overallUtilization = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

    res.json({
      cards: cards.map(card => ({
        id: card._id,
        bankName: card.bankName,
        cardName: card.cardName,
        last4Digits: card.last4Digits,
        cardNetwork: card.cardNetwork,
        creditLimit: card.creditLimit,
        availableCredit: card.availableCredit,
        currentBalance: card.currentBalance,
        utilizationPercentage: card.utilizationPercentage,
        billingCycleDay: card.billingCycleDay,
        dueDay: card.dueDay,
        isPrimary: card.isPrimary,
        rewardType: card.rewardType,
        rewardRate: card.rewardRate,
        totalRewardsEarned: card.totalRewardsEarned,
        annualFee: card.annualFee,
      })),
      summary: {
        totalCards: cards.length,
        totalCreditLimit: totalLimit,
        totalUsed: totalUsed,
        totalAvailable: totalAvailable,
        overallUtilization: Math.round(overallUtilization * 10) / 10,
      },
    });
  } catch (error) {
    logger.error('Error getting credit cards:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get credit cards',
    });
  }
});

/**
 * GET /cards/:id
 * Get single credit card details
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const card = await CreditCard.findOne({
      _id: id,
      userId: req.user.id,
      isActive: true,
    });

    if (!card) {
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
        last4Digits: card.last4Digits,
        cardNetwork: card.cardNetwork,
        creditLimit: card.creditLimit,
        availableCredit: card.availableCredit,
        currentBalance: card.currentBalance,
        utilizationPercentage: card.utilizationPercentage,
        billingCycleDay: card.billingCycleDay,
        dueDay: card.dueDay,
        lastBillingDate: card.lastBillingDate,
        nextBillingDate: card.nextBillingDate,
        lastPaymentDate: card.lastPaymentDate,
        isPrimary: card.isPrimary,
        rewardType: card.rewardType,
        rewardRate: card.rewardRate,
        totalRewardsEarned: card.totalRewardsEarned,
        rewardsBalance: card.rewardsBalance,
        annualFee: card.annualFee,
        interestRate: card.interestRate,
        issueDate: card.issueDate,
      },
    });
  } catch (error) {
    logger.error('Error getting credit card:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get credit card',
    });
  }
});

/**
 * POST /cards
 * Add new credit card
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      bankName,
      cardName,
      last4Digits,
      cardNetwork,
      network,
      creditLimit,
      currentBalance,
      billingCycleDay,
      dueDay,
      isPrimary,
      rewardType,
      rewardRate,
      annualFee,
      interestRate,
      issueDate,
    } = req.body;

    // Support both 'cardNetwork' and 'network' for compatibility
    const cardNet = cardNetwork || network || 'visa';

    // Validation
    if (!bankName || !cardName || !last4Digits || !creditLimit) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: bankName, cardName, last4Digits, creditLimit',
      });
      return;
    }

    // If marking as primary, unmark others
    if (isPrimary) {
      await CreditCard.updateMany(
        { userId: req.user.id },
        { isPrimary: false }
      );
    }

    const card = await CreditCard.create({
      userId: req.user.id,
      bankName,
      cardName,
      last4Digits,
      cardNetwork: cardNet,
      creditLimit,
      currentBalance: currentBalance || 0,
      billingCycleDay,
      dueDay,
      isPrimary: isPrimary || false,
      rewardType,
      rewardRate,
      annualFee,
      interestRate,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      isActive: true,
    });

    // Regenerate snapshot
    try {
      await HomeEngineService.generateSnapshot(req.user.id as any);
    } catch (snapshotError) {
      logger.warn('Failed to regenerate snapshot after adding card:', snapshotError);
    }

    res.status(201).json({
      message: 'Credit card added successfully',
      card: {
        id: card._id,
        bankName: card.bankName,
        cardName: card.cardName,
        last4Digits: card.last4Digits,
        creditLimit: card.creditLimit,
        availableCredit: card.availableCredit,
        isPrimary: card.isPrimary,
      },
    });
  } catch (error) {
    logger.error('Error adding credit card:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add credit card',
    });
  }
});

/**
 * PATCH /cards/:id
 * Update credit card
 */
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const updates = req.body;

    const card = await CreditCard.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!card) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Credit card not found',
      });
      return;
    }

    // If marking as primary, unmark others
    if (updates.isPrimary && !card.isPrimary) {
      await CreditCard.updateMany(
        { userId: req.user.id, _id: { $ne: id } },
        { isPrimary: false }
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      'cardName',
      'creditLimit',
      'currentBalance',
      'billingCycleDay',
      'dueDay',
      'isPrimary',
      'rewardType',
      'rewardRate',
      'annualFee',
      'interestRate',
      'rewardsBalance',
      'lastPaymentDate',
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        (card as any)[field] = updates[field];
      }
    });

    await card.save();

    // Regenerate snapshot
    try {
      await HomeEngineService.generateSnapshot(req.user.id as any);
    } catch (snapshotError) {
      logger.warn('Failed to regenerate snapshot after updating card:', snapshotError);
    }

    res.json({
      message: 'Credit card updated successfully',
      card: {
        id: card._id,
        bankName: card.bankName,
        cardName: card.cardName,
        last4Digits: card.last4Digits,
        creditLimit: card.creditLimit,
        availableCredit: card.availableCredit,
        currentBalance: card.currentBalance,
        utilizationPercentage: card.utilizationPercentage,
      },
    });
  } catch (error) {
    logger.error('Error updating credit card:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update credit card',
    });
  }
});

/**
 * DELETE /cards/:id
 * Delete credit card (soft delete)
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const card = await CreditCard.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!card) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Credit card not found',
      });
      return;
    }

    // Soft delete
    card.isActive = false;
    await card.save();

    // Regenerate snapshot
    try {
      await HomeEngineService.generateSnapshot(req.user.id as any);
    } catch (snapshotError) {
      logger.warn('Failed to regenerate snapshot after deleting card:', snapshotError);
    }

    res.json({
      message: 'Credit card deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting credit card:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete credit card',
    });
  }
});

export default router;
