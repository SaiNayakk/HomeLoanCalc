import type { AmortizationRow } from '../engine';
import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../utils/formatters';

interface AmortizationTableProps {
  schedule: AmortizationRow[];
  emiStartDate?: string;
}

interface YearlyRow {
  year: number;
  openingBalance: number;
  totalEMI: number;
  totalPrincipal: number;
  totalInterest: number;
  closingBalance: number;
  startDate?: string;
}

function getDateForMonth(startDate: string | undefined, monthOffset: number): string {
  if (!startDate) return `Month ${monthOffset}`;
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + monthOffset - 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function getYearLabel(startDate: string | undefined, year: number): string {
  if (!startDate) return `Year ${year}`;
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + (year - 1) * 12);
  return `${date.getFullYear()} (Year ${year})`;
}

function aggregateByYear(schedule: AmortizationRow[]): YearlyRow[] {
  const map = new Map<number, YearlyRow>();
  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    if (!map.has(year)) {
      map.set(year, {
        year,
        openingBalance: row.openingBalance,
        totalEMI: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        closingBalance: 0,
      });
    }
    const y = map.get(year)!;
    y.totalEMI += row.emiPayment;
    y.totalPrincipal += row.principal;
    y.totalInterest += row.interest;
    y.closingBalance = row.closingBalance;
  }
  return Array.from(map.values());
}

const ROWS_PER_PAGE = 24;

export function AmortizationTable({ schedule, emiStartDate }: AmortizationTableProps) {
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [page, setPage] = useState(0);

  const yearlyRows = aggregateByYear(schedule);

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newMode: 'monthly' | 'yearly' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
      setPage(0);
    }
  };

  const headCellSx = { fontWeight: 700, color: 'text.primary', bgcolor: 'background.default' };

  if (viewMode === 'yearly') {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            size="small"
          >
            <ToggleButton value="monthly" sx={{ fontWeight: 600, fontSize: 12 }}>Monthly</ToggleButton>
            <ToggleButton value="yearly" sx={{ fontWeight: 600, fontSize: 12 }}>Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Year</TableCell>
                <TableCell align="right" sx={headCellSx}>Opening Balance</TableCell>
                <TableCell align="right" sx={headCellSx}>Total EMI</TableCell>
                <TableCell align="right" sx={headCellSx}>Principal</TableCell>
                <TableCell align="right" sx={headCellSx}>Interest</TableCell>
                <TableCell align="right" sx={headCellSx}>Closing Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {yearlyRows.map((row) => (
                <TableRow
                  key={row.year}
                  hover
                  sx={{
                    bgcolor:
                      row.year === 1
                        ? 'rgba(99,102,241,0.05)'
                        : row.year === yearlyRows.length
                          ? 'rgba(16,185,129,0.05)'
                          : 'inherit',
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {getYearLabel(emiStartDate, row.year)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {formatCurrency(row.openingBalance)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {formatCurrency(row.totalEMI)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#16a34a', fontWeight: 600 }}>
                    {formatCurrency(row.totalPrincipal)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#f97316', fontWeight: 600 }}>
                    {formatCurrency(row.totalInterest)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {formatCurrency(row.closingBalance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Paper
          variant="outlined"
          sx={{ mt: 2, p: 1.5, borderRadius: 2, borderColor: 'divider', bgcolor: 'background.default', boxShadow: 'none' }}
        >
          <Typography fontSize={12} color="text.secondary">
            <strong>Yearly view:</strong> Each row aggregates 12 months of EMI payments. Download CSV for monthly detail.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Monthly view with pagination
  const totalRows = schedule.length;
  const paginatedRows = schedule.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} size="small">
          <ToggleButton value="monthly" sx={{ fontWeight: 600, fontSize: 12 }}>Monthly</ToggleButton>
          <ToggleButton value="yearly" sx={{ fontWeight: 600, fontSize: 12 }}>Yearly</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headCellSx}>Date / Month</TableCell>
              <TableCell align="right" sx={headCellSx}>Opening Balance</TableCell>
              <TableCell align="right" sx={headCellSx}>EMI</TableCell>
              <TableCell align="right" sx={headCellSx}>Principal</TableCell>
              <TableCell align="right" sx={headCellSx}>Interest</TableCell>
              <TableCell align="right" sx={headCellSx}>Closing Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => {
              const isFirstMonth = row.month === 1;
              const isLastMonth = row.month === schedule[schedule.length - 1].month;
              return (
                <TableRow
                  key={row.month}
                  hover
                  sx={{
                    bgcolor: isFirstMonth
                      ? 'rgba(99,102,241,0.05)'
                      : isLastMonth
                        ? 'rgba(16,185,129,0.05)'
                        : 'inherit',
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {getDateForMonth(emiStartDate, row.month)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {formatCurrency(row.openingBalance)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {formatCurrency(row.emiPayment)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#16a34a', fontWeight: 600 }}>
                    {formatCurrency(row.principal)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#f97316', fontWeight: 600 }}>
                    {formatCurrency(row.interest)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {formatCurrency(row.closingBalance)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={ROWS_PER_PAGE}
        rowsPerPageOptions={[ROWS_PER_PAGE]}
        labelDisplayedRows={({ from, to, count }) => `Months ${from}–${to} of ${count}`}
        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
      />
    </Box>
  );
}
