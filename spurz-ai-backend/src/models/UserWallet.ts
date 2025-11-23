import mongoose, { Document, Schema } from 'mongoose';

export interface IUserWallet extends Document {
  userId: mongoose.Types.ObjectId;
  totalCoins: number; // Total Spurz coins (10 coins = ₹1)
  totalRupees: number; // Total value in rupees
  lifetimeCoinsEarned: number; // All-time coins earned
  lifetimeRupeesEarned: number; // All-time rupees equivalent
  cardCashbackTotal: number; // Total from card rewards
  taskRewardsTotal: number; // Total from task completion
  referralRewardsTotal: number; // Total from referrals
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserWalletSchema = new Schema<IUserWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    totalCoins: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    totalRupees: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    lifetimeCoinsEarned: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    lifetimeRupeesEarned: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    cardCashbackTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    taskRewardsTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    referralRewardsTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Method to add coins
UserWalletSchema.methods.addCoins = function(coins: number, source: 'card' | 'task' | 'referral') {
  const rupees = coins * 0.1;
  
  this.totalCoins += coins;
  this.totalRupees += rupees;
  this.lifetimeCoinsEarned += coins;
  this.lifetimeRupeesEarned += rupees;
  
  if (source === 'card') {
    this.cardCashbackTotal += rupees;
  } else if (source === 'task') {
    this.taskRewardsTotal += rupees;
  } else if (source === 'referral') {
    this.referralRewardsTotal += rupees;
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to deduct coins (for redemptions)
UserWalletSchema.methods.deductCoins = function(coins: number) {
  if (this.totalCoins < coins) {
    throw new Error('Insufficient coins');
  }
  
  const rupees = coins * 0.1;
  this.totalCoins -= coins;
  this.totalRupees -= rupees;
  this.lastUpdated = new Date();
  
  return this.save();
};

export default mongoose.model<IUserWallet>('UserWallet', UserWalletSchema);
