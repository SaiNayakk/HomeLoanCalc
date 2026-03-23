# HomeLoanCalc

A smart, feature-rich home loan EMI calculator built with React and TypeScript. Handles real-world loan scenarios including prepayments, variable interest rates, EMI step-ups, and more.

**Live:** [loancalc-saiworks.nncs.in](https://loancalc-saiworks.nncs.in)

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tool and dev server
- **MUI (Material UI v7)** — component library
- **Tailwind CSS** — utility styling
- **Recharts** — charts and visualizations
- **vite-plugin-pwa** — Progressive Web App support

## Features

### Core Calculator
- EMI calculation with principal, interest rate, tenure, and optional processing fees
- Loan summary: EMI, total interest, total payment, effective cost
- Loan progress tracker (how much principal is paid off)
- Shareable URLs — readable format (`?p=...&r=...&t=...`) and legacy JSON state

### Prepayment Options
- Extra monthly EMI with configurable frequency (monthly, quarterly, yearly, etc.)
- Prepayment start date
- One-time lump-sum prepayment on a specific date

### Advanced Options
- **Variable rate scenarios** — multiple rate change periods with date ranges
- **Rate change mode** — choose between reducing EMI or reducing tenure on rate changes
- **EMI step-up** — automatic EMI increase by a percentage at a set interval

### Analysis & Comparisons
- Scenario comparison — side-by-side view of base vs. prepayment/variable rate/step-up
- Savings suggestions — dynamic scenarios showing interest saved under different strategies
- Prepayment impact visualizer
- Interest rate sensitivity — shows how rate changes affect your loan
- EMI payment calendar — month-by-month view

### Financial Planning Tools
- Loan eligibility calculator
- Down payment optimizer
- Rent vs. Buy analysis
- Tax benefit estimator (Section 80C + Section 24B)
- Saved calculations — store and reload loan configurations

### UX
- Dark / light mode (persisted to localStorage)
- Fully responsive — sticky mobile EMI bar on small screens
- Collapse / expand all sections
- Export actions (print, share link)
- Error boundaries around heavy sections
- FAQ section

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Edge Cases Handled

- **Zero or near-zero interest rate** — falls back to simple principal / tenure division
- **Very short tenures** — handles 1–2 month terms without divide-by-zero errors
- **Long tenures** — supports up to 600 months (50 years)
- **Past EMI start date** — shows "Amount pending" instead of "Total amount paid"
- **Variable rate + prepayment** — both are combined correctly in the amortization schedule
- **EMI step-up + prepayment** — step-ups account for extra EMI payments
- **Input validation** — principal > 0, tenure > 0, interest >= 0

## Project Structure

```
src/
  engine/         # Core calculation logic (amortization, prepayment, variable rate)
  components/     # All UI components
  hooks/          # Custom React hooks
  utils/          # Formatters and helpers
```
