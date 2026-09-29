import { Fragment, useMemo, useState } from 'react';
import type { Simulation } from '../engine/simulate';
import { taxBenefits } from '../engine/tax';
import type { PlanState } from '../lib/state';
import { duration, inr, monthDate, monthYear, short, ymOf } from '../lib/format';
import { Chart } from './Chart';
import { byLoanYear } from '../lib/years';
import { Mini, Toggle } from './Field';

type Set = (patch: Partial<PlanState>) => void;
interface Props { s: PlanState; set: Set; plan: Simulation; base: Simulation; planned: boolean }

const endOf = (s: PlanState, months: number) => monthYear(monthDate(s.start, months - 1));

function Kicker({ n, children }: { n: string; children: React.ReactNode }) {
  return <p className="kicker"><b>{n}</b>{children}</p>;
}

/* ── 01 · The EMI ─────────────────────────────────────────────── */
export function Summary({ s, plan, base, planned, heroRef }: Props & { heroRef: React.Ref<HTMLDivElement> }) {
  const interestShare = (plan.totalInterest / s.amount) * 100;
  const saved = base.totalInterest - plan.totalInterest;
  const earlier = base.actualTenureMonths - plan.actualTenureMonths;
  const total = s.amount + plan.totalInterest;
  const pShare = (s.amount / total) * 100;
  return (
    <section className="sheet" aria-labelledby="emi-h">
      <Kicker n="01">Your monthly EMI</Kicker>
      <div ref={heroRef} className="hero-emi" id="emi-h">{inr(plan.monthlyEMI)}<small>a month</small></div>
      <p className="story">
        Over <strong>{duration(plan.actualTenureMonths)}</strong> you&apos;ll pay <strong className="clay">{short(plan.totalInterest)}</strong> in interest,{' '}
        {interestShare >= 100 ? <>more than you borrowed</> : <>{Math.round(interestShare)}% of what you borrow</>}.
        {' '}Your last EMI is in <strong>{endOf(s, plan.actualTenureMonths)}</strong>.
        {planned && saved > 0 && <> Your plan saves <strong>{short(saved)}</strong>{earlier > 0 && <> and ends the loan <strong>{duration(earlier)}</strong> early</>}.</>}
      </p>
      <div className="split" aria-hidden="true"><span className="p" style={{ width: `${pShare}%` }} /><span className="i" style={{ width: `${100 - pShare}%` }} /></div>
      <div className="legend"><span><i style={{ background: 'var(--green)' }} />Principal {Math.round(pShare)}%</span><span><i style={{ background: 'var(--clay)' }} />Interest {Math.round(100 - pShare)}%</span></div>
      <ul className="ledger">
        <li><span>Loan amount</span><span>{inr(s.amount)}</span></li>
        <li><span>Total interest</span><span>{inr(plan.totalInterest)}</span></li>
        {s.fees > 0 && <li><span>Processing fee</span><span>{inr(s.fees)}</span></li>}
        {plan.totalExtraPayments > 0 && <li><span>Of which you prepay</span><span>{inr(plan.totalExtraPayments)}</span></li>}
        <li className="total"><span>Total you pay the bank</span><span>{inr(plan.totalPayable)}</span></li>
      </ul>
      {plan.emiRaised && (
        <p className="callout warn">At the higher rate, the EMI wouldn&apos;t cover the month&apos;s interest, so it&apos;s been raised to keep the loan shrinking. Banks do the same, usually after asking you.</p>
      )}
    </section>
  );
}

/* ── 02 · Where the money goes ────────────────────────────────── */
export function Flow({ s, plan, base, planned }: Props) {
  const years = useMemo(() => byLoanYear(plan.schedule, s.start), [plan, s.start]);
  const baseYears = useMemo(() => (planned ? byLoanYear(base.schedule, s.start) : undefined), [planned, base, s.start]);
  const firstYear = years[0];
  const firstShare = firstYear ? (firstYear.interest / (firstYear.interest + firstYear.principal)) * 100 : 0;
  return (
    <section className="sheet section">
      <Kicker n="02">Where the money goes</Kicker>
      <h2 className="h2">Early EMIs are mostly interest</h2>
      <p className="lede">In the first year, {Math.round(firstShare)}% of what you pay is interest. That share falls every year, which is why money prepaid early saves the most.</p>
      <Chart years={years} baseYears={baseYears} principal={s.amount} />
    </section>
  );
}

