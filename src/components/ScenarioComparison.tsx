import type { LoanCalculation } from '../engine';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../utils/formatters';

interface ScenarioComparisonProps {
  baseCalculation: LoanCalculation;
  scenarios: Array<{
    name: string;
    calculation: LoanCalculation;
  }>;
}

export function ScenarioComparison({ baseCalculation, scenarios }: ScenarioComparisonProps) {
  if (scenarios.length === 0) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: 'divider',
        boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
        bgcolor: 'background.paper',
      }}
    >
      <Box px={3} pt={3} pb={2}>
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          🔄 Scenario Comparison
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Scenario</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>EMI</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Interest</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Months</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Savings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Base</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatCurrency(baseCalculation.monthlyEMI)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                {formatCurrency(baseCalculation.totalInterest)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {formatCurrency(baseCalculation.totalPayable)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {baseCalculation.actualTenureMonths}
              </TableCell>
              <TableCell align="right" sx={{ color: 'text.disabled' }}>—</TableCell>
            </TableRow>

            {scenarios.map((scenario, idx) => {
              const reference = idx === 0 ? baseCalculation : scenarios[idx - 1].calculation;
              const totalSaved = reference.totalPayable - scenario.calculation.totalPayable;
              const totalSavedPercent = ((totalSaved / reference.totalPayable) * 100).toFixed(1);
              const tenureSaved = reference.actualTenureMonths - scenario.calculation.actualTenureMonths;

              return (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{scenario.name}</TableCell>
                  <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {formatCurrency(scenario.calculation.monthlyEMI)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                    {formatCurrency(scenario.calculation.totalInterest)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {formatCurrency(scenario.calculation.totalPayable)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {scenario.calculation.actualTenureMonths}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#16a34a' }}>
                    {formatCurrency(totalSaved)}
                    <Box component="span" display="block" fontSize={11} color="#16a34a">
                      {totalSavedPercent}% total
                      {tenureSaved > 0 ? ` | ${tenureSaved}mo` : ''}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {scenarios.length > 0 && (
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Final Savings (best)</TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 800, color: '#16a34a' }}>
                  {(() => {
                    const finalScenario = scenarios[scenarios.length - 1];
                    const finalSaved = baseCalculation.totalPayable - finalScenario.calculation.totalPayable;
                    return formatCurrency(finalSaved);
                  })()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
