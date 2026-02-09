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
        borderColor: '#e2e8f0',
        boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <Box px={3} pt={3} pb={2}>
        <Typography fontWeight={700} fontSize={16} color="#0f172a">
          🔄 Scenario Comparison
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
              <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Scenario</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>EMI</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Interest</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Months</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Savings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>Base</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#1d4ed8' }}>
                ₹{baseCalculation.monthlyEMI.toLocaleString('en-IN')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                ₹{baseCalculation.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>
                ₹{baseCalculation.totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {baseCalculation.actualTenureMonths}
              </TableCell>
              <TableCell align="right" sx={{ color: '#94a3b8' }}>—</TableCell>
            </TableRow>

            {scenarios.map((scenario, idx) => {
              const reference = idx === 0 ? baseCalculation : scenarios[idx - 1].calculation;
              const totalSaved = reference.totalPayable - scenario.calculation.totalPayable;
              const totalSavedPercent = ((totalSaved / reference.totalPayable) * 100).toFixed(1);
              const tenureSaved =
                reference.actualTenureMonths - scenario.calculation.actualTenureMonths;

              return (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{scenario.name}</TableCell>
                  <TableCell align="right" sx={{ color: '#0f172a', fontWeight: 600 }}>
                    ₹{scenario.calculation.monthlyEMI.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#7c3aed', fontWeight: 600 }}>
                    ₹{scenario.calculation.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#0f172a', fontWeight: 600 }}>
                    ₹{scenario.calculation.totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#0f172a', fontWeight: 600 }}>
                    {scenario.calculation.actualTenureMonths}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#16a34a' }}>
                    ₹{totalSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    <Box component="span" display="block" fontSize={11} color="#16a34a">
                      {totalSavedPercent}% total
                      {tenureSaved > 0 ? ` | ${tenureSaved}mo` : ''}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {scenarios.length > 0 && (
              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Final Savings (best)
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 800, color: '#16a34a' }}>
                  {(() => {
                    const finalScenario = scenarios[scenarios.length - 1];
                    const finalSaved = baseCalculation.totalPayable - finalScenario.calculation.totalPayable;
                    return `₹${finalSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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