/* ── 03 · Pay it off sooner ───────────────────────────────────── */
export function PayOff({ s, set, plan, base, fiveK }: Props & { fiveK: { saved: number; earlier: number } }) {
  const saved = base.totalInterest - plan.totalInterest;
  const earlier = base.actualTenureMonths - plan.actualTenureMonths;
  const perRupee = plan.totalExtraPayments > 0 ? saved / plan.totalExtraPayments : 0;
  return (
    <section className="sheet section">
      <Kicker n="03">Pay it off sooner</Kicker>
      <h2 className="h2">Small extras, big difference</h2>
      <p className="lede">Anything you pay beyond the EMI goes straight to the principal. Most banks don&apos;t charge for prepaying a floating-rate home loan.</p>
      <div className="grid2">
        <Mini label="Extra payment" money value={s.extra || ''} onChange={(v) => set({ extra: Math.max(0, Number(v) || 0) })} />
        <div className="mini">
          <label htmlFor="every">How often</label>
          <select id="every" value={s.every} onChange={(e) => set({ every: Number(e.target.value) as PlanState['every'] })}>
            <option value={1}>Every month</option><option value={3}>Every 3 months</option><option value={6}>Every 6 months</option><option value={12}>Once a year</option>
          </select>
        </div>
        <Mini label="Starting" type="month" value={s.extraFrom} onChange={(v) => v && set({ extraFrom: v })} />
        <div />
        <Mini label="One-time lump sum" money value={s.lump || ''} onChange={(v) => set({ lump: Math.max(0, Number(v) || 0) })} />
        <Mini label="Paid in" type="month" value={s.lumpAt} onChange={(v) => v && set({ lumpAt: v })} />
      </div>
      <div style={{ marginTop: 18 }}>
        <Toggle on={s.stepOn} onChange={(v) => set({ stepOn: v })} title="Raise the EMI as your salary grows" sub="A small yearly increase closes the loan years early." />
        {s.stepOn && (
          <div className="grid2" style={{ paddingBottom: 6 }}>
            <Mini label="Increase by" suffix="%" value={s.stepPct} onChange={(v) => set({ stepPct: Math.min(50, Math.max(0, Number(v) || 0)) })} />
            <Mini label="Every" suffix="years" value={s.stepYears} onChange={(v) => set({ stepYears: Math.min(10, Math.max(1, Math.round(Number(v) || 1))) })} />
          </div>
        )}
      </div>
      {saved > 0 ? (
        <div className="callout">
          <span className="callout-num">{short(saved)}</span>
          <span>less interest{earlier > 0 && <>, and the loan ends in <b>{endOf(s, plan.actualTenureMonths)}</b> instead of {endOf(s, base.actualTenureMonths)}</>}.
            {perRupee > 0 && <> Every rupee you prepay saves about <b>₹{perRupee.toFixed(2)}</b> of interest.</>}</span>
        </div>
      ) : (
        <p className="note">
          For example, ₹5,000 extra a month on this loan would save <b>{short(fiveK.saved)}</b> of interest and end it {duration(fiveK.earlier)} early.{' '}
          <button className="link-btn" onClick={() => set({ extra: 5000, every: 1 })}>Try it</button>
        </p>
      )}
    </section>
  );
}

