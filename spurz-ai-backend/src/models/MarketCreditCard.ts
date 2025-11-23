import mongoose, { Document, Schema } from 'mongoose';

export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'diners' | 'other';
export type CardTier = 'basic' | 'silver' | 'gold' | 'platinum' | 'signature' | 'infinite';
export type RewardType = 'cashback' | 'points' | 'miles' | 'none';

export interface IRewardCategory {
  category: string; // 'dining', 'fuel', 'groceries', 'travel', 'shopping', 'utilities', 'entertainment', 'other'
  rewardRate: number; // Cashback % or points per 100 spent
  cap?: number; // Monthly/yearly cap on rewards
  capPeriod?: 'monthly' | 'quarterly' | 'yearly';
}

export interface IPartnerMerchant {
  merchantName: string;
  category: string;
  specialRewardRate?: number;
  offerDescription?: string;
}

export interface IMarketCreditCard extends Document {
  bankName: string;
  cardName: string;
  network: CardNetwork;
  tier: CardTier;
  imageUrl?: string;
  
  // Fees & Charges
  annualFee: number;
  joiningFee: number;
  feeWaiverConditions?: string;
  
  // Interest & Charges
  interestRate: number; // APR
  lateFee: number;
  
  // Rewards Structure
  rewardType: RewardType;
  baseRewardRate: number; // Base cashback % or points per 100
  rewardCategories: IRewardCategory[];
  
  // Partner Merchants
  partnerMerchants?: IPartnerMerchant[];
  
  // Benefits & Features
  features: string[]; // ['lounge_access', 'fuel_surcharge_waiver', 'airport_transfer', etc.]
  welcomeBenefits?: string;
  
  // Eligibility
  minIncome?: number;
  minCreditScore?: number;
  eligibilityCriteria?: string;
  
  // Links
  applyUrl?: string;
  termsUrl?: string;
  
  // Metadata
  isActive: boolean;
  popularity: number; // For ranking/sorting
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const MarketCreditCardSchema = new Schema<IMarketCreditCard>(
  {
    bankName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    cardName: {
      type: String,
      required: true,
      trim: true,
    },
    network: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'rupay', 'diners', 'other'],
      required: true,
    },
    tier: {
      type: String,
      enum: ['basic', 'silver', 'gold', 'platinum', 'signature', 'infinite'],
      required: true,
    },
    imageUrl: String,
    
    // Fees
    annualFee: {
      type: Number,
      required: true,
      default: 0,
    },
    joiningFee: {
      type: Number,
      required: true,
      default: 0,
    },
    feeWaiverConditions: String,
    
    // Interest
    interestRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    lateFee: {
      type: Number,
      required: true,
      default: 0,
    },
    
    // Rewards
    rewardType: {
      type: String,
      enum: ['cashback', 'points', 'miles', 'none'],
      required: true,
    },
    baseRewardRate: {
      type: Number,
      required: true,
      default: 0,
    },
    rewardCategories: [
      {
        category: {
          type: String,
          required: true,
        },
        rewardRate: {
          type: Number,
          required: true,
        },
        cap: Number,
        capPeriod: {
          type: String,
          enum: ['monthly', 'quarterly', 'yearly'],
        },
      },
    ],
    
    // Partners
    partnerMerchants: [
      {
        merchantName: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        specialRewardRate: Number,
        offerDescription: String,
      },
    ],
    
    // Benefits
    features: {
      type: [String],
      default: [],
    },
    welcomeBenefits: String,
    
    // Eligibility
    minIncome: Number,
    minCreditScore: Number,
    eligibilityCriteria: String,
    
    // Links
    applyUrl: String,
    termsUrl: String,
    
    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    popularity: {
      type: Number,
      default: 0,
      index: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MarketCreditCardSchema.index({ bankName: 1, cardName: 1 });
MarketCreditCardSchema.index({ isActive: 1, popularity: -1 });
MarketCreditCardSchema.index({ 'rewardCategories.category': 1 });
MarketCreditCardSchema.index({ tier: 1, annualFee: 1 });

// Text search index for card search
MarketCreditCardSchema.index({ bankName: 'text', cardName: 'text', features: 'text' });

export default mongoose.model<IMarketCreditCard>('MarketCreditCard', MarketCreditCardSchema);
