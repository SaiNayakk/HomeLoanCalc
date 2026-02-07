import type { PrepaymentOptions } from '../engine';
import { Box, Divider, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';

interface PrepaymentInputProps {
  prepayment: PrepaymentOptions;
  onPrepaymentChange: (prepayment: PrepaymentOptions) => void;
}

export function PrepaymentInput({ prepayment, onPrepaymentChange }: PrepaymentInputProps) {
  const handleExtraEMIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onPrepaymentChange({
      ...prepayment,
      extraEMIMonthly: value,
    });
  };

  const handleLumpSumMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const month = parseInt(e.target.value, 10) || 1;
    onPrepaymentChange({
      ...prepayment,
      lumpSumPayment: {
        month,
        amount: prepayment.lumpSumPayment?.amount || 0,
      },
    });
  };

  const handleLumpSumAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    onPrepaymentChange({
      ...prepayment,
      lumpSumPayment: {
        month: prepayment.lumpSumPayment?.month || 1,
        amount,
      },
    });
  };

  return (
    <Stack spacing={2.5}>
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 3,
          borderColor: '#e2e8f0',
          boxShadow: '0 10px 20px rgba(15, 23, 42, 0.06)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Stack spacing={2}>
          <Typography fontWeight={700} fontSize={13} letterSpacing={1} textTransform="uppercase" color="#0f172a">
            💰 Extra Monthly Amount
          </Typography>
          <TextField
            type="number"
            value={prepayment.extraEMIMonthly || ''}
            onChange={handleExtraEMIChange}
            placeholder="5,000"
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 1000 }}
            helperText="Pay extra every month to reduce interest faster."
          />
          <Box display="flex" justifyContent="flex-end">
            <Typography fontWeight={700} color="#0f172a">
              ₹{prepayment.extraEMIMonthly.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Divider />

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 3,
          borderColor: '#e2e8f0',
          boxShadow: '0 10px 20px rgba(15, 23, 42, 0.06)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Stack spacing={2}>
          <Typography fontWeight={700} fontSize={13} letterSpacing={1} textTransform="uppercase" color="#0f172a">
            📦 One-time Lump Sum
          </Typography>
          <Stack spacing={2}>
            <TextField
              type="number"
              value={prepayment.lumpSumPayment?.month || 1}
              onChange={handleLumpSumMonthChange}
              placeholder="12"
              fullWidth
              label="After Month"
              inputProps={{ min: 1, max: 600 }}
              helperText="After which month?"
            />
            <TextField
              type="number"
              value={prepayment.lumpSumPayment?.amount || ''}
              onChange={handleLumpSumAmountChange}
              placeholder="2,00,000"
              fullWidth
              label="Amount"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 100000 }}
              helperText="E.g., bonus, inheritance, savings."
            />
          </Stack>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography color="#64748b" fontSize={12}>
              Selected
            </Typography>
            <Typography fontWeight={700} color="#0f172a">
              ₹{(prepayment.lumpSumPayment?.amount || 0).toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
