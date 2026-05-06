export const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Salary', 'Investment', 'Other'];

export const SEED_TRANSACTIONS = [
  { id: '1', type: 'income',  date: '2024-01-05', description: 'Monthly Salary',        category: 'Salary',        amount: 5000 },
  { id: '2', type: 'expense', date: '2024-01-08', description: 'Rent Payment',           category: 'Housing',       amount: 1500 },
  { id: '3', type: 'expense', date: '2024-01-10', description: 'Grocery Shopping',       category: 'Food',          amount: 320  },
  { id: '4', type: 'income',  date: '2024-01-15', description: 'Freelance Project',      category: 'Other',         amount: 1200 },
  { id: '5', type: 'expense', date: '2024-01-18', description: 'Netflix & Spotify',      category: 'Entertainment', amount: 25   },
  { id: '6', type: 'expense', date: '2024-01-20', description: 'Bus Pass',               category: 'Transport',     amount: 60   },
  { id: '7', type: 'expense', date: '2024-01-22', description: 'Doctor Visit',           category: 'Healthcare',    amount: 150  },
  { id: '8', type: 'income',  date: '2024-02-05', description: 'Monthly Salary',         category: 'Salary',        amount: 5000 },
  { id: '9', type: 'expense', date: '2024-02-07', description: 'Restaurant Dinner',      category: 'Food',          amount: 85   },
  { id: '10',type: 'income',  date: '2024-02-12', description: 'Stock Dividend',         category: 'Investment',    amount: 300  },
];

export const SEED_BUDGETS = [
  { category: 'Food',          amount: 500  },
  { category: 'Transport',     amount: 150  },
  { category: 'Housing',       amount: 1600 },
  { category: 'Entertainment', amount: 100  },
  { category: 'Healthcare',    amount: 200  },
];
