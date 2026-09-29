/**
 * Income-tax benefit of a home loan on a self-occupied house, per financial
 * year (April to March).
 *
 * Old regime:
 * - Section 24(b): interest, up to ₹2,00,000 a year per borrower.
 * - Section 80C: principal repaid (prepayments included), within the ₹1,50,000
 *   a year that each borrower shares with EPF, PPF, ELSS, insurance and so on.
 * - 4% health and education cess on the tax saved. Surcharge is ignored.
 * New regime (the default since FY 2023-24): neither deduction is available
 * for a self-occupied house, so the saving is zero.
 *
 * Joint borrowers who are also co-owners each claim their own limits on their
 * share. Shares are split equally here.
 */

import type { AmortizationRow } from './types';

export type Regime = 'old' | 'new';

export const LIMIT_24B = 200_000;
export const LIMIT_80C = 150_000;
export const CESS = 0.04;

export interface TaxSettings {
  regime: Regime;
  /** Marginal slab rate in percent, before cess (old regime: 5, 20 or 30). */
  slabRate: number;
  /** 80C already used by each borrower through EPF, PPF, insurance etc. */
  used80C: number;
  borrowers: 1 | 2;
}

export interface TaxYear {
  fy: string; // "2026-27"
  interest: number;
  principal: number;
  deduction24b: number; // all borrowers together
  deduction80C: number;
  saving: number;
}

export interface TaxSummary {
  years: TaxYear[];
  totalSaving: number;
  total24b: number;
  total80C: number;
  /** Years where interest went beyond what 24(b) lets every borrower deduct. */
  cappedYears: number;
}

/** Financial year label for a date: April 2026 to March 2027 is "2026-27". */
export function financialYear(d: Date): string {
  const start = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

export function taxBenefits(schedule: AmortizationRow[], emiStartDate: string | undefined, t: TaxSettings): TaxSummary {
  const start = emiStartDate ? new Date(emiStartDate) : new Date();
  const byFy = new Map<string, { interest: number; principal: number }>();
  for (const row of schedule) {
    const d = new Date(start.getFullYear(), start.getMonth() + row.month - 1, 1);
    const fy = financialYear(d);
    const cur = byFy.get(fy) ?? { interest: 0, principal: 0 };
    cur.interest += row.interest;
    cur.principal += row.principal + row.extraPrincipal;
    byFy.set(fy, cur);
  }

  const n = t.borrowers;
  const room80C = Math.max(0, LIMIT_80C - t.used80C);
  const rate = t.regime === 'old' ? (t.slabRate / 100) * (1 + CESS) : 0;
  const years: TaxYear[] = [];
  let cappedYears = 0;
  for (const [fy, { interest, principal }] of byFy) {
    const per24b = Math.min(interest / n, LIMIT_24B);
    const per80C = Math.min(principal / n, room80C);
    if (interest / n > LIMIT_24B) cappedYears++;
    const d24b = t.regime === 'old' ? per24b * n : 0;
    const d80C = t.regime === 'old' ? per80C * n : 0;
    years.push({ fy, interest, principal, deduction24b: d24b, deduction80C: d80C, saving: (d24b + d80C) * rate });
  }
  return {
    years,
    totalSaving: years.reduce((s, y) => s + y.saving, 0),
    total24b: years.reduce((s, y) => s + y.deduction24b, 0),
    total80C: years.reduce((s, y) => s + y.deduction80C, 0),
    cappedYears: t.regime === 'old' ? cappedYears : 0,
  };
}
