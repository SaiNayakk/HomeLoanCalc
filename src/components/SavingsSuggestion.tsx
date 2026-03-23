import type { LoanCalculation, PrepaymentOptions } from '../engine';
import { generateAmortizationSchedule, generateScheduleWithPrepayment } from '../engine';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { formatCurrency } from '../utils/formatters';

interface SavingsSuggestionProps {
  calculation: LoanCalculation;
}

const SCENARIOS = [
  { label: '₹5,000', amount: 5000, icon: '💰', color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.25)' },
  { label: '₹10,000', amount: 10000, icon: '🎯', color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.25)' },
  { label: '₹20,000', amount: 20000, icon: '🚀', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.25)' },
];

export function SavingsSuggestion({ calculation }: SavingsSuggestionProps) {
  const { input } = calculation;
  const baseCalculation = generateAmortizationSchedule(input);
  const baseTotalInterest = baseCalculation.totalInterest;
  const baseTenureMonths = baseCalculation.actualTenureMonths || input.tenureMonths;

  const calculateSavings = (extraMonthlyPayment: number) => {
    const prepayment: PrepaymentOptions = {
      extraEMIEnabled: true,
      extraEMIMonthly: extraMonthlyPayment,
      extraEMIFrequencyMonths: 1,
      extraEMIStartDate: input.emiStartDate,
      lumpSumEnabled: false,
    };

    const scenario = generateScheduleWithPrepayment(input, prepayment);
    const interestSaved = Math.max(0, baseTotalInterest - scenario.totalInterest);
    const monthsSaved = Math.max(0, baseTenureMonths - scenario.actualTenureMonths);

    return {
      monthsSaved,
      interestSaved,
      finalInterest: scenario.totalInterest,
      updatedTenure: {
        years: Math.floor(scenario.actualTenureMonths / 12),
        months: scenario.actualTenureMonths % 12,
      },
      yearsMonthsSaved: {
        years: Math.floor(monthsSaved / 12),
        months: monthsSaved % 12,
      },
    };
  };

  const savingsData = SCENARIOS.map((s) => ({ ...s, result: calculateSavings(s.amount) }));

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
        {savingsData.map((s) => (
          <Paper
            key={s.amount}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2.5,
              borderColor: s.border,
              bgcolor: s.bg,
              boxShadow: 'none',
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontSize={20}>{s.icon}</Typography>
                <Typography fontWeight={700} fontSize={13} sx={{ color: s.color }}>
                  Pay {s.label} extra/month
                </Typography>
              </Box>
              <Typography fontSize={12} sx={{ color: s.color }}>
                New tenure: {s.result.updatedTenure.years}y {s.result.updatedTenure.months}m
              </Typography>
              <Box>
                <Typography fontSize={13} fontWeight={600} sx={{ color: s.color }}>
                  Save {formatCurrency(s.result.interestSaved)} in interest
                </Typography>
                {s.result.yearsMonthsSaved.years > 0 || s.result.yearsMonthsSaved.months > 0 ? (
                  <Typography fontSize={12} sx={{ color: s.color }}>
                    Shave {s.result.yearsMonthsSaved.years}y {s.result.yearsMonthsSaved.months}m off tenure
                  </Typography>
                ) : null}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline' }}>
                <Typography fontSize={11} color="text.disabled" sx={{ textDecoration: 'line-through' }}>
                  {formatCurrency(baseTotalInterest, 0)}
                </Typography>
                <Typography fontSize={12} fontWeight={700} sx={{ color: s.color }}>
                  → {formatCurrency(s.result.finalInterest, 0)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 2,
          borderColor: 'rgba(234,179,8,0.4)',
          bgcolor: 'rgba(234,179,8,0.08)',
          boxShadow: 'none',
        }}
      >
        <Typography fontSize={13} color="text.secondary">
          <strong>💡 Pro Tip:</strong> Even small extra payments compound over time. Increase EMI by 10–20% during salary hikes to dramatically reduce your loan tenure!
        </Typography>
      </Paper>
    </Stack>
  );
}
