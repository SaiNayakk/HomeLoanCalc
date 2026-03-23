import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Divider,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { formatCurrency, formatCompact } from '../utils/formatters';

const BLUE = '#2563eb';
const BLUE_BG = 'rgba(37,99,235,0.08)';
const BLUE_BORDER = 'rgba(37,99,235,0.25)';

const FOIR = 0.5; // 50% Fixed Obligation to Income Ratio

function calcMaxLoan(maxEMI: number, annualRate: number, tenureMonths: number): number {
  if (maxEMI <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  const r = annualRate / 12 / 100;
  const factor = (Math.pow(1 + r, tenureMonths) - 1) / (r * Math.pow(1 + r, tenureMonths));
  return maxEMI * factor;
}

export function EligibilityCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('100000');
  const [existingEMIs, setExistingEMIs] = useState<string>('0');
  const [tenureMonths, setTenureMonths] = useState<number>(240);
  const [annualRate, setAnnualRate] = useState<number>(8.5);

  const income = parseFloat(monthlyIncome) || 0;
  const existing = parseFloat(existingEMIs) || 0;

  const { maxEMI, maxLoan, ltiRatio, highObligation } = useMemo(() => {
    const maxEMI = Math.max(0, (income - existing) * FOIR);
    const maxLoan = calcMaxLoan(maxEMI, annualRate, tenureMonths);
    const ltiRatio = income > 0 ? maxLoan / (income * 12) : 0;
    const highObligation = income > 0 && existing / income > 0.4;
    return { maxEMI, maxLoan, ltiRatio, highObligation };
  }, [income, existing, tenureMonths, annualRate]);

  const tenureYears = Math.round(tenureMonths / 12);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2.5,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 'none',
      }}
    >
      <Stack spacing={3}>
        {/* Inputs */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <TextField
            label="Monthly Income (₹)"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            inputProps={{ inputMode: 'numeric' }}
            size="small"
            fullWidth
          />
          <TextField
            label="Existing EMIs (₹)"
            value={existingEMIs}
            onChange={(e) => setExistingEMIs(e.target.value)}
            inputProps={{ inputMode: 'numeric' }}
            size="small"
            fullWidth
          />
        </Box>

        {/* Tenure slider */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
            <Typography fontSize={13} color="text.secondary">
              Desired Tenure
            </Typography>
            <Typography fontSize={13} fontWeight={700} color="text.primary">
              {tenureYears} years ({tenureMonths} months)
            </Typography>
          </Box>
          <Slider
            value={tenureMonths}
            min={12}
            max={360}
            step={12}
            onChange={(_, v) => setTenureMonths(v as number)}
            marks={[
              { value: 60, label: '5y' },
              { value: 120, label: '10y' },
              { value: 180, label: '15y' },
              { value: 240, label: '20y' },
              { value: 300, label: '25y' },
              { value: 360, label: '30y' },
            ]}
            sx={{ color: BLUE }}
          />
        </Box>

        {/* Rate slider */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
            <Typography fontSize={13} color="text.secondary">
              Interest Rate
            </Typography>
            <Typography fontSize={13} fontWeight={700} color="text.primary">
              {annualRate.toFixed(1)}% p.a.
            </Typography>
          </Box>
          <Slider
            value={annualRate}
            min={6}
            max={15}
            step={0.1}
            onChange={(_, v) => setAnnualRate(v as number)}
            marks={[
              { value: 7, label: '7%' },
              { value: 9, label: '9%' },
              { value: 11, label: '11%' },
              { value: 13, label: '13%' },
            ]}
            sx={{ color: BLUE }}
          />
        </Box>

        {/* Warning */}
        {highObligation && (
          <Alert severity="warning" sx={{ fontSize: 12, py: 0.5 }}>
            Your existing EMIs exceed 40% of income. Lenders may require a co-applicant or reject the application.
          </Alert>
        )}

        <Divider />

        {/* Results */}
        <Box>
          <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={1.5}>
            Loan Eligibility Results
          </Typography>

          {income === 0 ? (
            <Typography fontSize={13} color="text.secondary">
              Enter your monthly income to see eligibility.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {/* Max Loan */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: BLUE_BG,
                  borderColor: BLUE_BORDER,
                  boxShadow: 'none',
                  textAlign: 'center',
                }}
              >
                <Typography fontSize={11} color="text.secondary" mb={0.5}>
                  Max Loan Eligible
                </Typography>
                <Typography fontSize={22} fontWeight={800} sx={{ color: BLUE }}>
                  {formatCompact(maxLoan)}
                </Typography>
                <Typography fontSize={11} color="text.secondary" mt={0.25}>
                  {formatCurrency(maxLoan)}
                </Typography>
              </Paper>

              {/* Max EMI */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: BLUE_BG,
                  borderColor: BLUE_BORDER,
                  boxShadow: 'none',
                  textAlign: 'center',
                }}
              >
                <Typography fontSize={11} color="text.secondary" mb={0.5}>
                  Max EMI (FOIR 50%)
                </Typography>
                <Typography fontSize={22} fontWeight={800} sx={{ color: BLUE }}>
                  {formatCurrency(maxEMI)}
                </Typography>
                <Typography fontSize={11} color="text.secondary" mt={0.25}>
                  /month
                </Typography>
              </Paper>

              {/* Loan-to-Income Ratio */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: BLUE_BG,
                  borderColor: BLUE_BORDER,
                  boxShadow: 'none',
                  textAlign: 'center',
                }}
              >
                <Typography fontSize={11} color="text.secondary" mb={0.5}>
                  Loan-to-Income Ratio
                </Typography>
                <Typography fontSize={22} fontWeight={800} sx={{ color: BLUE }}>
                  {ltiRatio.toFixed(1)}x
                </Typography>
                <Typography fontSize={11} color="text.secondary" mt={0.25}>
                  annual income
                </Typography>
              </Paper>
            </Box>
          )}
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
            <strong>Note:</strong> Eligibility is estimated using a 50% FOIR (Fixed Obligation to Income Ratio).
            Actual eligibility varies by lender, credit score, age, and employment type.
          </Typography>
        </Paper>
      </Stack>
    </Paper>
  );
}
