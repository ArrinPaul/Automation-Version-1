import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateFinancialAudit = async (data: any, isGlobal: boolean) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = isGlobal
    ? `Analyze this branch-wide financial data for IEEE Student Branch Christ University. Provide 3 strategic recommendations. Data: ${JSON.stringify(data)}`
    : `Analyze this society-specific financial data and suggest cost optimization and activity planning. Data: ${JSON.stringify(data)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Audit Failed", error);
    return "Audit system currently offline. Please review manual ledgers.";
  }
};
