import { useMemo, useState } from 'react';
import './App.css';
import type {
  EMIStepUpScenario,
  LoanCalculation,
  LoanInput,
  PrepaymentOptions,
  VariableRateScenario,
} from './engine';
import {
  generateAmortizationSchedule,
  generateScheduleWithEMIStepUp,
  generateScheduleWithPrepayment,
  generateScheduleWithVariableRate,
} from './engine';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ExpandableSection,
  AdvancedOptions,
  PrepaymentInput,
  ExportActions,
  LoanInputForm,
  LoanSummaryPanel,
  ScenarioComparison,
  SavingsSection,
  FirstYearSection,
  AmortizationSection,
  VisualizationSection,
} from './components';
import { useDebounce } from './hooks/useDebounce';

const DEFAULT_INPUT: LoanInput = {
  principal: 5000000,
  annualRate: 7.5,
  tenureMonths: 240,
  emiStartDate: new Date().toISOString().split('T')[0],
};

const DEFAULT_PREPAYMENT: PrepaymentOptions = {
  extraEMIMonthly: 0,
};

function App() {
  const [input, setInput] = useState<LoanInput>(DEFAULT_INPUT);
  const [prepayment, setPrepayment] = useState<PrepaymentOptions>(DEFAULT_PREPAYMENT);
  const [prepaymentOpen, setPrepaymentOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showVariableRate, setShowVariableRate] = useState(false);
  const [variableRate, setVariableRate] = useState<VariableRateScenario>({
    changes: [{ month: 61, newRate: 8 }],
  });
  const [showEMIStepUp, setShowEMIStepUp] = useState(false);
  const [emiStepUp, setEMIStepUp] = useState<EMIStepUpScenario>({
    stepUpPercentage: 10,
    intervalMonths: 12,
  });
  const [isCalculating, setIsCalculating] = useState(false);

  const debouncedInput = useDebounce(input, 2000);
  const debouncedPrepayment = useDebounce(prepayment, 2000);

  const baseCalculation = useMemo(() => {
    setIsCalculating(true);
    try {
      const result = generateAmortizationSchedule(debouncedInput);
      setTimeout(() => setIsCalculating(false), 100);
      return result;
    } catch (error) {
      setIsCalculating(false);
      console.error('Calculation error:', error);
      return null;
    }
  }, [debouncedInput]);

  const withPrepaymentCalculation = useMemo(() => {
    if (!baseCalculation || (debouncedPrepayment.extraEMIMonthly === 0 && !debouncedPrepayment.lumpSumPayment?.amount)) {
      return null;
    }
    try {
      return generateScheduleWithPrepayment(debouncedInput, debouncedPrepayment);
    } catch (error) {
      console.error('Prepayment calculation error:', error);
      return null;
    }
  }, [debouncedInput, debouncedPrepayment, baseCalculation]);

  const withVariableRateCalculation = useMemo(() => {
    if (!baseCalculation || !showVariableRate) {
      return null;
    }
    try {
      return generateScheduleWithVariableRate(debouncedInput, variableRate);
    } catch (error) {
      console.error('Variable rate calculation error:', error);
      return null;
    }
  }, [debouncedInput, variableRate, showVariableRate, baseCalculation]);

  const withEMIStepUpCalculation = useMemo(() => {
    if (!baseCalculation || !showEMIStepUp) {
      return null;
    }
    try {
      return generateScheduleWithEMIStepUp(debouncedInput, emiStepUp);
    } catch (error) {
      console.error('EMI step-up calculation error:', error);
      return null;
    }
  }, [debouncedInput, emiStepUp, showEMIStepUp, baseCalculation]);

  const scenarios = useMemo(() => {
    const scenes: Array<{
      name: string;
      calculation: LoanCalculation;
    }> = [];

    if (withPrepaymentCalculation) {
      scenes.push({
        name: `With Extra EMI (₹${debouncedPrepayment.extraEMIMonthly.toLocaleString('en-IN')})`,
        calculation: withPrepaymentCalculation,
      });
    }

    if (withVariableRateCalculation) {
      scenes.push({
        name: `Rate Hike to ${variableRate.changes[0]?.newRate}% at Month ${variableRate.changes[0]?.month}`,
        calculation: withVariableRateCalculation,
      });
    }

    if (withEMIStepUpCalculation) {
      scenes.push({
        name: `EMI Step-up (${emiStepUp.stepUpPercentage}% every ${emiStepUp.intervalMonths}m)`,
        calculation: withEMIStepUpCalculation,
      });
    }

    return scenes;
  }, [
    withPrepaymentCalculation,
    withVariableRateCalculation,
    withEMIStepUpCalculation,
    debouncedPrepayment,
    variableRate,
    emiStepUp,
  ]);

  const displayCalculation = baseCalculation || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fff' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ width: '100%', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
              HomeLoanCalc
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem', fontWeight: 500 }}>
              Smart calculator for financial planning
            </p>
          </div>
          {displayCalculation && (
            <ExportActions calculation={displayCalculation} variant="header" />
          )}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          backgroundColor: '#f9fafb',
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: { xs: '1.5rem 1rem 3rem', md: '2.5rem 2rem 3.5rem' },
          }}
        >
          <Grid container spacing={4} alignItems="stretch">
            {/* Top row: input + summary side-by-side */}
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  p: 2,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 20px rgba(15, 23, 42, 0.06)',
                }}
              >
                <LoanInputForm input={input} onInputChange={setInput} />
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  p: 2,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 20px rgba(15, 23, 42, 0.06)',
                }}
              >
                <LoanSummaryPanel calculation={displayCalculation} isLoading={isCalculating} />
              </Box>
            </Grid>

            {/* Full-width sections below */}
            <Grid item xs={12}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  {!prepaymentOpen && (
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0f766e',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      onClick={() => setPrepaymentOpen(true)}
                    >
                      + Add pre-payments
                    </button>
                  )}
                  {!advancedOpen && (
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0f766e',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      onClick={() => setAdvancedOpen(true)}
                    >
                      + Add advanced options
                    </button>
                  )}
                </div>

                {prepaymentOpen && (
                  <ExpandableSection
                    title="Add pre-payments"
                    icon=""
                    defaultOpen={false}
                    open={prepaymentOpen}
                    onToggle={setPrepaymentOpen}
                  >
                    <PrepaymentInput prepayment={prepayment} onPrepaymentChange={setPrepayment} />
                  </ExpandableSection>
                )}

                {advancedOpen && (
                  <ExpandableSection
                    title="Advanced options"
                    icon=""
                    defaultOpen={false}
                    open={advancedOpen}
                    onToggle={setAdvancedOpen}
                  >
                    <AdvancedOptions
                      showVariableRate={showVariableRate}
                      onShowVariableRateChange={setShowVariableRate}
                      variableRate={variableRate}
                      onVariableRateChange={setVariableRate}
                      showEMIStepUp={showEMIStepUp}
                      onShowEMIStepUpChange={setShowEMIStepUp}
                      emiStepUp={emiStepUp}
                      onEMIStepUpChange={setEMIStepUp}
                    />
                  </ExpandableSection>
                )}

                {displayCalculation && (
                  <>
                    <SavingsSection calculation={displayCalculation} />
                <FirstYearSection calculation={displayCalculation} />
                    <AmortizationSection calculation={displayCalculation} />
                    <VisualizationSection calculation={displayCalculation} />
                  </>
                )}

                {scenarios.length > 0 && displayCalculation && (
                  <ScenarioComparison baseCalculation={displayCalculation} scenarios={scenarios} />
                )}

                {displayCalculation && !scenarios.length && (
                  <div style={{ background: 'linear-gradient(135deg, #f1f5f9, #eff6ff)', borderRadius: '1rem', border: '2px dashed #cbd5e1', padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: '#475569', fontWeight: 600 }}>✨ Add prepayment or rates to compare</p>
                  </div>
                )}
              </div>
            </Grid>
          </Grid>
        </Box>
      </main>
    </div>
  );
}

export default App;
