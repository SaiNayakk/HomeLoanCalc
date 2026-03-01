import type { LoanCalculation } from '../engine';
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';

interface ChartsProps {
  calculation: LoanCalculation;
}

export function LoanCharts({ calculation }: ChartsProps) {
  const { schedule } = calculation;
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const totalCharts = 5;
    setVisibleCount(1);

    const timers: Array<ReturnType<typeof setTimeout>> = [];
    for (let i = 2; i <= totalCharts; i += 1) {
      timers.push(
        setTimeout(() => {
          if (isMounted) {
            setVisibleCount(i);
          }
        }, (i - 1) * 350)
      );
    }

    return () => {
      isMounted = false;
      timers.forEach(clearTimeout);
    };
  }, [calculation]);

  const formatShortINR = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1000 && abs < 100000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    if (abs >= 10000000) {
      return `${(value / 10000000).toFixed(1)}Cr`;
    }
    if (abs >= 100000) {
      return `${(value / 100000).toFixed(1)}L`;
    }
    return `${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // Prepare data for loan balance chart
  const balanceChartData = schedule
    .filter((_, idx) => idx % Math.ceil(schedule.length / 50) === 0 || idx === schedule.length - 1) // Sample data for performance
    .map((row) => ({
      month: row.month,
      balance: row.closingBalance,
      monthName: `M${row.month}`,
    }));

  // Prepare data for interest vs principal breakdown by month
  const emiBreakdownData = schedule
    .filter((_, idx) => idx % Math.ceil(schedule.length / 24) === 0 || idx === schedule.length - 1)
    .map((row) => ({
      month: row.month,
      principal: row.principal,
      interest: row.interest,
      monthName: `M${row.month}`,
    }));

  // Prepare data for year-by-year breakdown
  const yearlyData: Array<{
    year: number;
    principal: number;
    interest: number;
    yearLabel: string;
  }> = [];

  for (let year = 1; year <= Math.ceil(schedule.length / 12); year++) {
    const yearStart = (year - 1) * 12;
    const yearEnd = Math.min(year * 12, schedule.length);
    const yearRows = schedule.slice(yearStart, yearEnd);

    const yearPrincipal = yearRows.reduce((sum, row) => sum + row.principal, 0);
    const yearInterest = yearRows.reduce((sum, row) => sum + row.interest, 0);

    yearlyData.push({
      year,
      principal: parseFloat(yearPrincipal.toFixed(0)),
      interest: parseFloat(yearInterest.toFixed(0)),
      yearLabel: `Y${year}`,
    });
  }

  // Data for cumulative interest paid
  const cumulativeData = schedule
    .filter((_, idx) => idx % Math.ceil(schedule.length / 50) === 0 || idx === schedule.length - 1)
    .reduce(
      (acc, row) => {
        const lastCumulative = acc.length > 0 ? acc[acc.length - 1].cumulativeInterest : 0;
        acc.push({
          month: row.month,
          cumulativeInterest: lastCumulative + row.interest,
          cumulativePrincipal: lastCumulative + row.principal,
          monthName: `M${row.month}`,
        });
        return acc;
      },
      [] as Array<{
        month: number;
        cumulativeInterest: number;
        cumulativePrincipal: number;
        monthName: string;
      }>
    );

  // Pie chart data removed (shown in summary)

  return (
    <div className="space-y-10">
      {/* Chart 1: Loan Balance Decline */}
      {visibleCount >= 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📉 Loan Balance Over Time</h3>
        <p className="text-sm text-gray-600 mb-10">Watch your loan balance decrease with each payment</p>
        <div className="h-px w-full bg-gray-200 mb-8"></div>
        <div style={{ marginTop: 24, paddingTop: 16 }}>
          <ResponsiveContainer width="100%" height={300}>
          <LineChart data={balanceChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="monthName"
              tick={{ fontSize: 12 }}
              label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatShortINR}
              label={{ value: 'Balance (₹)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) =>
                `₹${(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              }
              labelFormatter={(label) => `Month ${label}`}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="Outstanding Balance"
            />
          </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Chart 2: Principal vs Interest in EMI */}
      {visibleCount >= 2 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💰 Principal vs Interest Breakdown by Month
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          See how much of your EMI goes to principal vs interest
        </p>
        <div className="h-px w-full bg-gray-200 mb-6"></div>
        <div style={{ marginTop: 24, paddingTop: 16 }}>
          <ResponsiveContainer width="100%" height={300}>
          <BarChart data={emiBreakdownData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="monthName"
              tick={{ fontSize: 12 }}
              label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatShortINR}
              label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) =>
                `₹${(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              }
            />
            <Legend />
            <Bar dataKey="principal" stackId="a" fill="#10b981" name="Principal" />
            <Bar dataKey="interest" stackId="a" fill="#f97316" name="Interest" />
          </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Chart 3: Year-by-Year Principal vs Interest */}
      {visibleCount >= 3 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Year-by-Year Breakdown</h3>
        <p className="text-sm text-gray-600 mb-6">
          Compare principal repaid vs interest paid each year
        </p>
        <div className="h-px w-full bg-gray-200 mb-6"></div>
        <div style={{ marginTop: 24, paddingTop: 16 }}>
          <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="yearLabel"
              tick={{ fontSize: 12 }}
              label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatShortINR}
              label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) =>
                `₹${(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              }
            />
            <Legend />
            <Bar dataKey="principal" fill="#10b981" name="Principal Paid" />
            <Bar dataKey="interest" fill="#f97316" name="Interest Paid" />
          </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Chart 4: Cumulative Interest & Principal */}
      {visibleCount >= 4 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Cumulative Principal vs Interest Paid
        </h3>
        <p className="text-sm text-gray-600 mb-6">Track cumulative payments over the loan period</p>
        <div className="h-px w-full bg-gray-200 mb-6"></div>
        <div style={{ marginTop: 24, paddingTop: 16 }}>
          <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="monthName"
              tick={{ fontSize: 12 }}
              label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatShortINR}
              label={{ value: 'Cumulative (₹)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) =>
                `₹${(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              }
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="cumulativePrincipal"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              name="Principal Paid"
            />
            <Area
              type="monotone"
              dataKey="cumulativeInterest"
              stackId="1"
              stroke="#f97316"
              fill="#f97316"
              name="Interest Paid"
            />
          </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Pie charts removed per request (shown in summary) */}

      {/* Chart 7: Interest Rate Impact */}
      {visibleCount >= 5 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Monthly Interest Paid</h3>
        <p className="text-sm text-gray-600 mb-6">
          Watch how your monthly interest payment decreases over time
        </p>
        <div className="h-px w-full bg-gray-200 mb-6"></div>
        <div style={{ marginTop: 24, paddingTop: 16 }}>
          <ResponsiveContainer width="100%" height={250}>
          <LineChart data={schedule.filter((_, idx) => idx % Math.ceil(schedule.length / 50) === 0 || idx === schedule.length - 1)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatShortINR}
              label={{ value: 'Interest (₹)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) =>
                `₹${(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              }
            />
            <Line
              type="monotone"
              dataKey="interest"
              stroke="#f97316"
              dot={false}
              strokeWidth={2}
              name="Monthly Interest"
            />
          </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}
    </div>
  );
}
