import { useState, useMemo } from 'react';
import { Category, Transaction, Budget } from '../types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, getCurrentMonth, getMonthLabel } from '../utils/storage';
import { Header } from '../components/Layout';

interface BudgetsPageProps {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  onSetBudget: (categoryId: string, month: string, amount: number) => void;
  onDeleteBudget: (id: string) => void;
  onMenuClick: () => void;
}

export function BudgetsPage({
  categories,
  transactions,
  budgets,
  onSetBudget,
  onDeleteBudget,
  onMenuClick,
}: BudgetsPageProps) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatId, setNewCatId] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const monthlyTransactions = useMemo(
    () => transactions.filter(t => t.date.startsWith(selectedMonth) && t.type === 'expense'),
    [transactions, selectedMonth]
  );

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const budgetItems = useMemo(() => {
    return budgets
      .filter(b => b.month === selectedMonth)
      .map(b => {
        const cat = categories.find(c => c.id === b.categoryId);
        const spent = monthlyTransactions
          .filter(t => t.categoryId === b.categoryId)
          .reduce((s, t) => s + t.amount, 0);
        const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
        return { budget: b, cat, spent, pct };
      })
      .filter(x => x.cat);
  }, [budgets, selectedMonth, categories, monthlyTransactions]);

  const alreadyBudgeted = budgetItems.map(x => x.budget.categoryId);

  function handleSaveEdit(categoryId: string) {
    const amt = parseFloat(editAmount);
    if (!isNaN(amt) && amt > 0) {
      onSetBudget(categoryId, selectedMonth, amt);
    }
    setEditingCatId(null);
  }

  function handleAddBudget() {
    const amt = parseFloat(newAmount);
    if (!newCatId || isNaN(amt) || amt <= 0) return;
    onSetBudget(newCatId, selectedMonth, amt);
    setNewCatId('');
    setNewAmount('');
    setShowAddForm(false);
  }

  const totalBudget = budgetItems.reduce((s, x) => s + x.budget.amount, 0);
  const totalSpent = budgetItems.reduce((s, x) => s + x.spent, 0);

  return (
    <div>
      <Header title="Budgets" onMenuClick={onMenuClick}>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-medium"
          >
            <Plus size={16} /> Add Budget
          </button>
        </div>
      </Header>

      <div className="mb-4 text-gray-500 text-sm">{getMonthLabel(selectedMonth)}</div>

      {/* Summary */}
      {budgetItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className={`text-2xl font-bold mt-1 ${totalSpent > totalBudget ? 'text-red-500' : 'text-gray-700'}`}>
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-sm text-gray-500">Remaining</p>
            <p className={`text-2xl font-bold mt-1 ${totalBudget - totalSpent < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {formatCurrency(totalBudget - totalSpent)}
            </p>
          </div>
        </div>
      )}

      {/* Add budget form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Add Budget</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-40">
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select
                value={newCatId}
                onChange={e => setNewCatId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select category...</option>
                {expenseCategories
                  .filter(c => !alreadyBudgeted.includes(c.id))
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
              </select>
            </div>
            <div className="flex-1 min-w-32">
              <label className="block text-sm text-gray-600 mb-1">Amount ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddBudget}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget list */}
      {budgetItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
          <p className="text-4xl mb-2">📊</p>
          <p className="font-medium">No budgets for this month</p>
          <p className="text-sm">Click "Add Budget" to start tracking your spending goals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgetItems.map(({ budget, cat, spent, pct }) => (
            <div key={budget.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat!.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{cat!.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(spent)} spent of {formatCurrency(budget.amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingCatId === cat!.id ? (
                    <>
                      <input
                        type="number"
                        value={editAmount}
                        onChange={e => setEditAmount(e.target.value)}
                        className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(cat!.id)}
                        className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="text-gray-400 text-sm hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`text-sm font-semibold ${spent > budget.amount ? 'text-red-500' : 'text-green-600'}`}>
                        {formatCurrency(budget.amount - spent)} left
                      </span>
                      <button
                        onClick={() => { setEditingCatId(cat!.id); setEditAmount(String(budget.amount)); }}
                        className="p-1 text-gray-400 hover:text-indigo-600"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteBudget(budget.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: spent > budget.amount ? '#ef4444' : cat!.color,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">{Math.round(pct)}% used</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
