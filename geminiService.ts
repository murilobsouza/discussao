
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "./constants";
import { AIResponse, ClinicalCase } from "./types";

export async function getAIFeedback(
  currentCase: ClinicalCase,
  stepIndex: number,
  studentResponse: string
): Promise<AIResponse> {
  // Acesso seguro à API_KEY conforme diretrizes
  const g = globalThis as any;
  const apiKey = g.process?.env?.API_KEY || '';
  
  if (!apiKey) {
    return {
      feedback: "Erro: API Key não configurada. O Tutor não pode responder.",
      score: 0,
      justification: "Configuração de ambiente ausente."
    };
  }

  const ai = new GoogleGenAI({ apiKey });
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

    const text = response.text || '{}';
    const result = JSON.parse(text);
    
    return {
      feedback: result.feedback || "Feedback não gerado.",
      score: result.score ?? 0,
      justification: result.justification || ""
    };
  } catch (error) {
    console.error("Erro Gemini:", error);
    return {
      feedback: "Erro de conexão com a inteligência artificial.",
      score: 0,
      justification: "Falha na chamada da API."
    };
  }
}
