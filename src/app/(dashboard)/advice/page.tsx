
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { getExpenses, getUser } from '@/app/actions';
import { analyzeSpendingBehavior } from '@/ai/flows/analyze-spending-behavior';
import AdviceGenerator from '@/components/advice/advice-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense, UserProfile } from '@/lib/types';
import type { AnalyzeSpendingBehaviorOutput } from '@/ai/flows/analyze-spending-behavior';

export default function AdvicePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [spendingAnalysis, setSpendingAnalysis] = useState<AnalyzeSpendingBehaviorOutput | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfileAndRunAnalysis = useCallback(async () => {
        if (user && firestore) {
            setLoading(true);
            try {
                const profile = await getUser(firestore, user.uid);
                setUserProfile(profile);

                const userExpenses = await getExpenses(firestore, user.uid);

                if (profile && userExpenses.length > 0) {
                    const spendingAnalysisResult = await analyzeSpendingBehavior({
                        expenses: userExpenses.map(e => ({ ...e, date: e.date.toDate().toISOString() })),
                        income: profile.salary || 0,
                    });
                    setSpendingAnalysis(spendingAnalysisResult);
                } else {
                    setSpendingAnalysis(null);
                }
            } catch (error) {
                console.error("Failed to fetch data or run analysis:", error);
                setSpendingAnalysis(null);
            } finally {
                setLoading(false);
            }
        }
    }, [user, firestore]);

    useEffect(() => {
        fetchProfileAndRunAnalysis();
    }, [fetchProfileAndRunAnalysis]);

    if (isUserLoading || loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!userProfile) {
        return (
             <div className="flex h-screen w-screen items-center justify-center">
                <p>Could not load user profile.</p>
            </div>
        )
    }

    return (
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Personalized AI Advice</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Financial Advisor</CardTitle>
                    <CardDescription>
                        Get tailored advice from our AI based on your spending and goals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AdviceGenerator
                        userProfile={userProfile}
                        spendingAnalysis={spendingAnalysis}
                    />
                </CardContent>
            </Card>
        </main>
    );
}
