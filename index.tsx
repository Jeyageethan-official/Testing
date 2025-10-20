import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    generateProfessionalMessage: (userInput: string) => Promise<string>;
  }
}

// Defensive check in case the API key is not provided by the environment
if (!process.env.API_KEY) {
  console.error("Gemini API key is not available.");
  // Provide a fallback function so the app doesn't crash when the button is clicked
  window.generateProfessionalMessage = async () => {
    alert("AI Assistant is not configured correctly (API key is missing).");
    return "AI Assistant is currently unavailable.";
  };
} else {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  window.generateProfessionalMessage = async (userInput: string) => {
    try {
      const prompt = `You are an expert in converting informal 'Tanglish' (a mix of Tamil and English) text into professional, formal English. Convert the following message into a polite and professional English sentence suitable for a workplace context. Do not add any explanations, preamble, or markdown formatting. Just provide the converted sentence as plain text. Tanglish message: "${userInput}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "Sorry, there was an error processing your request. Please try again.";
    }
  };
}
