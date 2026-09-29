/**
 * One month-by-month simulation for every scenario: prepayments, rate changes
 * and EMI step-ups, alone or together.
 *
 * Rules it keeps:
 * - Prepayments are principal. Total payable = principal + interest + fees,
 *   never principal + interest + prepayments (that double-counts them).
 * - The last month pays only what's left, so the principal column always sums
 *   to exactly the loan amount.
 * - If a rate rise means the EMI no longer covers the month's interest, the EMI
 *   is raised to clear the loan over the remaining tenure, as banks do, instead
 *   of letting the balance grow forever. `emiRaised` says when that happened.
 */

import type {
  AmortizationRow, EMIStepUpScenario, LoanCalculation, LoanInput, PrepaymentOptions, VariableRateScenario,
} from './types';
import { calculateEMI } from './calculator';

export interface SimulationOptions {
  prepayment?: PrepaymentOptions;
  rates?: VariableRateScenario | null;
  stepUp?: EMIStepUpScenario | null;
}

export interface Simulation extends LoanCalculation {
  emiRaised: boolean;
}

const MAX_MONTHS = 600;

/** The EMI without rounding: calculateEMI rounds to paise, and those paise add up to a stray extra month. */
function exactEMI(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 1200;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Month number (1 = first EMI) of a calendar date, relative to the first EMI date. */
export function monthIndex(emiStartDate: string | undefined, date: string | undefined): number | null {
  if (!emiStartDate || !date) return null;
  const s = new Date(emiStartDate), d = new Date(date);
  if (Number.isNaN(s.getTime()) || Number.isNaN(d.getTime())) return null;
  return Math.max(1, (d.getFullYear() - s.getFullYear()) * 12 + (d.getMonth() - s.getMonth()) + 1);
}

function scheduledExtra(input: LoanInput, p: PrepaymentOptions | undefined, month: number): number {
  if (!p) return 0;
  let extra = 0;
  if (p.extraEMIEnabled !== false && p.extraEMIMonthly > 0) {
    const start = monthIndex(input.emiStartDate, p.extraEMIStartDate) ?? 1;
    const every = Math.max(1, p.extraEMIFrequencyMonths ?? 1);
    if (month >= start && (month - start) % every === 0) extra += p.extraEMIMonthly;
  }
  if (p.lumpSumEnabled !== false && p.lumpSumPayment?.amount) {
    const at = monthIndex(input.emiStartDate, p.lumpSumPayment.date) ?? p.lumpSumPayment.month;
    if (month === at) extra += p.lumpSumPayment.amount;
  }
  return extra;
}

export function simulate(input: LoanInput, opts: SimulationOptions = {}): Simulation {
  const { principal, tenureMonths } = input;
  calculateEMI(input); // validates the input
  const firstEMI = exactEMI(principal, input.annualRate, tenureMonths);
  const rateAt = new Map<number, number>();
  for (const c of opts.rates?.changes ?? []) if (c.month >= 1) rateAt.set(Math.round(c.month), c.newRate);

  let emi = firstEMI;
  let rate = input.annualRate;
  let balance = principal;
  let totalInterest = 0, totalExtra = 0, emiRaised = false;
  const schedule: AmortizationRow[] = [];

  for (let month = 1; balance > 0.005 && month <= MAX_MONTHS; month++) {
    const remaining = Math.max(1, tenureMonths - (month - 1));
    if (opts.stepUp && opts.stepUp.intervalMonths > 0 && month > 1 && (month - 1) % opts.stepUp.intervalMonths === 0) {
      emi *= 1 + opts.stepUp.stepUpPercentage / 100;
    }
    if (rateAt.has(month) && rateAt.get(month) !== rate) {
      rate = rateAt.get(month)!;
      if (opts.rates?.rateChangeMode === 'reduce-emi') emi = exactEMI(balance, rate, remaining);
    }

    const interest = (balance * rate) / 1200;
    if (emi <= interest + 0.01) {
      emi = exactEMI(balance, rate, Math.max(12, remaining));
      emiRaised = true;
    }
    const regular = Math.min(emi - interest, balance);
    const extra = Math.min(scheduledExtra(input, opts.prepayment, month), balance - regular);
    const closing = balance - regular - extra < 0.005 ? 0 : balance - regular - extra;

    totalInterest += interest;
    totalExtra += extra;
    schedule.push({
      month,
      openingBalance: round2(balance),
      emiPayment: round2(regular + interest),
      principal: round2(regular),
      interest: round2(interest),
      extraPrincipal: round2(extra),
      closingBalance: round2(closing),
      currentRate: rate,
    });
    balance = closing;
  }

  return {
    input,
    monthlyEMI: round2(firstEMI),
    totalInterest: round2(totalInterest),
    totalPayable: round2(principal + totalInterest + (input.processingFees ?? 0)),
    schedule,
    actualTenureMonths: schedule.length,
    totalExtraPayments: round2(totalExtra),
    emiRaised,
  };
}
