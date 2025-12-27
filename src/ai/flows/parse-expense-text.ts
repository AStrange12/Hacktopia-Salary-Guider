'use server';
/**
 * @fileOverview An AI agent that parses raw text to extract expense details.
 *
 * - parseExpenseFromText - A function that parses transaction text into structured expense data.
 * - ParseExpenseFromTextInput - The input type for the parseExpenseFromText function.
 * - ParseExpenseFromTextOutput - The return type for the parseExpenseFromText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExpenseCategorySchema = z.enum([
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'EMI',
  'Other',
]);

const ExpenseTypeSchema = z.enum(['need', 'want']);

export const ParseExpenseFromTextInputSchema = z.object({
  text: z.string().describe('The raw text to be parsed for expense details, like a bank transaction SMS.'),
});
export type ParseExpenseFromTextInput = z.infer<typeof ParseExpenseFromTextInputSchema>;

export const ParseExpenseFromTextOutputSchema = z.object({
  description: z.string().optional().describe('A short description of the expense transaction.'),
  amount: z.number().optional().describe('The numerical amount of the expense.'),
  category: ExpenseCategorySchema.optional().describe('The most likely category for the expense.'),
  type: ExpenseTypeSchema.optional().describe('A best-effort guess whether the expense is a "need" or a "want".'),
});
export type ParseExpenseFromTextOutput = z.infer<typeof ParseExpenseFromTextOutputSchema>;

export async function parseExpenseFromText(
  input: ParseExpenseFromTextInput
): Promise<ParseExpenseFromTextOutput> {
  return parseExpenseFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseExpenseTextPrompt',
  input: { schema: ParseExpenseFromTextInputSchema },
  output: { schema: ParseExpenseFromTextOutputSchema },
  prompt: `You are an expert at parsing transaction text like bank SMS messages. Extract the key details from the following text.

  Text to analyze:
  """
  {{{text}}}
  """

  - Identify the merchant or a concise description of the transaction.
  - Extract the transaction amount.
  - Determine the most appropriate category from the available options.
  - Make a best-effort guess if the transaction is a "need" or a "want".
  - If a value cannot be determined, leave it empty.
  `,
});

const parseExpenseFromTextFlow = ai.defineFlow(
  {
    name: 'parseExpenseFromTextFlow',
    inputSchema: ParseExpenseFromTextInputSchema,
    outputSchema: ParseExpenseFromTextOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
