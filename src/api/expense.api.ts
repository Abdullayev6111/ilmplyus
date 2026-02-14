import { API } from './api';

interface ExpenseCategory {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ExpenseSubCategory {
  id: number;
  name: string;
  expense_category_id: number;
  created_at: string;
  updated_at: string;
}

interface Cashier {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
  phone: string;
  branch_id: number;
  position_id: number | null;
  type: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Branch {
  id: number;
  name: string;
  city: string;
  address: string;
  director_name: string;
  phone: string;
  email: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface Expense {
  id: number;
  user_id: number;
  expense_category_id: number;
  expense_subcategory_id: number;
  amount: string;
  expense_date: string;
  info: string;
  branch_id: number;
  created_at: string;
  updated_at: string;
  category: ExpenseCategory;
  subcategory: ExpenseSubCategory;
  cashier: Cashier;
}

export const expenseAPI = {
  getCategories: async (): Promise<ExpenseCategory[]> => {
    const { data } = await API.get('/expense-categories');
    return data;
  },

  createCategory: async (name: string): Promise<ExpenseCategory> => {
    const { data } = await API.post('/expense-categories', { name });
    return data;
  },

  getSubCategories: async (): Promise<ExpenseSubCategory[]> => {
    const { data } = await API.get('/expense-subcategories');
    return data;
  },

  createSubCategory: async (payload: {
    name: string;
    expense_category_id: number;
  }): Promise<ExpenseSubCategory> => {
    const { data } = await API.post('/expense-subcategories', payload);
    return data;
  },

  getExpenses: async (): Promise<Expense[]> => {
    const { data } = await API.get('/expenses');
    return data;
  },

  createExpense: async (payload: {
    user_id: number;
    expense_category_id: number;
    expense_subcategory_id: number;
    amount: string;
    expense_date: string;
    info: string;
    branch_id: number;
  }): Promise<Expense> => {
    const { data } = await API.post('/expenses', payload);
    return data;
  },

  deleteExpense: async (id: number): Promise<void> => {
    await API.delete(`/expenses/${id}`);
  },

  getBranches: async (): Promise<Branch[]> => {
    const { data } = await API.get('/branches');
    return data;
  },

  getCashiers: async (): Promise<Cashier[]> => {
    const { data } = await API.get('/users');
    return data.data;
  },
};
