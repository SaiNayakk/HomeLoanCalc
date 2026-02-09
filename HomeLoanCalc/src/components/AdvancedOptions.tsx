import { useState } from 'react';
import type { VariableRateScenario, EMIStepUpScenario } from '../engine';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

interface AdvancedOptionsProps {
  showVariableRate: boolean;
  onShowVariableRateChange: (show: boolean) => void;
  variableRate: VariableRateScenario;
  onVariableRateChange: (rate: VariableRateScenario) => void;
  emiStartDate?: string;
  tenureMonths?: number;

  showEMIStepUp: boolean;
  onShowEMIStepUpChange: (show: boolean) => void;
  emiStepUp: EMIStepUpScenario;
  onEMIStepUpChange: (stepUp: EMIStepUpScenario) => void;
}

const addMonths = (dateStr: string, months: number) => {
  const date = new Date(dateStr);
  const next = new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
  return next.toISOString().split('T')[0];
};

export function AdvancedOptions({
  showVariableRate,
  onShowVariableRateChange,
  variableRate,
  onVariableRateChange,
  emiStartDate,
  tenureMonths,
  showEMIStepUp,
  onShowEMIStepUpChange,
  emiStepUp,
  onEMIStepUpChange,
}: AdvancedOptionsProps) {
  const [showRangeError, setShowRangeError] = useState(false);
  const endDate = emiStartDate && tenureMonths ? addMonths(emiStartDate, tenureMonths) : undefined;

  const ensureRanges = () => {
    if (!emiStartDate || !endDate) {
      return [] as Array<{ startDate: string; endDate: string; rate: number }>;
    }
    const existing = variableRate.ranges && variableRate.ranges.length > 0
      ? variableRate.ranges
      : [{ startDate: emiStartDate, endDate, rate: variableRate.changes[0]?.newRate || 8 }];

    const normalized = existing.map((range, index) => {
      const start = index === 0 ? emiStartDate : range.startDate;
      const isLast = index === existing.length - 1;
      const end = isLast
        ? (range.endDate && range.endDate !== range.startDate ? range.endDate : endDate)
        : range.endDate;
      return { ...range, startDate: start, endDate: end };
    });

    return normalized;
  };

  const buildChanges = (ranges: Array<{ startDate: string; endDate: string; rate: number }>) => {
    if (!emiStartDate) {
      return variableRate.changes;
    }
    const changes = ranges
      .map((range) => {
        const start = new Date(range.startDate);
        const base = new Date(emiStartDate);
        const monthIndex = (start.getFullYear() - base.getFullYear()) * 12 + (start.getMonth() - base.getMonth()) + 1;
        return { month: Math.max(1, monthIndex), newRate: range.rate };
      })
      .sort((a, b) => a.month - b.month);
    return changes;
  };

  const updateRanges = (ranges: Array<{ startDate: string; endDate: string; rate: number }>) => {
    const normalized = ranges.map((range, index) => {
      const prev = ranges[index - 1];
      const start = index === 0 ? (emiStartDate || range.startDate) : prev.endDate;
      const isLast = index === ranges.length - 1;
      let end = isLast ? range.endDate : range.endDate;
      if (endDate && isLast) {
        end = new Date(end) > new Date(endDate) ? endDate : end;
      }
      return { ...range, startDate: start, endDate: end };
    });

    onVariableRateChange({
      ...variableRate,
      ranges: normalized,
      changes: buildChanges(normalized),
    });
  };

  const handleAddRange = () => {
    if (!emiStartDate || !endDate) {
      return;
    }
    const ranges = ensureRanges();
    const last = ranges[ranges.length - 1];
    const next = {
      startDate: last.endDate,
      endDate,
      rate: last.rate,
    };
    updateRanges([...ranges.slice(0, -1), { ...last, endDate: next.startDate }, next]);
  };

  const handleRemoveRange = (index: number) => {
    const ranges = ensureRanges();
    if (ranges.length <= 1) {
      return;
    }
    const updated = ranges.filter((_, idx) => idx !== index);
    updateRanges(updated);
  };

  const handleRangeChange = (index: number, key: 'endDate' | 'rate', value: string) => {
    const ranges = ensureRanges();
    const updated = ranges.map((range, idx) => {
      if (idx !== index) {
        return range;
      }
      if (key === 'endDate') {
        return { ...range, endDate: value };
      }
      return { ...range, rate: parseFloat(value) || range.rate };
    });
    const isLast = index === ranges.length - 1;
    if (key === 'endDate' && isLast && endDate && value && value !== endDate) {
      const next = {
        startDate: value,
        endDate,
        rate: updated[index].rate,
      };
      updateRanges([...updated, next]);
      return;
    }
    updateRanges(updated);
  };

  const ranges = ensureRanges();
  const isLastRangeLocked = ranges.length > 0 && endDate ? ranges[ranges.length - 1].endDate === endDate : false;
  const isLastEndValid = ranges.length > 0 && endDate ? ranges[ranges.length - 1].endDate === endDate : false;

  const handleApplyRates = () => {
    if (!isLastEndValid) {
      setShowRangeError(true);
      return;
    }
    setShowRangeError(false);
  };

  return (
    <>
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
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography fontWeight={700} fontSize={13} letterSpacing={1} textTransform="uppercase" color="#0f172a">
              Rate Changes
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showVariableRate}
                  onChange={(e) => onShowVariableRateChange(e.target.checked)}
                  color="primary"
                />
              }
              label=""
            />
          </Box>
          <Typography fontSize={12} color="#64748b">
            Add multiple rate periods. Dates are kept continuous automatically, and the last period ends with your loan.
          </Typography>

          {showVariableRate && (
            <Stack spacing={2}>
              <TextField
                select
                label="Rate change effect"
                value={variableRate.rateChangeMode || 'reduce-tenure'}
                onChange={(e) =>
                  onVariableRateChange({
                    ...variableRate,
                    rateChangeMode: e.target.value as VariableRateScenario['rateChangeMode'],
                  })
                }
                fullWidth
                helperText="Choose whether EMI reduces or tenure reduces when rates change."
              >
                <MenuItem value="reduce-tenure">Keep EMI same, reduce tenure</MenuItem>
                <MenuItem value="reduce-emi">Keep tenure same, reduce EMI</MenuItem>
              </TextField>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 2,
                }}
              >
                {ranges.map((range, idx) => (
                  <Paper
                    key={`${range.startDate}-${idx}`}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, borderColor: '#e2e8f0' }}
                  >
                    <Stack spacing={2}>
                      <Typography fontWeight={700} fontSize={12} color="#0f172a">
                        Period {idx + 1}
                      </Typography>
                      <TextField
                        type="date"
                        value={range.startDate}
                        label="From date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        disabled
                      />
                      <TextField
                        type="date"
                        value={range.endDate}
                        label={idx === ranges.length - 1 ? 'To date' : 'To date'}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        onChange={(e) => handleRangeChange(idx, 'endDate', e.target.value)}
                      />
                      <TextField
                        type="number"
                        value={range.rate}
                        onChange={(e) => handleRangeChange(idx, 'rate', e.target.value)}
                        label="Rate for this period"
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        inputProps={{ step: 0.25 }}
                        fullWidth
                      />
                      {idx > 0 && (
                        <button
                          type="button"
                          style={{
                            alignSelf: 'flex-start',
                            border: '1px solid #e2e8f0',
                            borderRadius: 999,
                            padding: '6px 12px',
                            background: '#fff',
                            fontSize: 12,
                            color: '#0f172a',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleRemoveRange(idx)}
                        >
                          Remove period
                        </button>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Box>
              <button
                type="button"
                style={{
                  alignSelf: 'flex-start',
                  border: '1px solid #e2e8f0',
                  borderRadius: 999,
                  padding: '6px 12px',
                  background: '#fff',
                  fontSize: 12,
                  color: '#0f172a',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={handleAddRange}
              >
                + Add rate period
              </button>
              <Button
                variant="contained"
                sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
                onClick={handleApplyRates}
                disabled={!isLastEndValid}
              >
                Apply rate changes
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

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
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography fontWeight={700} fontSize={13} letterSpacing={1} textTransform="uppercase" color="#0f172a">
              EMI Step-Up (Salary Growth)
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showEMIStepUp}
                  onChange={(e) => onShowEMIStepUpChange(e.target.checked)}
                  color="primary"
                />
              }
              label=""
            />
          </Box>
          <Typography fontSize={12} color="#64748b">
            Simulate increasing EMI as your salary grows over years.
          </Typography>

          {showEMIStepUp && (
            <Stack spacing={2}>
              <TextField
                type="number"
                value={emiStepUp.stepUpPercentage}
                onChange={(e) => {
                  const percentage = parseFloat(e.target.value) || 10;
                  onEMIStepUpChange({
                    stepUpPercentage: percentage,
                    intervalMonths: emiStepUp.intervalMonths,
                  });
                }}
                label="Increase % Every Interval"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ min: 1, max: 50, step: 1 }}
                fullWidth
              />
              <TextField
                type="number"
                value={emiStepUp.intervalMonths}
                onChange={(e) => {
                  const months = parseInt(e.target.value, 10) || 12;
                  onEMIStepUpChange({
                    stepUpPercentage: emiStepUp.stepUpPercentage,
                    intervalMonths: months,
                  });
                }}
                label="Increase Every (Months)"
                inputProps={{ min: 1, step: 12 }}
                fullWidth
              />
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
    <Snackbar
      open={showRangeError}
      autoHideDuration={3000}
      onClose={() => setShowRangeError(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="warning" variant="filled" onClose={() => setShowRangeError(false)}>
        The last period must end on the loan end date before you can apply changes.
      </Alert>
    </Snackbar>
    </>
  );
}
