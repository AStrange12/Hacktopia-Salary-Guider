
"use client";

import { useState } from "react";
import type { SummarizeMonthlySpendingOutput } from "@/ai/flows/summarize-monthly-spending";
import { summarizeMonthlySpending } from "@/ai/flows/summarize-monthly-spending";
import type { UserProfile, Expense } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type PersonalizedAdviceCardProps = {
  userProfile: UserProfile;
  expenses: Expense[];
};

export default function PersonalizedAdviceCard({ userProfile, expenses }: PersonalizedAdviceCardProps) {
  const [summary, setSummary] = useState<SummarizeMonthlySpendingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyExpenses = expenses.filter(e => e.date.toDate() >= startOfMonth);

    const needsTotal = monthlyExpenses.filter(e => e.type === 'need').reduce((acc, exp) => acc + exp.amount, 0);
    const wantsTotal = monthlyExpenses.filter(e => e.type === 'want').reduce((acc, exp) => acc + exp.amount, 0);
    const totalSpent = needsTotal + wantsTotal;
    const income = userProfile.salary || 0;
    const savingsTotal = income > totalSpent ? income - totalSpent : 0;
    
    if (income === 0 && totalSpent === 0) {
       setError("Please add your income and some expenses to get a summary.");
       setIsLoading(false);
       return;
    }

    try {
      const result = await summarizeMonthlySpending({
        needs: needsTotal,
        wants: wantsTotal,
        savings: savingsTotal,
        totalIncome: income,
      });
      setSummary(result);
    } catch (e) {
      console.error("Failed to summarize monthly spending", e);
      setError("Could not generate summary at this time.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-4">
       {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-solid border-primary border-t-transparent mb-2"></div>
             <p>Generating summary...</p>
          </div>
       ) : error ? (
           <p className="text-sm text-destructive text-center py-4">{error}</p>
       ) : summary ? (
        <p className="text-sm text-muted-foreground">
          {summary.summary}
        </p>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-4 flex flex-col items-center gap-4">
          <p>Get a summary of your spending this month based on the 50/30/20 rule.</p>
           <Button onClick={handleSummarize}>
              <Sparkles className="mr-2 h-4 w-4" />
              Summarize
            </Button>
        </div>
      )}
    </div>
  );
}
