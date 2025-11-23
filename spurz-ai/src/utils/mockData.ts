import {
  User,
  FinancialData,
  ExpenseCategory,
  InsightBlock,
  SavingsInsight,
  EfficiencyScore,
  OnboardingTile,
  ExtractedData,
} from '@types/index';

// Mock Users for different scenarios
export const mockUsers = {
  scenarioA: {
    id: 'user_a',
    name: 'Visitor',
    email: 'visitor@example.com',
    isLoggedIn: false,
  },
  scenarioB: {
    id: 'user_b',
    name: 'Arjun',
    email: 'arjun.sharma@example.com',
    phone: '+91 98765 43210',
    isLoggedIn: true,
  },
  scenarioC: {
    id: 'user_c',
    name: 'Priya',
    email: 'priya.patel@example.com',
    phone: '+91 98765 43211',
    profilePicture: 'https://via.placeholder.com/150',
    isLoggedIn: true,
  },
  scenarioD: {
    id: 'user_d',
    name: 'Rahul',
    email: 'rahul.kumar@example.com',
    phone: '+91 98765 43212',
    profilePicture: 'https://via.placeholder.com/150',
    isLoggedIn: true,
  },
};

// Mock Financial Data for each scenario
export const mockFinancialData = {
  scenarioB: {
    // No financial data - just logged in
  } as FinancialData,

  scenarioC: {
    // Partial data - salary only
    salary: {
      amount: 75000,
      currency: 'INR',
      frequency: 'monthly',
      source: 'Tech Company',
    },
  } as FinancialData,

  scenarioD: {
    // Full data - all information provided
    salary: {
      amount: 85000,
      currency: 'INR',
      frequency: 'monthly',
      source: 'Tech Company',
    },
    cards: [
      {
        id: 'card_1',
        cardType: 'credit',
        name: 'HDFC Bank',
        lastFourDigits: '4521',
        issuer: 'HDFC',
        limit: 200000,
        currentBalance: 45000,
        rewards: {
          type: 'cashback',
          value: 2.5,
        },
      },
      {
        id: 'card_2',
        cardType: 'debit',
        name: 'ICICI Debit',
        lastFourDigits: '7890',
        issuer: 'ICICI',
        currentBalance: 120000,
      },
    ],
    expenses: [
      {
        id: 'exp_1',
        amount: 3500,
        category: 'Food & Dining',
        description: 'Zomato order',
        date: '2025-11-18',
        paymentMethod: 'card',
      },
      {
        id: 'exp_2',
        amount: 2000,
        category: 'Transport',
        description: 'Uber rides',
        date: '2025-11-17',
        paymentMethod: 'upi',
      },
      {
        id: 'exp_3',
        amount: 5000,
        category: 'Shopping',
        description: 'Amazon purchase',
        date: '2025-11-16',
        paymentMethod: 'card',
      },
      {
        id: 'exp_4',
        amount: 1500,
        category: 'Utilities',
        description: 'Electricity bill',
        date: '2025-11-15',
        paymentMethod: 'bank_transfer',
      },
      {
        id: 'exp_5',
        amount: 2500,
        category: 'Entertainment',
        description: 'Movie tickets',
        date: '2025-11-14',
        paymentMethod: 'card',
      },
    ],
    goals: [
      {
        id: 'goal_1',
        name: 'Trip to Dubai',
        targetAmount: 300000,
        currentAmount: 85000,
        deadline: '2026-06-30',
        category: 'travel',
      },
      {
        id: 'goal_2',
        name: 'Buy a Car',
        targetAmount: 800000,
        currentAmount: 150000,
        deadline: '2027-12-31',
        category: 'vehicle',
      },
    ],
  } as FinancialData,
};

// Expense Categories for Scenario D
export const mockExpenseCategories: ExpenseCategory[] = [
  {
    name: 'Food & Dining',
    icon: 'restaurant',
    amount: 14500,
    percentage: 22,
    trend: 'up',
    potentialSavings: 2900,
  },
  {
    name: 'Shopping',
    icon: 'shopping-bag',
    amount: 12000,
    percentage: 18,
    trend: 'stable',
    potentialSavings: 1500,
  },
  {
    name: 'Transport',
    icon: 'car',
    amount: 8000,
    percentage: 12,
    trend: 'down',
    potentialSavings: 1200,
  },
  {
    name: 'Entertainment',
    icon: 'film',
    amount: 6500,
    percentage: 10,
    trend: 'up',
    potentialSavings: 1300,
  },
  {
    name: 'Utilities',
    icon: 'zap',
    amount: 5200,
    percentage: 8,
    trend: 'stable',
    potentialSavings: 520,
  },
  {
    name: 'Others',
    icon: 'more-horizontal',
    amount: 29800,
    percentage: 30,
    trend: 'stable',
    potentialSavings: 2980,
  },
];

// Scenario A - Anonymous insights (blurred/locked)
export const mockScenarioAInsights: InsightBlock[] = [
  {
    id: 'insight_a_1',
    title: 'Your Monthly Savings Potential',
    subtitle: 'Unlock to see your potential savings',
    icon: 'trending-up',
    isLocked: true,
    copy: 'See how much you could save each month with smart financial habits',
    actionCopy: 'Get Insights',
  },
  {
    id: 'insight_a_2',
    title: 'Your Spending Efficiency Score',
    subtitle: 'Discover your financial health',
    icon: 'target',
    isLocked: true,
    copy: 'Understand how your spending compares to users with similar income',
    actionCopy: 'Unlock Now',
  },
  {
    id: 'insight_a_3',
    title: 'Misaligned Spending Categories',
    subtitle: 'See where you overspend',
    icon: 'alert-circle',
    isLocked: true,
    copy: 'Identify spending categories where you could optimize better',
    actionCopy: 'View Details',
  },
  {
    id: 'insight_a_4',
    title: 'Potential Additional Earnings',
    subtitle: 'Unlock income opportunities',
    icon: 'gift',
    isLocked: true,
    copy: 'Discover credit card rewards and cashback you might be missing',
    actionCopy: 'Learn More',
  },
];

