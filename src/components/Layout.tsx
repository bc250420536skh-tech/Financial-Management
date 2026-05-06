import React from 'react';
import { LayoutDashboard, ArrowLeftRight, PieChart, BarChart3, Tag, X, Menu } from 'lucide-react';

export type Page = 'dashboard' | 'transactions' | 'budgets' | 'reports' | 'categories';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={20} /> },
  { page: 'budgets', label: 'Budgets', icon: <PieChart size={20} /> },
  { page: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
  { page: 'categories', label: 'Categories', icon: <Tag size={20} /> },
];

export function Sidebar({ activePage, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white z-30 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="flex items-center justify-between p-6 border-b border-indigo-700">
          <div>
            <h1 className="text-xl font-bold">💰 FinanceManager</h1>
            <p className="text-indigo-300 text-xs mt-1">Track your money</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-indigo-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(({ page, label, icon }) => (
            <button
              key={page}
              onClick={() => { onNavigate(page); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${activePage === page
                  ? 'bg-white text-indigo-900'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  children?: React.ReactNode;
}

export function Header({ title, onMenuClick, children }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-white shadow text-gray-600 hover:text-gray-900"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}
