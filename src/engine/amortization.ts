/**
 * Amortization schedule generation
 */

import type { LoanInput, LoanCalculation, PrepaymentOptions } from './types';
import { generateScheduleWithPrepayment } from './prepayment';

/**
 * Generate complete amortization schedule for a loan
 */
export function generateAmortizationSchedule(
  input: LoanInput,
  prepayment?: PrepaymentOptions
): LoanCalculation {
  return generateScheduleWithPrepayment(input, prepayment);
}

/**
 * Get summary statistics for a loan
 */
export function getLoanSummary(calculation: LoanCalculation) {
  const { monthlyEMI, totalPayable, totalInterest, input, actualTenureMonths } = calculation;

  return {
    principal: input.principal,
    monthlyEMI,
    totalInterest,
    totalPayable,
    avgMonthlyInterest: parseFloat((totalInterest / actualTenureMonths).toFixed(2)),
    interestAsPercentageOfPrincipal: parseFloat(
      ((totalInterest / input.principal) * 100).toFixed(2)
    ),
    actualTenureMonths,
  };
}
