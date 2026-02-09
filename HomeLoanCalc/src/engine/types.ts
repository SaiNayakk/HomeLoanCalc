/**
 * Core types for the financial calculation engine
 */

export interface LoanInput {
  /** Loan amount in currency units */
  principal: number;
  /** Annual interest rate as percentage (e.g., 7.5 for 7.5%) */
  annualRate: number;
  /** Loan tenure in months */
  tenureMonths: number;
  /** EMI start date (ISO string) */
  emiStartDate?: string;
}

export interface PrepaymentOptions {
  /** Enable/disable extra EMI payments */
  extraEMIEnabled?: boolean;
  /** Extra EMI payment monthly (recurring) */
  extraEMIMonthly: number;
  /** Frequency of extra EMI payment in months (1 = every month, 12 = yearly) */
  extraEMIFrequencyMonths?: number;
  /** Start date for extra EMI payments (YYYY-MM-DD) */
  extraEMIStartDate?: string;
  /** Enable/disable lump sum payment */
  lumpSumEnabled?: boolean;
  /** Lump sum prepayment in month specified */
  lumpSumPayment?: {
    month: number;
    amount: number;
    date?: string;
  };
}

export interface VariableRateScenario {
  /** Rate changes at specific months */
  changes: Array<{
    month: number;
    newRate: number;
  }>;
  /** Date-based rate ranges for UI */
  ranges?: Array<{
    startDate: string;
    endDate: string;
    rate: number;
  }>;
  /** How to handle rate change: keep EMI or keep tenure */
  rateChangeMode?: 'reduce-tenure' | 'reduce-emi';
}

export interface EMIStepUpScenario {
  /** EMI increases by this percentage at specified intervals */
  stepUpPercentage: number;
  /** Months between step-ups */
  intervalMonths: number;
}

export interface AmortizationRow {
  /** Month number (1-based) */
  month: number;
  /** Beginning balance for the month */
  openingBalance: number;
  /** EMI payment amount */
  emiPayment: number;
  /** Principal portion of EMI */
  principal: number;
  /** Interest portion of EMI */
  interest: number;
  /** Extra principal paid (prepayment) */
  extraPrincipal: number;
  /** Remaining balance after payment */
  closingBalance: number;
  /** Current annual interest rate */
  currentRate: number;
}

export interface LoanCalculation {
  /** Input parameters */
  input: LoanInput;
  /** Monthly EMI amount */
  monthlyEMI: number;
  /** Total amount to be paid over loan tenure */
  totalPayable: number;
  /** Total interest payable */
  totalInterest: number;
  /** Complete amortization schedule */
  schedule: AmortizationRow[];
  /** Actual tenure in months (considering prepayments) */
  actualTenureMonths: number;
  /** Total extra payments made */
  totalExtraPayments: number;
}

export interface EMIResult {
  /** Monthly EMI payment */
  emi: number;
  /** Total amount payable */
  totalPayable: number;
  /** Total interest */
  totalInterest: number;
}

export interface LoanScenario {
  name: string;
  input: LoanInput;
  prepayment?: PrepaymentOptions;
  monthlyEMI: number;
  totalInterest: number;
  actualTenure: number;
}

