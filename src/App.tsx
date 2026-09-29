import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { monthIndex, simulate } from './engine/simulate';
import type { LoanInput, PrepaymentOptions } from './engine/types';
import { fromQuery, toQuery, type PlanState } from './lib/state';
import { duration, inr, words } from './lib/format';
import { Field } from './ui/Field';
import { Flow, PayOff, Rates, Schedule, Summary, Tax } from './ui/Sections';
import { Faq, Tools } from './ui/Tools';

function Mark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--ink)" />
      <path d="M8 16.5 16 9l8 7.5" fill="none" stroke="var(--paper)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 15v8h10v-8" fill="none" stroke="var(--paper)" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="16" cy="19" r="1.9" fill="var(--green)" />
    </svg>
  );
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    try { const t = localStorage.getItem('theme'); if (t) return t === 'dark'; } catch { /* storage blocked */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#121311' : '#f5f2ea');
  }, [dark]);
  const toggle = () => setDark((d) => { try { localStorage.setItem('theme', d ? 'light' : 'dark'); } catch { /* ignore */ } return !d; });
  return { dark, toggle };
}

export default function App() {
  const [s, setS] = useState<PlanState>(() => fromQuery(window.location.search));
  const set = useCallback((patch: Partial<PlanState>) => setS((prev) => ({ ...prev, ...patch })), []);
  const { dark, toggle } = useTheme();
  const [copied, setCopied] = useState(false);

  // The address bar always holds the current calculation, so reloading or sharing keeps it.
  useEffect(() => {
    const t = setTimeout(() => window.history.replaceState(null, '', `?${toQuery(s)}`), 250);
    return () => clearTimeout(t);
  }, [s]);

  const input: LoanInput = useMemo(() => ({
    principal: s.amount, annualRate: s.rate, tenureMonths: s.years * 12, processingFees: s.fees, emiStartDate: `${s.start}-01`,
  }), [s.amount, s.rate, s.years, s.fees, s.start]);

  const { base, plan, planned, fiveK } = useMemo(() => {
    const prepayment: PrepaymentOptions = {
      extraEMIMonthly: s.extra, extraEMIFrequencyMonths: s.every, extraEMIStartDate: `${s.extraFrom}-01`,
      lumpSumEnabled: s.lump > 0, lumpSumPayment: s.lump > 0 ? { month: 1, amount: s.lump, date: `${s.lumpAt}-01` } : undefined,
    };
    const rates = s.ratesOn && s.changes.length
      ? { rateChangeMode: s.rateMode, changes: s.changes.map((c) => ({ month: monthIndex(input.emiStartDate, `${c.at}-01`) ?? 1, newRate: c.rate })) }
      : null;
    const stepUp = s.stepOn && s.stepPct > 0 ? { stepUpPercentage: s.stepPct, intervalMonths: s.stepYears * 12 } : null;
    const base = simulate(input);
    const planned = s.extra > 0 || s.lump > 0 || !!rates || !!stepUp;
    const plan = planned ? simulate(input, { prepayment, rates, stepUp }) : base;
    const five = simulate(input, { prepayment: { extraEMIMonthly: 5000 } });
    return { base, plan, planned, fiveK: { saved: base.totalInterest - five.totalInterest, earlier: base.actualTenureMonths - five.actualTenureMonths } };
  }, [input, s.extra, s.every, s.extraFrom, s.lump, s.lumpAt, s.ratesOn, s.changes, s.rateMode, s.stepOn, s.stepPct, s.stepYears]);

  // On phones, keep the EMI in view once the big figure scrolls away.
  const hero = useRef<HTMLDivElement>(null);
  const [dock, setDock] = useState(false);
  useEffect(() => {
    if (!hero.current) return;
    const io = new IntersectionObserver(([e]) => setDock(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(hero.current);
    return () => io.disconnect();
  }, []);

  function share() {
    navigator.clipboard?.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }

  const props = { s, set, plan, base, planned };
  return (
    <>
      <header className="wrap top">
        <a className="brand" href="/" aria-label="HomeLoanCalc home"><Mark /><span className="brand-name">HomeLoan<i>Calc</i></span></a>
        <div className="top-actions">
          <button className="icon-btn" onClick={share}>{copied ? 'Link copied' : 'Share'}</button>
          <button className="icon-btn" onClick={toggle} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>{dark ? 'Light' : 'Dark'}</button>
        </div>
      </header>

      <main className="wrap layout">
        <aside className="panel" aria-label="Your loan">
          <h1 className="panel-title">Home loan EMI calculator</h1>
          <p className="panel-sub">Change anything; everything updates as you type.</p>
          <Field label="Loan amount" money value={s.amount} onChange={(v) => set({ amount: Math.round(v) })} min={500_000} max={30_000_000} step={100_000}
            hint={`₹${words(s.amount)}`} presets={[{ label: '25 L', value: 2_500_000 }, { label: '50 L', value: 5_000_000 }, { label: '75 L', value: 7_500_000 }, { label: '1 Cr', value: 10_000_000 }]} />
          <Field label="Interest rate" value={s.rate} onChange={(v) => set({ rate: Math.min(30, v) })} min={6} max={14} step={0.05} decimals={2} suffix="%" hint="per year, floating" ticks={['6%', '14%']} />
          <Field label="Tenure" value={s.years} onChange={(v) => set({ years: Math.min(40, Math.max(1, Math.round(v))) })} min={1} max={30} step={1} suffix="years" ticks={['1 year', '30 years']}
            presets={[10, 15, 20, 25, 30].map((y) => ({ label: `${y} y`, value: y }))} />
          <div className="field">
            <div className="field-head"><label htmlFor="start">First EMI</label><span className="field-words">used for dates and tax years</span></div>
            <div className="field-box"><input id="start" type="month" value={s.start} onChange={(e) => e.target.value && set({ start: e.target.value })} /></div>
          </div>
          <div className="field">
            <div className="field-head"><label htmlFor="fees">Processing fee</label><span className="field-words">optional</span></div>
            <div className="field-box"><span className="field-affix">₹</span><input id="fees" type="text" inputMode="numeric" value={s.fees ? s.fees.toLocaleString('en-IN') : ''} placeholder="0"
              onChange={(e) => set({ fees: Number(e.target.value.replace(/\D/g, '')) || 0 })} /></div>
          </div>
        </aside>

        <div>
          <Summary {...props} heroRef={hero} />
          <Flow {...props} />
          <PayOff {...props} fiveK={fiveK} />
          <Rates {...props} />
          <Tax {...props} />
          <Schedule {...props} />
          <Tools />
          <Faq />
        </div>
      </main>

      <footer className="wrap foot">
        <span>HomeLoanCalc · made by <a href="https://saiworks.nncs.in">Sai</a>, served from an old Android phone.</span>
        <span>Estimates for planning. Your bank&apos;s figures are final.</span>
      </footer>

      <div className={`dock${dock ? ' show' : ''}`} aria-hidden={!dock}>
        <div><b>{inr(plan.monthlyEMI)}</b><br /><span>a month for {duration(plan.actualTenureMonths)}</span></div>
        <button className="icon-btn" style={{ color: 'var(--paper)', borderColor: 'rgba(255,255,255,.3)' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Edit loan</button>
      </div>
    </>
  );
}
