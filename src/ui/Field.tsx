import { useId, useState } from 'react';
import { grouped } from '../lib/format';

interface FieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  /** Money fields are grouped the Indian way (50,00,000) and show a ₹ prefix. */
  money?: boolean;
  suffix?: string;
  decimals?: number;
  hint?: string;
  ticks?: [string, string];
  presets?: { label: string; value: number }[];
}

/** A big editable figure with a slider under it. Typing can go past the slider's range. */
export function Field({ label, value, onChange, min, max, step, money, suffix, decimals = 0, hint, ticks, presets }: FieldProps) {
  const id = useId();
  const show = (v: number) => (money ? grouped(v) : decimals ? String(Number(v.toFixed(decimals))) : String(v));
  // While typing, show exactly what was typed; otherwise show the current value.
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? show(value);

  function type(raw: string) {
    const clean = money ? raw.replace(/[^\d]/g, '') : raw.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    setDraft(money && clean ? grouped(Number(clean)) : clean);
    const n = Number(clean);
    if (clean !== '' && Number.isFinite(n) && n > 0) onChange(n);
  }
  const fill = `${Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))}%`;

  return (
    <div className="field">
      <div className="field-head">
        <label htmlFor={id}>{label}</label>
        {hint && <span className="field-words">{hint}</span>}
      </div>
      <div className="field-box">
        {money && <span className="field-affix">₹</span>}
        <input id={id} type="text" inputMode={decimals ? 'decimal' : 'numeric'} value={text}
          onFocus={() => setDraft(show(value))} onBlur={() => setDraft(null)} onChange={(e) => type(e.target.value)} />
        {suffix && <span className="field-affix">{suffix}</span>}
      </div>
      <input type="range" aria-label={`${label} slider`} min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        style={{ ['--fill' as string]: fill }} onChange={(e) => onChange(Number(e.target.value))} />
      {ticks && <div className="ticks"><span>{ticks[0]}</span><span>{ticks[1]}</span></div>}
      {presets && (
        <div className="chips">
          {presets.map((p) => (
            <button key={p.label} type="button" className="chip" aria-pressed={value === p.value} onClick={() => onChange(p.value)}>{p.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Small labelled input for secondary settings. */
export function Mini({ label, value, onChange, money, suffix, type = 'number', min, max, step }: {
  label: string; value: number | string; onChange: (v: string) => void; money?: boolean; suffix?: string; type?: 'number' | 'month'; min?: number; max?: number; step?: number;
}) {
  const id = useId();
  return (
    <div className="mini">
      <label htmlFor={id}>{label}{suffix ? ` (${suffix})` : ''}{money ? ' (₹)' : ''}</label>
      <input id={id} type={type} inputMode={type === 'number' ? 'decimal' : undefined} value={value} min={min} max={max} step={step}
        onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Toggle({ on, onChange, title, sub }: { on: boolean; onChange: (v: boolean) => void; title: string; sub?: string }) {
  return (
    <div className="switch-row">
      <p>{title}{sub && <small>{sub}</small>}</p>
      <button type="button" role="switch" aria-checked={on} aria-label={title} className="switch" onClick={() => onChange(!on)} />
    </div>
  );
}
