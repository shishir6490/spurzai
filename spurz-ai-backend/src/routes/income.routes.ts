import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import IncomeSource from '../models/IncomeSource';
import HomeEngineService from '../services/HomeEngineService';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /income
 * Get all income sources for user
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const incomeSources = await IncomeSource.find({ 
      userId: req.user.id,
      isActive: true 
    }).sort({ isPrimary: -1, createdAt: -1 });

    const totalMonthly = incomeSources.reduce((sum, source) => {
      let monthly = source.amount;
      switch (source.frequency) {
        case 'weekly': monthly = source.amount * 4.33; break;
        case 'bi-weekly': monthly = source.amount * 2.17; break;
        case 'monthly': monthly = source.amount; break;
        default: monthly = 0;
      }
      return sum + monthly;
    }, 0);

    res.json({
      incomeSources: incomeSources.map(source => ({
        id: source._id,
        type: source.type,
        name: source.name,
        source: source.name, // Alias for backward compatibility
        amount: source.amount,
        frequency: source.frequency,
        isPrimary: source.isPrimary,
        description: source.description,
        nextPaymentDate: source.nextPaymentDate,
      })),
      summary: {
        totalMonthly: Math.round(totalMonthly),
        sourceCount: incomeSources.length,
      },
    });
  } catch (error) {
    logger.error('Error getting income sources:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get income sources',
    });
  }
});

/**
 * POST /income
 * Add new income source
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      type,
      name,
      source,
      amount,
      frequency,
      isPrimary,
      description,
      nextPaymentDate,
    } = req.body;

    // Support both 'name' and 'source' fields for compatibility
    const incomeName = name || source;

    // Validation
    if (!type && !incomeName) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: name/source and amount',
      });
      return;
    }
    if (!amount || !frequency) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: amount, frequency',
      });
      return;
    }

    // If marking as primary, unmark others
    if (isPrimary) {
      await IncomeSource.updateMany(
        { userId: req.user.id },
        { isPrimary: false }
      );
    }

    const incomeSource = await IncomeSource.create({
      userId: req.user.id,
      type: type || 'salary',
      name: incomeName,
      amount,
      frequency,
      isPrimary: isPrimary || false,
      description,
      nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : undefined,
      isActive: true,
    });

    // Regenerate snapshot
    try {
      await HomeEngineService.generateSnapshot(req.user.id as any);
    } catch (snapshotError) {
      logger.warn('Failed to regenerate snapshot after adding income:', snapshotError);
    }

    res.status(201).json({
      message: 'Income source added successfully',
      incomeSource: {
        id: incomeSource._id,
        type: incomeSource.type,
        name: incomeSource.name,
        amount: incomeSource.amount,
        frequency: incomeSource.frequency,
        isPrimary: incomeSource.isPrimary,
      },
    });
  } catch (error) {
    logger.error('Error adding income source:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add income source',
    });
  }
});

/**
 * PUT /income/:id
 * Update income source
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const updates = req.body;

    const incomeSource = await IncomeSource.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!incomeSource) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Income source not found',
      });
      return;
    }

    // If marking as primary, unmark others
    if (updates.isPrimary && !incomeSource.isPrimary) {
      await IncomeSource.updateMany(
        { userId: req.user.id, _id: { $ne: id } },
        { isPrimary: false }
      );
    }

    // Update fields
    Object.assign(incomeSource, updates);
    await incomeSource.save();

    // Regenerate snapshot
    try {
      await HomeEngineService.generateSnapshot(req.user.id as any);
    } catch (snapshotError) {
      logger.warn('Failed to regenerate snapshot after updating income:', snapshotError);
    }

    res.json({
      message: 'Income source updated successfully',
      incomeSource: {
        id: incomeSource._id,
        type: incomeSource.type,
        name: incomeSource.name,
        amount: incomeSource.amount,
        frequency: incomeSource.frequency,
        isPrimary: incomeSource.isPrimary,
      },
    });
  } catch (error) {
    logger.error('Error updating income source:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update income source',
    });
  }
});

/**
 * DELETE /income/:id
 * Delete income source
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const incomeSource = await IncomeSource.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!incomeSource) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Income source not found',
      });
      return;
    }

    // Soft delete
    incomeSource.isActive = false;
    await incomeSource.save();

    // Regenerate snapshot
    try {
      await HomeEngineService.generateSnapshot(req.user.id as any);
    } catch (snapshotError) {
      logger.warn('Failed to regenerate snapshot after deleting income:', snapshotError);
    }

    res.json({
      message: 'Income source deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting income source:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete income source',
    });
  }
});

export default router;
