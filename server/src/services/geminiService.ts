import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../config/logger';

const MODEL_NAME = 'gemini-1.5-flash';

export interface FinancialAuditInput {
  scope: 'GLOBAL' | 'SOCIETY';
  institution: string;
  generatedAt: string;
  societyName?: string;
  balance: number;
  currency: 'INR';
  transactionSummary: {
    totalTransactions: number;
    totalIncome: number;
    totalExpense: number;
    netFlow: number;
    approvedCount: number;
    pendingCount: number;
    latestTransactionDate?: string;
  };
  recentTransactions: Array<{
    date: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    amount: number;
    status: string;
  }>;
}

const countWords = (content: string) => {
  return content.trim().split(/\s+/).filter(Boolean).length;
};

const normalizeWordCount = (content: string, maxWords = 220) => {
  const words = content.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return content.trim();
  }
  return `${words.slice(0, maxWords).join(' ')}…`;
};

const buildFallbackAudit = (input: FinancialAuditInput) => {
  const scopeLabel = input.scope === 'GLOBAL' ? 'branch-wide' : `${input.societyName ?? 'society'}-specific`;
  const tone = input.balance >= 0 ? 'financially stable' : 'financially constrained';

  const message = [
    `This ${scopeLabel} audit provides an operational finance outlook for ${input.institution}.`,
    `The ledger currently reflects a balance of ₹${input.balance.toFixed(2)} and indicates a ${tone} posture based on recent movement patterns.`,
    `Across ${input.transactionSummary.totalTransactions} recorded transactions, total income is ₹${input.transactionSummary.totalIncome.toFixed(2)} while total expense is ₹${input.transactionSummary.totalExpense.toFixed(2)}, resulting in a net flow of ₹${input.transactionSummary.netFlow.toFixed(2)}.`,
    `Approval governance remains important: ${input.transactionSummary.approvedCount} items are approved and ${input.transactionSummary.pendingCount} remain pending, signaling a need for timely review cadence.`,
    'Strategically, the first priority is to protect liquidity by sequencing discretionary spending after mandatory obligations and committed activity costs.',
    'Second, increase planning precision by aligning event calendars and procurement windows with expected income cycles so short-term cash gaps do not delay execution.',
    'Third, strengthen budget discipline by introducing monthly variance reviews at category level, especially for recurring operational heads and event logistics.',
    'If this cadence is maintained, the unit can preserve compliance, support predictable delivery, and build confidence for upcoming quarters with measurable governance outcomes.',
  ].join(' ');

  return normalizeWordCount(message, 220);
};

const buildPrompt = (input: FinancialAuditInput) => {
  const scopeLine = input.scope === 'GLOBAL'
    ? 'Scope: Branch-wide financial posture (management view).'
    : `Scope: ${input.societyName ?? 'Society'} specific financial posture.`;

  return [
    'You are the finance auditor for IEEE Finance Pro.',
    'Generate exactly one concise financial analysis paragraph between 190 and 220 words.',
    'Use professional institutional tone and provide clear, actionable recommendations.',
    'Include: current balance interpretation, inflow vs outflow reading, governance risk, and 3 strategic actions.',
    'Do not use markdown headings or bullet points.',
    scopeLine,
    `Data: ${JSON.stringify(input)}`,
  ].join(' ');
};

export const generateFinancialAudit = async (input: FinancialAuditInput): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    logger.warn({ message: 'GEMINI_API_KEY missing, using deterministic fallback financial audit text.' });
    return buildFallbackAudit(input);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(buildPrompt(input));
    const response = await result.response;
    const rawText = response.text().trim();

    const normalizedText = normalizeWordCount(rawText, 220);
    const normalizedWordCount = countWords(normalizedText);

    if (normalizedWordCount < 170) {
      logger.warn({
        message: 'Gemini response too short; using fallback financial audit text.',
        model: MODEL_NAME,
        words: normalizedWordCount,
      });
      return buildFallbackAudit(input);
    }

    return normalizedText;
  } catch (error: unknown) {
    logger.error({
      message: 'Gemini financial audit generation failed. Using fallback text.',
      model: MODEL_NAME,
      error: error instanceof Error ? error.message : String(error),
    });
    return buildFallbackAudit(input);
  }
};
