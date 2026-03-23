import type { LoanCalculation } from '../engine';
import { useState } from 'react';
import {
  Box,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../utils/formatters';

function computeEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / tenureMonths;
  const pow = Math.pow(1 + r, tenureMonths);
  return (principal * r * pow) / (pow - 1);
}

export function InterestRateAlert({ calculation }: { calculation: LoanCalculation }) {
  const [maxAffordable, setMaxAffordable] = useState('');

  const baseRate = calculation.input.annualRate;
  const { principal, tenureMonths } = calculation.input;
  const n = calculation.actualTenureMonths || tenureMonths;

  const offsets = [-2, -1, 0, 1, 2, 3];
  const scenarios = offsets.map((offset) => {
    const rate = Math.min(30, Math.max(1, baseRate + offset));
    const emi = computeEMI(principal, rate, n);
    const totalInterest = emi * n - principal;
    const delta = emi - calculation.monthlyEMI;
    return { rate, emi, delta, totalInterest };
  });

  const maxEMI = maxAffordable ? parseFloat(maxAffordable) : null;

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" color="text.primary" fontWeight={600}>
          Interest Rate Scenarios
        </Typography>

        <TextField
          label="Max affordable EMI (optional)"
          value={maxAffordable}
          onChange={(e) => setMaxAffordable(e.target.value)}
          type="number"
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
          sx={{ maxWidth: 280 }}
        />

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Rate</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>EMI</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Δ vs Current</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Total Interest</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scenarios.map(({ rate, emi, delta, totalInterest }) => {
                const isCurrent = rate === baseRate;
                const isOverBudget = maxEMI !== null && !isNaN(maxEMI) && emi > maxEMI;

                return (
                  <TableRow
                    key={rate}
                    sx={{
                      ...(isCurrent && {
                        borderLeft: '3px solid #2563eb',
                      }),
                      ...(isOverBudget && {
                        bgcolor: 'rgba(249,115,22,0.08)',
                      }),
                    }}
                  >
                    <TableCell sx={{ color: 'text.primary' }}>
                      {rate.toFixed(1)}%{isCurrent && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ ml: 0.5, color: '#2563eb', fontWeight: 600 }}
                        >
                          current
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: isCurrent ? 700 : 400,
                        color: isOverBudget ? 'rgb(249,115,22)' : 'text.primary',
                      }}
                    >
                      {formatCurrency(Math.round(emi))}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: delta > 0 ? 'error.main' : delta < 0 ? 'success.main' : 'text.secondary',
                      }}
                    >
                      {delta === 0
                        ? '—'
                        : `${delta > 0 ? '+' : ''}${formatCurrency(Math.round(delta))}`}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {formatCurrency(Math.round(totalInterest))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Stack>
    </Paper>
  );
}
