import type { LoanCalculation, PrepaymentOptions } from '../engine';
import { generateAmortizationSchedule, generateScheduleWithPrepayment } from '../engine';

interface SavingsSuggestionProps {
  calculation: LoanCalculation;
}

export function SavingsSuggestion({ calculation }: SavingsSuggestionProps) {
  const { input, actualTenureMonths } = calculation;
  const baseCalculation = generateAmortizationSchedule(input);
  const baseTotalInterest = baseCalculation.totalInterest;
  const baseTotalPayable = baseCalculation.totalPayable;
  const baseTenureMonths = baseCalculation.actualTenureMonths || input.tenureMonths;

  // Accurate savings for different prepayment scenarios
  const calculateSavings = (extraMonthlyPayment: number) => {
    const prepayment: PrepaymentOptions = {
      extraEMIEnabled: true,
      extraEMIMonthly: extraMonthlyPayment,
      extraEMIFrequencyMonths: 1,
      extraEMIStartDate: input.emiStartDate,
      lumpSumEnabled: false,
    };

    const scenario = generateScheduleWithPrepayment(input, prepayment);
    const interestSaved = Math.max(0, baseTotalInterest - scenario.totalInterest);
    const totalPayableSaved = Math.max(0, baseTotalPayable - scenario.totalPayable);
    const monthsSaved = Math.max(0, baseTenureMonths - scenario.actualTenureMonths);

    return {
      monthsSaved,
      interestSaved,
      totalPayableSaved,
      finalInterest: scenario.totalInterest,
      finalPayable: scenario.totalPayable,
      updatedTenure: {
        years: Math.floor(scenario.actualTenureMonths / 12),
        months: scenario.actualTenureMonths % 12,
      },
      yearsMonthsSaved: {
        years: Math.floor(monthsSaved / 12),
        months: monthsSaved % 12,
      },
    };
  };

  const savings5K = calculateSavings(5000);
  const savings10K = calculateSavings(10000);
  const savings20K = calculateSavings(20000);

  const cardBase: React.CSSProperties = {
    borderRadius: 10,
    padding: 16,
    border: '1px solid',
    display: 'flex',
    gap: 12,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        <div
          style={{
            ...cardBase,
            borderColor: '#bbf7d0',
            background: 'linear-gradient(90deg, #ecfdf3, #dcfce7)',
          }}
        >
          <span style={{ fontSize: 22 }}>💰</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#14532d', marginBottom: 6 }}>
              Pay ₹{(5000).toLocaleString('en-IN')} extra monthly ({savings5K.updatedTenure.years}y {savings5K.updatedTenure.months}m)
            </div>
            <div style={{ fontSize: 13, color: '#166534' }}>
              Save <strong>₹{savings5K.interestSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> in interest &amp; shave{' '}
              <strong>{savings5K.yearsMonthsSaved.years}y {savings5K.yearsMonthsSaved.months}m</strong>
            </div>
            <div style={{ fontSize: 12, color: '#166534', marginTop: 6 }}>
              Final interest:{' '}
              <del style={{ color: '#64748b' }}>
                ₹{baseTotalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </del>{' '}
              <strong>₹{savings5K.finalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
            </div>
            <div style={{ fontSize: 12, color: '#166534', marginTop: 4 }}>
              Total payable saved:{' '}
              <del style={{ color: '#64748b' }}>
                ₹{baseTotalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </del>{' '}
              <strong>₹{savings5K.finalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
            </div>
          </div>
        </div>

        <div
          style={{
            ...cardBase,
            borderColor: '#bfdbfe',
            background: 'linear-gradient(90deg, #eff6ff, #e0f2fe)',
          }}
        >
          <span style={{ fontSize: 22 }}>🎯</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: 6 }}>
              Pay ₹{(10000).toLocaleString('en-IN')} extra monthly ({savings10K.updatedTenure.years}y {savings10K.updatedTenure.months}m)
            </div>
            <div style={{ fontSize: 13, color: '#1d4ed8' }}>
              Save <strong>₹{savings10K.interestSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> in interest &amp; shave{' '}
              <strong>{savings10K.yearsMonthsSaved.years}y {savings10K.yearsMonthsSaved.months}m</strong>
            </div>
            <div style={{ fontSize: 12, color: '#1d4ed8', marginTop: 6 }}>
              Final interest:{' '}
              <del style={{ color: '#64748b' }}>
                ₹{baseTotalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </del>{' '}
              <strong>₹{savings10K.finalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
            </div>
            <div style={{ fontSize: 12, color: '#1d4ed8', marginTop: 4 }}>
              Total payable saved:{' '}
              <del style={{ color: '#64748b' }}>
                ₹{baseTotalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </del>{' '}
              <strong>₹{savings10K.finalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
            </div>
          </div>
        </div>

        <div
          style={{
            ...cardBase,
            borderColor: '#e9d5ff',
            background: 'linear-gradient(90deg, #f5f3ff, #fce7f3)',
          }}
        >
          <span style={{ fontSize: 22 }}>🚀</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#5b21b6', marginBottom: 6 }}>
              Pay ₹{(20000).toLocaleString('en-IN')} extra monthly ({savings20K.updatedTenure.years}y {savings20K.updatedTenure.months}m)
            </div>
            <div style={{ fontSize: 13, color: '#7e22ce' }}>
              Save <strong>₹{savings20K.interestSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> in interest &amp; shave{' '}
              <strong>{savings20K.yearsMonthsSaved.years}y {savings20K.yearsMonthsSaved.months}m</strong>
            </div>
            <div style={{ fontSize: 12, color: '#7e22ce', marginTop: 6 }}>
              Final interest:{' '}
              <del style={{ color: '#64748b' }}>
                ₹{baseTotalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </del>{' '}
              <strong>₹{savings20K.finalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
            </div>
            <div style={{ fontSize: 12, color: '#7e22ce', marginTop: 4 }}>
              Total payable saved:{' '}
              <del style={{ color: '#64748b' }}>
                ₹{baseTotalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </del>{' '}
              <strong>₹{savings20K.finalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: 10,
          padding: 12,
          fontSize: 13,
          color: '#92400e',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <strong>💡 Pro Tip:</strong>
          <span>Even small extra payments compound over time. Increase EMI by 10-20% during salary hikes to dramatically reduce your loan tenure!</span>
        </div>
      </div>
    </div>
  );
}
