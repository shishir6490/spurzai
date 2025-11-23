import mongoose, { Document, Schema } from 'mongoose';

export type DealCategory = 'dining' | 'shopping' | 'travel' | 'entertainment' | 'groceries' | 'fuel' | 'electronics' | 'fashion' | 'health' | 'other';
export type DealType = 'cashback' | 'discount' | 'bogo' | 'freebie' | 'voucher' | 'points';
export type DealStatus = 'active' | 'expired' | 'upcoming' | 'paused';

export interface ICardOffer {
  cardId?: mongoose.Types.ObjectId; // Reference to MarketCreditCard
  bankName: string;
  cardName: string;
  offerDetails: string;
  additionalDiscount?: number; // Extra % off or cashback
  minTransaction?: number;
  maxDiscount?: number;
}

export interface IDeal extends Document {
  merchantName: string;
  merchantLogo?: string;
  category: DealCategory;
  subcategory?: string;
  
  // Deal Details
  title: string;
  description: string;
  dealType: DealType;
  value: number; // Discount % or cashback % or flat amount
  originalPrice?: number;
  discountedPrice?: number;
  
  // Terms
  minTransaction?: number;
  maxDiscount?: number;
  termsAndConditions?: string;
  
  // Card Specific Offers
  cardOffers: ICardOffer[]; // Different offers for different cards
  
  // Location
  locations?: string[]; // Cities or specific addresses
  isOnline: boolean;
  dealUrl?: string;
  
  // Validity
  startDate: Date;
  endDate: Date;
  status: DealStatus;
  
  // Engagement
  views: number;
  clicks: number;
  redemptions: number;
  popularity: number; // Calculated score for ranking
  
  // Tags
  tags: string[];
  
  // Metadata
  isActive: boolean;
  isFeatured: boolean;
  featuredOrder?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    merchantName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    merchantLogo: String,
    category: {
      type: String,
      enum: ['dining', 'shopping', 'travel', 'entertainment', 'groceries', 'fuel', 'electronics', 'fashion', 'health', 'other'],
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    
    // Deal Details
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    dealType: {
      type: String,
      enum: ['cashback', 'discount', 'bogo', 'freebie', 'voucher', 'points'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: Number,
    discountedPrice: Number,
    
    // Terms
    minTransaction: Number,
    maxDiscount: Number,
    termsAndConditions: String,
    
    // Card Offers
    cardOffers: [
      {
        cardId: {
          type: Schema.Types.ObjectId,
          ref: 'MarketCreditCard',
        },
        bankName: {
          type: String,
          required: true,
        },
        cardName: {
          type: String,
          required: true,
        },
        offerDetails: {
          type: String,
          required: true,
        },
        additionalDiscount: Number,
        minTransaction: Number,
        maxDiscount: Number,
      },
    ],
    
    // Location
    locations: [String],
    isOnline: {
      type: Boolean,
      default: false,
    },
    dealUrl: String,
    
    // Validity
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'upcoming', 'paused'],
      default: 'active',
      index: true,
    },
    
    // Engagement
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    redemptions: {
      type: Number,
      default: 0,
    },
    popularity: {
      type: Number,
      default: 0,
      index: true,
    },
    
    // Tags
    tags: {
      type: [String],
      default: [],
    },
    
    // Metadata
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredOrder: Number,
  },
  {
    timestamps: true,
  }
);

// Compound Indexes
DealSchema.index({ category: 1, status: 1, endDate: -1 });
DealSchema.index({ isActive: 1, isFeatured: -1, popularity: -1 });
DealSchema.index({ merchantName: 1, status: 1 });
DealSchema.index({ 'cardOffers.bankName': 1 });

// Text search
DealSchema.index({ title: 'text', description: 'text', merchantName: 'text', tags: 'text' });

// Auto-expire deals
DealSchema.index({ endDate: 1 }, { expireAfterSeconds: 86400 }); // Delete 1 day after expiry

// Virtual for deal engagement score
DealSchema.virtual('engagementScore').get(function () {
  return (this.views * 0.1) + (this.clicks * 0.3) + (this.redemptions * 0.6);
});

// Update status based on dates
DealSchema.pre('save', function (next) {
  const now = new Date();
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now > this.endDate) {
    this.status = 'expired';
  } else if (this.status !== 'paused') {
    this.status = 'active';
  }
  
  // Calculate popularity score based on engagement
  const views = this.views || 0;
  const clicks = this.clicks || 0;
  const redemptions = this.redemptions || 0;
  this.popularity = redemptions * 10 + clicks * 2 + views;
  
  next();
});

export default mongoose.model<IDeal>('Deal', DealSchema);
