import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type AccountType = 'bank' | 'bendahara' | 'ketua';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'in' | 'out' | 'transfer';
  account: AccountType;
  toAccount?: AccountType;
  created_at?: string; // Menambahkan created_at
}

interface FinanceContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updated: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getBalance: (account?: AccountType, endDate?: Date) => number;
  getBalanceBeforeDate: (date: Date, account?: AccountType) => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchTransactions();
    
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, _payload => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }); // Sort ke-2: dibuat terakhir
      
    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }
    
    if (data) {
      setTransactions(data as Transaction[]);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const { error } = await supabase
      .from('transactions')
      .insert([transaction]);
      
    if (error) {
      console.error('Error adding transaction:', error);
      alert('Gagal menambah transaksi: ' + error.message);
    } else {
      fetchTransactions();
    }
  };

  const updateTransaction = async (id: string, updated: Omit<Transaction, 'id'>) => {
    const { error } = await supabase
      .from('transactions')
      .update(updated)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating transaction:', error);
      alert('Gagal update transaksi: ' + error.message);
    } else {
      fetchTransactions();
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting transaction:', error);
      alert('Gagal hapus transaksi: ' + error.message);
    } else {
      fetchTransactions();
    }
  };

  const getBalance = (account?: AccountType, endDate?: Date) => {
    return transactions.reduce((total, t) => {
      if (endDate) {
        const tDate = new Date(t.date);
        tDate.setHours(23, 59, 59, 999);
        if (tDate > endDate) return total; // Lewati transaksi yang lebih baru dari endDate
      }

      if (!account) {
        if (t.type === 'in') return total + t.amount;
        if (t.type === 'out') return total - t.amount;
        return total;
      }
      
      if (t.type === 'in' && t.account === account) return total + t.amount;
      if (t.type === 'out' && t.account === account) return total - t.amount;
      
      if (t.type === 'transfer') {
        if (t.account === account) return total - t.amount;
        if (t.toAccount === account) return total + t.amount;
      }
      
      return total;
    }, 0);
  };

  const getBalanceBeforeDate = (date: Date, account?: AccountType) => {
    return transactions.reduce((total, t) => {
      const tDate = new Date(t.date);
      if (tDate >= date) return total;

      if (!account) {
        if (t.type === 'in') return total + t.amount;
        if (t.type === 'out') return total - t.amount;
        return total;
      }
      
      if (t.type === 'in' && t.account === account) return total + t.amount;
      if (t.type === 'out' && t.account === account) return total - t.amount;
      
      if (t.type === 'transfer') {
        if (t.account === account) return total - t.amount;
        if (t.toAccount === account) return total + t.amount;
      }
      
      return total;
    }, 0);
  };

  return (
    <FinanceContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, getBalance, getBalanceBeforeDate }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
