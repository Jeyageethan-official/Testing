import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    generateProfessionalMessage: (userInput: string) => Promise<string>;
  }
}

// Directly use the API key provided by the user.
const apiKey = "AIzaSyCppq-j59GI9USv1Y0v2miQEn9y_7NfIWM";
const ai = new GoogleGenAI({ apiKey: apiKey });

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
    // Provide a more specific error message if the API key is invalid.
    if (error.toString().includes('API key not valid')) {
        return "The provided API key is not valid. Please check the key and try again.";
    }
    return "Sorry, there was an error processing your request. Please try again.";
  }
};
