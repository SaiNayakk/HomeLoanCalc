/**
 * Prepayment and advanced loan calculations
 */

import type { LoanInput, PrepaymentOptions, AmortizationRow, LoanCalculation, VariableRateScenario, EMIStepUpScenario } from './types';
import { calculateEMI } from './calculator';

const getMonthIndexFromDate = (emiStartDate?: string, targetDate?: string) => {
  if (!emiStartDate || !targetDate) {
    return null;
  }
  const start = new Date(emiStartDate);
  const target = new Date(targetDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(target.getTime())) {
    return null;
  }
  const monthDiff = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
  return Math.max(1, monthDiff + 1);
};

/**
 * Generate amortization schedule with prepayment options
 */
export function generateScheduleWithPrepayment(
  input: LoanInput,
  prepayment?: PrepaymentOptions
): LoanCalculation {
  const emiResult = calculateEMI(input);
  const schedule: AmortizationRow[] = [];

  let balance = input.principal;
  let month = 1;
  let totalExtraPayments = 0;

  // Simulate until loan is fully paid
  while (balance > 0 && month <= 600) {
    const openingBalance = balance;
    const monthlyRate = input.annualRate / 12 / 100;
    const interestPayment = openingBalance * monthlyRate;
    const principalPayment = emiResult.emi - interestPayment;
    let extraPrincipalPayment = 0;

    // Handle extra monthly EMI
    if (prepayment?.extraEMIEnabled !== false && prepayment?.extraEMIMonthly) {
      const startMonth = getMonthIndexFromDate(input.emiStartDate, prepayment.extraEMIStartDate) ?? 1;
      const frequency = Math.max(1, prepayment.extraEMIFrequencyMonths ?? 1);
      if (month >= startMonth && (month - startMonth) % frequency === 0) {
        extraPrincipalPayment += Math.min(prepayment.extraEMIMonthly, balance);
      }
    }

    // Handle lump sum prepayment at specific month
    if (prepayment?.lumpSumEnabled !== false && prepayment?.lumpSumPayment) {
      const lumpSumMonth = getMonthIndexFromDate(input.emiStartDate, prepayment.lumpSumPayment.date) ?? prepayment.lumpSumPayment.month;
      if (month === lumpSumMonth) {
      extraPrincipalPayment += Math.min(prepayment.lumpSumPayment.amount, balance);
      }
    }

    totalExtraPayments += extraPrincipalPayment;

    const totalPrincipalPayment = Math.min(principalPayment + extraPrincipalPayment, balance);
    const closingBalance = Math.max(0, balance - totalPrincipalPayment);

    schedule.push({
      month,
      openingBalance: parseFloat(openingBalance.toFixed(2)),
      emiPayment: parseFloat(emiResult.emi.toFixed(2)),
      principal: parseFloat(principalPayment.toFixed(2)),
      interest: parseFloat(interestPayment.toFixed(2)),
      extraPrincipal: parseFloat(extraPrincipalPayment.toFixed(2)),
      closingBalance: parseFloat(closingBalance.toFixed(2)),
      currentRate: input.annualRate,
    });

    balance = closingBalance;
    month++;
  }

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPayable = input.principal + totalInterest + totalExtraPayments + (input.processingFees ?? 0);

  return {
    input,
    monthlyEMI: emiResult.emi,
    totalPayable: parseFloat(totalPayable.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    schedule,
    actualTenureMonths: schedule.length,
    totalExtraPayments: parseFloat(totalExtraPayments.toFixed(2)),
  };
}

/**
 * Calculate with variable interest rates
 */
export function generateScheduleWithVariableRate(
  input: LoanInput,
  variableRate: VariableRateScenario,
  prepayment?: PrepaymentOptions
): LoanCalculation {
  let baseEMI = calculateEMI(input).emi;
  const schedule: AmortizationRow[] = [];

  let balance = input.principal;
  let month = 1;
  let totalInterest = 0;
  let totalExtraPayments = 0;

  // Create rate map
  const rateMap = new Map<number, number>();
  rateMap.set(1, input.annualRate);
  variableRate.changes.forEach((change) => {
    rateMap.set(change.month, change.newRate);
  });

  let currentRate = input.annualRate;

  while (balance > 0 && month <= 600) {
    // Check if rate changes this month
    if (rateMap.has(month)) {
      currentRate = rateMap.get(month) || currentRate;
      if (variableRate.rateChangeMode === 'reduce-emi') {
        const remainingMonths = Math.max(1, input.tenureMonths - (month - 1));
        baseEMI = calculateEMI({
          principal: balance,
          annualRate: currentRate,
          tenureMonths: remainingMonths,
        }).emi;
      }
    }

    const openingBalance = balance;
    const monthlyRate = currentRate / 12 / 100;
    const interestPayment = openingBalance * monthlyRate;
    const principalPayment = baseEMI - interestPayment;
    let extraPrincipalPayment = 0;

    if (prepayment?.extraEMIEnabled !== false && prepayment?.extraEMIMonthly) {
      const startMonth = getMonthIndexFromDate(input.emiStartDate, prepayment.extraEMIStartDate) ?? 1;
      const frequency = Math.max(1, prepayment.extraEMIFrequencyMonths ?? 1);
      if (month >= startMonth && (month - startMonth) % frequency === 0) {
        extraPrincipalPayment += Math.min(prepayment.extraEMIMonthly, balance);
      }
    }

    if (prepayment?.lumpSumEnabled !== false && prepayment?.lumpSumPayment) {
      const lumpSumMonth = getMonthIndexFromDate(input.emiStartDate, prepayment.lumpSumPayment.date) ?? prepayment.lumpSumPayment.month;
      if (month === lumpSumMonth) {
      extraPrincipalPayment += Math.min(prepayment.lumpSumPayment.amount, balance);
      }
    }

    totalExtraPayments += extraPrincipalPayment;

    const totalPrincipalPayment = Math.min(principalPayment + extraPrincipalPayment, balance);
    const closingBalance = Math.max(0, balance - totalPrincipalPayment);

    totalInterest += interestPayment;

    schedule.push({
      month,
      openingBalance: parseFloat(openingBalance.toFixed(2)),
      emiPayment: parseFloat(baseEMI.toFixed(2)),
      principal: parseFloat(principalPayment.toFixed(2)),
      interest: parseFloat(interestPayment.toFixed(2)),
      extraPrincipal: parseFloat(extraPrincipalPayment.toFixed(2)),
      closingBalance: parseFloat(closingBalance.toFixed(2)),
      currentRate,
    });

    balance = closingBalance;
    month++;
  }

  const totalPayable = input.principal + totalInterest + totalExtraPayments + (input.processingFees ?? 0);

  return {
    input,
    monthlyEMI: baseEMI,
    totalPayable: parseFloat(totalPayable.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    schedule,
    actualTenureMonths: schedule.length,
    totalExtraPayments: parseFloat(totalExtraPayments.toFixed(2)),
  };
}

/**
 * Calculate with EMI step-up (salary growth simulation)
 */
export function generateScheduleWithEMIStepUp(
  input: LoanInput,
  stepUp: EMIStepUpScenario,
  prepayment?: PrepaymentOptions
): LoanCalculation {
  const baseEMI = calculateEMI(input).emi;
  const schedule: AmortizationRow[] = [];

  let balance = input.principal;
  let month = 1;
  let totalInterest = 0;
  let totalExtraPayments = 0;
  let currentEMI = baseEMI;

  while (balance > 0 && month <= 600) {
    // Check if EMI steps up this month
    if ((month - 1) % stepUp.intervalMonths === 0 && month > 1) {
      currentEMI *= 1 + stepUp.stepUpPercentage / 100;
    }

    const openingBalance = balance;
    const monthlyRate = input.annualRate / 12 / 100;
    const interestPayment = openingBalance * monthlyRate;
    const principalPayment = Math.min(currentEMI - interestPayment, balance);
    let extraPrincipalPayment = 0;

    if (prepayment?.extraEMIEnabled !== false && prepayment?.extraEMIMonthly) {
      const startMonth = getMonthIndexFromDate(input.emiStartDate, prepayment.extraEMIStartDate) ?? 1;
      const frequency = Math.max(1, prepayment.extraEMIFrequencyMonths ?? 1);
      if (month >= startMonth && (month - startMonth) % frequency === 0) {
        extraPrincipalPayment += Math.min(prepayment.extraEMIMonthly, balance - principalPayment);
      }
    }

    if (prepayment?.lumpSumEnabled !== false && prepayment?.lumpSumPayment) {
      const lumpSumMonth = getMonthIndexFromDate(input.emiStartDate, prepayment.lumpSumPayment.date) ?? prepayment.lumpSumPayment.month;
      if (month === lumpSumMonth) {
      extraPrincipalPayment += Math.min(prepayment.lumpSumPayment.amount, balance - principalPayment);
      }
    }

    totalExtraPayments += extraPrincipalPayment;

    const totalPrincipalPayment = Math.min(principalPayment + extraPrincipalPayment, balance);
    const closingBalance = Math.max(0, balance - totalPrincipalPayment);

    totalInterest += interestPayment;

    schedule.push({
      month,
      openingBalance: parseFloat(openingBalance.toFixed(2)),
      emiPayment: parseFloat(currentEMI.toFixed(2)),
      principal: parseFloat(principalPayment.toFixed(2)),
      interest: parseFloat(interestPayment.toFixed(2)),
      extraPrincipal: parseFloat(extraPrincipalPayment.toFixed(2)),
      closingBalance: parseFloat(closingBalance.toFixed(2)),
      currentRate: input.annualRate,
    });

    balance = closingBalance;
    month++;
  }

  const totalPayable = input.principal + totalInterest + totalExtraPayments + (input.processingFees ?? 0);

  return {
    input,
    monthlyEMI: baseEMI,
    totalPayable: parseFloat(totalPayable.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    schedule,
    actualTenureMonths: schedule.length,
    totalExtraPayments: parseFloat(totalExtraPayments.toFixed(2)),
  };
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
