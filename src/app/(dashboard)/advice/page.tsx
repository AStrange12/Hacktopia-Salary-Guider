"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { getExpenses, getUser } from '@/app/actions';
import { analyzeSpendingBehavior } from '@/ai/flows/analyze-spending-behavior';
import AdviceGenerator from '@/components/advice/advice-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense, UserProfile } from '@/lib/types';
import type { AnalyzeSpendingBehaviorOutput } from '@/ai/flows/analyze-spending-behavior';

export default function AdvicePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [spendingAnalysis, setSpendingAnalysis] = useState<AnalyzeSpendingBehaviorOutput | null>(null);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    useEffect(() => {
        async function fetchData() {
            if (user) {
                const profile = await getUser(user.uid);
                setUserProfile(profile);

                if (profile) {
                    const expenses = await getExpenses(user.uid);
                    const spendingAnalysisResult = await analyzeSpendingBehavior({
                        expenses: expenses.map(e => ({ ...e, date: e.date.toDate().toISOString() })),
                        income: profile.salary || 0,
                    }).catch(() => null);

                    if (spendingAnalysisResult) {
                        setSpendingAnalysis(spendingAnalysisResult);
                    }
                }
            }
        }
        fetchData();
    }, [user]);

    if (isUserLoading || !userProfile) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        );
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
