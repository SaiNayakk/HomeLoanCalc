import type { PrepaymentOptions } from '../engine';
import { Box, Chip, Divider, FormControlLabel, InputAdornment, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { formatCurrency } from '../utils/formatters';

interface PrepaymentInputProps {
  prepayment: PrepaymentOptions;
  onPrepaymentChange: (prepayment: PrepaymentOptions) => void;
}

const sectionPaperSx = {
  p: 2.5,
  borderRadius: 2.5,
  borderColor: 'divider',
  boxShadow: 'none',
  bgcolor: 'background.paper',
};

export function PrepaymentInput({ prepayment, onPrepaymentChange }: PrepaymentInputProps) {
  const handleExtraEMIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPrepaymentChange({ ...prepayment, extraEMIMonthly: parseFloat(e.target.value) || 0 });
  };

  const handleExtraEMIEnabledChange = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onPrepaymentChange({ ...prepayment, extraEMIEnabled: checked });
  };

  const handleExtraEMIFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPrepaymentChange({ ...prepayment, extraEMIFrequencyMonths: Math.max(1, parseInt(e.target.value, 10) || 1) });
  };

  const handleExtraEMIStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPrepaymentChange({ ...prepayment, extraEMIStartDate: e.target.value });
  };

  const handleLumpSumEnabledChange = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onPrepaymentChange({ ...prepayment, lumpSumEnabled: checked });
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
    onPrepaymentChange({
      ...prepayment,
      lumpSumPayment: {
        month: prepayment.lumpSumPayment?.month || 1,
        amount: parseFloat(e.target.value) || 0,
        date: prepayment.lumpSumPayment?.date,
      },
    });
  };

  const handleLumpSumQuickDate = (years: number) => {
    const start = prepayment.extraEMIStartDate ? new Date(prepayment.extraEMIStartDate) : new Date();
    const target = new Date(start);
    target.setFullYear(target.getFullYear() + years);
    onPrepaymentChange({
      ...prepayment,
      lumpSumPayment: {
        month: prepayment.lumpSumPayment?.month || 1,
        amount: prepayment.lumpSumPayment?.amount || 0,
        date: target.toISOString().split('T')[0],
      },
    });
  };

  return (
    <Stack spacing={2.5}>
      {/* Extra Monthly Amount */}
      <Paper variant="outlined" sx={sectionPaperSx}>
        <Stack spacing={2}>
          <Typography fontWeight={700} fontSize={12} letterSpacing={1} textTransform="uppercase" color="text.secondary">
            Extra Monthly Amount
          </Typography>
          <FormControlLabel
            control={<Switch checked={prepayment.extraEMIEnabled ?? true} onChange={handleExtraEMIEnabledChange} />}
            label={<Typography variant="body2" color="text.primary" fontWeight={500}>Enable monthly prepayment</Typography>}
          />
          {prepayment.extraEMIEnabled !== false && (
            <>
              <TextField
                type="number"
                value={prepayment.extraEMIMonthly || ''}
                onChange={handleExtraEMIChange}
                placeholder="5,000"
                fullWidth
                size="small"
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                inputProps={{ min: 0, step: 1000 }}
                helperText="Pay extra every month to reduce interest faster."
              />
              <TextField
                type="number"
                value={prepayment.extraEMIFrequencyMonths ?? 1}
                onChange={handleExtraEMIFrequencyChange}
                placeholder="12"
                fullWidth
                size="small"
                label="Every (months)"
                inputProps={{ min: 1, step: 1 }}
                helperText="Set 12 for yearly, 3 for quarterly, etc."
              />
              <TextField
                type="date"
                value={prepayment.extraEMIStartDate || ''}
                onChange={handleExtraEMIStartDateChange}
                fullWidth
                size="small"
                label="Start date"
                InputLabelProps={{ shrink: true }}
                helperText="Date from which extra payments start."
              />
              {prepayment.extraEMIMonthly > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {formatCurrency(prepayment.extraEMIMonthly)} / month
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Stack>
      </Paper>

      <Divider />

      {/* One-time Lump Sum */}
      <Paper variant="outlined" sx={sectionPaperSx}>
        <Stack spacing={2}>
          <Typography fontWeight={700} fontSize={12} letterSpacing={1} textTransform="uppercase" color="text.secondary">
            One-time Lump Sum
          </Typography>
          <FormControlLabel
            control={<Switch checked={prepayment.lumpSumEnabled ?? false} onChange={handleLumpSumEnabledChange} />}
            label={<Typography variant="body2" color="text.primary" fontWeight={500}>Enable lump sum payment</Typography>}
          />
          {prepayment.lumpSumEnabled && (
            <Stack spacing={2}>
              <TextField
                type="date"
                value={prepayment.lumpSumPayment?.date || ''}
                onChange={handleLumpSumDateChange}
                fullWidth
                size="small"
                label="Payment date"
                InputLabelProps={{ shrink: true }}
                helperText="Date you plan to make the lump sum payment."
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[{ label: '+1 year', years: 1 }, { label: '+5 years', years: 5 }, { label: '+10 years', years: 10 }].map((opt) => (
                  <Chip
                    key={opt.years}
                    label={opt.label}
                    size="small"
                    variant="outlined"
                    onClick={() => handleLumpSumQuickDate(opt.years)}
                    sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
                  />
                ))}
              </Box>
              <TextField
                type="number"
                value={prepayment.lumpSumPayment?.amount || ''}
                onChange={handleLumpSumAmountChange}
                placeholder="2,00,000"
                fullWidth
                size="small"
                label="Amount"
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                inputProps={{ min: 0, step: 100000 }}
                helperText="E.g., bonus, inheritance, savings."
              />
              {(prepayment.lumpSumPayment?.amount ?? 0) > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Selected</Typography>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {formatCurrency(prepayment.lumpSumPayment?.amount ?? 0)}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
