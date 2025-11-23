import mongoose, { Document, Schema, Types } from 'mongoose';

export type IncomeFrequency = 'monthly' | 'weekly' | 'bi-weekly' | 'one-time';
export type IncomeType = 'salary' | 'freelance' | 'business' | 'investment' | 'loan' | 'other';

export interface IIncomeSource extends Document {
  userId: Types.ObjectId;
  name: string;
  type: IncomeType;
  amount: number;
  frequency: IncomeFrequency;
  isPrimary: boolean;
  nextPaymentDate?: Date;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSourceSchema = new Schema<IIncomeSource>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['salary', 'freelance', 'business', 'investment', 'loan', 'other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ['monthly', 'weekly', 'bi-weekly', 'one-time'],
      required: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    nextPaymentDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
IncomeSourceSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IIncomeSource>('IncomeSource', IncomeSourceSchema);
