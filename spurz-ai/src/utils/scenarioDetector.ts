import { FinancialData, UserScenario, ScenarioState } from '@types/index';

/**
 * Detects the current user scenario (A, B, C, or D) based on login status and data availability
 */
export const detectUserScenario = (
  isLoggedIn: boolean,
  financialData?: FinancialData
): UserScenario => {
  // Scenario A: Not logged in
  if (!isLoggedIn) {
    return 'A';
  }

  // If logged in, check data availability
  const hasSalary = !!financialData?.salary;
  const hasCards = !!financialData?.cards && financialData.cards.length > 0;
  const hasExpenses = !!financialData?.expenses && financialData.expenses.length > 0;

  // Scenario B: Logged in, no data
  if (!hasSalary && !hasCards && !hasExpenses) {
    return 'B';
  }

  // Scenario C: Logged in, partial data (at least one data point but not all)
  if ((hasSalary || hasCards || hasExpenses) && !(hasSalary && hasCards && hasExpenses)) {
    return 'C';
  }

  // Scenario D: Fully active (all data provided)
  if (hasSalary && hasCards && hasExpenses) {
    return 'D';
  }

  // Default fallback
  return 'B';
};

/**
 * Get comprehensive scenario state information
 */
export const getScenarioState = (
  isLoggedIn: boolean,
  financialData?: FinancialData
): ScenarioState => {
  const scenario = detectUserScenario(isLoggedIn, financialData);

  const hasSalary = !!financialData?.salary;
  const hasCards = !!financialData?.cards && financialData.cards.length > 0;
  const hasExpenses = !!financialData?.expenses && financialData.expenses.length > 0;

  // Calculate profile completeness percentage
  let profileCompleteness = 0;
  if (hasSalary) profileCompleteness += 33;
  if (hasCards) profileCompleteness += 33;
  if (hasExpenses) profileCompleteness += 34;

  return {
    scenario,
    isLoggedIn,
    hasSalary,
    hasCards,
    hasExpenses,
    profileCompleteness,
  };
};

/**
 * Get next action recommendation based on current scenario
 */
export const getNextAction = (scenario: UserScenario): string => {
  switch (scenario) {
    case 'A':
      return 'login';
    case 'B':
      return 'add_salary'; // Priority 1
    case 'C':
      return 'complete_profile'; // Add missing data
    case 'D':
      return 'view_insights'; // Everything ready
    default:
      return 'login';
  }
};

/**
 * Get scenario description for debugging
 */
export const getScenarioDescription = (scenario: UserScenario): string => {
  switch (scenario) {
    case 'A':
      return 'Anonymous Visitor - Not logged in';
    case 'B':
      return 'Logged In - No financial data provided';
    case 'C':
      return 'Logged In - Partial financial data';
    case 'D':
      return 'Fully Active - All financial data available';
    default:
      return 'Unknown Scenario';
  }
};

/**
 * Check if user can see specific insight based on scenario
 */
export const canViewInsight = (
  scenario: UserScenario,
  insightId: string
): boolean => {
  // Scenario A: All insights are locked
  if (scenario === 'A') return false;

  // Scenario B: Show only onboarding prompts
  if (scenario === 'B') return insightId.includes('onboarding');

  // Scenario C: Show partial insights based on available data
  if (scenario === 'C') return !insightId.includes('locked');

  // Scenario D: All insights visible
  if (scenario === 'D') return true;

  return false;
};

/**
 * Get CTA text for current scenario
 */
export const getCTAText = (scenario: UserScenario): string => {
  switch (scenario) {
    case 'A':
      return 'Get Insights';
    case 'B':
      return 'Add Salary';
    case 'C':
      return 'Complete Profile';
    case 'D':
      return 'View Full Insights';
    default:
      return 'Continue';
  }
};

/**
 * Get hero subtitle based on scenario
 */
export const getHeroSubtitle = (scenario: UserScenario, userName?: string): string => {
  switch (scenario) {
    case 'A':
      return 'Your Earning Intelligence';
    case 'B':
      return `Hi ${userName}, let's build your Earning Intelligence`;
    case 'C':
      return `${userName}, you're on the right track!`;
    case 'D':
      return `Welcome back, ${userName}!`;
    default:
      return 'Your Earning Intelligence';
  }
};
