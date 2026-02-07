import type { LoanInput } from '../engine';
import { Box, InputAdornment, Paper, Slider, Stack, TextField, Typography } from '@mui/material';

interface LoanInputFormProps {
  input: LoanInput;
  onInputChange: (input: LoanInput) => void;
}

export function LoanInputForm({ input, onInputChange }: LoanInputFormProps) {
  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onInputChange({ ...input, principal: value });
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onInputChange({ ...input, annualRate: value });
  };

  const handleTenureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    onInputChange({ ...input, tenureMonths: value });
  };

  const handleEMIStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onInputChange({ ...input, emiStartDate: value });
  };

  return (
    <Box component="form">
      <Stack spacing={3}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 1,
            borderColor: '#e2e8f0',
            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
            background: '#ffffff',
          }}
        >
          <Stack spacing={2}>
            <Typography fontWeight={700} fontSize={13} letterSpacing={1} textTransform="uppercase" color="#0f172a">
              💵 Loan Amount
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="nowrap">
              <TextField
                type="number"
                value={input.principal || ''}
                onChange={handlePrincipalChange}
                placeholder="50,00,000"
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 100000 }}
              />
              <Typography minWidth={150} textAlign="right" fontSize={18} fontWeight={700} color="#0f172a">
                ₹{input.principal.toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Slider
              value={input.principal}
              min={100000}
              max={20000000}
              step={100000}
              onChange={(_event, value) => {
                const nextValue = Array.isArray(value) ? value[0] : value;
                onInputChange({ ...input, principal: nextValue });
              }}
            />
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 1,
            borderColor: '#e2e8f0',
            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
            background: '#ffffff',
          }}
        >
          <Stack spacing={2}>
            <Typography fontWeight={700} fontSize={13} letterSpacing={1} textTransform="uppercase" color="#0f172a">
              📊 Interest Rate
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="nowrap">
              <TextField
                type="number"
                value={input.annualRate || ''}
                onChange={handleRateChange}
                placeholder="7.50"
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ min: 0, max: 30, step: 0.01 }}
              />
              <Typography minWidth={120} textAlign="right" fontSize={18} fontWeight={700} color="#0f172a">
                {input.annualRate.toFixed(2)}%
              </Typography>
            </Box>
            <Slider
              value={input.annualRate}
              min={1}
              max={20}
              step={0.1}
              onChange={(_event, value) => {
                const nextValue = Array.isArray(value) ? value[0] : value;
                onInputChange({ ...input, annualRate: nextValue });
              }}
            />
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 1,
            borderColor: '#e2e8f0',
            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
            background: '#ffffff',
          }}
        >
          <Stack spacing={2}>
            <Typography fontWeight={700} fontSize={13} letterSpacing={1} textTransform="uppercase" color="#0f172a">
              ⏱️ Loan Tenure
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="nowrap">
              <TextField
                type="number"
                value={input.tenureMonths || ''}
                onChange={handleTenureChange}
                placeholder="240"
                fullWidth
                variant="outlined"
                inputProps={{ min: 1, max: 600, step: 1 }}
              />
              <Typography minWidth={140} textAlign="right" fontSize={18} fontWeight={700} color="#0f172a">
                {Math.floor(input.tenureMonths / 12)}y {input.tenureMonths % 12}m
              </Typography>
            </Box>
            <Slider
              value={input.tenureMonths}
              min={1}
              max={600}
              step={1}
              onChange={(_event, value) => {
                const nextValue = Array.isArray(value) ? value[0] : value;
                onInputChange({ ...input, tenureMonths: nextValue });
              }}
            />
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 1,
            borderColor: '#e2e8f0',
            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
            background: '#ffffff',
          }}
        >
          <Stack spacing={2}>
            <Typography fontWeight={700} fontSize={13} letterSpacing={1} textTransform="uppercase" color="#0f172a">
              📅 EMI Start Date
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="nowrap">
              <TextField
                type="date"
                value={input.emiStartDate || ''}
                onChange={handleEMIStartDateChange}
                fullWidth
                variant="outlined"
                inputProps={{}}
              />
              <Typography minWidth={160} textAlign="right" fontSize={14} fontWeight={700} color="#0f172a">
                {input.emiStartDate
                  ? new Date(input.emiStartDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                  : '—'}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
