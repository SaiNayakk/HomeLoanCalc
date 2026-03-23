/**
 * Format a number as Indian currency (₹ with en-IN locale)
 */
export function formatCurrency(value: number, fractionDigits = 0): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: fractionDigits })}`;
}

/**
 * Format a large number in compact Indian notation: Cr / L
 * Examples: 5000000 → "₹50 L", 15000000 → "₹1.5 Cr", 500000 → "₹5 L"
 */
export function formatCompact(value: number): string {
  if (value >= 10_000_000) {
    const cr = value / 10_000_000;
    return `₹${parseFloat(cr.toFixed(2))} Cr`;
  }
  if (value >= 100_000) {
    const l = value / 100_000;
    return `₹${parseFloat(l.toFixed(2))} L`;
  }
  return formatCurrency(value);
}
