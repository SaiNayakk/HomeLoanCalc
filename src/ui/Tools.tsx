import { useMemo, useState } from 'react';
import { inr, short } from '../lib/format';
import { Mini } from './Field';

const emiOf = (p: number, rate: number, months: number) => {
  const r = rate / 1200;
  if (!r) return p / months;
  const f = Math.pow(1 + r, months);
  return (p * r * f) / (f - 1);
};

/** How much a bank is likely to lend: EMIs (old and new) capped at a share of take-home pay. */
function Eligibility() {
  const [income, setIncome] = useState(100_000);
  const [existing, setExisting] = useState(0);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [foir, setFoir] = useState(50);
  const maxEMI = Math.max(0, (income * foir) / 100 - existing);
  const r = rate / 1200, n = years * 12;
  const maxLoan = maxEMI <= 0 ? 0 : r ? (maxEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) : maxEMI * n;
  return (
    <div>
      <div className="grid2">
        <Mini label="Monthly take-home pay" money value={income || ''} onChange={(v) => setIncome(Math.max(0, Number(v) || 0))} />
        <Mini label="EMIs you already pay" money value={existing || ''} onChange={(v) => setExisting(Math.max(0, Number(v) || 0))} />
        <Mini label="Interest rate" suffix="%" value={rate} step={0.05} onChange={(v) => setRate(Math.min(30, Math.max(0, Number(v) || 0)))} />
        <Mini label="Tenure" suffix="years" value={years} onChange={(v) => setYears(Math.min(30, Math.max(1, Math.round(Number(v) || 1))))} />
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <span className="note" style={{ margin: 0 }}>Share of pay banks allow for all EMIs</span>
        <div className="seg" role="group" aria-label="Allowed share of income">
          {[40, 50, 60].map((f) => <button key={f} aria-pressed={foir === f} onClick={() => setFoir(f)}>{f}%</button>)}
        </div>
      </div>
      <div className="callout">
        <span className="callout-num">{short(maxLoan)}</span>
        <span>is roughly what you could borrow, with an EMI of up to <b>{inr(maxEMI)}</b> a month.</span>
      </div>
      <p className="note">Banks cap all your EMIs at about 40 to 60% of take-home pay (FOIR), depending on income and credit score. They also fund at most 75 to 90% of the property&apos;s value.</p>
    </div>
  );
}

/**
 * Rent or buy, compared fairly: both people spend the same each month. Whoever
 * pays less (EMI vs rent) invests the difference, and the renter also invests
 * the down payment and buying costs. Compare what each owns at the end.
 */
