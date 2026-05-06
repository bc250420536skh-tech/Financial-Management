import { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { formatCurrency, getCurrentMonth } from '../utils/storage';
import { Header } from '../components/Layout';

interface ReportsPageProps {
  transactions: Transaction[];
  categories: Category[];
  onMenuClick: () => void;
}

export function ReportsPage({ transactions, categories, onMenuClick }: ReportsPageProps) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Monthly summary for last CHART_MONTHS months
  const CHART_MONTHS = 12;
  const monthlySummary = useMemo(() => {
    const data = [];
    for (let i = CHART_MONTHS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const txs = transactions.filter(t => t.date.startsWith(m));
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      data.push({
        month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        Income: income,
        Expenses: expense,
        Net: income - expense,
      });
    }
    return data;
  }, [transactions]);

  // Expense breakdown for selected month
  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.date.startsWith(selectedMonth) && t.type === 'expense')
      .forEach(t => { map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount; });
    return Object.entries(map)
      .map(([catId, amt]) => {
        const cat = categories.find(c => c.id === catId);
        return { name: cat?.name ?? 'Other', value: amt, color: cat?.color ?? '#9ca3af', icon: cat?.icon ?? '💸' };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, selectedMonth, categories]);

  // Income breakdown for selected month
  const incomeBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.date.startsWith(selectedMonth) && t.type === 'income')
      .forEach(t => { map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount; });
    return Object.entries(map)
      .map(([catId, amt]) => {
        const cat = categories.find(c => c.id === catId);
        return { name: cat?.name ?? 'Other', value: amt, color: cat?.color ?? '#9ca3af' };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, selectedMonth, categories]);

  const monthlyIncome = incomeBreakdown.reduce((s, x) => s + x.value, 0);
  const monthlyExpense = expenseBreakdown.reduce((s, x) => s + x.value, 0);
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;

  return (
    <div>
      <Header title="Reports" onMenuClick={onMenuClick}>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </Header>

      {/* Monthly stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-sm text-gray-500">Income</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(monthlyIncome)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-sm text-gray-500">Expenses</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(monthlyExpense)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-sm text-gray-500">Savings Rate</p>
          <p className={`text-2xl font-bold mt-1 ${savingsRate >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
            {savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* 12-month trend */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">12-Month Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlySummary} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="Income" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Net savings line */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Net Savings Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlySummary} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Line
              type="monotone"
              dataKey="Net"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Expense Breakdown</h3>
          {expenseBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No expense data for this month</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {expenseBreakdown.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                      <span className="text-gray-700">{e.icon} {e.name}</span>
                    </div>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(e.value)} ({((e.value / monthlyExpense) * 100).toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Income breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Income Breakdown</h3>
          {incomeBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No income data for this month</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={incomeBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {incomeBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {incomeBreakdown.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                      <span className="text-gray-700">{e.name}</span>
                    </div>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(e.value)} ({((e.value / monthlyIncome) * 100).toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
