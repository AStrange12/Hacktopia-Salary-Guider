'use client';
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-spending-behavior.ts';
import '@/ai/flows/suggest-personalized-advice.ts';
import '@/ai/flows/summarize-monthly-spending.ts';
import '@/ai/flows/parse-expense-text.ts';
