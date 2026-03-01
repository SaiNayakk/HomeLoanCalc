import type { PrepaymentOptions } from '../engine';
import { Box, Divider, FormControlLabel, InputAdornment, Paper, Stack, Switch, TextField, Typography } from '@mui/material';

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

  const handleExtraEMIEnabledChange = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onPrepaymentChange({
      ...prepayment,
      extraEMIEnabled: checked,
    });
  };

  const handleExtraEMIFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value, 10) || 1);
    onPrepaymentChange({
      ...prepayment,
      extraEMIFrequencyMonths: value,
    });
  };

  const handleExtraEMIStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPrepaymentChange({
      ...prepayment,
      extraEMIStartDate: e.target.value,
    });
  };

  const handleLumpSumEnabledChange = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onPrepaymentChange({
      ...prepayment,
      lumpSumEnabled: checked,
    });
  };

  const handleLumpSumDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPrepaymentChange({
      ...prepayment,
      lumpSumPayment: {
        month: prepayment.lumpSumPayment?.month || 1,
        amount: prepayment.lumpSumPayment?.amount || 0,
        date: e.target.value,
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
        date: prepayment.lumpSumPayment?.date,
      },
    });
  };

  const handleLumpSumQuickDate = (years: number) => {
    const start = prepayment.extraEMIStartDate
      ? new Date(prepayment.extraEMIStartDate)
      : new Date();
    const target = new Date(start);
    target.setFullYear(target.getFullYear() + years);
    const iso = target.toISOString().split('T')[0];
    onPrepaymentChange({
      ...prepayment,
      lumpSumPayment: {
        month: prepayment.lumpSumPayment?.month || 1,
        amount: prepayment.lumpSumPayment?.amount || 0,
        date: iso,
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
            Extra Monthly Amount
          </Typography>
          <FormControlLabel
            control={<Switch checked={prepayment.extraEMIEnabled ?? true} onChange={handleExtraEMIEnabledChange} />}
            label="Enable monthly prepayment"
          />
          {prepayment.extraEMIEnabled !== false && (
            <>
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
              <TextField
                type="number"
                value={prepayment.extraEMIFrequencyMonths ?? 1}
                onChange={handleExtraEMIFrequencyChange}
                placeholder="12"
                fullWidth
                label="Every (months)"
                inputProps={{ min: 1, step: 1 }}
                helperText="Set 12 for yearly, 3 for quarterly, etc."
              />
              <TextField
                type="date"
                value={prepayment.extraEMIStartDate || ''}
                onChange={handleExtraEMIStartDateChange}
                fullWidth
                label="Start date"
                InputLabelProps={{ shrink: true }}
                helperText="Date from which extra payments start."
              />
              <Box display="flex" justifyContent="flex-end">
                <Typography fontWeight={700} color="#0f172a">
                  {prepayment.extraEMIMonthly.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </>
          )}
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
            One-time Lump Sum
          </Typography>
          <FormControlLabel
            control={<Switch checked={prepayment.lumpSumEnabled ?? false} onChange={handleLumpSumEnabledChange} />}
            label="Enable lump sum payment"
          />
          {prepayment.lumpSumEnabled && (
            <>
              <Stack spacing={2}>
                <TextField
                  type="date"
                  value={prepayment.lumpSumPayment?.date || ''}
                  onChange={handleLumpSumDateChange}
                  fullWidth
                  label="Payment date"
                  InputLabelProps={{ shrink: true }}
                  helperText="Date you plan to make the lump sum payment."
                />
                <Box display="flex" gap={1} flexWrap="wrap">
                  <button
                    type="button"
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 999,
                      padding: '6px 12px',
                      background: '#fff',
                      fontSize: 12,
                      color: '#0f172a',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleLumpSumQuickDate(1)}
                  >
                    +1 year
                  </button>
                  <button
                    type="button"
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 999,
                      padding: '6px 12px',
                      background: '#fff',
                      fontSize: 12,
                      color: '#0f172a',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleLumpSumQuickDate(5)}
                  >
                    +5 years
                  </button>
                  <button
                    type="button"
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 999,
                      padding: '6px 12px',
                      background: '#fff',
                      fontSize: 12,
                      color: '#0f172a',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleLumpSumQuickDate(10)}
                  >
                    +10 years
                  </button>
                </Box>
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
                  ?{(prepayment.lumpSumPayment?.amount || 0).toLocaleString('en-IN')}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
