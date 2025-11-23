import mongoose, { Document, Schema, Types } from 'mongoose';

export type RecommendationType = 'new_card' | 'existing_card' | 'upgrade';
export type RecommendationReason = 
  | 'high_spending_category'
  | 'better_rewards'
  | 'annual_fee_savings'
  | 'welcome_bonus'
  | 'partner_merchant'
  | 'low_utilization'
  | 'debt_consolidation';

export interface ICardRecommendation extends Document {
  userId: Types.ObjectId;
  
  // Recommended Card
  marketCardId?: Types.ObjectId; // Reference to MarketCreditCard (for new card)
  userCardId?: Types.ObjectId; // Reference to user's CreditCard (for existing card)
  
  type: RecommendationType;
  
  // Card Details (denormalized for quick access)
  bankName: string;
  cardName: string;
  cardImageUrl?: string;
  
  // Recommendation Details
  primaryReason: RecommendationReason;
  reasons: string[]; // Human-readable reasons
  
  // Financial Impact
  estimatedMonthlySavings?: number;
  estimatedYearlySavings?: number;
  estimatedRewards?: number; // Per month
  
  // Context
  relevantCategories?: string[]; // Categories where this card is best
  relevantDeals?: Types.ObjectId[]; // Deal IDs this card works with
  
  // Scoring
  score: number; // 0-100, confidence/relevance score
  priority: number; // 1-10, display priority
  
  // User Interaction
  isViewed: boolean;
  viewedAt?: Date;
  isDismissed: boolean;
  dismissedAt?: Date;
  dismissReason?: string;
  isApplied: boolean;
  appliedAt?: Date;
  
  // Validity
  expiresAt?: Date;
  isActive: boolean;
  
  // Metadata
  calculationData?: Record<string, any>; // Store calculation details for debugging
  
  createdAt: Date;
  updatedAt: Date;
}

const CardRecommendationSchema = new Schema<ICardRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Card References
    marketCardId: {
      type: Schema.Types.ObjectId,
      ref: 'MarketCreditCard',
    },
    userCardId: {
      type: Schema.Types.ObjectId,
      ref: 'CreditCard',
    },
    
    type: {
      type: String,
      enum: ['new_card', 'existing_card', 'upgrade'],
      required: true,
    },
    
    // Card Details
    bankName: {
      type: String,
      required: true,
    },
    cardName: {
      type: String,
      required: true,
    },
    cardImageUrl: String,
    
    // Reasons
    primaryReason: {
      type: String,
      enum: [
        'high_spending_category',
        'better_rewards',
        'annual_fee_savings',
        'welcome_bonus',
        'partner_merchant',
        'low_utilization',
        'debt_consolidation',
      ],
      required: true,
    },
    reasons: {
      type: [String],
      default: [],
    },
    
    // Financial Impact
    estimatedMonthlySavings: Number,
    estimatedYearlySavings: Number,
    estimatedRewards: Number,
    
    // Context
    relevantCategories: [String],
    relevantDeals: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Deal',
      },
    ],
    
    // Scoring
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50,
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5,
    },
    
    // User Interaction
    isViewed: {
      type: Boolean,
      default: false,
    },
    viewedAt: Date,
    isDismissed: {
      type: Boolean,
      default: false,
      index: true,
    },
    dismissedAt: Date,
    dismissReason: String,
    isApplied: {
      type: Boolean,
      default: false,
    },
    appliedAt: Date,
    
    // Validity
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    
    // Metadata
    calculationData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CardRecommendationSchema.index({ userId: 1, isActive: 1, priority: -1, score: -1 });
CardRecommendationSchema.index({ userId: 1, type: 1, isDismissed: 1 });
CardRecommendationSchema.index({ userId: 1, primaryReason: 1 });
CardRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for days until expiry
CardRecommendationSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiresAt) return null;
  const now = new Date();
  const diff = this.expiresAt.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Enable virtuals in JSON
CardRecommendationSchema.set('toJSON', { virtuals: true });
CardRecommendationSchema.set('toObject', { virtuals: true });

export default mongoose.model<ICardRecommendation>('CardRecommendation', CardRecommendationSchema);
