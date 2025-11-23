import mongoose, { Document, Schema, Types } from 'mongoose';

export type FinancialHealthStatus = 'excellent' | 'good' | 'fair' | 'poor';

export interface IFinancialSnapshot extends Document {
  userId: Types.ObjectId;
  date: Date;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  creditUtilization: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  healthScore: number;
  healthStatus: FinancialHealthStatus;
  metrics: {
    totalCreditLimit: number;
    totalCreditUsed: number;
    availableCredit: number;
    upcomingPayments: number;
    monthlyBurnRate: number;
  };
  scenario?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialSnapshotSchema = new Schema<IFinancialSnapshot>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalIncome: {
      type: Number,
      required: true,
      default: 0,
    },
    totalExpenses: {
      type: Number,
      required: true,
      default: 0,
    },
    savingsRate: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    creditUtilization: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    debtToIncomeRatio: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    emergencyFundMonths: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    healthScore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    healthStatus: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true,
      default: 'fair',
    },
    metrics: {
      totalCreditLimit: {
        type: Number,
        default: 0,
      },
      totalCreditUsed: {
        type: Number,
        default: 0,
      },
      availableCredit: {
        type: Number,
        default: 0,
      },
      upcomingPayments: {
        type: Number,
        default: 0,
      },
      monthlyBurnRate: {
        type: Number,
        default: 0,
      },
    },
    scenario: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FinancialSnapshotSchema.index({ userId: 1, date: -1 });
FinancialSnapshotSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IFinancialSnapshot>('FinancialSnapshot', FinancialSnapshotSchema);
