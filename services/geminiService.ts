import { GoogleGenAI } from "@google/genai";
import { FinancialState, Transaction } from "../types";

export const getFinancialInsights = async (state: FinancialState, targetSocietyId?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = '';
  
  if (targetSocietyId) {
    const soc = state.societies.find(s => s.id === targetSocietyId);
    if (!soc) return "Society data not found.";
    
    const socTx = state.transactions.filter(t => t.societyId === targetSocietyId);
    const summary = socTx.map(t => `${t.type}: ₹${t.amount} (${t.category} - ${t.description})`).join(", ");

    prompt = `
      As a professional financial auditor for IEEE, analyze the financial health of the "${soc.name}" (${soc.shortName}) society:
      Allocated Budget: ₹${soc.budget}
      Current Balance: ₹${soc.balance}
      Recent Transactions: ${summary || "No transactions recorded yet."}
      
      Provide a concise report (max 200 words) for the Society Chair on:
      1. Their specific financial standing and budget utilization.
      2. Suggestions for improving their technical activity outreach within their remaining budget.
      3. One specific area where they could optimize costs based on their transaction history.
    `;
  } else {
    const totalBalance = state.societies.reduce((acc, s) => acc + s.balance, 0);
    const totalBudget = state.societies.reduce((acc, s) => acc + s.budget, 0);
    const summary = state.societies.map(s => `${s.shortName}: Budget ₹${s.budget}, Spent ₹${s.budget - s.balance}`).join(", ");

    prompt = `
      As a professional financial auditor for IEEE, analyze this IEEE Student Branch financial data:
      Total Budget: ₹${totalBudget}
      Total Current Balance: ₹${totalBalance}
      Society Details: ${summary}
      
      Provide a concise report (max 200 words) on:
      1. Overall financial health of the entire Student Branch.
      2. Any society that is overspending or underutilizing budget significantly.
      3. Three actionable recommendations to optimize the remaining budget for upcoming technical events.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI service.";
  }
};