/* ── 04 · If rates change ─────────────────────────────────────── */
export function Rates({ s, set, plan }: Props) {
  const add = () => {
    const last = s.changes.at(-1);
    const at = last ? ymOf(monthDate(last.at, 12)) : ymOf(monthDate(s.start, 12));
    set({ ratesOn: true, changes: [...s.changes, { at, rate: Math.max(0, Number(((last?.rate ?? s.rate) - 0.25).toFixed(2))) }] });
  };
  return (
    <section className="sheet section">
      <Kicker n="04">If rates change</Kicker>
      <h2 className="h2">Floating rates move with the repo rate</h2>
      <p className="lede">When your rate changes, banks usually keep the EMI and change the tenure. You can ask for the opposite.</p>
      <Toggle on={s.ratesOn} onChange={(v) => { if (v && !s.changes.length) add(); else set({ ratesOn: v }); }} title="Model a rate change" />
      {s.ratesOn && (
        <>
          {s.changes.map((c, i) => (
            <div className="row" key={i} style={{ marginBottom: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}><Mini label="From" type="month" value={c.at} onChange={(v) => v && set({ changes: s.changes.map((x, j) => (j === i ? { ...x, at: v } : x)) })} /></div>
              <div style={{ flex: 1 }}><Mini label="New rate" suffix="%" value={c.rate} step={0.05} onChange={(v) => set({ changes: s.changes.map((x, j) => (j === i ? { ...x, rate: Math.min(30, Math.max(0, Number(v) || 0)) } : x)) })} /></div>
              <button className="remove" aria-label="Remove this rate change" onClick={() => { const changes = s.changes.filter((_, j) => j !== i); set({ changes, ratesOn: changes.length > 0 }); }}>×</button>
            </div>
          ))}
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
            <button className="link-btn" onClick={add}>Add another change</button>
            <div className="seg" role="group" aria-label="When the rate changes">
              <button aria-pressed={s.rateMode === 'reduce-tenure'} onClick={() => set({ rateMode: 'reduce-tenure' })}>Keep EMI</button>
              <button aria-pressed={s.rateMode === 'reduce-emi'} onClick={() => set({ rateMode: 'reduce-emi' })}>Keep tenure</button>
            </div>
          </div>
          <p className="note">With these changes the loan runs {duration(plan.actualTenureMonths)} and costs {short(plan.totalInterest)} in interest.</p>
        </>
      )}
    </section>
  );
}

/* ── 05 · Tax ─────────────────────────────────────────────────── */
export function Tax({ s, set, plan }: Props) {
  const t = useMemo(() => taxBenefits(plan.schedule, `${s.start}-01`, { regime: s.regime, slabRate: s.slab, used80C: s.used80C, borrowers: s.borrowers }), [plan, s.start, s.regime, s.slab, s.used80C, s.borrowers]);
  const [all, setAll] = useState(false);
  const rows = all ? t.years : t.years.slice(0, 6);
  return (
    <section className="sheet section">
      <Kicker n="05">Income tax</Kicker>
      <h2 className="h2">What the loan saves you in tax</h2>
      <p className="lede">For a house you live in. The answer depends first on your tax regime.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        <div className="seg" role="group" aria-label="Tax regime">
          <button aria-pressed={s.regime === 'old'} onClick={() => set({ regime: 'old' })}>Old regime</button>
          <button aria-pressed={s.regime === 'new'} onClick={() => set({ regime: 'new' })}>New regime</button>
        </div>
      </div>
      {s.regime === 'new' ? (
        <p className="callout warn">Under the new regime, the default since 2023-24, a home loan on a house you live in gives no deduction: no 80C for principal and no 24(b) for interest. If the loan is a big part of your deductions, compare both regimes on your full income before you file.</p>
      ) : (
        <>
          <div className="grid2">
            <div className="mini">
              <label>Your tax slab</label>
              <div className="seg" role="group" aria-label="Tax slab">{[5, 20, 30].map((r) => <button key={r} aria-pressed={s.slab === r} onClick={() => set({ slab: r })}>{r}%</button>)}</div>
            </div>
            <div className="mini">
              <label>Borrowers</label>
              <div className="seg" role="group" aria-label="Borrowers">
                <button aria-pressed={s.borrowers === 1} onClick={() => set({ borrowers: 1 })}>Just me</button>
                <button aria-pressed={s.borrowers === 2} onClick={() => set({ borrowers: 2 })}>Two, jointly</button>
              </div>
            </div>
            <Mini label={`80C already used${s.borrowers === 2 ? ' by each' : ''} (EPF, PPF, insurance)`} money value={s.used80C || ''} onChange={(v) => set({ used80C: Math.min(150_000, Math.max(0, Number(v) || 0)) })} />
          </div>
          <div className="callout">
            <span className="callout-num">{short(t.totalSaving)}</span>
            <span>in tax saved over the loan, including 4% cess.{t.years[1] && <> A full year like {t.years[1].fy} saves <b>{inr(t.years[1].saving)}</b>.</>}</span>
          </div>
          {t.cappedYears > 0 && (
            <p className="note">In {t.cappedYears} year{t.cappedYears === 1 ? '' : 's'}, interest is above the ₹2 lakh 24(b) limit{s.borrowers === 2 ? ' for each borrower' : ''}, so part of it isn&apos;t deductible.{s.borrowers === 1 && ' A co-owner who is also a co-borrower can claim their own ₹2 lakh.'}</p>
          )}
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table>
              <thead><tr><th>Financial year</th><th>Interest paid</th><th>24(b)</th><th>Principal paid</th><th>80C</th><th>Tax saved</th></tr></thead>
              <tbody>
                {rows.map((y) => (
                  <tr key={y.fy} style={{ cursor: 'default' }}>
                    <td>{y.fy}</td><td>{inr(y.interest)}</td><td>{inr(y.deduction24b)}</td><td>{inr(y.principal)}</td><td>{inr(y.deduction80C)}</td><td className="green">{inr(y.saving)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {t.years.length > 6 && <button className="link-btn" style={{ marginTop: 10 }} onClick={() => setAll(!all)}>{all ? 'Show fewer years' : `Show all ${t.years.length} years`}</button>}
        </>
      )}
      <p className="note">An estimate for planning, not tax advice. It ignores surcharge, the pre-construction interest rule and rented-out property. Limits: 24(b) ₹2,00,000 and 80C ₹1,50,000 a year, per borrower.</p>
    </section>
  );
}

/* ── 06 · Year by year ────────────────────────────────────────── */
export function Schedule({ s, plan }: Props) {
  const years = useMemo(() => byLoanYear(plan.schedule, s.start), [plan, s.start]);
  const [open, setOpen] = useState<number | null>(null);
  const hasExtra = plan.totalExtraPayments > 0;
  function csv() {
    const head = 'Month,EMI,Principal,Prepaid,Interest,Balance,Rate';
    const body = plan.schedule.map((r) => [ymOf(monthDate(s.start, r.month - 1)), r.emiPayment, r.principal, r.extraPrincipal, r.interest, r.closingBalance, r.currentRate].join(','));
    const url = URL.createObjectURL(new Blob([[head, ...body].join('\n')], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: `home-loan-schedule-${s.start}.csv` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  return (
    <section className="sheet section">
      <Kicker n="06">Year by year</Kicker>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <h2 className="h2" style={{ margin: 0 }}>The full schedule</h2>
        <div className="row no-print">
          <button className="icon-btn" onClick={csv}>Download CSV</button>
          <button className="icon-btn" onClick={() => window.print()}>Print</button>
        </div>
      </div>
      <p className="lede">Tap a year to see its months.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Year</th><th>Principal</th>{hasExtra && <th>Prepaid</th>}<th>Interest</th><th>Balance</th></tr></thead>
          <tbody>
            {years.map((y, i) => (
              <Fragment key={i}>
                <tr onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                  <td>{open === i ? '▾' : '▸'} {y.label}</td><td className="green">{inr(y.principal)}</td>{hasExtra && <td>{inr(y.extra)}</td>}<td className="clay">{inr(y.interest)}</td><td>{inr(y.balance)}</td>
                </tr>
                {open === i && plan.schedule.slice(i * 12, i * 12 + 12).map((r) => (
                  <tr className="sub" key={r.month}>
                    <td>&nbsp;&nbsp;{monthYear(monthDate(s.start, r.month - 1))}</td><td>{inr(r.principal)}</td>{hasExtra && <td>{inr(r.extraPrincipal)}</td>}<td>{inr(r.interest)}</td><td>{inr(r.closingBalance)}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
