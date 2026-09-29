import { describe, expect, it } from 'vitest';
import { calculateEMI } from './calculator';
import { simulate } from './simulate';
import { generateScheduleWithPrepayment } from './prepayment';
import { financialYear, taxBenefits, LIMIT_24B } from './tax';

const base = { principal: 5_000_000, annualRate: 7.5, tenureMonths: 240, emiStartDate: '2026-10-05' };
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('EMI', () => {
  it('matches the standard formula for common loans', () => {
    expect(Math.round(calculateEMI(base).emi)).toBe(40_280); // ₹50 L, 7.5%, 20 y
    expect(Math.round(calculateEMI({ principal: 1_000_000, annualRate: 8.5, tenureMonths: 180 }).emi)).toBe(9_847);
    expect(Math.round(calculateEMI({ principal: 3_000_000, annualRate: 9, tenureMonths: 360 }).emi)).toBe(24_139);
  });
  it('handles a zero rate', () => {
    expect(calculateEMI({ principal: 120_000, annualRate: 0, tenureMonths: 12 }).emi).toBe(10_000);
  });
  it('rejects nonsense', () => {
    expect(() => calculateEMI({ principal: 0, annualRate: 8, tenureMonths: 12 })).toThrow();
    expect(() => calculateEMI({ principal: 1e5, annualRate: 8, tenureMonths: 0 })).toThrow();
  });
});

describe('schedule', () => {
  it('pays off exactly on time and the principal column sums to the loan', () => {
    const s = simulate(base);
    expect(s.actualTenureMonths).toBe(240);
    expect(sum(s.schedule.map((r) => r.principal))).toBeCloseTo(5_000_000, -1);
    expect(s.schedule.at(-1)!.closingBalance).toBe(0);
    expect(Math.round(s.totalInterest / 1000)).toBe(4_667); // ≈ ₹46.67 L
  });

  it('never double-counts prepayments in total payable', () => {
    const s = simulate(base, { prepayment: { extraEMIMonthly: 10_000, extraEMIFrequencyMonths: 1 } });
    const paidIn = sum(s.schedule.map((r) => r.emiPayment + r.extraPrincipal));
    expect(s.totalPayable).toBeCloseTo(base.principal + s.totalInterest, 0);
    expect(s.totalPayable).toBeCloseTo(paidIn, -1); // what you actually hand the bank
    expect(sum(s.schedule.map((r) => r.principal + r.extraPrincipal))).toBeCloseTo(base.principal, -1);
  });

  it('prepaying shortens the loan and saves interest', () => {
    const plain = simulate(base);
    const extra = simulate(base, { prepayment: { extraEMIMonthly: 5_000 } });
    expect(extra.actualTenureMonths).toBeLessThan(plain.actualTenureMonths);
    expect(extra.totalInterest).toBeLessThan(plain.totalInterest);
  });

  it('applies a lump sum once, in its month', () => {
    const s = simulate(base, { prepayment: { extraEMIMonthly: 0, lumpSumEnabled: true, lumpSumPayment: { month: 13, amount: 500_000 } } });
    expect(s.schedule[12].extraPrincipal).toBe(500_000);
    expect(s.schedule.filter((r) => r.extraPrincipal > 0)).toHaveLength(1);
  });

  it('a lump sum bigger than the balance only pays what is owed', () => {
    const s = simulate(base, { prepayment: { extraEMIMonthly: 0, lumpSumEnabled: true, lumpSumPayment: { month: 2, amount: 99_000_000 } } });
    expect(s.actualTenureMonths).toBe(2);
    expect(sum(s.schedule.map((r) => r.principal + r.extraPrincipal))).toBeCloseTo(base.principal, -1);
  });

  it('keeps the old function names working', () => {
    const a = generateScheduleWithPrepayment(base, { extraEMIMonthly: 2_000 });
    const b = simulate(base, { prepayment: { extraEMIMonthly: 2_000 } });
    expect(a.totalInterest).toBe(b.totalInterest);
  });
});

describe('rate changes and step-ups', () => {
  it('a cut with "keep EMI" shortens the loan', () => {
    const s = simulate(base, { rates: { changes: [{ month: 25, newRate: 6.5 }], rateChangeMode: 'reduce-tenure' } });
    expect(s.actualTenureMonths).toBeLessThan(240);
    expect(s.schedule[30].currentRate).toBe(6.5);
  });
  it('a cut with "reduce EMI" keeps the tenure', () => {
    const s = simulate(base, { rates: { changes: [{ month: 25, newRate: 6.5 }], rateChangeMode: 'reduce-emi' } });
    expect(s.actualTenureMonths).toBe(240);
    expect(s.schedule[30].emiPayment).toBeLessThan(s.schedule[10].emiPayment);
  });
  it('a steep rise never lets the balance grow: the EMI is raised instead', () => {
    const s = simulate(base, { rates: { changes: [{ month: 2, newRate: 14 }], rateChangeMode: 'reduce-tenure' } });
    expect(s.emiRaised).toBe(true);
    expect(s.actualTenureMonths).toBeLessThanOrEqual(600);
    expect(s.schedule.every((r) => r.closingBalance <= r.openingBalance)).toBe(true);
  });
  it('a yearly step-up finishes early', () => {
    const s = simulate(base, { stepUp: { stepUpPercentage: 5, intervalMonths: 12 } });
    expect(s.actualTenureMonths).toBeLessThan(200);
    expect(s.schedule[12].emiPayment).toBeCloseTo(s.schedule[0].emiPayment * 1.05, 0);
  });
});

describe('tax', () => {
  const s = simulate(base);
  const old = { regime: 'old' as const, slabRate: 30, used80C: 0, borrowers: 1 as const };

  it('labels financial years April to March', () => {
    expect(financialYear(new Date(2026, 2, 31))).toBe('2025-26');
    expect(financialYear(new Date(2026, 3, 1))).toBe('2026-27');
  });
  it('gives nothing under the new regime', () => {
    expect(taxBenefits(s.schedule, base.emiStartDate, { ...old, regime: 'new' }).totalSaving).toBe(0);
  });
  it('caps 24(b) at ₹2 L per borrower and adds 4% cess', () => {
    const t = taxBenefits(s.schedule, base.emiStartDate, old);
    const full = t.years[1]; // first complete financial year
    expect(full.interest).toBeGreaterThan(LIMIT_24B);
    expect(full.deduction24b).toBe(LIMIT_24B);
    expect(full.saving).toBeCloseTo((full.deduction24b + full.deduction80C) * 0.3 * 1.04, 2);
    expect(t.cappedYears).toBeGreaterThan(0);
  });
  it('80C only uses the room left after EPF and the rest', () => {
    const t = taxBenefits(s.schedule, base.emiStartDate, { ...old, used80C: 150_000 });
    expect(t.total80C).toBe(0);
  });
  it('two co-borrowers can claim up to twice as much', () => {
    const one = taxBenefits(s.schedule, base.emiStartDate, old).total24b;
    const two = taxBenefits(s.schedule, base.emiStartDate, { ...old, borrowers: 2 }).total24b;
    expect(two).toBeGreaterThan(one);
    expect(two).toBeLessThanOrEqual(s.totalInterest + 1);
  });
  it('splits the first financial year at March', () => {
    const t = taxBenefits(s.schedule, base.emiStartDate, old);
    expect(t.years[0].fy).toBe('2026-27'); // Oct 2026 to Mar 2027: 6 EMIs
    expect(s.schedule.slice(0, 6).reduce((a, r) => a + r.interest, 0)).toBeCloseTo(t.years[0].interest, 2);
  });
});
