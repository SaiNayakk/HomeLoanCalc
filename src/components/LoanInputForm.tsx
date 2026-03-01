import type { LoanInput } from '../engine';
import { Box, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';

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

  const handleProcessingFeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onInputChange({ ...input, processingFees: value });
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
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'stretch', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
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
              <Typography
                sx={{
                  minWidth: { xs: 'auto', sm: 150 },
                  textAlign: { xs: 'left', sm: 'right' },
                }}
                fontSize={18}
                fontWeight={700}
                color="#0f172a"
              >
                ₹{input.principal.toLocaleString('en-IN')}
              </Typography>
            </Box>
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
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'stretch', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
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
              <Typography
                sx={{
                  minWidth: { xs: 'auto', sm: 120 },
                  textAlign: { xs: 'left', sm: 'right' },
                }}
                fontSize={18}
                fontWeight={700}
                color="#0f172a"
              >
                {input.annualRate.toFixed(2)}%
              </Typography>
            </Box>
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
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'stretch', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <TextField
                type="number"
                value={input.tenureMonths || ''}
                onChange={handleTenureChange}
                placeholder="240"
                fullWidth
                variant="outlined"
                inputProps={{ min: 1, max: 600, step: 1 }}
              />
              <Typography
                sx={{
                  minWidth: { xs: 'auto', sm: 140 },
                  textAlign: { xs: 'left', sm: 'right' },
                }}
                fontSize={18}
                fontWeight={700}
                color="#0f172a"
              >
                {Math.floor(input.tenureMonths / 12)}y {input.tenureMonths % 12}m
              </Typography>
            </Box>
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
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'stretch', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <TextField
                type="date"
                value={input.emiStartDate || ''}
                onChange={handleEMIStartDateChange}
                fullWidth
                variant="outlined"
                inputProps={{}}
              />
              <Typography
                sx={{
                  minWidth: { xs: 'auto', sm: 160 },
                  textAlign: { xs: 'left', sm: 'right' },
                }}
                fontSize={14}
                fontWeight={700}
                color="#0f172a"
              >
                {input.emiStartDate
                  ? new Date(input.emiStartDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                  : '—'}
              </Typography>
            </Box>
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
              🧾 Processing Fees
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'stretch', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <TextField
                type="number"
                value={input.processingFees || ''}
                onChange={handleProcessingFeesChange}
                placeholder="0"
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 1000 }}
              />
              <Typography
                sx={{
                  minWidth: { xs: 'auto', sm: 150 },
                  textAlign: { xs: 'left', sm: 'right' },
                }}
                fontSize={18}
                fontWeight={700}
                color="#0f172a"
              >
                ₹{(input.processingFees ?? 0).toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
