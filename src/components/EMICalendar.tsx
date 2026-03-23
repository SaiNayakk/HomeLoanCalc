import type { LoanCalculation } from '../engine';
import { Box, Paper, Typography } from '@mui/material';
import { formatCurrency } from '../utils/formatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mmm = MONTH_NAMES[date.getMonth()].slice(0, 3);
  const yyyy = date.getFullYear();
  return `${dd} ${mmm} ${yyyy}`;
}

export function EMICalendar({ calculation }: { calculation: LoanCalculation }) {
  const { emiStartDate } = calculation.input;

  if (!emiStartDate) {
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
          Set EMI start date to see payment calendar
        </Typography>
      </Box>
    );
  }

  const startDate = new Date(emiStartDate);
  const months = Array.from({ length: 12 }, (_, i) => {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + i);
    const scheduleRow = calculation.schedule[i];
    return { paymentDate, scheduleRow, index: i };
  }).filter(({ scheduleRow }) => scheduleRow !== undefined);

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 1.5,
        }}
      >
        {months.map(({ paymentDate, scheduleRow, index }) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{
              p: 1.5,
              bgcolor: 'background.default',
              borderRadius: 2,
            }}
          >
            {/* Month name + year */}
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                mb: 0.5,
                color: 'text.primary',
              }}
            >
              {MONTH_NAMES[paymentDate.getMonth()]} {paymentDate.getFullYear()}
            </Typography>

            {/* Payment date */}
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1 }}>
              {formatDate(paymentDate)}
            </Typography>

            {/* EMI */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>EMI</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary' }}>
                {formatCurrency(scheduleRow.emiPayment)}
              </Typography>
            </Box>

            {/* Principal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Principal</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'success.main' }}>
                {formatCurrency(scheduleRow.principal)}
              </Typography>
            </Box>

            {/* Interest */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Interest</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'warning.main' }}>
                {formatCurrency(scheduleRow.interest)}
              </Typography>
            </Box>

            {/* Balance */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                pt: 0.5,
                mt: 0.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Balance</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary' }}>
                {formatCurrency(scheduleRow.closingBalance)}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
