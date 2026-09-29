import { useEffect, useMemo, useRef, useState } from 'react';
import { short } from '../lib/format';
import type { YearRow } from '../lib/years';

const H = 230, PAD_T = 12, PAD_B = 26, PAD_L = 0, PAD_R = 44;

/** Per-year bars (principal under interest) with the balance line over them. */
export function Chart({ years, baseYears, principal }: { years: YearRow[]; baseYears?: YearRow[]; principal: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  const n = Math.max(years.length, baseYears?.length ?? 0);
  const g = useMemo(() => {
    const innerW = w - PAD_L - PAD_R, innerH = H - PAD_T - PAD_B;
    const band = innerW / n;
    const barW = Math.max(3, Math.min(26, band * 0.62));
    const maxPaid = Math.max(...years.map((y) => y.principal + y.extra + y.interest), 1);
    const yBar = (v: number) => (v / maxPaid) * innerH;
    const yBal = (v: number) => PAD_T + innerH - (v / principal) * innerH;
    const xMid = (i: number) => PAD_L + band * i + band / 2;
    const line = (rows: YearRow[]) => [`M${PAD_L},${yBal(principal)}`, ...rows.map((r, i) => `L${xMid(i)},${yBal(r.balance)}`)].join(' ');
    return { innerH, band, barW, yBar, yBal, xMid, line, maxPaid };
  }, [w, n, years, principal]);

  const every = n > 24 ? 5 : n > 12 ? 2 : 1;
  const h = hover !== null ? years[hover] : null;

  return (
    <div className="chart" ref={box} onMouseLeave={() => setHover(null)}>
      <svg width={w} height={H} role="img" aria-label={`Payments per year for ${years.length} years: principal and interest, and the balance left at the end of each year.`}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} className="grid" x1={PAD_L} x2={w - PAD_R} y1={PAD_T + g.innerH * (1 - f)} y2={PAD_T + g.innerH * (1 - f)} />
        ))}
        <text className="axis" x={w - PAD_R + 6} y={g.yBal(principal) + 4}>{short(principal)}</text>
        <text className="axis" x={w - PAD_R + 6} y={g.yBal(0)}>₹0</text>
        {hover !== null && <rect className="hover-col" x={PAD_L + g.band * hover} y={PAD_T} width={g.band} height={g.innerH} />}
        {years.map((y, i) => {
          const p = g.yBar(y.principal + y.extra), it = g.yBar(y.interest);
          const x = g.xMid(i) - g.barW / 2, base = PAD_T + g.innerH;
          return (
            <g key={i}>
              <rect className="bar-p" x={x} y={base - p} width={g.barW} height={p} rx={1.5} />
              <rect className="bar-i" x={x} y={base - p - it} width={g.barW} height={Math.max(0, it - 1)} rx={1.5} />
              {i % every === 0 && <text className="axis" x={g.xMid(i)} y={H - 6} textAnchor="middle">{y.label}</text>}
            </g>
          );
        })}
        {baseYears && <path className="bal-base" d={g.line(baseYears)} />}
        <path className="bal" d={g.line(years)} />
        {years.map((_, i) => (
          <rect key={`t${i}`} x={PAD_L + g.band * i} y={PAD_T} width={g.band} height={g.innerH + PAD_B} fill="transparent"
            onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />
        ))}
      </svg>
      {h && hover !== null && (
        <div className="tip" style={{ left: Math.min(Math.max(g.xMid(hover), 95), w - 95), top: PAD_T + 4 }}>
          <b>{h.label}</b>
          <div><span>Principal</span><span>{short(h.principal)}</span></div>
          {h.extra > 0 && <div><span>Prepaid</span><span>{short(h.extra)}</span></div>}
          <div><span>Interest</span><span>{short(h.interest)}</span></div>
          <div><span>Balance after</span><span>{short(h.balance)}</span></div>
        </div>
      )}
      <div className="legend">
        <span><i style={{ background: 'var(--green)' }} />Principal</span>
        <span><i style={{ background: 'var(--clay)' }} />Interest</span>
        <span><i style={{ background: 'var(--ink)', height: 2, verticalAlign: 3 }} />Balance left</span>
        {baseYears && <span><i style={{ background: 'var(--muted)', height: 2, verticalAlign: 3 }} />Balance without your plan</span>}
      </div>
    </div>
  );
}
