
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "./constants";
import { AIResponse, ClinicalCase } from "./types";

// Função auxiliar para obter a API KEY de forma segura
const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env?.API_KEY) 
      ? process.env.API_KEY 
      : (window as any).process?.env?.API_KEY || '';
  } catch {
    return '';
  }
};

export async function getAIFeedback(
  currentCase: ClinicalCase,
  stepIndex: number,
  studentResponse: string
): Promise<AIResponse> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return {
      feedback: "Erro: API Key da Gemini não configurada no ambiente.",
      score: 0,
      justification: "Configuração ausente."
    };
  }

  // Inicializa o cliente dentro da chamada para garantir que use a chave atualizada
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

    const result = JSON.parse(response.text || '{}');
    return {
      feedback: result.feedback || "Não foi possível gerar feedback.",
      score: result.score ?? 0,
      justification: result.justification || ""
    };
  } catch (error) {
    console.error("Erro na API da IA:", error);
    return {
      feedback: "Houve um erro técnico ao processar sua resposta. Verifique a cota da API ou tente novamente.",
      score: 0,
      justification: "Erro de comunicação com Gemini."
    };
  }
}
