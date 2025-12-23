"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestPersonalizedAdvice, PersonalizedAdviceInput } from '@/ai/flows/suggest-personalized-advice';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { Lightbulb, Sparkles } from 'lucide-react';
import type { AnalyzeSpendingBehaviorOutput } from '@/ai/flows/analyze-spending-behavior';

const adviceSchema = z.object({
  financialGoals: z.string().min(10, {
    message: "Please describe your financial goals in at least 10 characters.",
  }),
});

interface AdviceGeneratorProps {
  userProfile: UserProfile;
  spendingAnalysis: AnalyzeSpendingBehaviorOutput | null;
}

export default function AdviceGenerator({ userProfile, spendingAnalysis }: AdviceGeneratorProps) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof adviceSchema>>({
    resolver: zodResolver(adviceSchema),
    defaultValues: {
      financialGoals: '',
    }
  });

  async function onSubmit(values: z.infer<typeof adviceSchema>) {
    if (!spendingAnalysis) {
      toast({
        variant: "destructive",
        title: "Analysis Data Missing",
        description: "Not enough spending data to generate advice.",
      });
      return;
    }

    setIsLoading(true);
    setAdvice(null);
    try {
       const adviceInput: PersonalizedAdviceInput = {
        spendingAnalysis: JSON.stringify(spendingAnalysis),
        financialGoals: values.financialGoals,
        taxRegime: userProfile.taxRegime || 'new',
        salary: userProfile.salary || 0,
      };
      const result = await suggestPersonalizedAdvice(adviceInput);
      setAdvice(result.advice);
    } catch (error) {
      console.error("Error generating advice:", error);
      toast({
        variant: "destructive",
        title: "Advice Generation Failed",
        description: "Could not generate advice at this time. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="financialGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What are your financial goals?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., I want to save for a down payment on a house, invest in stocks for long-term growth, and create an emergency fund."
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading }>
            {isLoading ? "Generating..." : <><Sparkles className="mr-2 h-4 w-4" /> Get Advice</>}
          </Button>
        </form>
      </Form>

      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-pulse">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Our AI is analyzing your profile...</p>
        </div>
      )}

      {advice && (
        <div className="rounded-lg border bg-secondary/30 p-6 space-y-4">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-primary"><Lightbulb/> AI Financial Advice</h4>
            {advice.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                <p key={index} className="text-sm text-foreground/90 leading-relaxed">{paragraph}</p>
            ))}
        </div>
      )}
    </div>
  );
}
