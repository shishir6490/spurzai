import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  fullName?: string;
  dateOfBirth?: Date;
  occupation?: string;
  city?: string;
  profilePictureUrl?: string;
  onboardingCompleted: boolean;
  onboardingStep?: number;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    currency: string;
  };
  settings: {
    trackingEnabled: boolean;
  };
  financialSnapshot: {
    potentialSavingsPercent?: number;
    lastExpensesHash?: string;
    lastInvestmentsHash?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    occupation: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    profilePictureUrl: {
      type: String,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 0,
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      darkMode: {
        type: Boolean,
        default: false,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    settings: {
      trackingEnabled: {
        type: Boolean,
        default: false,
      },
    },
    financialSnapshot: {
      potentialSavingsPercent: {
        type: Number,
      },
      lastExpensesHash: {
        type: String,
      },
      lastInvestmentsHash: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