function RentOrBuy() {
  const [price, setPrice] = useState(8_000_000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [rent, setRent] = useState(25_000);
  const [rentUp, setRentUp] = useState(5);
  const [appreciation, setAppreciation] = useState(5);
  const [invest, setInvest] = useState(10);
  const [costs, setCosts] = useState(7);

  const r = useMemo(() => {
    const down = (price * downPct) / 100, upfront = (price * costs) / 100;
    const n = years * 12, emi = emiOf(price - down, rate, n), mr = invest / 1200;
    let renter = down + upfront, buyer = 0, monthlyRent = rent;
    for (let m = 1; m <= n; m++) {
      if (m > 1 && (m - 1) % 12 === 0) monthlyRent *= 1 + rentUp / 100;
      renter *= 1 + mr; buyer *= 1 + mr;
      if (emi > monthlyRent) renter += emi - monthlyRent; else buyer += monthlyRent - emi;
    }
    const house = price * Math.pow(1 + appreciation / 100, years);
    return { emi, buyerWorth: house + buyer, renterWorth: renter, house };
  }, [price, downPct, rate, years, rent, rentUp, appreciation, invest, costs]);
  const buyWins = r.buyerWorth >= r.renterWorth;
  const gap = Math.abs(r.buyerWorth - r.renterWorth);

  return (
    <div>
      <div className="grid2">
        <Mini label="Property price" money value={price || ''} onChange={(v) => setPrice(Math.max(0, Number(v) || 0))} />
        <Mini label="Rent for a similar home" money value={rent || ''} onChange={(v) => setRent(Math.max(0, Number(v) || 0))} />
        <Mini label="Down payment" suffix="%" value={downPct} onChange={(v) => setDownPct(Math.min(90, Math.max(10, Number(v) || 0)))} />
        <Mini label="Loan rate" suffix="%" value={rate} step={0.05} onChange={(v) => setRate(Math.min(30, Math.max(0, Number(v) || 0)))} />
        <Mini label="Years" value={years} onChange={(v) => setYears(Math.min(30, Math.max(1, Math.round(Number(v) || 1))))} />
        <Mini label="Rent rises each year" suffix="%" value={rentUp} onChange={(v) => setRentUp(Math.min(20, Math.max(0, Number(v) || 0)))} />
        <Mini label="Property value rises each year" suffix="%" value={appreciation} onChange={(v) => setAppreciation(Math.min(20, Math.max(-5, Number(v) || 0)))} />
        <Mini label="Return on investments" suffix="%" value={invest} onChange={(v) => setInvest(Math.min(20, Math.max(0, Number(v) || 0)))} />
        <Mini label="Stamp duty and registration" suffix="% of price" value={costs} onChange={(v) => setCosts(Math.min(15, Math.max(0, Number(v) || 0)))} />
      </div>
      <div className="callout" style={buyWins ? undefined : { background: 'var(--clay-soft)' }}>
        <span className="callout-num" style={buyWins ? undefined : { color: 'var(--clay)' }}>{buyWins ? 'Buy' : 'Rent'}</span>
        <span>
          After {years} years, {buyWins ? 'buying' : 'renting and investing'} leaves you about <b>{short(gap)}</b> better off.
          The buyer owns a home worth {short(r.house)}{r.buyerWorth > r.house && <> plus {short(r.buyerWorth - r.house)} invested</>}; the renter has {short(r.renterWorth)} invested.
        </span>
      </div>
      <p className="note">Both pay the same each month: the EMI of {inr(r.emi)} or the rent, whichever is lower, with the difference invested. The renter also invests the down payment and buying costs. Maintenance, society charges and taxes aren&apos;t included.</p>
    </div>
  );
}

export function Tools() {
  const [tab, setTab] = useState<'elig' | 'rent'>('elig');
  return (
    <section className="sheet section tools">
      <p className="kicker"><b>07</b>Before you apply</p>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'elig'} onClick={() => setTab('elig')}>How much can I borrow?</button>
        <button role="tab" aria-selected={tab === 'rent'} onClick={() => setTab('rent')}>Rent or buy?</button>
      </div>
      {tab === 'elig' ? <Eligibility /> : <RentOrBuy />}
    </section>
  );
}

const FAQ = [
  ['How is EMI calculated?', 'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan amount, r is the annual rate ÷ 12 ÷ 100, and n is the number of months. For ₹50 lakh at 7.5% for 20 years, that is ₹40,280 a month.'],
  ['What is the EMI on a ₹50 lakh home loan?', 'At 8.5% for 20 years it is about ₹43,391 a month; at 7.5% it is about ₹40,280.'],
  ['What is the EMI on a ₹1 crore home loan?', 'At 8.5% for 20 years it is about ₹86,782 a month; at 7.5% it is about ₹80,559.'],
  ['Does a longer tenure cost more?', 'Yes. The EMI is lower but you pay interest for longer. ₹50 lakh at 8% costs about ₹50.4 lakh in interest over 20 years, and about ₹22.8 lakh over 10 years.'],
  ['Is prepaying worth it?', 'Usually, because it cuts the principal that interest is charged on. ₹5,000 extra a month on a ₹50 lakh, 20-year loan saves about ₹11.5 lakh at 7.5% (₹13.9 lakh at 8.5%) and ends the loan more than 4 years early.'],
  ['Can I claim tax benefits on my home loan?', 'Under the old tax regime, yes: up to ₹2 lakh of interest a year under Section 24(b) and principal within the ₹1.5 lakh 80C limit, for a house you live in. Under the new regime, a self-occupied home loan gets no deduction.'],
  ['When rates change, should I reduce EMI or tenure?', 'Keeping the EMI and cutting the tenure saves more interest. Lowering the EMI helps monthly cash flow. Banks default to changing the tenure.'],
];

export function Faq() {
  return (
    <section className="sheet section faq">
      <p className="kicker"><b>08</b>Questions people ask</p>
      {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
    </section>
  );
}
