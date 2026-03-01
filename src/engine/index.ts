/**
 * Public API for the financial calculation engine
 * This is the only file React components should import from
 */

export type {
  LoanInput,
  LoanCalculation,
  AmortizationRow,
  EMIResult,
  PrepaymentOptions,
  VariableRateScenario,
  EMIStepUpScenario,
  LoanScenario,
} from './types';

export {
  calculateEMI,
  calculateMonthlyInterest,
  calculatePrincipalPortion,
} from './calculator';

export {
  generateAmortizationSchedule,
  getLoanSummary,
} from './amortization';

export {
  generateScheduleWithPrepayment,
  generateScheduleWithVariableRate,
  generateScheduleWithEMIStepUp,
  calculateRefinance,
} from './prepayment';
