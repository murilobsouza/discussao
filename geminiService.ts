
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "./constants";
import { AIResponse, ClinicalCase } from "./types";

export async function getAIFeedback(
  currentCase: ClinicalCase,
  stepIndex: number,
  studentResponse: string
): Promise<AIResponse> {
  try {
    // Acesso obrigatório via process.env.API_KEY
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return {
        feedback: "Atenção: A API_KEY do Gemini não foi configurada. O feedback da IA está desativado.",
        score: 0,
        justification: "Configuração ausente."
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3-flash-preview';
    
    const caseContext = `
      Caso: ${currentCase.title}
      Etapa: ${currentCase.steps[stepIndex].title}
      Pergunta: ${currentCase.steps[stepIndex].question}
      Resposta do Aluno: ${studentResponse}
    `;

    const response = await ai.models.generateContent({
      model,
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

    return JSON.parse(response.text || '{}') as AIResponse;
  } catch (error) {
    console.error("Erro Gemini:", error);
    return {
      feedback: "Erro técnico ao processar resposta.",
      score: 0,
      justification: "Falha na API."
    };
  }
}
