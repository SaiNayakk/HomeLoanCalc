import type { LoanCalculation } from '../engine';
import { Box, Paper, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCompact } from '../utils/formatters';

const COLOR_BASE = '#2563eb';
const COLOR_PREPAY = '#10b981';

function sampleRows<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string | number;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <Paper
      elevation={3}
      sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>Month {label}</Typography>
      {payload.map((entry) => (
        <Box key={entry.name} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 11, color: 'text.secondary', flexGrow: 1 }}>
            {entry.name}
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
            {formatCompact(entry.value)}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}

export function PrepaymentVisualizer({
  baseCalculation,
  prepaymentCalculation,
}: {
  baseCalculation: LoanCalculation;
  prepaymentCalculation: LoanCalculation | null;
}) {
  if (!prepaymentCalculation) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Add prepayments to see the impact visualized
        </Typography>
      </Box>
    );
  }

  // Build combined dataset aligned by month index
  const baseRows = sampleRows(baseCalculation.schedule, 60);
  const prepayRows = sampleRows(prepaymentCalculation.schedule, 60);

  // Create a union of months present in either schedule
  const monthSet = new Set([
    ...baseRows.map((r) => r.month),
    ...prepayRows.map((r) => r.month),
  ]);
  const months = Array.from(monthSet).sort((a, b) => a - b);

  const baseByMonth = new Map(baseRows.map((r) => [r.month, r.closingBalance]));
  const prepayByMonth = new Map(prepayRows.map((r) => [r.month, r.closingBalance]));

  const chartData = months.map((month) => ({
    month,
    'Without Prepayment': baseByMonth.get(month) ?? 0,
    'With Prepayment': prepayByMonth.get(month) ?? 0,
  }));

  const interestSaved = baseCalculation.totalInterest - prepaymentCalculation.totalInterest;
  const monthsSaved =
    baseCalculation.actualTenureMonths - prepaymentCalculation.actualTenureMonths;

  return (
    <Box>
      {/* Chart */}
      <Box sx={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              label={{ value: 'Month', position: 'insideBottom', offset: -4, fontSize: 11 }}
            />
            <YAxis
              tickFormatter={(v: number) => formatCompact(v)}
              tick={{ fontSize: 11 }}
              width={70}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="Without Prepayment"
              stroke={COLOR_BASE}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="With Prepayment"
              stroke={COLOR_PREPAY}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Summary */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
          mt: 2,
        }}
      >
        <Paper
          variant="outlined"
          sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}
        >
          <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.25 }}>
            Interest Saved
          </Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLOR_PREPAY }}>
            {formatCompact(interestSaved)}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}
        >
          <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.25 }}>
            Months Saved
          </Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLOR_PREPAY }}>
            {monthsSaved > 0 ? monthsSaved : 0}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
