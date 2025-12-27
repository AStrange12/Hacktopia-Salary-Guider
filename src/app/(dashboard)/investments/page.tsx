
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { getInvestments } from '@/app/actions';
import AddInvestmentDialog from '@/components/investments/add-investment-dialog';
import InvestmentsList from '@/components/investments/investments-list';
import type { Investment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function InvestmentsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvestments = useCallback(async () => {
        if (user && firestore) {
            setLoading(true);
            const userInvestments = await getInvestments(firestore, user.uid);
            setInvestments(userInvestments);
            setLoading(false);
        }
    }, [user, firestore]);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    useEffect(() => {
        fetchInvestments();
    }, [fetchInvestments]);

    if (loading || isUserLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        );
    }
    
    const totalInvested = investments.reduce((acc, inv) => acc + inv.purchasePrice, 0);
    const totalCurrentValue = investments.reduce((acc, inv) => acc + inv.currentValue, 0);
    const totalGainLoss = totalCurrentValue - totalInvested;
    const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return (
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Investments</h2>
                <AddInvestmentDialog onInvestmentAdded={fetchInvestments} />
            </div>
            
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalInvested.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground">Total amount you've put in.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalCurrentValue.toLocaleString('en-IN')}</div>
                         <p className="text-xs text-muted-foreground">The current worth of your portfolio.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                        <TrendingUp className={`h-4 w-4 ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                           {totalGainLoss >= 0 ? '+' : ''}₹{totalGainLoss.toLocaleString('en-IN')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {gainLossPercentage.toFixed(2)}% overall return
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="pt-4">
                <InvestmentsList investments={investments} onInvestmentChange={fetchInvestments} />
            </div>
        </main>
    );
}
