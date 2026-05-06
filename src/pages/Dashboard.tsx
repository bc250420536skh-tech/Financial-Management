import { useMemo } from 'react';
import { Transaction, Category, Budget } from '../types';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react';
import { formatCurrency, getCurrentMonth, getMonthLabel } from '../utils/storage';
import { TransactionRow } from '../components/TransactionComponents';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  onAddTransaction: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export function Dashboard({
  transactions,
  categories,
  budgets,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: DashboardProps) {
  const currentMonth = getCurrentMonth();

  const monthlyTransactions = useMemo(
    () => transactions.filter(t => t.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  );

  const totalIncome = useMemo(
    () => monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [monthlyTransactions]
  );
  const totalExpenses = useMemo(
    () => monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [monthlyTransactions]
  );
  const balance = totalIncome - totalExpenses;

  // Expense by category for pie chart
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => { map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount; });
    return Object.entries(map).map(([catId, amt]) => {
      const cat = categories.find(c => c.id === catId);
      return { name: cat?.name ?? 'Other', value: amt, color: cat?.color ?? '#9ca3af' };
    });
  }, [monthlyTransactions, categories]);

  // Last 6 months bar chart
  const last6Months = useMemo(() => {
    const months: { month: string; Income: number; Expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const txs = transactions.filter(t => t.date.startsWith(m));
      months.push({
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        Income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        Expenses: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  }, [transactions]);

  // Budget progress for current month
  const budgetProgress = useMemo(() => {
    return budgets
      .filter(b => b.month === currentMonth)
      .map(b => {
        const cat = categories.find(c => c.id === b.categoryId);
        const spent = monthlyTransactions
          .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
          .reduce((s, t) => s + t.amount, 0);
        return { cat, budget: b.amount, spent, pct: Math.min((spent / b.amount) * 100, 100) };
      })
      .filter(x => x.cat);
  }, [budgets, currentMonth, categories, monthlyTransactions]);

  const MAX_RECENT_TRANSACTIONS = 5;
  const recent = transactions.slice(0, MAX_RECENT_TRANSACTIONS);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Balance"
          value={formatCurrency(balance)}
          icon={<Wallet size={24} />}
          color="indigo"
          sub={getMonthLabel(currentMonth)}
        />
        <SummaryCard
          title="Income"
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp size={24} />}
          color="green"
          sub="This month"
        />
        <SummaryCard
          title="Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<TrendingDown size={24} />}
          color="red"
          sub="This month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Income vs Expenses (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last6Months} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Expenses by Category</h3>
          {expenseByCategory.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
              No expense data this month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Budget progress */}
      {budgetProgress.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Budget Progress</h3>
          <div className="space-y-3">
            {budgetProgress.map(({ cat, budget, spent, pct }) => (
              <div key={cat!.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{cat!.icon} {cat!.name}</span>
                  <span className={spent > budget ? 'text-red-500 font-medium' : 'text-gray-600'}>
                    {formatCurrency(spent)} / {formatCurrency(budget)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: spent > budget ? '#ef4444' : cat!.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-semibold text-gray-700">Recent Transactions</h3>
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-medium"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-4xl mb-2">💸</p>
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started</p>
          </div>
        ) : (
          <div>
            {recent.map(t => (
              <TransactionRow
                key={t.id}
                transaction={t}
                category={categories.find(c => c.id === t.categoryId)}
                onEdit={() => onEditTransaction(t)}
                onDelete={() => onDeleteTransaction(t.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
  sub,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'indigo' | 'green' | 'red';
  sub: string;
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-500',
  };
  const textColors = { indigo: 'text-indigo-700', green: 'text-green-700', red: 'text-red-600' };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${textColors[color]}`}>{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
