'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized financial tips based on user income and expenses.
 *
 * - generateFinancialTips - A function that takes income and expense data and returns financial advice.
 * - FinancialTipsInput - The input type for the generateFinancialTips function.
 * - FinancialTipsOutput - The return type for the generateFinancialTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialTipsInputSchema = z.object({
  income: z.number().describe('The total income of the user.'),
  expenses: z.array(
    z.object({
      category: z.string().describe('The category of the expense.'),
      amount: z.number().describe('The amount spent on the expense.'),
    })
  ).describe('A list of expenses with categories and amounts.'),
  financialGoals: z.string().describe('The financial goals of the user'),
});
export type FinancialTipsInput = z.infer<typeof FinancialTipsInputSchema>;

const FinancialTipsOutputSchema = z.object({
  tips: z.string().describe('Personalized financial tips and suggestions.'),
});
export type FinancialTipsOutput = z.infer<typeof FinancialTipsOutputSchema>;

export async function generateFinancialTips(input: FinancialTipsInput): Promise<FinancialTipsOutput> {
  return generateFinancialTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialTipsPrompt',
  input: {schema: FinancialTipsInputSchema},
  output: {schema: FinancialTipsOutputSchema},
  // The prompt below is in Brazilian Portuguese
  prompt: `Você é um consultor financeiro. Com base na renda, despesas e metas financeiras do usuário, forneça dicas e sugestões financeiras personalizadas.

Renda: {{income}}
Despesas:
{{#each expenses}}
  - Categoria: {{this.category}}, Valor: {{this.amount}}
{{/each}}
Metas Financeiras: {{financialGoals}}

Dicas:`,
});

const generateFinancialTipsFlow = ai.defineFlow(
  {
    name: 'generateFinancialTipsFlow',
    inputSchema: FinancialTipsInputSchema,
    outputSchema: FinancialTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
