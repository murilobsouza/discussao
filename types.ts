
export type UserRole = 'student' | 'professor';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface CaseStep {
  title: string;
  content: string;
  question: string;
}

export interface ClinicalCase {
  id: string;
  title: string;
  theme: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  tags: string[];
  steps: CaseStep[];
  created_at: string;
  created_by: string;
}

export interface SessionStep {
  step_index: number;
  student_response: string;
  ai_feedback: string;
  partial_score: number;
  timestamp: string;
}

export interface ClinicalSession {
  id: string;
  student_id: string;
  case_id: string;
  case_title: string;
  status: 'in_progress' | 'completed';
  current_step: number;
  total_score: number;
  steps_data: SessionStep[];
  started_at: string;
  finished_at?: string;
}

export interface AIResponse {
  feedback: string;
  score: number;
  justification: string;
}
