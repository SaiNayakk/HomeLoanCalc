import { describe, expect, it } from 'vitest';
import { defaults, fromQuery, toQuery } from './state';

describe('share links', () => {
  it('round-trips the new format', () => {
    const s = { ...defaults(), amount: 7_500_000, rate: 8.1, years: 25, start: '2027-01', extra: 5000, every: 3 as const, lump: 200000, lumpAt: '2028-03',
      ratesOn: true, changes: [{ at: '2028-01', rate: 7.6 }], rateMode: 'reduce-emi' as const, stepOn: true, stepPct: 5, stepYears: 2, regime: 'old' as const, slab: 20, used80C: 100000, borrowers: 2 as const };
    const back = fromQuery(`?${toQuery(s)}`);
    expect(back).toEqual(s);
  });
  it('opens old ?p=&r=&t= links', () => {
    const s = fromQuery('?p=3000000&r=8.5&t=180&s=2025-06-15');
    expect([s.amount, s.rate, s.years, s.start]).toEqual([3_000_000, 8.5, 15, '2025-06']);
  });
  it('opens old ?state= links, with prepayments and rate changes', () => {
    const state = { input: { principal: 4_000_000, annualRate: 9, tenureMonths: 240, emiStartDate: '2025-01-01' },
      prepayment: { extraEMIEnabled: true, extraEMIMonthly: 3000, extraEMIFrequencyMonths: 1 }, variableRate: { changes: [{ month: 13, newRate: 8.5 }] }, showVariableRate: true };
    const s = fromQuery(`?state=${encodeURIComponent(JSON.stringify(state))}`);
    expect([s.amount, s.rate, s.years, s.extra, s.ratesOn, s.changes[0]]).toEqual([4_000_000, 9, 20, 3000, true, { at: '2026-01', rate: 8.5 }]);
  });
  it('ignores junk', () => {
    expect(fromQuery('?a=-5&r=abc&y=999').years).toBe(40);
    expect(fromQuery('?state=%7Bnot-json').amount).toBe(defaults().amount);
  });
});
