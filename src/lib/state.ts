/**
 * Everything the page needs, and its shareable URL form.
 *
 * Short keys keep links readable: ?a=5000000&r=7.5&y=20&s=2026-10 ...
 * Older links (?p=&r=&t=&adv= and ?state=JSON) still open correctly.
 */

import { thisMonth, ymOf } from './format';
import type { Regime } from '../engine/tax';

export interface RateChange { at: string; rate: number } // at: "YYYY-MM"

export interface PlanState {
  amount: number;
  rate: number;
  years: number;
  start: string; // first EMI month, "YYYY-MM"
  fees: number;
  extra: number; // extra paid every `every` months
  every: 1 | 3 | 6 | 12;
  extraFrom: string;
  lump: number;
  lumpAt: string;
  ratesOn: boolean;
  rateMode: 'reduce-tenure' | 'reduce-emi';
  changes: RateChange[];
  stepOn: boolean;
  stepPct: number;
  stepYears: number;
  regime: Regime;
  slab: number;
  used80C: number;
  borrowers: 1 | 2;
}

export function defaults(): PlanState {
  const now = thisMonth();
  return {
    amount: 5_000_000, rate: 7.5, years: 20, start: now, fees: 0,
    extra: 0, every: 1, extraFrom: now, lump: 0, lumpAt: now,
    ratesOn: false, rateMode: 'reduce-tenure', changes: [],
    stepOn: false, stepPct: 5, stepYears: 1,
    regime: 'old', slab: 30, used80C: 0, borrowers: 1,
  };
}

const num = (v: string | null, d: number) => (v !== null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : d);
const ym = (v: string | null | undefined, d: string) => (v && /^\d{4}-\d{2}/.test(v) ? v.slice(0, 7) : d);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function toQuery(s: PlanState): string {
  const d = defaults();
  const q = new URLSearchParams();
  q.set('a', String(s.amount)); q.set('r', String(s.rate)); q.set('y', String(s.years)); q.set('s', s.start);
  if (s.fees) q.set('f', String(s.fees));
  if (s.extra) { q.set('pm', String(s.extra)); if (s.every !== 1) q.set('pe', String(s.every)); if (s.extraFrom !== s.start) q.set('pf', s.extraFrom); }
  if (s.lump) { q.set('ls', String(s.lump)); q.set('la', s.lumpAt); }
  if (s.ratesOn && s.changes.length) { q.set('rc', s.changes.map((c) => `${c.at}:${c.rate}`).join(',')); if (s.rateMode === 'reduce-emi') q.set('rm', 'e'); }
  if (s.stepOn) q.set('su', `${s.stepPct}:${s.stepYears}`);
  if (s.regime !== d.regime || s.slab !== d.slab || s.used80C || s.borrowers !== 1) q.set('tx', `${s.regime}:${s.slab}:${s.used80C}:${s.borrowers}`);
  return q.toString();
}

