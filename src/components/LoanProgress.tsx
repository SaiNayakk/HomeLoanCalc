import type { LoanCalculation } from '../engine';
import { Box, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { formatCurrency, formatCompact } from '../utils/formatters';

export function LoanProgress({ calculation }: { calculation: LoanCalculation }) {
  const { emiStartDate } = calculation.input;

  if (!emiStartDate) return null;

  const startDate = new Date(emiStartDate);
  const today = new Date();

  const monthsPaid = Math.max(
    0,
    (today.getFullYear() - startDate.getFullYear()) * 12 +
      today.getMonth() -
      startDate.getMonth(),
  );

  const totalMonths = calculation.actualTenureMonths;
  const monthsRemaining = Math.max(0, totalMonths - monthsPaid);
  const pctPaid = Math.min(100, (monthsPaid / totalMonths) * 100);

  const amountPaid = monthsPaid * calculation.monthlyEMI;

  const schedule = calculation.schedule;
  const scheduleIndex = Math.min(monthsPaid, schedule.length - 1);
  const balanceRemaining = schedule[scheduleIndex].closingBalance;

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" color="text.primary" fontWeight={600}>
          Loan Progress
        </Typography>
        <Chip
          label={`${pctPaid.toFixed(1)}% paid`}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      <Box mb={2}>
        <LinearProgress
          variant="determinate"
          value={pctPaid}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: 'background.default',
            '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' },
          }}
        />
      </Box>

      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box textAlign="center">
          <Typography variant="h6" color="text.primary" fontWeight={700}>
            {monthsPaid}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            months paid
          </Typography>
        </Box>

        <Box textAlign="center">
          <Typography variant="h6" color="text.primary" fontWeight={700}>
            {monthsRemaining}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            months remaining
          </Typography>
        </Box>

        <Box textAlign="center">
          <Typography variant="h6" color="text.primary" fontWeight={700}>
            {formatCompact(balanceRemaining)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            balance
          </Typography>
        </Box>
      </Stack>

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          Amount paid so far: {formatCurrency(amountPaid)}
        </Typography>
      </Box>
    </Paper>
  );
}
