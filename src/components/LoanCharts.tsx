import type { LoanCalculation } from '../engine';
import { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';

interface ChartsProps {
  calculation: LoanCalculation;
}

const chartCardSx = {
  p: 3,
  borderRadius: 2.5,
  borderColor: 'divider',
  bgcolor: 'background.paper',
  mb: 3,
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string}>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderColor: 'divider', bgcolor: 'background.paper', boxShadow: 3, minWidth: 140 }}>
      {label && <Typography fontSize={11} color="text.secondary" mb={0.75}>{label}</Typography>}
      {payload.map((entry) => (
        <Box key={entry.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography fontSize={12} fontWeight={600} sx={{ color: entry.color }}>{entry.name}</Typography>
          <Typography fontSize={12} fontWeight={700} color="text.primary">
            ₹{entry.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}

export function LoanCharts({ calculation }: ChartsProps) {
  const { schedule } = calculation;
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setVisibleCount(1);
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    for (let i = 2; i <= 5; i++) {
      timers.push(setTimeout(() => { if (isMounted) setVisibleCount(i); }, (i - 1) * 350));
    }
    return () => { isMounted = false; timers.forEach(clearTimeout); };
  }, [calculation]);

  const formatShortINR = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 10_000_000) return `${(value / 10_000_000).toFixed(1)}Cr`;
    if (abs >= 100_000) return `${(value / 100_000).toFixed(1)}L`;
    if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const balanceChartData = schedule
    .filter((_, idx) => idx % Math.ceil(schedule.length / 50) === 0 || idx === schedule.length - 1)
    .map((row) => ({ month: row.month, balance: row.closingBalance, monthName: `M${row.month}` }));

  const emiBreakdownData = schedule
    .filter((_, idx) => idx % Math.ceil(schedule.length / 24) === 0 || idx === schedule.length - 1)
    .map((row) => ({ month: row.month, principal: row.principal, interest: row.interest, monthName: `M${row.month}` }));

  const yearlyData: Array<{ year: number; principal: number; interest: number; yearLabel: string }> = [];
  for (let year = 1; year <= Math.ceil(schedule.length / 12); year++) {
    const rows = schedule.slice((year - 1) * 12, Math.min(year * 12, schedule.length));
    yearlyData.push({
      year,
      principal: parseFloat(rows.reduce((s, r) => s + r.principal, 0).toFixed(0)),
      interest: parseFloat(rows.reduce((s, r) => s + r.interest, 0).toFixed(0)),
      yearLabel: `Y${year}`,
    });
  }

  const cumulativeData = schedule
    .filter((_, idx) => idx % Math.ceil(schedule.length / 50) === 0 || idx === schedule.length - 1)
    .reduce((acc, row) => {
      const last = acc.length > 0 ? acc[acc.length - 1].cumulativeInterest : 0;
      acc.push({ month: row.month, cumulativeInterest: last + row.interest, cumulativePrincipal: last + row.principal, monthName: `M${row.month}` });
      return acc;
    }, [] as Array<{ month: number; cumulativeInterest: number; cumulativePrincipal: number; monthName: string }>);

  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const toggleSeries = (name: string) => setHiddenSeries(prev => {
    const next = new Set(prev);
    if (next.has(name)) next.delete(name); else next.add(name);
    return next;
  });

  return (
    <Box>
      {visibleCount >= 1 && (
        <Paper variant="outlined" sx={chartCardSx}>
          <Typography fontWeight={700} fontSize={15} color="text.primary" mb={0.5}>📉 Loan Balance Over Time</Typography>
          <Typography fontSize={13} color="text.secondary" mb={2}>Watch your loan balance decrease with each payment</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" tick={{ fontSize: 12 }} label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatShortINR} label={{ value: 'Balance (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="balance" stroke="#2563eb" dot={false} strokeWidth={2} name="Outstanding Balance" hide={hiddenSeries.has('Outstanding Balance')} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {visibleCount >= 2 && (
        <Paper variant="outlined" sx={chartCardSx}>
          <Typography fontWeight={700} fontSize={15} color="text.primary" mb={0.5}>💰 Principal vs Interest by Month</Typography>
          <Typography fontSize={13} color="text.secondary" mb={2}>See how much of your EMI goes to principal vs interest</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emiBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" tick={{ fontSize: 12 }} label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatShortINR} label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                onClick={(e) => e.value && toggleSeries(e.value)}
                wrapperStyle={{ cursor: 'pointer' }}
                formatter={(value) => (
                  <span style={{ opacity: hiddenSeries.has(value) ? 0.4 : 1 }}>{value}</span>
                )}
              />
              <Bar dataKey="principal" stackId="a" fill="#10b981" name="Principal" hide={hiddenSeries.has('Principal')} />
              <Bar dataKey="interest" stackId="a" fill="#f97316" name="Interest" hide={hiddenSeries.has('Interest')} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {visibleCount >= 3 && (
        <Paper variant="outlined" sx={chartCardSx}>
          <Typography fontWeight={700} fontSize={15} color="text.primary" mb={0.5}>📊 Year-by-Year Breakdown</Typography>
          <Typography fontSize={13} color="text.secondary" mb={2}>Compare principal repaid vs interest paid each year</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="yearLabel" tick={{ fontSize: 12 }} label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatShortINR} label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                onClick={(e) => e.value && toggleSeries(e.value)}
                wrapperStyle={{ cursor: 'pointer' }}
                formatter={(value) => (
                  <span style={{ opacity: hiddenSeries.has(value) ? 0.4 : 1 }}>{value}</span>
                )}
              />
              <Bar dataKey="principal" fill="#10b981" name="Principal Paid" hide={hiddenSeries.has('Principal Paid')} />
              <Bar dataKey="interest" fill="#f97316" name="Interest Paid" hide={hiddenSeries.has('Interest Paid')} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {visibleCount >= 4 && (
        <Paper variant="outlined" sx={chartCardSx}>
          <Typography fontWeight={700} fontSize={15} color="text.primary" mb={0.5}>📈 Cumulative Principal vs Interest</Typography>
          <Typography fontSize={13} color="text.secondary" mb={2}>Track cumulative payments over the loan period</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" tick={{ fontSize: 12 }} label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatShortINR} label={{ value: 'Cumulative (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                onClick={(e) => e.value && toggleSeries(e.value)}
                wrapperStyle={{ cursor: 'pointer' }}
                formatter={(value) => (
                  <span style={{ opacity: hiddenSeries.has(value) ? 0.4 : 1 }}>{value}</span>
                )}
              />
              <Area type="monotone" dataKey="cumulativePrincipal" stackId="1" stroke="#10b981" fill="#10b981" name="Principal Paid" hide={hiddenSeries.has('Principal Paid')} />
              <Area type="monotone" dataKey="cumulativeInterest" stackId="1" stroke="#f97316" fill="#f97316" name="Interest Paid" hide={hiddenSeries.has('Interest Paid')} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {visibleCount >= 5 && (
        <Paper variant="outlined" sx={{ ...chartCardSx, mb: 0 }}>
          <Typography fontWeight={700} fontSize={15} color="text.primary" mb={0.5}>📉 Monthly Interest Paid</Typography>
          <Typography fontSize={13} color="text.secondary" mb={2}>Watch how your monthly interest payment decreases over time</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={schedule.filter((_, idx) => idx % Math.ceil(schedule.length / 50) === 0 || idx === schedule.length - 1)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatShortINR} label={{ value: 'Interest (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="interest" stroke="#f97316" dot={false} strokeWidth={2} name="Monthly Interest" hide={hiddenSeries.has('Monthly Interest')} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  );
}
