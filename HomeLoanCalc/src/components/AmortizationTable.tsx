import type { AmortizationRow } from '../engine';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

interface AmortizationTableProps {
  schedule: AmortizationRow[];
  emiStartDate?: string;
}

function getDateForMonth(startDate: string | undefined, monthOffset: number): string {
  if (!startDate) return `Month ${monthOffset}`;
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + monthOffset - 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function AmortizationTable({ schedule, emiStartDate }: AmortizationTableProps) {
  const displayRows =
    schedule.length <= 24
      ? schedule
      : [
          ...schedule.slice(0, 12),
          { month: 0, openingBalance: 0, emiPayment: 0, principal: 0, interest: 0, closingBalance: 0 } as AmortizationRow,
          ...schedule.slice(-11),
        ];

  return (
    <Box>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: '#e2e8f0',
          boxShadow: 'none',
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Date / Month</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Opening Balance</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>EMI</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Principal</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Interest</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Closing Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRows.map((row, idx) => {
              if (row.month === 0) {
                return (
                  <TableRow key={`separator-${idx}`} sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell colSpan={6} align="center" sx={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>
                      ⋯ {schedule.length - 23} months omitted ⋯
                    </TableCell>
                  </TableRow>
                );
              }

              const isFirstMonth = row.month === 1;
              const isLastMonth = row.month === schedule[schedule.length - 1].month;

              return (
                <TableRow
                  key={row.month}
                  hover
                  sx={{
                    backgroundColor: isFirstMonth ? '#eef2ff' : isLastMonth ? '#ecfdf5' : 'inherit',
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>
                    {getDateForMonth(emiStartDate, row.month)}
                  </TableCell>
                  <TableCell align="right">
                    ₹{row.openingBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ₹{row.emiPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#16a34a', fontWeight: 600 }}>
                    ₹{row.principal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#f97316', fontWeight: 600 }}>
                    ₹{row.interest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ₹{row.closingBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Paper
        variant="outlined"
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 2,
          borderColor: '#e2e8f0',
          backgroundColor: '#f8fafc',
          boxShadow: 'none',
        }}
      >
        <Typography fontSize={12} color="#475569">
          <strong>Legend:</strong> Table shows first 12 and last 12 months. Download CSV for the full schedule.
        </Typography>
      </Paper>
    </Box>
  );
}
