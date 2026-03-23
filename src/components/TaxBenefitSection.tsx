import type { LoanCalculation } from '../engine';
import { useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../utils/formatters';

const GREEN = '#16a34a';
const GREEN_BG = 'rgba(22,163,74,0.08)';
const GREEN_BORDER = 'rgba(22,163,74,0.25)';

const TAX_SLABS = [5, 20, 30] as const;
type TaxSlab = (typeof TAX_SLABS)[number];

const SEC_80C_LIMIT = 150_000;
const SEC_24B_LIMIT = 200_000;

interface YearlyTaxData {
  year: number;
  principalPaid: number;
  interestPaid: number;
  saving80C: number;
  saving24B: number;
  totalSaving: number;
}

function computeYearlyData(
  schedule: LoanCalculation['schedule'],
  taxRate: number,
): YearlyTaxData[] {
  const yearMap = new Map<number, { principal: number; interest: number }>();

  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    const existing = yearMap.get(year) ?? { principal: 0, interest: 0 };
    yearMap.set(year, {
      principal: existing.principal + row.principal,
      interest: existing.interest + row.interest,
    });
  }

  const result: YearlyTaxData[] = [];
  for (const [year, { principal, interest }] of yearMap) {
    const saving80C = (Math.min(principal, SEC_80C_LIMIT) * taxRate) / 100;
    const saving24B = (Math.min(interest, SEC_24B_LIMIT) * taxRate) / 100;
    result.push({
      year,
      principalPaid: principal,
      interestPaid: interest,
      saving80C,
      saving24B,
      totalSaving: saving80C + saving24B,
    });
  }

  return result.sort((a, b) => a.year - b.year);
}

export function TaxBenefitSection({ calculation }: { calculation: LoanCalculation }) {
  const [taxRate, setTaxRate] = useState<TaxSlab>(30);

  const yearlyData = computeYearlyData(calculation.schedule, taxRate);
  const totalSaving = yearlyData.reduce((sum, y) => sum + y.totalSaving, 0);
  const total80C = yearlyData.reduce((sum, y) => sum + y.saving80C, 0);
  const total24B = yearlyData.reduce((sum, y) => sum + y.saving24B, 0);

  const tableRows = yearlyData.slice(0, 5);

  return (
    <Stack spacing={2.5}>
      {/* Tax slab selector */}
      <Box>
        <Typography fontSize={13} color="text.secondary" mb={1}>
          Select your income tax slab:
        </Typography>
        <Stack direction="row" spacing={1}>
          {TAX_SLABS.map((slab) => (
            <Chip
              key={slab}
              label={`${slab}%`}
              onClick={() => setTaxRate(slab)}
              variant={taxRate === slab ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 700,
                fontSize: 13,
                ...(taxRate === slab
                  ? { bgcolor: GREEN, color: '#fff', '&:hover': { bgcolor: '#15803d' } }
                  : { borderColor: 'divider', color: 'text.secondary' }),
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Summary card */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: GREEN_BG,
          borderColor: GREEN_BORDER,
          boxShadow: 'none',
        }}
      >
        <Typography fontSize={13} color="text.secondary" mb={1.5}>
          Lifetime tax savings at <strong>{taxRate}%</strong> slab
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 2,
          }}
        >
          <Box>
            <Typography fontSize={11} color="text.secondary" mb={0.25}>
              Sec 80C (Principal)
            </Typography>
            <Typography fontSize={18} fontWeight={700} sx={{ color: GREEN }}>
              {formatCurrency(total80C)}
            </Typography>
          </Box>
          <Box>
            <Typography fontSize={11} color="text.secondary" mb={0.25}>
              Sec 24B (Interest)
            </Typography>
            <Typography fontSize={18} fontWeight={700} sx={{ color: GREEN }}>
              {formatCurrency(total24B)}
            </Typography>
          </Box>
          <Box>
            <Typography fontSize={11} color="text.secondary" mb={0.25}>
              Total Tax Saved
            </Typography>
            <Typography fontSize={22} fontWeight={800} sx={{ color: GREEN }}>
              {formatCurrency(totalSaving)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Divider />

      {/* Year-by-year table (first 5 years) */}
      <Box>
        <Typography fontSize={13} fontWeight={600} color="text.primary" mb={1}>
          Year-by-year breakdown
          {yearlyData.length > 5 && (
            <Typography component="span" fontSize={12} color="text.secondary" ml={1}>
              (showing first 5 of {yearlyData.length} years)
            </Typography>
          )}
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>
                  Year
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}
                >
                  Principal Paid
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, fontSize: 12, color: GREEN }}
                >
                  80C Saving
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}
                >
                  Interest Paid
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, fontSize: 12, color: GREEN }}
                >
                  24B Saving
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, fontSize: 12, color: GREEN }}
                >
                  Total Saved
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow
                  key={row.year}
                  sx={{ '&:last-child td': { borderBottom: 'none' } }}
                >
                  <TableCell sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                    Yr {row.year}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {formatCurrency(row.principalPaid)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontSize: 13, fontWeight: 600, color: GREEN }}
                  >
                    {formatCurrency(row.saving80C)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {formatCurrency(row.interestPaid)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontSize: 13, fontWeight: 600, color: GREEN }}
                  >
                    {formatCurrency(row.saving24B)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontSize: 13, fontWeight: 700, color: GREEN }}
                  >
                    {formatCurrency(row.totalSaving)}
                  </TableCell>
                </TableRow>
              ))}

              {/* Total row */}
              <TableRow sx={{ bgcolor: GREEN_BG }}>
                <TableCell
                  sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', borderTop: `1px solid ${GREEN_BORDER}` }}
                >
                  Total
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontSize: 12, color: 'text.secondary', borderTop: `1px solid ${GREEN_BORDER}` }}
                >
                  —
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontSize: 13, fontWeight: 700, color: GREEN, borderTop: `1px solid ${GREEN_BORDER}` }}
                >
                  {formatCurrency(total80C)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontSize: 12, color: 'text.secondary', borderTop: `1px solid ${GREEN_BORDER}` }}
                >
                  —
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontSize: 13, fontWeight: 700, color: GREEN, borderTop: `1px solid ${GREEN_BORDER}` }}
                >
                  {formatCurrency(total24B)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontSize: 14, fontWeight: 800, color: GREEN, borderTop: `1px solid ${GREEN_BORDER}` }}
                >
                  {formatCurrency(totalSaving)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
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
        <Typography fontSize={12} color="text.secondary">
          <strong>Note:</strong> Sec 80C deduction is capped at ₹1,50,000/year (shared with other 80C investments).
          Sec 24B is capped at ₹2,00,000/year for self-occupied property. Consult a tax advisor for your specific situation.
        </Typography>
      </Paper>
    </Stack>
  );
}
