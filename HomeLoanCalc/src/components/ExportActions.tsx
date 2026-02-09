import type { LoanCalculation } from '../engine';
import { Button, Paper, Stack, Typography } from '@mui/material';

interface ExportActionsProps {
  calculation: LoanCalculation;
  variant?: 'card' | 'header';
  shareState?: unknown;
}

export function ExportActions({ calculation, variant = 'card', shareState }: ExportActionsProps) {
  const exportToCSV = () => {
    const headers = [
      'Month',
      'Opening Balance',
      'EMI Payment',
      'Principal',
      'Interest',
      'Extra Principal',
      'Closing Balance',
      'Current Rate',
    ];

    const rows = calculation.schedule.map((row) => [
      row.month,
      row.openingBalance,
      row.emiPayment,
      row.principal,
      row.interest,
      row.extraPrincipal,
      row.closingBalance,
      row.currentRate,
    ]);

    const csvContent = [
      headers.join(','),
      `"Loan Amount","${calculation.input.principal}"`,
      `"Interest Rate","${calculation.input.annualRate}%"`,
      `"Tenure (months)","${calculation.input.tenureMonths}"`,
      `"Actual Tenure (months)","${calculation.actualTenureMonths}"`,
      `"Monthly EMI","${calculation.monthlyEMI}"`,
      `"Total Interest","${calculation.totalInterest}"`,
      `"Total Payable","${calculation.totalPayable}"`,
      '',
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `loan-schedule-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareCalculation = () => {
    const url = new URL(window.location.href);
    const payload =
      shareState ??
      {
        input: {
          principal: calculation.input.principal,
          annualRate: calculation.input.annualRate,
          tenureMonths: calculation.input.tenureMonths,
          emiStartDate: calculation.input.emiStartDate,
        },
      };
    url.searchParams.set('state', encodeURIComponent(JSON.stringify(payload)));

    navigator.clipboard.writeText(url.toString()).then(() => {
      alert('Share link copied to clipboard!');
    });
  };

  const printSchedule = () => {
    window.print();
  };

  if (variant === 'header') {
    return (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="contained" color="primary" onClick={exportToCSV}>
          CSV
        </Button>
        <Button size="small" variant="text" onClick={printSchedule}>
          Print
        </Button>
        <Button size="small" variant="outlined" onClick={shareCalculation}>
          Share
        </Button>
      </Stack>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: '#e2e8f0',
        p: 2.5,
        boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <Typography fontWeight={700} fontSize={16} color="#0f172a" mb={2}>
        Export & Share
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button variant="contained" color="primary" onClick={exportToCSV}>
          📊 CSV
        </Button>
        <Button variant="contained" color="secondary" onClick={printSchedule}>
          🖨️ Print
        </Button>
        <Button variant="outlined" onClick={shareCalculation}>
          🔗 Share
        </Button>
      </Stack>
    </Paper>
  );
}
