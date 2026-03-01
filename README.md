# HomeLoanCalc – EMI Edge Cases

This app handles a number of edge cases in EMI calculations and scenarios. Key cases supported:

- Zero or near-zero interest rate: EMI falls back to simple principal/tenure division.
- Very short tenures: Handles 1–2 month terms without divide-by-zero issues.
- Long tenures: Supports up to 600 months (50 years) in schedules.
- EMI start date in the past: Shows “Amount pending” instead of “Total amount paid.”
- Prepayment frequency: Extra EMI can be monthly, quarterly, yearly, etc. via frequency in months.
- Prepayment start date: Extra EMI can start from a specific date.
- Lump-sum prepayment: Single payment on a chosen date (or month fallback).
- Variable rate periods: Multiple consecutive rate changes across date ranges.
- Rate change mode: Choose between reducing EMI or reducing tenure when rate changes.
- Variable rate with prepayment: Both are combined in schedule calculation.
- EMI step-up with prepayment: Step-ups account for extra EMI payments.
- Input validation: Principal > 0, tenure > 0, and non-negative interest.

Notes:
- Savings are computed against the base schedule (no prepayment).
- Scenario comparison uses incremental savings between scenarios.