// Scenario B - Onboarding tiles
export const mockOnboardingTiles: OnboardingTile[] = [
  {
    id: 'tile_salary',
    title: 'Add Your Income',
    description: 'Add your income to estimate your monthly capacity',
    icon: 'briefcase',
    actionLabel: 'Add Salary',
    actionType: 'salary',
    completed: false,
    priority: 1,
  },
  {
    id: 'tile_cards',
    title: 'Add Payment Cards',
    description: 'Unlock card-based reward insights',
    icon: 'credit-card',
    actionLabel: 'Add Credit/Debit Cards',
    actionType: 'cards',
    completed: false,
    priority: 2,
  },
  {
    id: 'tile_expenses',
    title: 'Connect Your Expenses',
    description: 'Understand where your money goes',
    icon: 'trending-down',
    actionLabel: 'Connect Bank / Upload Statement',
    actionType: 'expenses',
    completed: false,
    priority: 3,
  },
];

// Scenario C - Partial insights (salary provided)
export const mockScenarioCInsights: InsightBlock[] = [
  {
    id: 'insight_c_1',
    title: 'Your Ideal Monthly Distribution',
    value: '50-30-20',
    icon: 'pie-chart',
    isLocked: false,
    confidence: 85,
    source: 'email',
    copy: 'Based on your salary, here\'s the ideal distribution: 50% Needs, 30% Wants, 20% Savings',
    actionCopy: 'View Breakdown',
  },
  {
    id: 'insight_c_2',
    title: 'Estimated Savings Potential',
    value: '₹15,000 - ₹20,000',
    icon: 'trending-up',
    isLocked: false,
    confidence: 70,
    copy: 'Add your expense data to unlock accurate savings insights',
    actionCopy: 'Add Expenses',
  },
  {
    id: 'insight_c_3',
    title: 'Your Spending Insights',
    subtitle: 'Add expense data to improve accuracy by 40%',
    icon: 'bar-chart-2',
    isLocked: true,
    copy: 'Connect your bank or upload statements to see detailed breakdown',
    actionCopy: 'Connect Bank',
  },
];

// Scenario D - Full insights
export const mockScenarioDInsights: SavingsInsight = {
  currentSavingsPercentage: 32,
  potentialSavingsPercentage: 45,
  monthlyPotentialSavings: 10400,
  improvementThisMonth: 2.5,
};

export const mockScenarioDInsightBlocks: InsightBlock[] = [
  {
    id: 'insight_d_1',
    title: 'Your Savings Potential',
    value: '₹10,400/mo',
    icon: 'trending-up',
    isLocked: false,
    confidence: 92,
    source: 'auto',
    copy: 'You can save an additional ₹10,400 every month by optimizing your spending patterns',
    actionCopy: 'View Recommendations',
  },
  {
    id: 'insight_d_2',
    title: 'Spending Efficiency',
    value: '78/100',
    icon: 'star',
    isLocked: false,
    confidence: 85,
    source: 'auto',
    copy: 'Your efficiency score improved by 2.5% this month. Great work on controlling dining expenses!',
    actionCopy: 'View Details',
  },
  {
    id: 'insight_d_3',
    title: 'Best Rewards Opportunity',
    value: '₹1,250+',
    icon: 'gift',
    isLocked: false,
    copy: 'You\'re missing out on ₹1,250+ in credit card rewards. Optimize your card usage',
    actionCopy: 'Learn More',
  },
];

export const mockEfficiencyScore: EfficiencyScore = {
  currentScore: 67,
  targetScore: 78,
  recommendation: 'Optimize your dining and entertainment spending to reach target',
};

// Mock Email Extraction Data
export const mockExtractedEmailData: ExtractedData = {
  salary: {
    amount: 85000,
    currency: 'INR',
    frequency: 'monthly',
    source: 'Email: salary@company.com',
  },
  detectedExpenses: [
    {
      name: 'Food & Dining',
      icon: 'restaurant',
      amount: 14500,
      percentage: 22,
      trend: 'up',
    },
    {
      name: 'Shopping',
      icon: 'shopping-bag',
      amount: 12000,
      percentage: 18,
      trend: 'stable',
    },
    {
      name: 'Transport',
      icon: 'car',
      amount: 8000,
      percentage: 12,
      trend: 'down',
    },
  ],
  cardData: [
    {
      id: 'card_1',
      cardType: 'credit',
      name: 'HDFC Bank',
      lastFourDigits: '4521',
      issuer: 'HDFC',
      limit: 200000,
      currentBalance: 45000,
    },
  ],
  emiData: [
    {
      type: 'Home Loan',
      amount: 35000,
      duration: '20 years',
    },
  ],
  confidenceScore: 92,
};

// Helper function to calculate profile completeness
export const calculateProfileCompleteness = (
  hasSalary: boolean,
  hasCards: boolean,
  hasExpenses: boolean
): number => {
  let completeness = 0;
  if (hasSalary) completeness += 33;
  if (hasCards) completeness += 33;
  if (hasExpenses) completeness += 34;
  return completeness;
};
