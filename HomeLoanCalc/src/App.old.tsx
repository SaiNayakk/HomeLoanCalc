import { useState, useMemo } from 'react';
import './App.css';
import { LoanInput, generateAmortizationSchedule, LoanCalculation } from './engine';
import { LoanInputForm, LoanResults } from './components';
import { useDebounce } from './hooks/useDebounce';

const DEFAULT_INPUT: LoanInput = {
  principal: 5000000, // ₹50 lakhs
  annualRate: 7.5,
  tenureMonths: 240, // 20 years
};

function App() {
  const [input, setInput] = useState<LoanInput>(DEFAULT_INPUT);
  const [isCalculating, setIsCalculating] = useState(false);

  // Debounce input to 2 seconds
  const debouncedInput = useDebounce(input, 2000);

  // Calculate on debounced input change
  const calculation = useMemo(() => {
    setIsCalculating(true);
    try {
      const result = generateAmortizationSchedule(debouncedInput);
      setTimeout(() => setIsCalculating(false), 100); // Small delay for visual feedback
      return result;
    } catch (error) {
      setIsCalculating(false);
      console.error('Calculation error:', error);
      return null;
    }
  }, [debouncedInput]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HomeLoanCalc</h1>
              <p className="text-gray-600 mt-1">Advanced Home Loan Calculator</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Updates automatically while you type</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-2 gap-6 h-full p-6">
            {/* Left Column: Inputs */}
            <section className="bg-white rounded-lg shadow-md p-6 overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Details</h2>
              <LoanInputForm input={input} onInputChange={setInput} />
            </section>

            {/* Right Column: Results */}
            <section className="bg-white rounded-lg shadow-md p-6 overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Results</h2>
              <LoanResults calculation={calculation} isLoading={isCalculating} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
