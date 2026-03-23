import type { LoanCalculation } from '../engine';
import { lazy, Suspense, useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import Tooltip from '@mui/material/Tooltip';
import { ExpandableSection } from './ExpandableSection';
import { AmortizationTable } from './AmortizationTable';
import { SavingsSuggestion } from './SavingsSuggestion';
import { formatCurrency, formatCompact } from '../utils/formatters';

const LazyLoanCharts = lazy(() =>
  import('./LoanCharts').then((module) => ({ default: module.LoanCharts })),
);

interface LoanResultsProps {
  calculation: LoanCalculation | null;
  isLoading?: boolean;
}

/* ─── small reusable row for the breakdown list ─── */
function BreakdownRow({
  label,
  value,
  accent,
  bold,
}: {
  label: string | React.ReactNode;
  value: string;
  accent?: string;
  bold?: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={bold ? 700 : 500}
        sx={bold ? { color: 'text.primary' } : {}}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={bold ? 800 : 700}
        sx={{ color: accent || (bold ? 'text.primary' : 'text.secondary') }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function InfoLabel({ label, tip }: { label: string; tip: string }) {
  return (
    <Tooltip title={tip} placement="top" arrow>
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'help' }}>
        {label}
        <Box component="span" sx={{ fontSize: 11, color: 'text.disabled', fontWeight: 400 }}>ⓘ</Box>
      </Box>
    </Tooltip>
  );
}

/* ─── metric chip card ─── */
function MetricCard({
  label,
  value,
  sub,
  accentColor,
}: {
  label: string;
  value: string;
  sub?: string;
  accentColor?: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2.5,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100%',
      }}
    >
      <Typography
        fontSize={10}
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing={0.9}
        color="text.secondary"
        mb={0.75}
      >
        {label}
      </Typography>
      <Typography
        fontSize={20}
        fontWeight={800}
        sx={{ color: accentColor || 'text.primary', lineHeight: 1.1 }}
      >
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

export function LoanSummaryPanel({ calculation, isLoading }: LoanResultsProps) {
  if (!calculation) {
    return (
      <Box
        sx={{
          borderRadius: 3,
          border: '2px dashed',
          borderColor: 'divider',
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          alignSelf: 'stretch',
        }}
      >
        <Typography fontSize={32} mb={1.5}>🏠</Typography>
        <Typography color="text.primary" fontWeight={700} fontSize={16} mb={0.5}>
          Enter loan details
        </Typography>
        <Typography color="text.secondary" fontSize={14}>
          Fill in the form to see your EMI and full breakdown
        </Typography>
      </Box>
    );
  }

  const { monthlyEMI, totalPayable, totalInterest, input } = calculation;
  const animatedEMI = useAnimatedNumber(monthlyEMI);
  const years = Math.floor(input.tenureMonths / 12);
  const months = input.tenureMonths % 12;
  const hasEmiStart = Boolean(input.emiStartDate);
  const emiStartDate = hasEmiStart ? new Date(input.emiStartDate as string) : null;
  const today = new Date();
  const isEmiStarted =
    emiStartDate !== null &&
    new Date(emiStartDate.getFullYear(), emiStartDate.getMonth(), emiStartDate.getDate()).getTime() <
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return (
    <Box sx={{ position: 'relative', alignSelf: { xs: 'auto', md: 'stretch' }, display: 'flex', flexDirection: 'column' }}>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 3,
            bgcolor: 'background.paper',
            opacity: 0.85,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="text.secondary" fontWeight={600}>Calculating…</Typography>
        </Box>
      )}

      <Stack spacing={2} sx={{ flex: 1, justifyContent: { xs: 'flex-start', md: 'space-between' } }}>
        {/* ── Hero EMI card ── */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            boxShadow: '0 8px 28px rgba(37,99,235,0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* decorative circle */}
          <Box
            sx={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 130,
              height: 130,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.07)',
            }}
          />
          <Typography
            fontSize={11}
            fontWeight={700}
            textTransform="uppercase"
            letterSpacing={1.2}
            sx={{ color: 'rgba(255,255,255,0.65)' }}
          >
            Monthly EMI
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 36, md: 42 },
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.05,
              mt: 0.5,
              mb: 0.75,
              letterSpacing: '-1px',
            }}
          >
            {formatCurrency(animatedEMI)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              {years}y {months}m tenure
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.4)' }} />
            <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              {input.annualRate}% p.a.
            </Typography>
            {hasEmiStart && emiStartDate && (
              <>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.4)' }} />
                <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                  {isEmiStarted ? 'Started' : `Starts ${emiStartDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
                </Typography>
              </>
            )}
          </Box>
        </Paper>

        {/* ── Secondary metrics ── */}
        <Grid container spacing={1.5}>
          <Grid size={6}>
            <MetricCard
              label="Total Payable"
              value={formatCompact(totalPayable)}
              sub="Principal + Interest"
            />
          </Grid>
          <Grid size={6}>
            <MetricCard
              label="Total Interest"
              value={formatCompact(totalInterest)}
              sub={`${((totalInterest / input.principal) * 100).toFixed(0)}% of principal`}
              accentColor="#f97316"
            />
          </Grid>
        </Grid>

        {/* ── Loan Breakdown ── */}
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2.5, borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}
        >
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography fontSize={11} fontWeight={700} textTransform="uppercase" letterSpacing={0.9} color="text.secondary">
              Loan Breakdown
            </Typography>
          </Box>
          <Stack spacing={1.25} sx={{ px: 2.5, py: 2 }}>
            <BreakdownRow label={<InfoLabel label="Principal" tip="The original loan amount borrowed from the bank." />} value={formatCurrency(input.principal)} accent="#2563eb" />
            <BreakdownRow label={<InfoLabel label="Total Interest" tip="Total interest paid over the entire loan tenure." />} value={formatCurrency(totalInterest, 0)} accent="#f97316" />
            <BreakdownRow label={<InfoLabel label="Processing Fees" tip="One-time bank fee charged for processing the loan application." />} value={formatCurrency(input.processingFees ?? 0)} />
            <Divider sx={{ my: 0.5 }} />
            <BreakdownRow
              label={isEmiStarted ? 'Amount Pending' : 'Total Amount'}
              value={formatCurrency(input.principal + totalInterest + (input.processingFees ?? 0), 0)}
              bold
            />
          </Stack>
        </Paper>

        {/* ── Cost Split (two SVG donuts) ── */}
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2.5, borderColor: 'divider', bgcolor: 'background.paper', p: 2.5 }}
        >
          <Typography fontSize={11} fontWeight={700} textTransform="uppercase" letterSpacing={0.9} color="text.secondary" mb={1.5}>
            Cost Split
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {/* Donut 1 — Total: Principal vs Interest */}
            {(() => {
              const total = (input.principal || 0) + (totalInterest || 0);
              const r = 36;
              const circ = 2 * Math.PI * r;
              const principalDash = total > 0 ? (circ * input.principal) / total : 0;
              const interestDash = circ - principalDash;
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Typography fontSize={10} fontWeight={700} textTransform="uppercase" letterSpacing={0.8} color="text.disabled">
                    Total Cost
                  </Typography>
                  <svg width="88" height="88" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#f97316" strokeWidth="14" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#2563eb" strokeWidth="14"
                      strokeDasharray={`${principalDash} ${interestDash}`}
                      transform="rotate(-90 50 50)" />
                  </svg>
                  <Stack spacing={0.75} width="100%">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563eb', flexShrink: 0 }} />
                      <Box flex={1}>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600 }}>Principal</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'text.primary' }}>{formatCompact(input.principal)}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f97316', flexShrink: 0 }} />
                      <Box flex={1}>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600 }}>Interest</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#f97316' }}>{formatCompact(totalInterest)}</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              );
            })()}

            {/* Donut 2 — Monthly EMI: Interest vs Principal (month 1) */}
            {(() => {
              const firstRow = calculation.schedule[0];
              const emiInterest = firstRow?.interest ?? 0;
              const emiPrincipal = firstRow?.principal ?? 0;
              const emiTotal = emiInterest + emiPrincipal;
              const r = 36;
              const circ = 2 * Math.PI * r;
              const principalDash = emiTotal > 0 ? (circ * emiPrincipal) / emiTotal : 0;
              const interestDash = circ - principalDash;
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Typography fontSize={10} fontWeight={700} textTransform="uppercase" letterSpacing={0.8} color="text.disabled">
                    Monthly EMI
                  </Typography>
                  <svg width="88" height="88" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#f97316" strokeWidth="14" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#10b981" strokeWidth="14"
                      strokeDasharray={`${principalDash} ${interestDash}`}
                      transform="rotate(-90 50 50)" />
                  </svg>
                  <Stack spacing={0.75} width="100%">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', flexShrink: 0 }} />
                      <Box flex={1}>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600 }}>Principal</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'text.primary' }}>{formatCompact(emiPrincipal)}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f97316', flexShrink: 0 }} />
                      <Box flex={1}>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600 }}>Interest</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#f97316' }}>{formatCompact(emiInterest)}</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              );
            })()}
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}

/* ─── Section components ─── */

export function SavingsSection({ calculation, forceOpen }: { calculation: LoanCalculation; forceOpen?: boolean | null }) {
  return (
    <ExpandableSection title="Savings Opportunities" icon="💡" defaultOpen={true} forceOpen={forceOpen}>
      <SavingsSuggestion calculation={calculation} />
    </ExpandableSection>
  );
}

export function SummarySection({ calculation }: { calculation: LoanCalculation }) {
  const { monthlyEMI, totalInterest, input } = calculation;
  const years = Math.floor(input.tenureMonths / 12);
  const months = input.tenureMonths % 12;

  return (
    <ExpandableSection title="Summary" icon="📋" defaultOpen={true}>
      <Stack spacing={1}>
        <BreakdownRow label="Principal" value={formatCurrency(input.principal)} />
        <BreakdownRow label="Rate" value={`${input.annualRate.toFixed(2)}%`} />
        <BreakdownRow label="Tenure" value={`${years}y ${months}m (${input.tenureMonths}m)`} />
        <Divider />
        <BreakdownRow label="Monthly EMI" value={formatCurrency(monthlyEMI)} accent="#2563eb" />
        <BreakdownRow label="Total Interest" value={formatCurrency(totalInterest)} accent="#f97316" />
      </Stack>
    </ExpandableSection>
  );
}

export function FirstYearSection({ calculation, forceOpen }: { calculation: LoanCalculation; forceOpen?: boolean | null }) {
  const { monthlyEMI } = calculation;
  const firstYrInterest = calculation.schedule.slice(0, 12).reduce((sum, r) => sum + r.interest, 0);
  const firstYrPrincipal = calculation.schedule.slice(0, 12).reduce((sum, r) => sum + r.principal, 0);
  const ipRatio = ((firstYrInterest / firstYrPrincipal) * 100).toFixed(0);

  const cards = [
    { label: 'Annual EMI', value: formatCurrency(monthlyEMI * 12), color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.2)' },
    { label: '1st Yr Interest', value: formatCurrency(firstYrInterest), color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)' },
    { label: '1st Yr Principal', value: formatCurrency(firstYrPrincipal), color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    { label: 'I/P Ratio', value: `${ipRatio}%`, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
  ];

  return (
    <ExpandableSection title="First Year Breakdown" icon="📊" defaultOpen={false} forceOpen={forceOpen}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 1.5 }}>
        {cards.map((card) => (
          <Box
            key={card.label}
            sx={{
              borderRadius: 2.5,
              p: 2,
              border: `1px solid ${card.border}`,
              bgcolor: card.bg,
            }}
          >
            <Typography fontSize={10} fontWeight={700} textTransform="uppercase" letterSpacing={0.8} sx={{ color: card.color, mb: 0.75 }}>
              {card.label}
            </Typography>
            <Typography fontSize={20} fontWeight={800} sx={{ color: card.color }}>
              {card.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </ExpandableSection>
  );
}

export function AmortizationSection({ calculation, forceOpen }: { calculation: LoanCalculation; forceOpen?: boolean | null }) {
  return (
    <ExpandableSection title="Amortization Schedule" icon="📅" defaultOpen={false} forceOpen={forceOpen}>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <AmortizationTable schedule={calculation.schedule} emiStartDate={calculation.input.emiStartDate} />
      </Box>
    </ExpandableSection>
  );
}

export function VisualizationSection({ calculation, forceOpen }: { calculation: LoanCalculation; forceOpen?: boolean | null }) {
  const [chartsOpen, setChartsOpen] = useState(false);

  return (
    <ExpandableSection
      title="Visualizations"
      icon="📊"
      open={chartsOpen}
      onToggle={setChartsOpen}
      defaultOpen={false}
      forceOpen={forceOpen}
    >
      {chartsOpen ? (
        <Suspense
          fallback={
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Loading charts…</Typography>
            </Box>
          }
        >
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <LazyLoanCharts calculation={calculation} />
          </Box>
        </Suspense>
      ) : null}
    </ExpandableSection>
  );
}

export function LoanDetailSections({ calculation }: { calculation: LoanCalculation | null }) {
  if (!calculation) return null;
  return (
    <Stack spacing={2}>
      <SavingsSection calculation={calculation} />
      <SummarySection calculation={calculation} />
      <FirstYearSection calculation={calculation} />
      <AmortizationSection calculation={calculation} />
      <VisualizationSection calculation={calculation} />
    </Stack>
  );
}

export function LoanResults({ calculation, isLoading }: LoanResultsProps) {
  return (
    <Stack spacing={3}>
      <LoanSummaryPanel calculation={calculation} isLoading={isLoading} />
      <LoanDetailSections calculation={calculation} />
    </Stack>
  );
}
