import { FinancialMetrics } from './MetricsService';

export type HealthBand = 'UNKNOWN' | 'CRITICAL' | 'STRESSED' | 'BALANCED' | 'OPTIMIZER';

export type ScenarioCode =
  | 'ONBOARDING_NO_SALARY'
  | 'ONBOARDING_NO_CARDS'
  | 'ONBOARDING_PARTIAL'
  | 'READY_NO_HEALTH'
  | 'CRITICAL_RED'
  | 'STRESSED_AMBER'
  | 'BALANCED_GREEN'
  | 'OPTIMIZER_BLUE';

export interface DataCompleteness {
  hasBasicProfile?: boolean; // Deprecated
  hasBasicInfo: boolean; // New - combines profile fields
  hasSalaryInfo: boolean;
  hasCardInfo: boolean;
  hasExpenseInfo?: boolean;
  hasBankLinkage?: boolean;
  hasEmailLinkage?: boolean;
  completionPercentage: number;
}

class ScenarioService {
  /**
   * Derive health band from financial metrics
   */
  deriveHealthBand(metrics: FinancialMetrics): HealthBand {
    // If no income data, can't determine health
    if (metrics.monthlyIncome === 0) {
      return 'UNKNOWN';
    }

    const { savingsRate, creditUtilization, debtToIncomeRatio } = metrics;

    // Critical: Very poor financial health
    if (
      savingsRate < 0.1 || // Saving less than 10%
      creditUtilization > 0.8 || // Using more than 80% of credit
      debtToIncomeRatio > 0.5 // Debt more than 50% of income
    ) {
      return 'CRITICAL';
    }

    // Stressed: Below average financial health
    if (
      savingsRate < 0.2 ||
      creditUtilization > 0.5 ||
      debtToIncomeRatio > 0.3
    ) {
      return 'STRESSED';
    }

    // Balanced: Good financial health
    if (
      savingsRate < 0.3 ||
      creditUtilization > 0.3
    ) {
      return 'BALANCED';
    }

    // Optimizer: Excellent financial health
    return 'OPTIMIZER';
  }

  /**
   * Derive scenario code based on data completeness and health
   */
  deriveScenarioCode(
    completeness: DataCompleteness,
    healthBand: HealthBand
  ): ScenarioCode {
    const {
      hasBasicInfo,
      hasSalaryInfo,
      hasCardInfo,
      hasExpenseInfo,
      hasBankLinkage,
      hasEmailLinkage,
    } = completeness;

    // Onboarding scenarios - missing critical data
    if (!hasSalaryInfo) {
      return 'ONBOARDING_NO_SALARY';
    }

    if (!hasCardInfo) {
      return 'ONBOARDING_NO_CARDS';
    }

    // Partial onboarding - has basics but missing extras
    const totalDataPoints = [
      hasBasicInfo,
      hasExpenseInfo,
      hasBankLinkage,
      hasEmailLinkage,
    ].filter(Boolean).length;

    if (totalDataPoints < 2) {
      return 'ONBOARDING_PARTIAL';
    }

    // Has all data, now check health
    if (healthBand === 'UNKNOWN') {
      return 'READY_NO_HEALTH';
    }

    // Map health band to scenario
    switch (healthBand) {
      case 'CRITICAL':
        return 'CRITICAL_RED';
      case 'STRESSED':
        return 'STRESSED_AMBER';
      case 'BALANCED':
        return 'BALANCED_GREEN';
      case 'OPTIMIZER':
        return 'OPTIMIZER_BLUE';
      default:
        return 'READY_NO_HEALTH';
    }
  }

  /**
   * Get scenario metadata (for hero content, etc.)
   */
  getScenarioMetadata(scenarioCode: ScenarioCode): {
    color: string;
    priority: string;
    stage: 'onboarding' | 'active';
  } {
    switch (scenarioCode) {
      case 'ONBOARDING_NO_SALARY':
      case 'ONBOARDING_NO_CARDS':
      case 'ONBOARDING_PARTIAL':
      case 'READY_NO_HEALTH':
        return { color: 'gray', priority: 'setup', stage: 'onboarding' };
      
      case 'CRITICAL_RED':
        return { color: 'red', priority: 'urgent', stage: 'active' };
      
      case 'STRESSED_AMBER':
        return { color: 'amber', priority: 'important', stage: 'active' };
      
      case 'BALANCED_GREEN':
        return { color: 'green', priority: 'maintain', stage: 'active' };
      
      case 'OPTIMIZER_BLUE':
        return { color: 'blue', priority: 'optimize', stage: 'active' };
      
      default:
        return { color: 'gray', priority: 'unknown', stage: 'onboarding' };
    }
  }
}

export default new ScenarioService();
