import type { LoanCalculation } from '../engine';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { formatCurrency } from '../utils/formatters';

interface ExportActionsProps {
  calculation: LoanCalculation;
  variant?: 'card' | 'header';
  shareState?: unknown;
}

export function ExportActions({ calculation, variant = 'card', shareState }: ExportActionsProps) {
  const exportToPDF = () => {
    const { principal, annualRate, tenureMonths } = calculation.input;
    const { monthlyEMI, totalInterest, totalPayable } = calculation;

    const html = `<html><head><style>
body { font-family: Arial, sans-serif; padding: 20px; }
h1 { color: #2563eb; }
table { width: 100%; border-collapse: collapse; margin-top: 16px; }
td, th { padding: 8px 12px; border: 1px solid #e2e8f0; text-align: left; }
th { background: #f1f5f9; font-weight: 700; }
.highlight { color: #2563eb; font-weight: 700; }
</style></head>
<body>
<h1>🏠 Home Loan Summary</h1>
<table>
  <thead>
    <tr><th>Parameter</th><th>Value</th></tr>
  </thead>
  <tbody>
    <tr><td>Principal Amount</td><td>${formatCurrency(principal)}</td></tr>
    <tr><td>Annual Interest Rate</td><td>${annualRate}%</td></tr>
    <tr><td>Tenure</td><td>${tenureMonths} months (${Math.round(tenureMonths / 12)} years)</td></tr>
    <tr><td>Monthly EMI</td><td class="highlight">${formatCurrency(monthlyEMI)}</td></tr>
    <tr><td>Total Interest</td><td>${formatCurrency(totalInterest)}</td></tr>
    <tr><td>Total Payable</td><td class="highlight">${formatCurrency(totalPayable)}</td></tr>
  </tbody>
</table>
</body></html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.srcdoc = html;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow!.focus();
      iframe.contentWindow!.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };

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

  const copyResults = () => {
    const { principal, annualRate, tenureMonths } = calculation.input;
    const years = Math.floor(tenureMonths / 12);
    const months = tenureMonths % 12;
    const text = [
      '🏠 Home Loan Summary',
      '─────────────────────',
      `Principal:     ${formatCurrency(principal)}`,
      `Rate:          ${annualRate}% p.a.`,
      `Tenure:        ${years}y ${months}m`,
      '─────────────────────',
      `Monthly EMI:   ${formatCurrency(calculation.monthlyEMI)}`,
      `Total Interest:${formatCurrency(calculation.totalInterest)}`,
      `Total Payable: ${formatCurrency(calculation.totalPayable)}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  };

  const shareCalculation = () => {
    const url = new URL(window.location.href);
    // Clear existing params
    url.search = '';
    const { principal, annualRate, tenureMonths, emiStartDate, processingFees } = calculation.input;
    url.searchParams.set('p', String(principal));
    url.searchParams.set('r', String(annualRate));
    url.searchParams.set('t', String(tenureMonths));
    if (emiStartDate) url.searchParams.set('s', emiStartDate);
    if (processingFees) url.searchParams.set('f', String(processingFees));
    // Advanced state as compact JSON if provided
    if (shareState) {
      const adv = shareState as Record<string, unknown>;
      if (adv.prepayment && (adv.prepayment as Record<string,unknown>).extraEMIMonthly) {
        url.searchParams.set('adv', encodeURIComponent(JSON.stringify(shareState)));
      }
    }
    navigator.clipboard.writeText(url.toString()).then(() => alert('Share link copied to clipboard!'));
  };

  const printSchedule = () => {
    window.print();
  };

  if (variant === 'header') {
    return (
      <Stack direction="row" spacing={0.75}>
        <Button size="small" variant="contained" color="primary" onClick={exportToCSV}>
          CSV
        </Button>
        <Button size="small" variant="text" onClick={printSchedule} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
          Print
        </Button>
        <Button size="small" variant="outlined" onClick={exportToPDF} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
          PDF
        </Button>
        <Button size="small" variant="text" onClick={copyResults} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>Copy</Button>
        <Button size="small" variant="outlined" onClick={shareCalculation} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
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
        borderColor: 'divider',
        p: 2.5,
        boxShadow: 'none',
        bgcolor: 'background.paper',
      }}
    >
      <Typography fontWeight={700} fontSize={16} color="text.primary" mb={2}>
        Export & Share
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button variant="contained" color="primary" onClick={exportToCSV}>
          📊 CSV
        </Button>
        <Button variant="contained" color="secondary" onClick={printSchedule}>
          🖨️ Print
        </Button>
        <Button variant="outlined" onClick={exportToPDF}>
          📄 PDF
        </Button>
        <Button variant="text" onClick={copyResults}>📋 Copy</Button>
        <Button variant="outlined" onClick={shareCalculation}>
          🔗 Share
        </Button>
      </Stack>
    </Paper>
  );
}
