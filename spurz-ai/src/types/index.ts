// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  isLoggedIn: boolean;
}

// Financial Data Types
export interface SalaryInfo {
  amount: number;
  currency: string;
  frequency: 'monthly' | 'annual';
  source?: string;
}

export interface Card {
  id: string;
  cardType: 'credit' | 'debit';
  name: string;
  lastFourDigits: string;
  issuer: string;
  limit?: number;
  currentBalance: number;
  rewards?: {
    type: string;
    value: number;
  };
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: 'card' | 'cash' | 'upi' | 'bank_transfer';
}

export interface ExpenseCategory {
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  potentialSavings?: number;
}

export interface FinancialData {
  salary?: SalaryInfo;
  cards?: Card[];
  expenses?: Expense[];
  goals?: FinancialGoal[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

// Insight Types
export interface InsightBlock {
  id: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  icon: string;
  isLocked: boolean;
  confidence?: number;
  source?: string;
  copy: string;
  actionCopy?: string;
}

export interface SavingsInsight {
  currentSavingsPercentage: number;
  potentialSavingsPercentage: number;
  monthlyPotentialSavings: number;
  improvementThisMonth: number;
}

export interface EfficiencyScore {
  currentScore: number;
  targetScore: number;
  recommendation: string;
}

// Scenario Types
export type UserScenario = 'A' | 'B' | 'C' | 'D';

export interface ScenarioState {
  scenario: UserScenario;
  isLoggedIn: boolean;
  hasSalary: boolean;
  hasCards: boolean;
  hasExpenses: boolean;
  profileCompleteness: number;
}

// Mock Data Permission Types
export interface PermissionState {
  emailAccess: boolean;
  emailConnected: boolean;
  aadhaarVerified: boolean;
}

export interface ExtractedData {
  salary?: SalaryInfo;
  detectedExpenses?: ExpenseCategory[];
  cardData?: Card[];
  emiData?: {
    type: string;
    amount: number;
    duration: string;
  }[];
  confidenceScore: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Onboarding Tile Type
export interface OnboardingTile {
  id: string;
  title: string;
  description: string;
  icon: string;
  actionLabel: string;
  actionType: 'salary' | 'cards' | 'expenses' | 'email' | 'aadhaar';
  completed: boolean;
  priority: number;
}