export function fromQuery(search: string): PlanState {
  const d = defaults();
  const q = new URLSearchParams(search);

  // Legacy: ?state={input, prepayment, variableRate, emiStepUp, ...}
  const legacy = q.get('state');
  if (legacy) {
    try { return fromLegacy(JSON.parse(decodeURIComponent(legacy)), d); } catch { return d; }
  }
  // Legacy: ?p=&r=&t=&s=&f=&adv=
  if (q.get('p') || q.get('t')) {
    let adv: Record<string, unknown> = {};
    try { adv = q.get('adv') ? JSON.parse(decodeURIComponent(q.get('adv')!)) : {}; } catch { /* ignore */ }
    return fromLegacy({ input: { principal: num(q.get('p'), d.amount), annualRate: num(q.get('r'), d.rate), tenureMonths: num(q.get('t'), d.years * 12), emiStartDate: q.get('s'), processingFees: num(q.get('f'), 0) }, ...adv }, d);
  }
  if (!q.get('a')) return d;

  const s: PlanState = { ...d };
  s.amount = clamp(num(q.get('a'), d.amount), 10_000, 500_000_000);
  s.rate = clamp(num(q.get('r'), d.rate), 0, 30);
  s.years = clamp(Math.round(num(q.get('y'), d.years)), 1, 40);
  s.start = ym(q.get('s'), d.start);
  s.fees = Math.max(0, num(q.get('f'), 0));
  s.extra = Math.max(0, num(q.get('pm'), 0));
  s.every = ([1, 3, 6, 12].includes(num(q.get('pe'), 1)) ? num(q.get('pe'), 1) : 1) as PlanState['every'];
  s.extraFrom = ym(q.get('pf'), s.start);
  s.lump = Math.max(0, num(q.get('ls'), 0));
  s.lumpAt = ym(q.get('la'), s.start);
  const rc = q.get('rc');
  if (rc) {
    s.changes = rc.split(',').map((p) => { const [at, r] = p.split(':'); return { at: ym(at, s.start), rate: clamp(num(r, s.rate), 0, 30) }; }).slice(0, 10);
    s.ratesOn = s.changes.length > 0;
    s.rateMode = q.get('rm') === 'e' ? 'reduce-emi' : 'reduce-tenure';
  }
  const su = q.get('su');
  if (su) { const [p, y] = su.split(':'); s.stepOn = true; s.stepPct = clamp(num(p, 5), 0, 50); s.stepYears = clamp(num(y, 1), 1, 10); }
  const tx = q.get('tx');
  if (tx) {
    const [reg, slab, used, b] = tx.split(':');
    s.regime = reg === 'new' ? 'new' : 'old';
    s.slab = [5, 20, 30].includes(num(slab, 30)) ? num(slab, 30) : 30;
    s.used80C = clamp(num(used, 0), 0, 150_000);
    s.borrowers = num(b, 1) === 2 ? 2 : 1;
  }
  return s;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromLegacy(o: any, d: PlanState): PlanState {
  const s: PlanState = { ...d };
  const i = o?.input ?? {};
  s.amount = num(String(i.principal ?? ''), d.amount);
  s.rate = num(String(i.annualRate ?? ''), d.rate);
  s.years = Math.max(1, Math.round(num(String(i.tenureMonths ?? ''), d.years * 12) / 12));
  s.start = ym(i.emiStartDate, d.start);
  s.fees = num(String(i.processingFees ?? ''), 0);
  const p = o?.prepayment ?? {};
  if (p.extraEMIEnabled !== false && p.extraEMIMonthly) { s.extra = Number(p.extraEMIMonthly) || 0; s.every = ([1, 3, 6, 12].includes(p.extraEMIFrequencyMonths) ? p.extraEMIFrequencyMonths : 1); s.extraFrom = ym(p.extraEMIStartDate, s.start); }
  if (p.lumpSumEnabled && p.lumpSumPayment?.amount) { s.lump = Number(p.lumpSumPayment.amount) || 0; s.lumpAt = ym(p.lumpSumPayment.date, s.start); }
  const v = o?.variableRate;
  if (v?.changes?.length && o?.showVariableRate !== false) {
    const start = new Date(`${s.start}-01`);
    s.changes = v.changes.map((c: any) => ({ at: ymOf(new Date(start.getFullYear(), start.getMonth() + (Number(c.month) || 1) - 1, 1)), rate: Number(c.newRate) || s.rate }));
    s.ratesOn = true;
    s.rateMode = v.rateChangeMode === 'reduce-emi' ? 'reduce-emi' : 'reduce-tenure';
  }
  const e = o?.emiStepUp;
  if (e && o?.showEMIStepUp) { s.stepOn = true; s.stepPct = Number(e.stepUpPercentage) || 5; s.stepYears = Math.max(1, Math.round((Number(e.intervalMonths) || 12) / 12)); }
  return s;
}
