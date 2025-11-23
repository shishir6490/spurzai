import mongoose, { Document, Schema, Types } from 'mongoose';

export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'other';

export interface ICreditCard extends Document {
  userId: Types.ObjectId;
  bankName: string;
  cardName: string;
  lastFourDigits: string;
  last4Digits: string; // Alias for lastFourDigits
  network: CardNetwork;
  cardNetwork: CardNetwork; // Alias for network
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  utilizationPercentage: number; // Virtual property
  billingCycleDay: number;
  dueDay: number; // Alias for billingCycleDay
  dueDate: Date;
  lastBillingDate?: Date;
  nextBillingDate?: Date;
  lastPaymentDate?: Date;
  isPrimary: boolean;
  rewardType?: string;
  rewardRate?: number;
  totalRewardsEarned?: number;
  rewardsBalance?: number;
  annualFee?: number;
  interestRate?: number;
  issueDate?: Date;
  rewards?: {
    type: string;
    pointsBalance?: number;
    cashbackPercent?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CreditCardSchema = new Schema<ICreditCard>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    cardName: {
      type: String,
      required: true,
      trim: true,
    },
    lastFourDigits: {
      type: String,
      required: true,
      match: /^\d{4}$/,
    },
    network: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'rupay', 'other'],
      required: true,
    },
    creditLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    availableCredit: {
      type: Number,
      required: true,
    },
    billingCycleDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    lastBillingDate: Date,
    nextBillingDate: Date,
    lastPaymentDate: Date,
    isPrimary: {
      type: Boolean,
      default: false,
    },
    rewardType: String,
    rewardRate: Number,
    totalRewardsEarned: {
      type: Number,
      default: 0,
    },
    rewardsBalance: {
      type: Number,
      default: 0,
    },
    annualFee: Number,
    interestRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    issueDate: Date,
    rewards: {
      type: {
        type: String,
        enum: ['points', 'cashback', 'miles', 'none'],
      },
      pointsBalance: Number,
      cashbackPercent: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CreditCardSchema.index({ userId: 1, isActive: 1 });

// Virtual for utilization percentage
CreditCardSchema.virtual('utilizationPercent').get(function () {
  if (this.creditLimit === 0) return 0;
  return (this.currentBalance / this.creditLimit) * 100;
});

CreditCardSchema.virtual('utilizationPercentage').get(function () {
  if (this.creditLimit === 0) return 0;
  return (this.currentBalance / this.creditLimit) * 100;
});

// Alias virtuals for backward compatibility
CreditCardSchema.virtual('last4Digits').get(function () {
  return this.lastFourDigits;
});

CreditCardSchema.virtual('cardNetwork').get(function () {
  return this.network;
});

CreditCardSchema.virtual('dueDay').get(function () {
  return this.billingCycleDay;
});

// Update availableCredit before saving
CreditCardSchema.pre('save', function (next) {
  this.availableCredit = this.creditLimit - this.currentBalance;
  next();
});

// Enable virtuals in JSON
CreditCardSchema.set('toJSON', { virtuals: true });
CreditCardSchema.set('toObject', { virtuals: true });

export default mongoose.model<ICreditCard>('CreditCard', CreditCardSchema);
