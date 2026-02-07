import type { LoanCalculation } from '../engine';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { ExpandableSection } from './ExpandableSection';
import { AmortizationTable } from './AmortizationTable';
import { SavingsSuggestion } from './SavingsSuggestion';
import { LoanCharts } from './LoanCharts';

interface LoanResultsProps {
  calculation: LoanCalculation | null;
  isLoading?: boolean;
}

export function LoanSummaryPanel({ calculation, isLoading }: LoanResultsProps) {
  if (!calculation) {
    return (
      <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl border-2 border-dashed border-blue-200 p-12 text-center">
        <p className="text-gray-500 font-semibold text-lg">📊 Enter loan details to see results</p>
      </div>
    );
  }

  const { monthlyEMI, totalPayable, totalInterest, input } = calculation;
  const years = Math.floor(input.tenureMonths / 12);
  const months = input.tenureMonths % 12;
  const hasEmiStart = Boolean(calculation.input.emiStartDate);
  const emiStartDate = hasEmiStart ? new Date(calculation.input.emiStartDate as string) : null;
  const today = new Date();
  const isEmiStarted =
    emiStartDate !== null &&
    new Date(emiStartDate.getFullYear(), emiStartDate.getMonth(), emiStartDate.getDate()).getTime() <
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const pieData = [
    { name: 'Principal', value: input.principal || 0 },
    { name: 'Interest', value: totalInterest || 0 },
  ];
  const pieColors = ['#2563eb', '#f97316'];

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="inline-flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200 border-t-blue-500 mb-4"></div>
            <p className="text-gray-600 font-semibold">Calculating...</p>
          </div>
        </div>
      )}

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={2} sx={{ height: '100%', minHeight: 520, justifyContent: 'space-between' }}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  borderColor: '#e2e8f0',
                  p: 1.5,
                  minHeight: 140,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <span>💳</span>
                  <span className="font-semibold">Monthly EMI</span>
                </div>
                <div className="text-slate-900 font-semibold mt-2">₹{monthlyEMI.toLocaleString('en-IN')}</div>
                <div className="text-slate-500 font-medium">{years}y {months}m tenure</div>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  borderColor: '#e2e8f0',
                  p: 1.5,
                  minHeight: 140,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <span>💰</span>
                  <span className="font-semibold">Total Payable</span>
                </div>
                <div className="text-slate-900 font-semibold mt-2">₹{totalPayable.toLocaleString('en-IN')}</div>
                <div className="text-slate-500 font-medium">Over the loan period</div>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  borderColor: '#e2e8f0',
                  p: 1.5,
                  minHeight: 140,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <span>📈</span>
                  <span className="font-semibold">Total Interest</span>
                </div>
                <div className="text-slate-900 font-semibold mt-2">₹{totalInterest.toLocaleString('en-IN')}</div>
                <div className="text-slate-500 font-medium">
                  {((totalInterest / input.principal) * 100).toFixed(1)}% of principal
                </div>
              </Paper>

              {hasEmiStart && emiStartDate && (
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    borderColor: '#e2e8f0',
                    p: 1.5,
                    minHeight: 140,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div className="flex items-center gap-2 text-slate-700">
                    <span>📅</span>
                    <span className="font-semibold">First EMI</span>
                  </div>
                  <div className="text-slate-900 font-semibold mt-2">
                    {emiStartDate.toLocaleDateString('en-IN', { dateStyle: 'long' })}
                  </div>
                </Paper>
              )}

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  borderColor: '#e2e8f0',
                  p: 1.5,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Principal amount</span>
                    <span className="font-semibold text-slate-900">₹{input.principal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total interest</span>
                    <span className="font-semibold text-slate-900">₹{totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Processing fees</span>
                    <span className="font-semibold text-slate-900">₹0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pre-payment</span>
                    <span className="font-semibold text-slate-900">₹0</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span>{isEmiStarted ? 'Amount pending' : 'Total amount paid'}</span>
                    <span className="font-bold text-slate-900">₹{(input.principal + totalInterest).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </Paper>

            </Stack>
        </Grid>

        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={2} sx={{ height: '100%', minHeight: 520, justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Total Cost Breakdown</div>
            <PieChart width={260} height={220}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                dataKey="value"
                label={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  `₹${(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                }
              />
            </PieChart>
          </div>

          <div style={{ flex: 1, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>First EMI Split</div>
            <PieChart width={260} height={220}>
              <Pie
                data={[
                  { name: 'Principal (1st EMI)', value: calculation.schedule[0]?.principal || 0 },
                  { name: 'Interest (1st EMI)', value: calculation.schedule[0]?.interest || 0 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                dataKey="value"
                label={false}
              >
                <Cell fill="#22c55e" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip
                formatter={(value) =>
                  `₹${(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                }
              />
            </PieChart>
          </div>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}

export function SavingsSection({ calculation }: { calculation: LoanCalculation }) {
  return (
    <ExpandableSection title="💡 Savings Opportunities" icon="🎁" defaultOpen={true}>
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
      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-3 px-3 rounded-lg bg-blue-50/50 hover:bg-blue-100/50 transition">
          <span className="text-gray-700 font-medium">Principal</span>
          <span className="font-bold text-gray-900">₹{input.principal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between py-3 px-3 rounded-lg bg-indigo-50/50 hover:bg-indigo-100/50 transition">
          <span className="text-gray-700 font-medium">Rate</span>
          <span className="font-bold text-gray-900">{input.annualRate.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between py-3 px-3 rounded-lg bg-purple-50/50 hover:bg-purple-100/50 transition">
          <span className="text-gray-700 font-medium">Tenure</span>
          <span className="font-bold text-gray-900">{years}y {months}m ({input.tenureMonths}m)</span>
        </div>
        <div className="flex justify-between py-3 px-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition">
          <span className="text-gray-700 font-medium">Monthly EMI</span>
          <span className="font-bold text-blue-600">₹{monthlyEMI.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between py-3 px-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition">
          <span className="text-gray-700 font-medium">Total Interest</span>
          <span className="font-bold text-purple-600">₹{totalInterest.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </ExpandableSection>
  );
}

export function FirstYearSection({ calculation }: { calculation: LoanCalculation }) {
  const { monthlyEMI } = calculation;

  return (
    <ExpandableSection title="First Year Breakdown" icon="📊" defaultOpen={false}>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-sm transition">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-2">Annual EMI</p>
          <p className="text-2xl font-bold text-blue-900">
            ₹{(monthlyEMI * 12).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-sm transition">
          <p className="text-orange-600 text-xs font-bold uppercase tracking-wide mb-2">1st Yr Interest</p>
          <p className="text-2xl font-bold text-orange-900">
            ₹{(calculation.schedule.slice(0, 12).reduce((sum, row) => sum + row.interest, 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-sm transition">
          <p className="text-green-600 text-xs font-bold uppercase tracking-wide mb-2">1st Yr Principal</p>
          <p className="text-2xl font-bold text-green-900">
            ₹{(calculation.schedule.slice(0, 12).reduce((sum, row) => sum + row.principal, 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-sm transition">
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-wide mb-2">I/P Ratio</p>
          <p className="text-2xl font-bold text-indigo-900">
            {(
              (calculation.schedule.slice(0, 12).reduce((sum, row) => sum + row.interest, 0) /
                calculation.schedule.slice(0, 12).reduce((sum, row) => sum + row.principal, 0)) *
              100
            ).toFixed(0)}
            %
          </p>
        </div>
      </div>
    </ExpandableSection>
  );
}

export function AmortizationSection({ calculation }: { calculation: LoanCalculation }) {
  return (
    <ExpandableSection title="Amortization Schedule" icon="📈" defaultOpen={false}>
      <div className="w-full overflow-x-auto">
        <AmortizationTable schedule={calculation.schedule} emiStartDate={calculation.input.emiStartDate} />
      </div>
    </ExpandableSection>
  );
}

export function VisualizationSection({ calculation }: { calculation: LoanCalculation }) {
  return (
    <ExpandableSection title="Visualizations" icon="📊" defaultOpen={true}>
      <div className="w-full overflow-x-auto">
        <LoanCharts calculation={calculation} />
      </div>
    </ExpandableSection>
  );
}

export function LoanDetailSections({ calculation }: { calculation: LoanCalculation | null }) {
  if (!calculation) {
    return null;
  }

  return (
    <div className="space-y-6">
      <SavingsSection calculation={calculation} />
      <SummarySection calculation={calculation} />
      <FirstYearSection calculation={calculation} />
      <AmortizationSection calculation={calculation} />
      <VisualizationSection calculation={calculation} />
    </div>
  );
}

export function LoanResults({ calculation, isLoading }: LoanResultsProps) {
  return (
    <div className="space-y-6">
      <LoanSummaryPanel calculation={calculation} isLoading={isLoading} />
      <LoanDetailSections calculation={calculation} />
    </div>
  );
}

