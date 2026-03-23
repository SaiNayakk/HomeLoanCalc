import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { generateAmortizationSchedule } from '../engine';
import type { LoanInput } from '../engine';
import { formatCompact, formatCurrency } from '../utils/formatters';

interface DownPaymentAnalysisProps {
  propertyPrice: number;
  input: LoanInput;
}

const DOWN_PAYMENT_PERCENTAGES = [10, 20, 30, 40];
const RECOMMENDED_PERCENT = 20;
const RECOMMENDED_BORDER = '3px solid #2563eb';

export function DownPaymentAnalysis({ propertyPrice, input }: DownPaymentAnalysisProps) {
  const rows = DOWN_PAYMENT_PERCENTAGES.map((pct) => {
    const downPayment = (pct / 100) * propertyPrice;
    const loanAmount = propertyPrice - downPayment;
    const calc = generateAmortizationSchedule({ ...input, principal: loanAmount });
    return { pct, downPayment, loanAmount, calc };
  });

  const baseline = rows[0]; // 10% row used as savings reference

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
      {/* Header */}
      <Box px={3} pt={3} pb={2}>
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          Down Payment Analysis
        </Typography>
        <Typography fontSize={13} color="text.secondary" mt={0.5}>
          Compare how your down payment affects EMI and total cost for a property priced at{' '}
          {formatCompact(propertyPrice)}
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Down %</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Down Amount
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Loan Amount
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Monthly EMI
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Total Interest
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Total Payable
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Savings vs 10%
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(({ pct, downPayment, loanAmount, calc }) => {
              const isRecommended = pct === RECOMMENDED_PERCENT;
              const savingsVsBaseline = baseline.calc.totalPayable - calc.totalPayable;

              return (
                <TableRow
                  key={pct}
                  hover
                  sx={
                    isRecommended
                      ? { borderLeft: RECOMMENDED_BORDER }
                      : undefined
                  }
                >
                  {/* Down % with optional chip */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        fontWeight={isRecommended ? 700 : 600}
                        fontSize={14}
                        color="text.primary"
                      >
                        {pct}%
                      </Typography>
                      {isRecommended && (
                        <Chip
                          label="Recommended"
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 20,
                            bgcolor: '#dbeafe',
                            color: '#1d4ed8',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Typography fontSize={13} color="text.secondary">
                      {formatCompact(downPayment)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography fontSize={13} fontWeight={600} color="text.primary">
                      {formatCompact(loanAmount)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      fontSize={13}
                      fontWeight={700}
                      color={isRecommended ? '#2563eb' : 'primary.main'}
                    >
                      {formatCurrency(calc.monthlyEMI)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography fontSize={13} fontWeight={600} color="secondary.main">
                      {formatCompact(calc.totalInterest)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography fontSize={13} fontWeight={600} color="text.primary">
                      {formatCompact(calc.totalPayable)}
                    </Typography>
                  </TableCell>

                  {/* Savings vs 10% baseline */}
                  <TableCell align="right">
                    {pct === 10 ? (
                      <Typography fontSize={12} color="text.disabled">
                        —
                      </Typography>
                    ) : (
                      <Typography fontSize={13} fontWeight={700} color="#16a34a">
                        {formatCompact(savingsVsBaseline)}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box px={3} py={1.5}>
        <Typography fontSize={11} color="text.secondary">
          * Savings vs 10% = difference in total payable compared to the 10% down payment option.
          All calculations use the same interest rate and tenure.
        </Typography>
      </Box>
    </Paper>
  );
}
