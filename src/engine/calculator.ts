/**
 * Core EMI calculation functions
 * Pure financial logic with no external dependencies
 */

import type { LoanInput, EMIResult } from './types';

/**
 * Calculate monthly EMI using standard amortization formula
 * EMI = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 * P = Principal amount
 * r = Monthly interest rate (annual rate / 12 / 100)
 * n = Number of months
 */
export function calculateEMI(input: LoanInput): EMIResult {
  const { principal, annualRate, tenureMonths } = input;

  if (principal <= 0) {
    throw new Error('Principal amount must be greater than 0');
  }
  if (annualRate < 0) {
    throw new Error('Interest rate cannot be negative');
  }
  if (tenureMonths <= 0) {
    throw new Error('Tenure must be greater than 0');
  }

  // Calculate monthly rate
  const monthlyRate = annualRate / 12 / 100;

  // If interest rate is 0, EMI is simply principal divided by months
  if (monthlyRate === 0) {
    const emi = principal / tenureMonths;
    return {
      emi: parseFloat(emi.toFixed(2)),
      totalPayable: parseFloat(principal.toFixed(2)),
      totalInterest: 0,
    };
  }

  // Standard EMI formula
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  const emi = principal * (numerator / denominator);

  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;

  return {
    emi: parseFloat(emi.toFixed(2)),
    totalPayable: parseFloat(totalPayable.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
  };
}

/**
 * Calculate monthly interest for a given balance
 */
export function calculateMonthlyInterest(
  balance: number,
  annualRate: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  return balance * monthlyRate;
}

/**
 * Calculate principal portion of EMI payment
 */
export function calculatePrincipalPortion(
  emiAmount: number,
  interestAmount: number
): number {
  return emiAmount - interestAmount;
}
