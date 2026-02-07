import type { LoanCalculation } from '../engine';
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

interface ChartsProps {
  calculation: LoanCalculation;
}

export function LoanCharts({ calculation }: ChartsProps) {
  const { schedule, monthlyEMI, input } = calculation;

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

  // Pie chart data - Total principal vs interest
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const pieData = [
    {
      name: 'Principal',
      value: parseFloat(input.principal.toFixed(0)),
      percentage: 100,
    },
    {
      name: 'Interest',
      value: parseFloat(totalInterest.toFixed(0)),
      percentage: parseFloat(((totalInterest / input.principal) * 100).toFixed(2)),
    },
  ];

  const COLORS = ['#3b82f6', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Chart 1: Loan Balance Decline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📉 Loan Balance Over Time</h3>
        <p className="text-sm text-gray-600 mb-4">Watch your loan balance decrease with each payment</p>
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

      {/* Chart 2: Principal vs Interest in EMI */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💰 Principal vs Interest Breakdown by Month
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          See how much of your EMI goes to principal vs interest
        </p>
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

      {/* Chart 3: Year-by-Year Principal vs Interest */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Year-by-Year Breakdown</h3>
        <p className="text-sm text-gray-600 mb-4">
          Compare principal repaid vs interest paid each year
        </p>
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

      {/* Chart 4: Cumulative Interest & Principal */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Cumulative Principal vs Interest Paid
        </h3>
        <p className="text-sm text-gray-600 mb-4">Track cumulative payments over the loan period</p>
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

      {/* Chart 5: Principal vs Interest Pie Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🥧 Total Cost Breakdown</h3>
        <p className="text-sm text-gray-600 mb-4">
          See the total percentage of your payment that goes to interest vs principal
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent = 0 }) => {
                return `${name}: ${((percent as number) * 100).toFixed(1)}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                `₹${(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Your Total Cost:</span> Out of ₹
            {(input.principal + totalInterest).toLocaleString('en-IN', { maximumFractionDigits: 0 })} that
            you'll pay, ₹{totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (
            {((totalInterest / (input.principal + totalInterest)) * 100).toFixed(1)}%) is interest!
          </p>
        </div>
      </div>

      {/* Chart 6: Monthly EMI Composition */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 First Month EMI Breakdown</h3>
        <p className="text-sm text-gray-600 mb-4">See how your first EMI is split between principal and interest</p>
        {schedule.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Principal', value: schedule[0].principal },
                    { name: 'Interest', value: schedule[0].interest },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent = 0 }) =>
                    `${name}: ₹${(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })} (${(percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f97316" />
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    `₹${(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-amber-50 rounded border border-amber-200">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">First Month Insight:</span> Your first EMI of ₹
                {monthlyEMI.toLocaleString('en-IN')} contains only ₹
                {schedule[0].principal.toLocaleString('en-IN', { maximumFractionDigits: 0 })} principal and ₹
                {schedule[0].interest.toLocaleString('en-IN', { maximumFractionDigits: 0 })} interest. As you
                progress, interest portion decreases!
              </p>
            </div>
          </>
        )}
      </div>

      {/* Chart 7: Interest Rate Impact */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Monthly Interest Paid</h3>
        <p className="text-sm text-gray-600 mb-4">
          Watch how your monthly interest payment decreases over time
        </p>
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
  );
}
