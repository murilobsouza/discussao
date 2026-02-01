
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "./constants";
import { AIResponse, ClinicalCase } from "./types";

// Always use strictly const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAIFeedback(
  currentCase: ClinicalCase,
  stepIndex: number,
  studentResponse: string
): Promise<AIResponse> {
  const model = 'gemini-3-flash-preview';
  
  const caseContext = `
    Caso: ${currentCase.title}
    Tema: ${currentCase.theme}
    Etapa Atual: ${stepIndex + 1} de ${currentCase.steps.length}
    Informação da Etapa: ${currentCase.steps[stepIndex].content}
    Pergunta feita: ${currentCase.steps[stepIndex].question}
    Resposta do Aluno: ${studentResponse}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: caseContext,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            score: { type: Type.NUMBER },
            justification: { type: Type.STRING }
          },
          required: ["feedback", "score", "justification"]
        }
      }
    });

    // Directly access text property from response object
    const result = JSON.parse(response.text || '{}');
    return {
      feedback: result.feedback || "Não foi possível gerar feedback.",
      score: result.score ?? 0,
      justification: result.justification || ""
    };
  } catch (error) {
    console.error("Erro na API da IA:", error);
    return {
      feedback: "Houve um erro técnico ao processar sua resposta. Tente novamente.",
      score: 0,
      justification: "Erro de conexão com o servidor de IA."
    };
  }
}
