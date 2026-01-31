
import { ClinicalCase } from './types';

export const AUTH_CODES = {
  STUDENT: '2026',
  PROFESSOR: '2317'
};

export const INITIAL_CASES: ClinicalCase[] = [
  {
    id: '1',
    title: 'Olho Vermelho Súbito',
    theme: 'Glaucoma',
    difficulty: 'médio',
    tags: ['Emergência', 'Glaucoma Agudo'],
    created_at: new Date().toISOString(),
    created_by: 'system',
    steps: [
      {
        title: 'Apresentação Inicial',
        content: 'Paciente masculino, 65 anos, apresenta-se com dor ocular intensa súbita em olho direito, acompanhada de náuseas e vômitos. Relata visão de halos coloridos ao redor das luzes.',
        question: 'Quais suas principais hipóteses diagnósticas iniciais?'
      },
      {
        title: 'História Adicional',
        content: 'O paciente nega traumas prévios ou cirurgias oculares. É hipermetrope e faz uso de medicações para hipertensão sistêmica. A dor começou após ida ao cinema.',
        question: 'Quais exames complementares ou de consultório você solicitaria agora?'
      },
      {
        title: 'Achados de Exame',
        content: 'Ao exame: Acuidade visual OD: conta dedos a 1 metro. Biomicroscopia OD: injeção ciliar importante, edema de córnea microcístico, câmara anterior rasa, pupila em médio-midríase fixa. Tonometria de aplanação OD: 52 mmHg.',
        question: 'Qual o diagnóstico mais provável e a justificativa baseada nos achados?'
      },
      {
        title: 'Conduta',
        content: 'O diagnóstico de Crise Aguda de Glaucoma de Ângulo Fechado foi confirmado.',
        question: 'Qual a conduta imediata medicamentosa e o tratamento definitivo indicado?'
      },
      {
        title: 'Resumo Final',
        content: 'Parabéns por concluir o caso. O glaucoma agudo é uma emergência oftalmológica que requer redução rápida da PIO para evitar dano irreversível ao nervo óptico.',
        question: 'Reflexão final: O que você aprendeu sobre a importância do diagnóstico diferencial em olhos vermelhos dolorosos?'
      }
    ]
  }
];

export const SYSTEM_PROMPT = `Você é um Tutor de Casos Clínicos em Oftalmologia para alunos de graduação em Medicina.
Sua tarefa é guiar o aluno em cada etapa do caso sem dar spoilers do diagnóstico final antes da hora.

REGRAS:
1. Avalie a resposta do aluno com base APENAS nas informações liberadas até o momento.
2. Seja didático, objetivo e encorajador.
3. Aponte "Red Flags" (sinais de alerta) se o aluno ignorar algo grave.
4. Forneça um feedback construtivo.
5. Atribua uma pontuação de 0 a 2 para a etapa (0: Errado/Insuficiente, 1: Parcial, 2: Correto/Completo).
6. Responda estritamente em formato JSON para que o sistema possa processar.

Formato da resposta:
{
  "feedback": "Texto do feedback aqui...",
  "score": 0-2,
  "justification": "Breve justificativa da nota..."
}`;
