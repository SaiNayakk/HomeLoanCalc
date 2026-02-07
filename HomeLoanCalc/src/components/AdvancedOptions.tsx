import type { VariableRateScenario, EMIStepUpScenario } from '../engine';
import {
  Box,
  FormControlLabel,
  InputAdornment,
  Paper,
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

  showEMIStepUp: boolean;
  onShowEMIStepUpChange: (show: boolean) => void;
  emiStepUp: EMIStepUpScenario;
  onEMIStepUpChange: (stepUp: EMIStepUpScenario) => void;
}

export function AdvancedOptions({
  showVariableRate,
  onShowVariableRateChange,
  variableRate,
  onVariableRateChange,
  showEMIStepUp,
  onShowEMIStepUpChange,
  emiStepUp,
  onEMIStepUpChange,
}: AdvancedOptionsProps) {
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
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography fontWeight={700} fontSize={13} letterSpacing={1} textTransform="uppercase" color="#0f172a">
              📈 Rate Hike Scenario
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
            What if interest rates increase after a few years?
          </Typography>

          {showVariableRate && (
            <Stack spacing={2}>
              <TextField
                type="number"
                value={variableRate.changes[0]?.newRate || 8}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value) || 7.5;
                  onVariableRateChange({
                    changes: [
                      {
                        month: variableRate.changes[0]?.month || 61,
                        newRate,
                      },
                    ],
                  });
                }}
                label="New Rate"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ step: 0.25 }}
                fullWidth
              />
              <TextField
                type="number"
                value={variableRate.changes[0]?.month || 61}
                onChange={(e) => {
                  const month = parseInt(e.target.value, 10) || 61;
                  onVariableRateChange({
                    changes: [
                      {
                        month,
                        newRate: variableRate.changes[0]?.newRate || 8,
                      },
                    ],
                  });
                }}
                label="After Month"
                inputProps={{ min: 1, step: 12 }}
                fullWidth
              />
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
              💪 EMI Step-Up (Salary Growth)
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
  );
}
