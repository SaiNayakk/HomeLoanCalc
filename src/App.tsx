import { useEffect, useMemo, useState } from 'react';
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
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CssBaseline,
  Grid,
  Switch,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
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
  MobileEMIBar,
  TaxBenefitSection,
  EligibilityCalculator,
  DownPaymentAnalysis,
  SavedCalculations,
  RentVsBuy,
  LoanProgress,
  InterestRateAlert,
  EMICalendar,
  PrepaymentVisualizer,
  ErrorBoundary,
} from './components';

const FAQ_ITEMS = [
  {
    q: 'What is EMI and how is it calculated?',
    a: 'EMI (Equated Monthly Installment) is your fixed monthly repayment. It is calculated using the principal, interest rate, and tenure so that each payment includes both interest and principal.',
  },
  {
    q: 'How does tenure affect total interest?',
    a: 'A longer tenure lowers EMI but increases total interest paid. A shorter tenure increases EMI but reduces interest cost.',
  },
  {
    q: 'What is the benefit of prepaying a home loan?',
    a: 'Prepayments reduce outstanding principal, which cuts interest and can shorten the loan tenure significantly.',
  },
  {
    q: 'Is it better to reduce EMI or tenure when rates change?',
    a: 'Reducing tenure saves more interest in the long run, while reducing EMI improves monthly cash flow. Choose based on your financial comfort.',
  },
  {
    q: 'How do rate changes affect my loan?',
    a: 'Higher rates increase interest cost; lower rates reduce it. You can choose to keep EMI the same and shorten tenure or keep tenure and reduce EMI.',
  },
];

