import mongoose, { Document, Schema, Types } from 'mongoose';

export type SpendingCategoryType = 
  | 'dining' 
  | 'groceries' 
  | 'fuel' 
  | 'travel' 
  | 'shopping' 
  | 'entertainment' 
  | 'utilities' 
  | 'health' 
  | 'education' 
  | 'electronics'
  | 'fashion'
  | 'insurance'
  | 'bills'
  | 'other';

export interface IMonthlyBreakdown {
  month: string; // 'YYYY-MM'
  amount: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface IRecommendedCard {
  cardId: Types.ObjectId; // Reference to MarketCreditCard
  bankName: string;
  cardName: string;
  estimatedReward: number; // Estimated monthly reward in this category
  rewardRate: number;
  reason: string;
}

export interface ISpendingCategory extends Document {
  userId: Types.ObjectId;
  category: SpendingCategoryType;
  
  // Current Period (Last 30 days)
  currentMonthSpending: number;
  previousMonthSpending: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  
  // Historical Data
  totalSpending: number;
  averageMonthlySpending: number;
  monthlyBreakdown: IMonthlyBreakdown[];
  
  // Transaction Stats
  totalTransactions: number;
  averageTransactionAmount: number;
  lastTransactionDate?: Date;
  
  // Top Merchants in this category
  topMerchants?: Array<{
    merchantName: string;
    amount: number;
    transactionCount: number;
  }>;
  
  // Card Usage
  cardsUsed?: Array<{
    cardId: Types.ObjectId; // User's CreditCard
    amount: number;
    rewardEarned: number;
  }>;
  
  // Recommended Cards for this category
  recommendedCards: IRecommendedCard[];
  
  // Insights
  isHighSpendingCategory: boolean; // Top 3 categories
  potentialSavings?: number; // If using optimal card
  
  lastCalculated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const SpendingCategorySchema = new Schema<ISpendingCategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'dining', 'groceries', 'fuel', 'travel', 'shopping', 
        'entertainment', 'utilities', 'health', 'education',
        'electronics', 'fashion', 'insurance', 'bills', 'other'
      ],
      required: true,
    },
    
    // Current Period
    currentMonthSpending: {
      type: Number,
      required: true,
      default: 0,
    },
    previousMonthSpending: {
      type: Number,
      required: true,
      default: 0,
    },
    trend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'stable',
    },
    trendPercentage: {
      type: Number,
      default: 0,
    },
    
    // Historical
    totalSpending: {
      type: Number,
      required: true,
      default: 0,
    },
    averageMonthlySpending: {
      type: Number,
      required: true,
      default: 0,
    },
    monthlyBreakdown: [
      {
        month: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        transactionCount: {
          type: Number,
          required: true,
        },
        averageTransaction: {
          type: Number,
          required: true,
        },
      },
    ],
    
    // Transaction Stats
    totalTransactions: {
      type: Number,
      default: 0,
    },
    averageTransactionAmount: {
      type: Number,
      default: 0,
    },
    lastTransactionDate: Date,
    
    // Top Merchants
    topMerchants: [
      {
        merchantName: String,
        amount: Number,
        transactionCount: Number,
      },
    ],
    
    // Card Usage
    cardsUsed: [
      {
        cardId: {
          type: Schema.Types.ObjectId,
          ref: 'CreditCard',
        },
        amount: Number,
        rewardEarned: Number,
      },
    ],
    
    // Recommendations
    recommendedCards: [
      {
        cardId: {
          type: Schema.Types.ObjectId,
          ref: 'MarketCreditCard',
          required: true,
        },
        bankName: {
          type: String,
          required: true,
        },
        cardName: {
          type: String,
          required: true,
        },
        estimatedReward: {
          type: Number,
          required: true,
        },
        rewardRate: {
          type: Number,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
      },
    ],
    
    // Insights
    isHighSpendingCategory: {
      type: Boolean,
      default: false,
    },
    potentialSavings: Number,
    
    lastCalculated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SpendingCategorySchema.index({ userId: 1, category: 1 }, { unique: true });
SpendingCategorySchema.index({ userId: 1, currentMonthSpending: -1 });
SpendingCategorySchema.index({ userId: 1, isHighSpendingCategory: -1 });
SpendingCategorySchema.index({ lastCalculated: 1 });

// Calculate trend before saving
SpendingCategorySchema.pre('save', function (next) {
  if (this.previousMonthSpending > 0) {
    const change = this.currentMonthSpending - this.previousMonthSpending;
    this.trendPercentage = (change / this.previousMonthSpending) * 100;
    
    if (Math.abs(this.trendPercentage) < 5) {
      this.trend = 'stable';
    } else if (this.trendPercentage > 0) {
      this.trend = 'up';
    } else {
      this.trend = 'down';
    }
  }
  
  next();
});

export default mongoose.model<ISpendingCategory>('SpendingCategory', SpendingCategorySchema);
