/** Indian money and date formatting. */

const inrFmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** ₹40,280 */
export const inr = (n: number) => `₹${inrFmt.format(Math.round(n))}`;

/** Grouped digits without the symbol: 50,00,000 */
export const grouped = (n: number) => inrFmt.format(Math.round(n));

/** ₹46.67 L, ₹1.25 Cr, ₹40,280 */
export function short(n: number): string {
  const a = Math.abs(n), sign = n < 0 ? '−' : '';
  if (a >= 1e7) return `${sign}₹${trim(a / 1e7)} Cr`;
  if (a >= 1e5) return `${sign}₹${trim(a / 1e5)} L`;
  return `${sign}${inr(a)}`;
}
const trim = (x: number) => (x >= 100 ? x.toFixed(0) : x.toFixed(2).replace(/\.?0+$/, ''));

/** "50 lakh", "1.2 crore", "75 thousand" */
export function words(n: number): string {
  if (n >= 1e7) return `${trim(n / 1e7)} crore`;
  if (n >= 1e5) return `${trim(n / 1e5)} lakh`;
  if (n >= 1e3) return `${trim(n / 1e3)} thousand`;
  return grouped(n);
}

/** "2026-10" plus 5 months -> Date */
export function monthDate(ym: string, plusMonths = 0): Date {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, (m || 1) - 1 + plusMonths, 1);
}
export const ymOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export const thisMonth = () => ymOf(new Date());

/** "Sep 2046" */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthYear = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** 240 -> "20 years"; 207 -> "17 years 3 months" */
export function duration(months: number): string {
  const y = Math.floor(months / 12), m = months % 12;
  const ys = y ? `${y} year${y === 1 ? '' : 's'}` : '';
  const ms = m ? `${m} month${m === 1 ? '' : 's'}` : '';
  return [ys, ms].filter(Boolean).join(' ') || '0 months';
}

export const pct = (n: number, digits = 0) => `${n.toFixed(digits)}%`;
