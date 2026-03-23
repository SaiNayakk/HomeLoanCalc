import type { LoanInput } from '../engine';
import {
  Box,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import { formatCompact } from '../utils/formatters';

interface LoanInputFormProps {
  input: LoanInput;
  onInputChange: (input: LoanInput) => void;
  headerActions?: React.ReactNode;
}

const LOAN_PRESETS = [
  { label: '₹20 L', value: 2_000_000 },
  { label: '₹30 L', value: 3_000_000 },
  { label: '₹50 L', value: 5_000_000 },
  { label: '₹1 Cr', value: 10_000_000 },
  { label: '₹2 Cr', value: 20_000_000 },
];

function getErrors(input: LoanInput) {
  return {
    principal:
      input.principal <= 0
        ? 'Enter a loan amount'
        : input.principal < 100_000
          ? 'Minimum ₹1 Lakh'
          : '',
    annualRate:
      input.annualRate <= 0
        ? 'Rate must be greater than 0%'
        : input.annualRate > 30
          ? 'Rate cannot exceed 30%'
          : '',
    tenureMonths:
      input.tenureMonths < 1
        ? 'Minimum 1 month'
        : input.tenureMonths > 600
          ? 'Maximum 600 months'
          : '',
  };
}

function FieldLabel({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography
        fontSize={11}
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing={1}
        color="text.secondary"
      >
        {icon} {label}
      </Typography>
      <Typography fontSize={17} fontWeight={800} color="text.primary">
        {value}
      </Typography>
    </Box>
  );
}

export function LoanInputForm({ input, onInputChange, headerActions }: LoanInputFormProps) {
  const errors = getErrors(input);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        alignSelf: { xs: 'auto', md: 'stretch' },
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          px: 3,
          py: 1.75,
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography fontWeight={800} fontSize={14} color="text.primary" textTransform="uppercase" letterSpacing={0.5}>
          Loan Parameters
        </Typography>
        {headerActions}
      </Box>

      {/* ── Loan Amount ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <FieldLabel
          icon="₹"
          label="Loan Amount"
          value={formatCompact(input.principal)}
        />
        <TextField
          type="number"
          value={input.principal || ''}
          onChange={(e) => onInputChange({ ...input, principal: parseFloat(e.target.value) || 0 })}
          placeholder="5000000"
          fullWidth
          size="small"
          error={!!errors.principal}
          helperText={errors.principal || undefined}
          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          inputProps={{ min: 0, step: 100000 }}
        />
        <Slider
          value={Math.min(input.principal, 30_000_000)}
          onChange={(_, val) => onInputChange({ ...input, principal: val as number })}
          min={100_000}
          max={30_000_000}
          step={100_000}
          sx={{ mt: 2, mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {LOAN_PRESETS.map((p) => (
            <Chip
              key={p.value}
              label={p.label}
              size="small"
              variant={input.principal === p.value ? 'filled' : 'outlined'}
              color={input.principal === p.value ? 'primary' : 'default'}
              onClick={() => onInputChange({ ...input, principal: p.value })}
              sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
            />
          ))}
        </Box>
      </Box>

      <Divider />

      {/* ── Interest Rate ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <FieldLabel
          icon="％"
          label="Interest Rate"
          value={`${input.annualRate.toFixed(2)}% p.a.`}
        />
        <TextField
          type="number"
          value={input.annualRate || ''}
          onChange={(e) => onInputChange({ ...input, annualRate: parseFloat(e.target.value) || 0 })}
          placeholder="7.50"
          fullWidth
          size="small"
          error={!!errors.annualRate}
          helperText={errors.annualRate || undefined}
          InputProps={{ endAdornment: <InputAdornment position="end">% p.a.</InputAdornment> }}
          inputProps={{ min: 0, max: 30, step: 0.05 }}
        />
        <Slider
          value={Math.min(Math.max(input.annualRate, 1), 20)}
          onChange={(_, val) => onInputChange({ ...input, annualRate: val as number })}
          min={1}
          max={20}
          step={0.1}
          sx={{ mt: 2, mb: 0.5 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.disabled">1%</Typography>
          <Typography variant="caption" color="text.disabled">20%</Typography>
        </Box>
      </Box>

      <Divider />

      {/* ── Loan Tenure ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <FieldLabel
          icon="⏱"
          label="Loan Tenure"
          value={`${Math.floor(input.tenureMonths / 12)}y ${input.tenureMonths % 12}m`}
        />
        <TextField
          type="number"
          value={input.tenureMonths || ''}
          onChange={(e) => onInputChange({ ...input, tenureMonths: parseInt(e.target.value, 10) || 0 })}
          placeholder="240"
          fullWidth
          size="small"
          error={!!errors.tenureMonths}
          helperText={errors.tenureMonths ? errors.tenureMonths : 'months'}
          inputProps={{ min: 1, max: 600, step: 1 }}
        />
        <Slider
          value={Math.min(Math.max(input.tenureMonths, 12), 360)}
          onChange={(_, val) => onInputChange({ ...input, tenureMonths: val as number })}
          min={12}
          max={360}
          step={6}
          marks={[
            { value: 60, label: '5y' },
            { value: 120, label: '10y' },
            { value: 180, label: '15y' },
            { value: 240, label: '20y' },
            { value: 300, label: '25y' },
            { value: 360, label: '30y' },
          ]}
          sx={{ mt: 2, mb: 1 }}
        />
      </Box>

      <Divider />

      {/* ── EMI Start Date ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
        <Typography fontSize={11} fontWeight={700} textTransform="uppercase" letterSpacing={1} color="text.secondary" mb={1.5}>
          📅 EMI Start Date
        </Typography>
        <TextField
          type="date"
          value={input.emiStartDate || ''}
          onChange={(e) => onInputChange({ ...input, emiStartDate: e.target.value })}
          fullWidth
          size="small"
          inputProps={{}}
        />
      </Box>

      <Divider />

      {/* ── Processing Fees ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
        <Typography fontSize={11} fontWeight={700} textTransform="uppercase" letterSpacing={1} color="text.secondary" mb={1.5}>
          🧾 Processing Fees
        </Typography>
        <TextField
          type="number"
          value={input.processingFees || ''}
          onChange={(e) => onInputChange({ ...input, processingFees: parseFloat(e.target.value) || 0 })}
          placeholder="0"
          fullWidth
          size="small"
          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          inputProps={{ min: 0, step: 1000 }}
        />
      </Box>
    </Paper>
  );
}
