import mongoose, { Document, Schema } from 'mongoose';

// Reward types
export enum RewardType {
  TASK_COMPLETION = 'TASK_COMPLETION',
  CARD_CASHBACK = 'CARD_CASHBACK',
  REFERRAL = 'REFERRAL',
  DAILY_LOGIN = 'DAILY_LOGIN',
  PROFILE_COMPLETION = 'PROFILE_COMPLETION',
  SPENDING_GOAL = 'SPENDING_GOAL',
  CARD_LINK = 'CARD_LINK',
  DEAL_REDEEM = 'DEAL_REDEEM',
  MONTHLY_BONUS = 'MONTHLY_BONUS',
  SPECIAL_EVENT = 'SPECIAL_EVENT'
}

// Reward status
export enum RewardStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED'
}

export interface IReward extends Document {
  userId: mongoose.Types.ObjectId;
  type: RewardType;
  coins: number; // Spurz coins earned (10 coins = ₹1)
  rupees: number; // Equivalent in rupees (coins * 0.1)
  description: string;
  taskId?: string; // Reference to specific task if applicable
  creditCardId?: mongoose.Types.ObjectId; // If from card cashback
  status: RewardStatus;
  claimedAt?: Date;
  expiresAt?: Date;
  metadata?: {
    cardName?: string;
    transactionAmount?: number;
    cashbackPercentage?: number;
    referralCode?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RewardSchema = new Schema<IReward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: Object.values(RewardType),
      required: true
    },
    coins: {
      type: Number,
      required: true,
      min: 0
    },
    rupees: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    },
    taskId: {
      type: String
    },
    creditCardId: {
      type: Schema.Types.ObjectId,
      ref: 'CreditCard'
    },
    status: {
      type: String,
      enum: Object.values(RewardStatus),
      default: RewardStatus.PENDING
    },
    claimedAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
RewardSchema.index({ userId: 1, status: 1 });
RewardSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IReward>('Reward', RewardSchema);
