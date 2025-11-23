import mongoose, { Document, Schema, Types } from 'mongoose';

export type GoalCategory = 'savings' | 'debt' | 'investment' | 'purchase' | 'emergency' | 'other';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface IGoal extends Document {
  userId: Types.ObjectId;
  category: GoalCategory;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  status: GoalStatus;
  priority: number;
  icon?: string;
  color?: string;
  milestones?: Array<{
    amount: number;
    label: string;
    reached: boolean;
    reachedAt?: Date;
  }>;
  completedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['savings', 'debt', 'investment', 'purchase', 'emergency', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active',
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
    },
    milestones: [
      {
        amount: {
          type: Number,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
        reached: {
          type: Boolean,
          default: false,
        },
        reachedAt: {
          type: Date,
        },
      },
    ],
    completedAt: {
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
GoalSchema.index({ userId: 1, status: 1, priority: -1 });
GoalSchema.index({ userId: 1, deadline: 1 });
GoalSchema.index({ userId: 1, createdAt: -1 });

// Virtual for progress percentage
GoalSchema.virtual('progressPercent').get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Auto-complete goal when target reached
GoalSchema.pre('save', function (next) {
  if (this.currentAmount >= this.targetAmount && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  next();
});

export default mongoose.model<IGoal>('Goal', GoalSchema);
