import { useEffect, useMemo, useState } from 'react';
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
import { Box, Grid } from '@mui/material';
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
  extraEMIEnabled: true,
  extraEMIMonthly: 0,
  extraEMIFrequencyMonths: 1,
  extraEMIStartDate: new Date().toISOString().split('T')[0],
  lumpSumEnabled: false,
};

function App() {
  const [input, setInput] = useState<LoanInput>(DEFAULT_INPUT);
  const [prepayment, setPrepayment] = useState<PrepaymentOptions>(DEFAULT_PREPAYMENT);
  const [prepaymentOpen, setPrepaymentOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showVariableRate, setShowVariableRate] = useState(false);
  const [variableRate, setVariableRate] = useState<VariableRateScenario>({
    changes: [{ month: 61, newRate: 8 }],
    ranges: [
      {
        startDate: DEFAULT_INPUT.emiStartDate || new Date().toISOString().split('T')[0],
        endDate: DEFAULT_INPUT.emiStartDate || new Date().toISOString().split('T')[0],
        rate: 8,
      },
    ],
    rateChangeMode: 'reduce-tenure',
  });
  const [showEMIStepUp, setShowEMIStepUp] = useState(false);
  const [emiStepUp, setEMIStepUp] = useState<EMIStepUpScenario>({
    stepUpPercentage: 10,
    intervalMonths: 12,
  });
  const debouncedInput = useDebounce(input, 2000);
  const debouncedPrepayment = useDebounce(prepayment, 2000);
  const isCalculating = debouncedInput !== input;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawState = params.get('state');
    if (!rawState) {
      return;
    }
    try {
      const decoded = JSON.parse(decodeURIComponent(rawState));
      if (decoded?.input) {
        setInput((prev) => ({
          ...prev,
          ...decoded.input,
        }));
      }
      if (decoded?.prepayment) {
        setPrepayment((prev) => ({
          ...prev,
          ...decoded.prepayment,
        }));
      }
      if (typeof decoded?.prepaymentOpen === 'boolean') {
        setPrepaymentOpen(decoded.prepaymentOpen);
      }
      if (decoded?.variableRate) {
        setVariableRate(decoded.variableRate);
        setShowVariableRate(decoded?.showVariableRate ?? true);
      }
      if (typeof decoded?.advancedOpen === 'boolean') {
        setAdvancedOpen(decoded.advancedOpen);
      }
      if (decoded?.emiStepUp) {
        setEMIStepUp(decoded.emiStepUp);
        setShowEMIStepUp(decoded?.showEMIStepUp ?? true);
      }
    } catch (error) {
      console.error('Failed to parse shared state', error);
    }
  }, []);

  const baseCalculation = useMemo(() => {
    try {
      return generateAmortizationSchedule(debouncedInput);
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }, [debouncedInput]);

  const withPrepaymentCalculation = useMemo(() => {
    if (
      !baseCalculation ||
      ((debouncedPrepayment.extraEMIEnabled === false || debouncedPrepayment.extraEMIMonthly === 0) &&
        (debouncedPrepayment.lumpSumEnabled !== true || !debouncedPrepayment.lumpSumPayment?.amount))
    ) {
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
      return generateScheduleWithVariableRate(debouncedInput, variableRate, debouncedPrepayment);
    } catch (error) {
      console.error('Variable rate calculation error:', error);
      return null;
    }
  }, [debouncedInput, variableRate, showVariableRate, baseCalculation, debouncedPrepayment]);

  const withEMIStepUpCalculation = useMemo(() => {
    if (!baseCalculation || !showEMIStepUp) {
      return null;
    }
    try {
      return generateScheduleWithEMIStepUp(debouncedInput, emiStepUp, debouncedPrepayment);
    } catch (error) {
      console.error('EMI step-up calculation error:', error);
      return null;
    }
  }, [debouncedInput, emiStepUp, showEMIStepUp, baseCalculation, debouncedPrepayment]);

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
      const label =
        variableRate.changes.length > 1
          ? `Rate Changes (${variableRate.changes.length} periods)`
          : `Rate Change to ${variableRate.changes[0]?.newRate}% at Month ${variableRate.changes[0]?.month}`;
      scenes.push({
        name: label,
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

  const displayCalculation =
    withVariableRateCalculation ||
    withEMIStepUpCalculation ||
    withPrepaymentCalculation ||
    baseCalculation ||
    null;

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
            <ExportActions
              calculation={displayCalculation}
              variant="header"
              shareState={{
                input,
                prepayment,
                prepaymentOpen,
                variableRate,
                showVariableRate,
                advancedOpen,
                emiStepUp,
                showEMIStepUp,
              }}
            />
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
            <Grid size={{ xs: 12, md: 7 }}>
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
            <Grid size={{ xs: 12, md: 5 }}>
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
            <Grid size={{ xs: 12 }}>
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
                    emiStartDate={input.emiStartDate}
                    tenureMonths={input.tenureMonths}
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
                    {baseCalculation && (
                      <ExpandableSection title="Scenario Comparison" icon="🔄" defaultOpen={scenarios.length > 0}>
                        {scenarios.length > 0 ? (
                          <ScenarioComparison baseCalculation={baseCalculation} scenarios={scenarios} />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <p style={{ color: '#475569', fontWeight: 600 }}>
                              Add prepayment or rate changes to compare scenarios.
                            </p>
                          </div>
                        )}
                      </ExpandableSection>
                    )}
                    <AmortizationSection calculation={displayCalculation} />
                    <VisualizationSection calculation={displayCalculation} />
                    <section
                      style={{
                        marginTop: '2.5rem',
                        padding: '2rem',
                        borderRadius: '1rem',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
                      }}
                    >
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                        Home Loan FAQs
                      </h2>
                      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                        Quick answers to common home loan questions to help you plan better.
                      </p>
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                            What is EMI and how is it calculated?
                          </h3>
                          <p style={{ color: '#475569' }}>
                            EMI (Equated Monthly Installment) is your fixed monthly repayment. It is calculated using
                            the principal, interest rate, and tenure so that each payment includes both interest and
                            principal.
                          </p>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                            How does tenure affect total interest?
                          </h3>
                          <p style={{ color: '#475569' }}>
                            A longer tenure lowers EMI but increases total interest paid. A shorter tenure increases
                            EMI but reduces interest cost.
                          </p>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                            What is the benefit of prepaying a home loan?
                          </h3>
                          <p style={{ color: '#475569' }}>
                            Prepayments reduce outstanding principal, which cuts interest and can shorten the loan
                            tenure significantly.
                          </p>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                            Is it better to reduce EMI or tenure when rates change?
                          </h3>
                          <p style={{ color: '#475569' }}>
                            Reducing tenure saves more interest in the long run, while reducing EMI improves monthly
                            cash flow. Choose based on your financial comfort.
                          </p>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                            How do rate changes affect my loan?
                          </h3>
                          <p style={{ color: '#475569' }}>
                            Higher rates increase interest cost; lower rates reduce it. You can choose to keep EMI the
                            same and shorten tenure or keep tenure and reduce EMI.
                          </p>
                        </div>
                      </div>
                    </section>
                  </>
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