const DEFAULT_INPUT: LoanInput = {
  principal: 5000000,
  annualRate: 7.5,
  tenureMonths: 240,
  processingFees: 0,
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
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === '1';
  });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: { main: darkMode ? '#3b82f6' : '#2563eb' },
          secondary: { main: '#0f766e' },
          background: {
            default: darkMode ? '#0f172a' : '#f9fafb',
            paper: darkMode ? '#1e293b' : '#ffffff',
          },
          text: {
            primary: darkMode ? '#f1f5f9' : '#0f172a',
            secondary: darkMode ? '#94a3b8' : '#475569',
          },
          divider: darkMode ? '#334155' : '#e2e8f0',
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: 'Manrope, Segoe UI, sans-serif',
          fontWeightRegular: 500,
          fontWeightMedium: 600,
          fontWeightBold: 700,
        },
      }),
    [darkMode],
  );

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next ? '1' : '0');
  };

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
  const [forceOpen, setForceOpen] = useState<boolean | null>(null);
  const debouncedInput = input;
  const debouncedPrepayment = prepayment;
  const isCalculating = false;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // New readable URL format: ?p=principal&r=rate&t=tenure&s=startDate&f=fees&adv=...
    const p = params.get('p');
    const r = params.get('r');
    const t = params.get('t');
    if (p || r || t) {
      setInput((prev) => ({
        ...prev,
        ...(p ? { principal: parseFloat(p) } : {}),
        ...(r ? { annualRate: parseFloat(r) } : {}),
        ...(t ? { tenureMonths: parseInt(t, 10) } : {}),
        ...(params.get('s') ? { emiStartDate: params.get('s')! } : {}),
        ...(params.get('f') ? { processingFees: parseFloat(params.get('f')!) } : {}),
      }));
      const adv = params.get('adv');
      if (adv) {
        try {
          const decoded = JSON.parse(decodeURIComponent(adv));
          if (decoded?.prepayment) setPrepayment((prev) => ({ ...prev, ...decoded.prepayment }));
          if (decoded?.prepayment?.extraEMIMonthly) setPrepaymentOpen(true);
          if (decoded?.variableRate) { setVariableRate(decoded.variableRate); setShowVariableRate(true); }
          if (decoded?.emiStepUp) { setEMIStepUp(decoded.emiStepUp); setShowEMIStepUp(true); }
        } catch { /* ignore */ }
      }
      return;
    }

    // Legacy format: ?state=JSON
    const rawState = params.get('state');
    if (!rawState) return;
    try {
      const decoded = JSON.parse(decodeURIComponent(rawState));
      if (decoded?.input) setInput((prev) => ({ ...prev, ...decoded.input }));
      if (decoded?.prepayment) setPrepayment((prev) => ({ ...prev, ...decoded.prepayment }));
      if (typeof decoded?.prepaymentOpen === 'boolean') setPrepaymentOpen(decoded.prepaymentOpen);
      if (decoded?.variableRate) {
        setVariableRate(decoded.variableRate);
        setShowVariableRate(decoded?.showVariableRate ?? true);
      }
      if (typeof decoded?.advancedOpen === 'boolean') setAdvancedOpen(decoded.advancedOpen);
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
    )
      return null;
    try {
      return generateScheduleWithPrepayment(debouncedInput, debouncedPrepayment);
    } catch (error) {
      console.error('Prepayment calculation error:', error);
      return null;
    }
  }, [debouncedInput, debouncedPrepayment, baseCalculation]);

  const withVariableRateCalculation = useMemo(() => {
    if (!baseCalculation || !showVariableRate) return null;
    try {
      return generateScheduleWithVariableRate(debouncedInput, variableRate, debouncedPrepayment);
    } catch (error) {
      console.error('Variable rate calculation error:', error);
      return null;
    }
  }, [debouncedInput, variableRate, showVariableRate, baseCalculation, debouncedPrepayment]);

  const withEMIStepUpCalculation = useMemo(() => {
    if (!baseCalculation || !showEMIStepUp) return null;
    try {
      return generateScheduleWithEMIStepUp(debouncedInput, emiStepUp, debouncedPrepayment);
    } catch (error) {
      console.error('EMI step-up calculation error:', error);
      return null;
    }
  }, [debouncedInput, emiStepUp, showEMIStepUp, baseCalculation, debouncedPrepayment]);

  const scenarios = useMemo(() => {
    const scenes: Array<{ name: string; calculation: LoanCalculation }> = [];

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
      scenes.push({ name: label, calculation: withVariableRateCalculation });
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              maxWidth: 1400,
              margin: '0 auto',
              width: '100%',
              px: { xs: 2, md: 4 },
              py: { xs: 1.25, md: 1.5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                🏠
              </Box>
              <Box>
                <Typography fontWeight={800} fontSize={17} color="text.primary" sx={{ letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                  HomeLoanCalc
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Smart EMI calculator
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 }, flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Switch checked={darkMode} onChange={toggleDarkMode} size="small" color="primary" />
                <Typography sx={{ fontSize: 14, userSelect: 'none' }}>{darkMode ? '🌙' : '☀️'}</Typography>
              </Box>
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
            </Box>
          </Box>
        </Box>

        {/* Main */}
        <Box component="main" sx={{ flex: 1, bgcolor: 'background.default' }}>
          <Box
            sx={{
              maxWidth: 1400,
              margin: '0 auto',
              padding: { xs: '1.25rem 1rem 5rem', md: '2rem 2rem 3rem' },
            }}
          >
            {/* Top two-column row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, alignItems: 'stretch', gap: 3, mb: 3 }}>
              <LoanInputForm
                input={input}
                onInputChange={setInput}
                headerActions={displayCalculation ? (
                  <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 0.75 }}>
                    <Button size="small" variant="text" onClick={() => window.print()}>Print</Button>
                    <Button size="small" variant="outlined" onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('state', encodeURIComponent(JSON.stringify({ input, prepayment, prepaymentOpen, variableRate, showVariableRate, advancedOpen, emiStepUp, showEMIStepUp })));
                      navigator.clipboard.writeText(url.toString()).then(() => alert('Share link copied!'));
                    }}>Share</Button>
                  </Box>
                ) : undefined}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignSelf: { xs: 'auto', md: 'stretch' } }}>
                <LoanSummaryPanel calculation={displayCalculation} isLoading={isCalculating} />
                {displayCalculation && <LoanProgress calculation={displayCalculation} />}
              </Box>
            </Box>

            <Grid container spacing={3} alignItems="flex-start">
              {/* Full-width sections */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Collapse / Expand All */}
                  {displayCalculation && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="text"
                        sx={{ color: 'text.secondary', fontSize: 12 }}
                        onClick={() => {
                          const next = forceOpen === true ? false : true;
                          setForceOpen(next);
                          setTimeout(() => setForceOpen(null), 50);
                        }}
                      >
                        {forceOpen === false ? '▶ Expand All' : '▾ Collapse All'}
                      </Button>
                    </Box>
                  )}

                  {/* Quick add buttons */}
                  {(!prepaymentOpen || !advancedOpen) && (
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                      {!prepaymentOpen && (
                        <Box
                          component="button"
                          type="button"
                          onClick={() => setPrepaymentOpen(true)}
                          sx={{
                            background: 'none',
                            border: '1px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            color: 'secondary.main',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            px: 2,
                            py: 0.75,
                            fontFamily: 'inherit',
                            transition: 'all 0.15s',
                            '&:hover': { borderColor: 'secondary.main', bgcolor: 'action.hover' },
                          }}
                        >
                          + Pre-payments
                        </Box>
                      )}
                      {!advancedOpen && (
                        <Box
                          component="button"
                          type="button"
                          onClick={() => setAdvancedOpen(true)}
                          sx={{
                            background: 'none',
                            border: '1px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            color: 'secondary.main',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            px: 2,
                            py: 0.75,
                            fontFamily: 'inherit',
                            transition: 'all 0.15s',
                            '&:hover': { borderColor: 'secondary.main', bgcolor: 'action.hover' },
                          }}
                        >
                          + Advanced Options
                        </Box>
                      )}
                    </Box>
                  )}

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

                  <ExpandableSection title="Loan Eligibility Calculator" icon="📋" defaultOpen={false} forceOpen={forceOpen}>
                    <EligibilityCalculator />
                  </ExpandableSection>

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
                      <SavingsSection calculation={displayCalculation} forceOpen={forceOpen} />
                      <FirstYearSection calculation={displayCalculation} forceOpen={forceOpen} />

                      {baseCalculation && (
                        <ExpandableSection
                          title="Scenario Comparison"
                          icon="🔄"
                          defaultOpen={scenarios.length > 0}
                          forceOpen={forceOpen}
                        >
                          {scenarios.length > 0 ? (
                            <ScenarioComparison
                              baseCalculation={baseCalculation}
                              scenarios={scenarios}
                            />
                          ) : (
                            <Box sx={{ textAlign: 'center', p: 3 }}>
                              <Typography color="text.secondary" fontWeight={600}>
                                Add prepayment or rate changes to compare scenarios.
                              </Typography>
                            </Box>
                          )}
                        </ExpandableSection>
                      )}

                      <ErrorBoundary>
                        <AmortizationSection calculation={displayCalculation} forceOpen={forceOpen} />
                      </ErrorBoundary>
                      <ErrorBoundary>
                        <VisualizationSection calculation={displayCalculation} forceOpen={forceOpen} />
                      </ErrorBoundary>

                      {baseCalculation && (
                        <ExpandableSection title="Prepayment Impact" icon="📉" defaultOpen={false} forceOpen={forceOpen}>
                          <PrepaymentVisualizer
                            baseCalculation={baseCalculation}
                            prepaymentCalculation={withPrepaymentCalculation}
                          />
                        </ExpandableSection>
                      )}

                      <ExpandableSection title="Interest Rate Scenarios" icon="📊" defaultOpen={false} forceOpen={forceOpen}>
                        <InterestRateAlert calculation={displayCalculation} />
                      </ExpandableSection>

                      <ExpandableSection title="EMI Payment Calendar" icon="📅" defaultOpen={false} forceOpen={forceOpen}>
                        <EMICalendar calculation={displayCalculation} />
                      </ExpandableSection>

                      <ExpandableSection title="Tax Benefits (80C + 24B)" icon="🧾" defaultOpen={false} forceOpen={forceOpen}>
                        <TaxBenefitSection calculation={displayCalculation} />
                      </ExpandableSection>

                      <ExpandableSection title="Down Payment Optimizer" icon="🏡" defaultOpen={false} forceOpen={forceOpen}>
                        <DownPaymentAnalysis propertyPrice={Math.round(input.principal / 0.8)} input={input} />
                      </ExpandableSection>

                      <ExpandableSection title="Rent vs Buy" icon="🔑" defaultOpen={false} forceOpen={forceOpen}>
                        <RentVsBuy />
                      </ExpandableSection>

                      <ExpandableSection title="Saved Calculations" icon="💾" defaultOpen={false} forceOpen={forceOpen}>
                        <SavedCalculations
                          currentInput={input}
                          currentCalculation={displayCalculation}
                          onLoad={setInput}
                        />
                      </ExpandableSection>

                      {/* FAQ Accordion */}
                      <Box
                        sx={{
                          mt: 2,
                          p: { xs: 2, md: 3 },
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
                        }}
                      >
                        <Typography variant="h6" fontWeight={800} color="text.primary" mb={0.5}>
                          Home Loan FAQs
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          Quick answers to common home loan questions to help you plan better.
                        </Typography>
                        {FAQ_ITEMS.map((item, i) => (
                          <Accordion
                            key={i}
                            disableGutters
                            elevation={0}
                            sx={{
                              border: 'none',
                              borderTop: '1px solid',
                              borderColor: 'divider',
                              '&:before': { display: 'none' },
                              bgcolor: 'transparent',
                            }}
                          >
                            <AccordionSummary
                              expandIcon={
                                <Typography color="text.secondary" fontSize={18}>
                                  ▾
                                </Typography>
                              }
                              sx={{
                                px: 0,
                                minHeight: 'unset',
                                '& .MuiAccordionSummary-content': { my: 1.25 },
                              }}
                            >
                              <Typography fontWeight={700} color="text.primary" fontSize={15}>
                                {item.q}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 0, pt: 0, pb: 1.5 }}>
                              <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                                {item.a}
                              </Typography>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Sticky mobile EMI bar */}
        <MobileEMIBar calculation={displayCalculation} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
