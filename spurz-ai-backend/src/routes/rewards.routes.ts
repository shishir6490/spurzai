import { Router, Request, Response } from 'express';
import Reward, { RewardType, RewardStatus } from '../models/Reward';
import UserWallet from '../models/UserWallet';
import User from '../models/User';

const router = Router();

/**
 * GET /api/rewards/wallet/:userId
 * Get user's wallet balance and stats
 */
router.get('/wallet/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get or create wallet
    let wallet = await UserWallet.findOne({ userId });
    
    if (!wallet) {
      wallet = await UserWallet.create({
        userId,
        totalCoins: 0,
        totalRupees: 0,
        lifetimeCoinsEarned: 0,
        lifetimeRupeesEarned: 0,
        cardCashbackTotal: 0,
        taskRewardsTotal: 0,
        referralRewardsTotal: 0
      });
    }

    // Get recent rewards
    const recentRewards = await Reward.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get pending rewards count
    const pendingRewardsCount = await Reward.countDocuments({
      userId,
      status: RewardStatus.PENDING
    });

    res.json({
      success: true,
      data: {
        wallet,
        recentRewards,
        pendingRewardsCount,
        conversionRate: {
          coinsPerRupee: 10,
          rupeesPerCoin: 0.1,
          message: '10 Spurz Coins = ₹1'
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rewards/history/:userId
 * Get user's rewards history with filters
 */
router.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { type, status, limit = 50, skip = 0 } = req.query;

    const query: any = { userId };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const rewards = await Reward.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const total = await Reward.countDocuments(query);

    res.json({
      success: true,
      data: {
        rewards,
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
          hasMore: total > Number(skip) + Number(limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching rewards history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/rewards/add
 * Add a new reward for user (admin/system use)
 */
router.post('/add', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      type,
      coins,
      description,
      taskId,
      creditCardId,
      metadata,
      expiresAt
    } = req.body;

    if (!userId || !type || !coins || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, type, coins, description'
      });
    }

    const rupees = coins * 0.1;

    // Create reward
    const reward = await Reward.create({
      userId,
      type,
      coins,
      rupees,
      description,
      taskId,
      creditCardId,
      metadata,
      status: RewardStatus.COMPLETED, // Auto-complete for now
      expiresAt,
      claimedAt: new Date() // Auto-claim for now
    });

    // Update wallet
    let wallet = await UserWallet.findOne({ userId });
    
    if (!wallet) {
      wallet = await UserWallet.create({ userId });
    }

    const source = type.includes('CARD') ? 'card' : 
                   type.includes('REFERRAL') ? 'referral' : 'task';
    
    await wallet.addCoins(coins, source);

    res.json({
      success: true,
      data: {
        reward,
        wallet
      },
      message: `Successfully added ${coins} coins (₹${rupees.toFixed(2)}) to wallet`
    });
  } catch (error: any) {
    console.error('Error adding reward:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/rewards/claim/:rewardId
 * Claim a pending reward
 */
router.post('/claim/:rewardId', async (req: Request, res: Response) => {
  try {
    const { rewardId } = req.params;
    const { userId } = req.body;

    const reward = await Reward.findOne({
      _id: rewardId,
      userId,
      status: RewardStatus.PENDING
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        error: 'Reward not found or already claimed'
      });
    }

    // Check expiration
    if (reward.expiresAt && reward.expiresAt < new Date()) {
      reward.status = RewardStatus.EXPIRED;
      await reward.save();
      
      return res.status(400).json({
        success: false,
        error: 'Reward has expired'
      });
    }

    // Update reward
    reward.status = RewardStatus.CLAIMED;
    reward.claimedAt = new Date();
    await reward.save();

    // Update wallet
    let wallet = await UserWallet.findOne({ userId });
    
    if (!wallet) {
      wallet = await UserWallet.create({ userId });
    }

    const source = reward.type.includes('CARD') ? 'card' : 
                   reward.type.includes('REFERRAL') ? 'referral' : 'task';
    
    await wallet.addCoins(reward.coins, source);

    res.json({
      success: true,
      data: {
        reward,
        wallet
      },
      message: `Successfully claimed ${reward.coins} coins (₹${reward.rupees.toFixed(2)})`
    });
  } catch (error: any) {
    console.error('Error claiming reward:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rewards/stats/:userId
 * Get detailed reward statistics
 */
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const wallet = await UserWallet.findOne({ userId });

    if (!wallet) {
      return res.json({
        success: true,
        data: {
          totalCoins: 0,
          totalRupees: 0,
          lifetimeCoinsEarned: 0,
          lifetimeRupeesEarned: 0,
          breakdown: {
            cardCashback: 0,
            taskRewards: 0,
            referralRewards: 0
          },
          thisMonth: {
            coins: 0,
            rupees: 0
          }
        }
      });
    }

    // Calculate this month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRewards = await Reward.aggregate([
      {
        $match: {
          userId: wallet.userId,
          status: { $in: [RewardStatus.COMPLETED, RewardStatus.CLAIMED] },
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalCoins: { $sum: '$coins' },
          totalRupees: { $sum: '$rupees' }
        }
      }
    ]);

    const thisMonth = monthlyRewards[0] || { totalCoins: 0, totalRupees: 0 };

    res.json({
      success: true,
      data: {
        totalCoins: wallet.totalCoins,
        totalRupees: wallet.totalRupees,
        lifetimeCoinsEarned: wallet.lifetimeCoinsEarned,
        lifetimeRupeesEarned: wallet.lifetimeRupeesEarned,
        breakdown: {
          cardCashback: wallet.cardCashbackTotal,
          taskRewards: wallet.taskRewardsTotal,
          referralRewards: wallet.referralRewardsTotal
        },
        thisMonth: {
          coins: thisMonth.totalCoins,
          rupees: thisMonth.totalRupees
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching reward stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
