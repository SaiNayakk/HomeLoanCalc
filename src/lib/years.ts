import type { AmortizationRow } from '../engine/types';
import { monthDate } from './format';

export interface YearRow { label: string; principal: number; extra: number; interest: number; balance: number }

/** Loan years (12 EMIs each, from the first EMI), labelled by the calendar year they start in. */
export function byLoanYear(schedule: AmortizationRow[], start: string): YearRow[] {
  const out: YearRow[] = [];
  schedule.forEach((r, i) => {
    const k = Math.floor(i / 12);
    out[k] ??= { label: String(monthDate(start, k * 12).getFullYear()), principal: 0, extra: 0, interest: 0, balance: 0 };
    out[k].principal += r.principal;
    out[k].extra += r.extraPrincipal;
    out[k].interest += r.interest;
    out[k].balance = r.closingBalance;
  });
  return out;
}
