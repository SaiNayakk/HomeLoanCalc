/**
 * Prepayment and advanced loan calculations
 */

import type { LoanInput, PrepaymentOptions, LoanCalculation, VariableRateScenario, EMIStepUpScenario } from './types';
import { simulate } from './simulate';

/**
 * The three scenario functions below are kept for existing callers. They all
 * run the same simulation (see simulate.ts), which fixed double-counted
 * prepayments in total payable and over-counted principal in the final month.
 */

/** Schedule with extra EMIs and/or a lump-sum prepayment. */
export function generateScheduleWithPrepayment(input: LoanInput, prepayment?: PrepaymentOptions): LoanCalculation {
  return simulate(input, { prepayment });
}

/** Schedule with interest-rate changes (keep EMI and change tenure, or recalculate EMI). */
export function generateScheduleWithVariableRate(input: LoanInput, variableRate: VariableRateScenario, prepayment?: PrepaymentOptions): LoanCalculation {
  return simulate(input, { rates: variableRate, prepayment });
}

/** Schedule where the EMI rises by a percentage at a fixed interval (salary growth). */
export function generateScheduleWithEMIStepUp(input: LoanInput, stepUp: EMIStepUpScenario, prepayment?: PrepaymentOptions): LoanCalculation {
  return simulate(input, { stepUp, prepayment });
}

/**
 * Refinance calculator - switch to new interest rate
 */
export function calculateRefinance(
  currentCalculation: LoanCalculation,
  newRate: number,
  refinanceMonth: number
): LoanCalculation {
  const remainingMonths = Math.max(0, currentCalculation.input.tenureMonths - refinanceMonth);
  const remainingBalance = currentCalculation.schedule[refinanceMonth - 1]?.closingBalance || 0;

  if (remainingBalance <= 0 || remainingMonths <= 0) {
    return currentCalculation;
  }

  // Recalculate with new rate
  const newInput: LoanInput = {
    principal: remainingBalance,
    annualRate: newRate,
    tenureMonths: remainingMonths,
  };

  const newCalculation = generateScheduleWithPrepayment(newInput);

  // Combine schedules
  const combinedSchedule = [
    ...currentCalculation.schedule.slice(0, refinanceMonth - 1),
    ...newCalculation.schedule.map((row) => ({
      ...row,
      month: refinanceMonth + row.month - 1,
    })),
  ];

  const totalInterest = combinedSchedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPayable = currentCalculation.input.principal + totalInterest + (currentCalculation.input.processingFees ?? 0);

  return {
    input: currentCalculation.input,
    monthlyEMI: currentCalculation.monthlyEMI,
    totalPayable: parseFloat(totalPayable.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    schedule: combinedSchedule,
    actualTenureMonths: combinedSchedule.length,
    totalExtraPayments: 0,
  };
}
