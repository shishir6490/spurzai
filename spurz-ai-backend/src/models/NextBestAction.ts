import mongoose, { Document, Schema, Types } from 'mongoose';

export type ActionType = 'payment' | 'saving' | 'investment' | 'credit' | 'spending' | 'other';
export type ActionStatus = 'pending' | 'completed' | 'dismissed' | 'snoozed';

export interface INextBestAction extends Document {
  userId: Types.ObjectId;
  type: ActionType;
  title: string;
  description: string;
  icon?: string;
  priority: number;
  estimatedImpact?: string;
  estimatedSavings?: number;
  dueDate?: Date;
  status: ActionStatus;
  completedAt?: Date;
  snoozedUntil?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NextBestActionSchema = new Schema<INextBestAction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['payment', 'saving', 'investment', 'credit', 'spending', 'other'],
      required: true,
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
    priority: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 10,
    },
    estimatedImpact: {
      type: String,
    },
    estimatedSavings: {
      type: Number,
      min: 0,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'dismissed', 'snoozed'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
    },
    snoozedUntil: {
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
NextBestActionSchema.index({ userId: 1, status: 1, priority: -1 });
NextBestActionSchema.index({ userId: 1, dueDate: 1 });
NextBestActionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INextBestAction>('NextBestAction', NextBestActionSchema);
