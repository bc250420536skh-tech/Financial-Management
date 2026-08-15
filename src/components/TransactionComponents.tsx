import React, { useState } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { formatCurrency } from '../utils/storage';

interface TransactionModalProps {
  categories: Category[];
  transaction?: Transaction;
  onSave: (data: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

export function TransactionModal({ categories, transaction, onSave, onClose }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '');
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(transaction?.notes ?? '');
  const [error, setError] = useState('');

  const filteredCategories = categories.filter(c => c.type === type);

  function handleTypeChange(t: TransactionType) {
    setType(t);
    setCategoryId('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError('Enter a valid positive amount.'); return; }
    if (!description.trim()) { setError('Description is required.'); return; }
    if (!categoryId) { setError('Please select a category.'); return; }
    if (!date) { setError('Date is required.'); return; }
    onSave({ type, amount: amt, description: description.trim(), categoryId, date, notes: notes.trim() || undefined });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${type === 'income' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              + Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              − Expense
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select category...</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Add any additional notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              {transaction ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
  category?: Category;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionRow({ transaction, category, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = transaction.type === 'income';
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b last:border-b-0">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: `${category?.color ?? '#9ca3af'}20` }}
      >
        {category?.icon ?? '💸'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{transaction.description}</p>
        <p className="text-sm text-gray-500">
          {category?.name ?? 'Uncategorized'} · {transaction.date}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onEdit}
          className="text-indigo-500 hover:text-indigo-700 text-sm px-2 py-1 rounded hover:bg-indigo-50"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50"
        >
          Del
        </button>
      </div>
    </div>
  );
}
