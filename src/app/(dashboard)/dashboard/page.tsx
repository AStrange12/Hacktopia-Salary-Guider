
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import {
  getUser,
  getExpenses,
  getSavingsGoals,
} from '@/app/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, Receipt } from 'lucide-react';
import SpendingSplitCard from '@/components/dashboard/spending-split-card';
import FinancialHealthCard from '@/components/dashboard/financial-health-card';
import PersonalizedAdviceCard from '@/components/dashboard/personalized-advice-card';
import RecentExpenses from '@/components/dashboard/recent-expenses';
import SavingsGoals from '@/components/dashboard/savings-goals';
import AddExpenseDialog from '@/components/dashboard/add-expense-dialog';
import AddGoalDialog from '@/components/dashboard/add-goal-dialog';
import { analyzeSpendingBehavior } from '@/ai/flows/analyze-spending-behavior';
import { summarizeMonthlySpending } from '@/ai/flows/summarize-monthly-spending';
import MonthEndRiskCard from '@/components/dashboard/month-end-risk-card';
import type { UserProfile, Expense, SavingsGoal } from '@/lib/types';
import type { SummarizeMonthlySpendingOutput } from '@/ai/flows/summarize-monthly-spending';
import type { AnalyzeSpendingBehaviorOutput } from '@/ai/flows/analyze-spending-behavior';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [spendingAnalysis, setSpendingAnalysis] = useState<AnalyzeSpendingBehaviorOutput | null>(null);
  const [spendingSummary, setSpendingSummary] = useState<SummarizeMonthlySpendingOutput | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (user && firestore) {
      setLoading(true);
      const [profile, userExpenses, userGoals] = await Promise.all([
        getUser(firestore, user.uid),
        getExpenses(firestore, user.uid),
        getSavingsGoals(firestore, user.uid),
      ]);

      setUserProfile(profile);
      setExpenses(userExpenses);
      setSavingsGoals(userGoals);

      if (profile) {
          if (userExpenses.length > 0) {
            const analysis = await analyzeSpendingBehavior({
                expenses: userExpenses.map(e => ({...e, date: e.date.toDate().toISOString()})),
                income: profile.salary || 0,
            }).catch(() => null);
            setSpendingAnalysis(analysis);
          } else {
            setSpendingAnalysis(null);
          }
          

          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthlyExpenses = userExpenses.filter(e => e.date.toDate() >= startOfMonth);

          const needsTotal = monthlyExpenses.filter(e => e.type === 'need').reduce((acc, exp) => acc + exp.amount, 0);
          const wantsTotal = monthlyExpenses.filter(e => e.type === 'want').reduce((acc, exp) => acc + exp.amount, 0);
          const totalSpent = needsTotal + wantsTotal;
          const income = profile.salary || 0;
          const savingsTotal = income > totalSpent ? income - totalSpent : 0;
          
          if (needsTotal > 0 || wantsTotal > 0) {
            const summary = await summarizeMonthlySpending({
                needs: needsTotal,
                wants: wantsTotal,
                savings: savingsTotal,
                totalIncome: income
            }).catch(() => null);
            setSpendingSummary(summary);
          } else {
            setSpendingSummary(null);
          }
      }

      setLoading(false);
    }
  }, [user, firestore]);

  useEffect(() => {
    // This effect now correctly depends only on `fetchData`, which itself
    // depends on `user` and `firestore`. It will run once when the user is available.
    fetchData();
  }, [fetchData]);

  if (loading || isUserLoading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
  }
  
  if (!userProfile) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyExpenses = expenses.filter(e => e.date.toDate() >= startOfMonth);
  const totalSpent = monthlyExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const needsTotal = monthlyExpenses.filter(e => e.type === 'need').reduce((acc, exp) => acc + exp.amount, 0);
  const wantsTotal = monthlyExpenses.filter(e => e.type === 'want').reduce((acc, exp) => acc + exp.amount, 0);
  const income = userProfile.salary || 0;
  const savingsTotal = income - totalSpent > 0 ? income - totalSpent : 0;

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <AddExpenseDialog onExpenseAdded={fetchData}/>
          <AddGoalDialog onGoalAdded={fetchData}/>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{income.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Your monthly salary</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent (This Month)</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              {income > 0 ? `${((totalSpent / income) * 100).toFixed(1)}% of income` : `100% of income`}
            </p>
          </CardContent>
        </Card>
        <FinancialHealthCard score={spendingAnalysis?.financialHealthScore} />
        <MonthEndRiskCard income={income} totalSpent={totalSpent} budget={userProfile.budget} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SpendingSplitCard 
          needs={needsTotal} 
          wants={wantsTotal} 
          savings={savingsTotal}
          income={income}
        />
        <RecentExpenses expenses={expenses.slice(0, 10)} onExpenseChange={fetchData}/>
      </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle className="text-sm font-medium">AI Advisor</CardTitle>
            </CardHeader>
            <CardContent>
                 <PersonalizedAdviceCard initialSummary={spendingSummary} />
            </CardContent>
        </Card>
        <div className="lg:col-span-3">
            <SavingsGoals goals={savingsGoals} onGoalChange={fetchData}/>
        </div>
       </div>
    </main>
  );
}
