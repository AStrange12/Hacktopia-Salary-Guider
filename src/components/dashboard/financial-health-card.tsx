
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import { analyzeSpendingBehavior, AnalyzeSpendingBehaviorOutput } from "@/ai/flows/analyze-spending-behavior";
import type { UserProfile, Expense } from "@/lib/types";

type FinancialHealthCardProps = {
  userProfile: UserProfile;
  expenses: Expense[];
};

export default function FinancialHealthCard({ userProfile, expenses }: FinancialHealthCardProps) {
  const [analysis, setAnalysis] = useState<AnalyzeSpendingBehaviorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!userProfile || expenses.length === 0) {
      setError("Not enough data to calculate a score. Please add some expenses first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeSpendingBehavior({
        expenses: expenses.map(e => ({ ...e, date: e.date.toDate().toISOString() })),
        income: userProfile.salary || 0,
      });
      setAnalysis(result);
    } catch (e) {
      console.error("Financial health analysis failed:", e);
      setError("Could not analyze your financial health at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  const score = analysis?.financialHealthScore;
  const safeScore = score || 0;
  const circumference = 2 * Math.PI * 45; // 2 * pi * radius
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s < 40) return "hsl(var(--destructive))";
    if (s < 70) return "hsl(var(--chart-4))";
    return "hsl(var(--chart-2))";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="text-muted-foreground text-center py-8">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-solid border-primary border-t-transparent mb-2"></div>
            <p className="text-sm">Analyzing...</p>
          </div>
        ) : error ? (
           <div className="text-destructive text-center py-8 text-sm flex flex-col items-center gap-2">
             <AlertCircle className="h-6 w-6" />
             <p>{error}</p>
          </div>
        ) : score === undefined || score === null ? (
          <div className="text-muted-foreground text-center py-4 flex flex-col items-center gap-4">
            <p className="text-sm">Click to check your financial health score.</p>
            <Button onClick={handleAnalyze}>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze
            </Button>
          </div>
        ) : (
          <div className="relative h-32 w-32">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle
                className="stroke-current text-secondary"
                strokeWidth="10"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
              ></circle>
              <circle
                className="stroke-current transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                style={{ color: getColor(safeScore) }}
              ></circle>
              <text
                x="50"
                y="50"
                fontFamily="Verdana"
                fontSize="24"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="hsl(var(--foreground))"
              >
                {safeScore}
              </text>
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
