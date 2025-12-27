
import type { Timestamp } from 'firebase/firestore';

export type UserProfile = {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  salary?: number;
  taxRegime?: 'old' | 'new';
  budget?: {
    needs: number;
    wants: number;
    savings: number;
  };
};

export type Expense = {
  id: string;
  userId: string;
  category: string;
  amount: number;
  date: Timestamp;
  description?: string;
  type: 'need' | 'want';
};

export type SavingsGoal = {
  id: string;
  userId: string;
  name: string;
  category: 'Emergency' | 'Gold' | 'Investments' | 'Other';
  targetAmount: number;
  currentAmount: number;
  deadline: Timestamp;
};

export type Investment = {
  id: string;
  userId: string;
  name: string;
  type: 'Stock' | 'Crypto' | 'Fixed Deposit' | 'Mutual Fund' | 'Other';
  purchaseDate: Timestamp;
  quantity?: number;
  purchasePrice: number;
  currentValue: number;
};
