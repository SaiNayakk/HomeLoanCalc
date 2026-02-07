import type { LoanCalculation } from '../engine';

interface SavingsSuggestionProps {
  calculation: LoanCalculation;
}

export function SavingsSuggestion({ calculation }: SavingsSuggestionProps) {
  const { input, monthlyEMI, totalInterest } = calculation;

  // Calculate savings for different prepayment scenarios
  const calculateSavings = (extraMonthlyPayment: number) => {
    // Calculate savings estimate based on extra payment
    
    // Simple approximation: extra payment reduces principal faster
    // More accurate would need full recalculation, but this gives good estimate
    const monthsToPayoff = input.tenureMonths;
    const estimatedMonthsSaved = Math.round(
      (extraMonthlyPayment * monthsToPayoff) / monthlyEMI
    );
    
    // Interest saved estimate
    const monthlyInterestOnExtra = (input.annualRate / 12 / 100) * (extraMonthlyPayment * monthsToPayoff);
    const estimatedSavings = Math.min(monthlyInterestOnExtra, totalInterest * 0.3);

    return {
      monthsSaved: estimatedMonthsSaved,
      interestSaved: Math.max(0, estimatedSavings),
      yearsMonthsSaved: {
        years: Math.floor(estimatedMonthsSaved / 12),
        months: estimatedMonthsSaved % 12,
      },
    };
  };

  const savings5K = calculateSavings(5000);
  const savings10K = calculateSavings(10000);
  const savings20K = calculateSavings(20000);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💰</span>
          <div className="flex-1">
            <p className="font-semibold text-green-900 mb-1">Pay ₹{(5000).toLocaleString('en-IN')} extra monthly</p>
            <p className="text-sm text-green-700">
              Save <span className="font-bold">₹{savings5K.interestSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span> in interest &amp; 
              complete loan in <span className="font-bold">{savings5K.yearsMonthsSaved.years}y {savings5K.yearsMonthsSaved.months}m</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div className="flex-1">
            <p className="font-semibold text-blue-900 mb-1">Pay ₹{(10000).toLocaleString('en-IN')} extra monthly</p>
            <p className="text-sm text-blue-700">
              Save <span className="font-bold">₹{savings10K.interestSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span> in interest &amp; 
              complete loan in <span className="font-bold">{savings10K.yearsMonthsSaved.years}y {savings10K.yearsMonthsSaved.months}m</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚀</span>
          <div className="flex-1">
            <p className="font-semibold text-purple-900 mb-1">Pay ₹{(20000).toLocaleString('en-IN')} extra monthly</p>
            <p className="text-sm text-purple-700">
              Save <span className="font-bold">₹{savings20K.interestSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span> in interest &amp; 
              complete loan in <span className="font-bold">{savings20K.yearsMonthsSaved.years}y {savings20K.yearsMonthsSaved.months}m</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-sm text-amber-900">
        <p className="font-medium mb-1">💡 Pro Tip:</p>
        <p>Even small extra payments compound over time. Increase EMI by 10-20% during salary hikes to dramatically reduce your loan tenure!</p>
      </div>
    </div>
  );
}
