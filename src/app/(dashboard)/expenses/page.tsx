
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { getExpenses } from '@/app/actions';
import AddExpenseDialog from '@/components/dashboard/add-expense-dialog';
import ExpensesDataTable from '@/components/expenses/expenses-data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SpendingByCategoryChart from '@/components/expenses/spending-by-category-chart';
import type { Expense } from '@/lib/types';

export default function ExpensesPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExpenses = useCallback(async () => {
        if (user && firestore) {
            setLoading(true);
            const userExpenses = await getExpenses(firestore, user.uid);
            setExpenses(userExpenses);
            setLoading(false);
        }
    }, [user, firestore]);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    if (loading || isUserLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        );
    }

    const sortedExpenses = [...(expenses || [])].sort((a, b) => b.date.toMillis() - a.date.toMillis());

    const spendingByCategory = (expenses || []).reduce((acc, expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(spendingByCategory).map(([category, amount]) => ({
        name: category,
        total: amount,
    }));


    return (
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
                <AddExpenseDialog onExpenseAdded={fetchExpenses}/>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                    <CardDescription>A breakdown of your spending across all categories.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SpendingByCategoryChart data={chartData} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>
                        A complete history of your expenses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ExpensesDataTable expenses={sortedExpenses} onExpenseChange={fetchExpenses} />
                </CardContent>
            </Card>
        </main>
    );
}

    