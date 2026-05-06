import { useState } from 'react';
import { Category, TransactionType } from '../types';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Header } from '../components/Layout';

interface CategoriesPageProps {
  categories: Category[];
  onAdd: (data: Omit<Category, 'id'>) => void;
  onUpdate: (id: string, data: Partial<Omit<Category, 'id'>>) => void;
  onDelete: (id: string) => void;
  onMenuClick: () => void;
}

const COLORS = [
  '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b',
  '#ef4444', '#f97316', '#eab308', '#ec4899',
  '#a855f7', '#3b82f6', '#14b8a6', '#6366f1',
  '#84cc16', '#f43f5e', '#0ea5e9', '#d97706',
];

const ICONS = ['💼', '💻', '📈', '💰', '🏠', '🍔', '🚗', '🏥', '🎮', '🛍️', '📚', '⚡', '✈️', '🎵', '🏋️', '🐶', '💊', '🎁', '🍕', '☕'];

interface CategoryFormState {
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

const defaultForm: CategoryFormState = { name: '', type: 'expense', color: '#3b82f6', icon: '💸' };

export function CategoriesPage({ categories, onAdd, onUpdate, onDelete, onMenuClick }: CategoriesPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(defaultForm);
  const [editForm, setEditForm] = useState<CategoryFormState>(defaultForm);
  const [formError, setFormError] = useState('');

  function handleAdd() {
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    onAdd({ ...form, name: form.name.trim() });
    setForm(defaultForm);
    setShowForm(false);
    setFormError('');
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, type: cat.type, color: cat.color, icon: cat.icon });
  }

  function handleUpdate(id: string) {
    if (!editForm.name.trim()) return;
    onUpdate(id, { ...editForm, name: editForm.name.trim() });
    setEditingId(null);
  }

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div>
      <Header title="Categories" onMenuClick={onMenuClick}>
        <button
          onClick={() => { setShowForm(true); setForm(defaultForm); setFormError(''); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-medium"
        >
          <Plus size={16} /> Add Category
        </button>
      </Header>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">New Category</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-40">
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Category name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as TransactionType }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    className={`text-xl p-1.5 rounded-lg ${form.icon === ic ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-gray-100'}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category groups */}
      {[{ label: 'Income Categories', items: incomeCategories }, { label: 'Expense Categories', items: expenseCategories }].map(({ label, items }) => (
        <div key={label} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</h3>
          <div className="bg-white rounded-2xl shadow-sm divide-y">
            {items.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-sm">No categories yet</div>
            )}
            {items.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 p-4">
                {editingId === cat.id ? (
                  <div className="flex-1 flex flex-wrap gap-2 items-center">
                    <span
                      className="text-xl cursor-pointer"
                      title="Change icon"
                      onClick={() => {
                        const idx = ICONS.indexOf(editForm.icon);
                        setEditForm(f => ({ ...f, icon: ICONS[(idx + 1) % ICONS.length] }));
                      }}
                    >
                      {editForm.icon}
                    </span>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="flex-1 min-w-32 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditForm(f => ({ ...f, color: c }))}
                          className={`w-5 h-5 rounded-full ${editForm.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button onClick={() => handleUpdate(cat.id)} className="p-1 text-green-600 hover:text-green-800">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      {cat.icon}
                    </div>
                    <span className="flex-1 font-medium text-gray-800">{cat.name}</span>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
