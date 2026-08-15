import { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import { Plus, Search } from 'lucide-react';
import { TransactionRow } from '../components/TransactionComponents';
import { Header } from '../components/Layout';

interface TransactionsPageProps {
  transactions: Transaction[];
  categories: Category[];
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onMenuClick: () => void;
}

export function TransactionsPage({
  transactions,
  categories,
  onAdd,
  onEdit,
  onDelete,
  onMenuClick,
}: TransactionsPageProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory && t.categoryId !== filterCategory) return false;
      if (filterMonth && !t.date.startsWith(filterMonth)) return false;
      if (search) {
        const q = search.toLowerCase();
        const cat = categories.find(c => c.id === t.categoryId);
        if (
          !t.description.toLowerCase().includes(q) &&
          !(cat?.name.toLowerCase().includes(q))
        ) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCategory, filterMonth, search, categories]);

  return (
    <div>
      <Header title="Transactions" onMenuClick={onMenuClick}>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-medium"
        >
          <Plus size={16} /> Add Transaction
        </button>
      </Header>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                ${filterType === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t}
            </button>
          ))}

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="ml-auto px-3 py-1 border border-gray-200 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>

          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-1 border border-gray-200 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p className="font-medium">No transactions found</p>
            <p className="text-sm">Try adjusting your filters or add a new transaction</p>
          </div>
        ) : (
          <div>
            {filtered.map(t => (
              <TransactionRow
                key={t.id}
                transaction={t}
                category={categories.find(c => c.id === t.categoryId)}
                onEdit={() => onEdit(t)}
                onDelete={() => onDelete(t.id)}
              />
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-400 mt-3 text-right">
        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} shown
      </p>
    </div>
  );
}
