import { useState } from 'react';
import { Box, Chip, Grid, Paper, Slider, Stack, TextField, Typography, InputAdornment } from '@mui/material';
import { formatCurrency, formatCompact } from '../utils/formatters';

export function RentVsBuy() {
  const [propertyPrice, setPropertyPrice] = useState(5000000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [loanRate, setLoanRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(20000);
  const [annualRentIncrease, setAnnualRentIncrease] = useState(5);
  const [appreciation, setAppreciation] = useState(6);

  // Buy scenario calculations
  const downPayment = (propertyPrice * downPaymentPct) / 100;
  const loanAmount = propertyPrice - downPayment;
  const r = loanRate / 12 / 100;
  const n = tenure * 12;
  const emi =
    r === 0
      ? loanAmount / n
      : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalBuyCost = downPayment + emi * n;
  const propertyValueAtEnd = propertyPrice * Math.pow(1 + appreciation / 100, tenure);
  const netBuyCost = totalBuyCost - propertyValueAtEnd;

  // Rent scenario calculations
  let totalRentCost = 0;
  for (let year = 0; year < tenure; year++) {
    totalRentCost += monthlyRent * 12 * Math.pow(1 + annualRentIncrease / 100, year);
  }

  const buyingIsBetter = netBuyCost < totalRentCost;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: 'divider',
        p: { xs: 2, sm: 3 },
        bgcolor: 'background.paper',
      }}
    >
      <Typography fontWeight={700} fontSize={18} color="text.primary" mb={3}>
        Rent vs Buy Comparison
      </Typography>

      {/* Inputs */}
      <Grid container spacing={2.5} mb={3}>
        {/* Column 1 */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Property Price"
              type="number"
              size="small"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              fullWidth
            />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Down Payment: {downPaymentPct}% ({formatCompact(downPayment)})
              </Typography>
              <Slider
                value={downPaymentPct}
                min={10}
                max={40}
                step={1}
                onChange={(_, v) => setDownPaymentPct(v as number)}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}%`}
              />
            </Box>
            <TextField
              label="Loan Interest Rate"
              type="number"
              size="small"
              value={loanRate}
              onChange={(e) => setLoanRate(Number(e.target.value))}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              fullWidth
            />
            <TextField
              label="Loan Tenure"
              type="number"
              size="small"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              InputProps={{ endAdornment: <InputAdornment position="end">yrs</InputAdornment> }}
              fullWidth
            />
          </Stack>
        </Grid>

        {/* Column 2 */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Monthly Rent"
              type="number"
              size="small"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Number(e.target.value))}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              fullWidth
            />
            <TextField
              label="Annual Rent Increase"
              type="number"
              size="small"
              value={annualRentIncrease}
              onChange={(e) => setAnnualRentIncrease(Number(e.target.value))}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              fullWidth
            />
            <TextField
              label="Expected Property Appreciation"
              type="number"
              size="small"
              value={appreciation}
              onChange={(e) => setAppreciation(Number(e.target.value))}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              fullWidth
            />
          </Stack>
        </Grid>
      </Grid>

      {/* Results */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2.5}>
        {/* Buy Card */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
            Buy Scenario
          </Typography>
          <Stack spacing={0.75}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Down Payment</Typography>
              <Typography variant="body2" color="text.primary" fontWeight={500}>{formatCompact(downPayment)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Monthly EMI</Typography>
              <Typography variant="body2" color="text.primary" fontWeight={500}>{formatCurrency(emi)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Total Buy Cost</Typography>
              <Typography variant="body2" color="text.primary" fontWeight={500}>{formatCompact(totalBuyCost)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Property Value at End</Typography>
              <Typography variant="body2" color="text.primary" fontWeight={500}>{formatCompact(propertyValueAtEnd)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 0.75, mt: 0.25 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Net Buy Cost</Typography>
              <Typography variant="body2" fontWeight={700} color={netBuyCost < 0 ? 'success.main' : 'text.primary'}>
                {netBuyCost < 0 ? `-${formatCompact(Math.abs(netBuyCost))}` : formatCompact(netBuyCost)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Rent Card */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
            Rent Scenario
          </Typography>
          <Stack spacing={0.75}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Initial Monthly Rent</Typography>
              <Typography variant="body2" color="text.primary" fontWeight={500}>{formatCurrency(monthlyRent)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Annual Increase</Typography>
              <Typography variant="body2" color="text.primary" fontWeight={500}>{annualRentIncrease}%</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Period</Typography>
              <Typography variant="body2" color="text.primary" fontWeight={500}>{tenure} years</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 0.75, mt: 0.25 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Rent Cost</Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {formatCompact(totalRentCost)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>

      {/* Verdict Banner */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: buyingIsBetter ? 'success.light' : 'info.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography fontWeight={700} color={buyingIsBetter ? 'success.dark' : 'info.dark'} fontSize={15}>
          {buyingIsBetter ? 'Buying is better' : 'Renting is better'}
        </Typography>
        <Chip
          label={
            buyingIsBetter
              ? `Save ${formatCompact(totalRentCost - netBuyCost)} by buying`
              : `Save ${formatCompact(netBuyCost - totalRentCost)} by renting`
          }
          color={buyingIsBetter ? 'success' : 'info'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>
    </Paper>
  );
}
