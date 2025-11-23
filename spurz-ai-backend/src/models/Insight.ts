import mongoose, { Document, Schema, Types } from 'mongoose';

export type InsightCategory = 'spending' | 'saving' | 'credit' | 'income' | 'debt' | 'investment';
export type InsightPriority = 'high' | 'medium' | 'low';

export interface IInsight extends Document {
  userId: Types.ObjectId;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  icon?: string;
  value?: number;
  valueLabel?: string;
  trend?: 'up' | 'down' | 'stable';
  actionable: boolean;
  relatedActionId?: Types.ObjectId;
  isRead: boolean;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const InsightSchema = new Schema<IInsight>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['spending', 'saving', 'credit', 'income', 'debt', 'investment'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
      default: 'medium',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    value: {
      type: Number,
    },
    valueLabel: {
      type: String,
    },
    trend: {
      type: String,
      enum: ['up', 'down', 'stable'],
    },
    actionable: {
      type: Boolean,
      default: false,
    },
    relatedActionId: {
      type: Schema.Types.ObjectId,
      ref: 'NextBestAction',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InsightSchema.index({ userId: 1, createdAt: -1 });
InsightSchema.index({ userId: 1, isRead: 1, priority: -1 });
InsightSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IInsight>('Insight', InsightSchema);
