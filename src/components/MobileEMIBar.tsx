import type { LoanCalculation } from '../engine';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { formatCurrency } from '../utils/formatters';

interface MobileEMIBarProps {
  calculation: LoanCalculation | null;
}

export function MobileEMIBar({ calculation }: MobileEMIBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile || !calculation) return null;

  const { monthlyEMI, schedule } = calculation;
  const firstRow = schedule[0];
  const principalPart = firstRow?.principal ?? 0;
  const interestPart = firstRow?.interest ?? 0;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        px: 2.5,
        py: 1.5,
        borderRadius: '16px 16px 0 0',
        bgcolor: 'background.paper',
        borderTop: '2px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          textTransform="uppercase"
          letterSpacing={0.8}
          display="block"
        >
          Monthly EMI
        </Typography>
        <Typography fontSize={22} fontWeight={800} color="primary.main" lineHeight={1.2}>
          {formatCurrency(monthlyEMI)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2.5 }}>
        <Box textAlign="center">
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
            Principal
          </Typography>
          <Typography fontSize={13} fontWeight={700} color="#10b981">
            {formatCurrency(principalPart)}
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
            Interest
          </Typography>
          <Typography fontSize={13} fontWeight={700} color="#f97316">
            {formatCurrency(interestPart)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
