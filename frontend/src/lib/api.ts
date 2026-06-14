import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SubmissionPayload {
  user_id?: string;
  candidate_email?: string;
  question_id: string;
  assessment_id: string;
  code: string;
  language: string;
}

export const submitCode = async (payload: SubmissionPayload) => {
  const response = await api.post('/submissions/', payload);
  return response.data;
};

export const runCode = async (payload: SubmissionPayload) => {
  const response = await api.post('/submissions/run', payload);
  return response.data;
};

export const getAssessments = async () => {
  const response = await api.get('/assessments/');
  return response.data;
};

export const getAssessment = async (id: string) => {
  const response = await api.get(`/assessments/${id}`);
  return response.data;
};

export const updateAssessment = async (id: string, payload: any) => {
  const response = await api.put(`/assessments/${id}`, payload);
  return response.data;
};

export const deleteAssessment = async (id: string) => {
  const response = await api.delete(`/assessments/${id}`);
  return response.data;
};

export const getSubmissions = async (assessmentId?: string) => {
  const url = assessmentId ? `/submissions/?assessment_id=${assessmentId}` : '/submissions/';
  const response = await api.get(url);
  return response.data;
};

export const createAssessment = async (payload: { title: string; description: string; duration_minutes: number; created_by: string; status: string }) => {
  const response = await api.post('/assessments/', payload);
  return response.data;
};

export const generateAssessment = async (payload: { topic: string; language: string; duration_minutes: number; created_by: string }) => {
  const response = await api.post('/assessments/generate', payload);
  return response.data;
};

export const createAssessmentFromBank = async (payload: { title: string; description: string; difficulty: string; duration_minutes: number; num_questions: number; created_by: string; candidate_emails: string }) => {
  const response = await api.post('/assessments/from-bank', payload);
  return response.data;
};

export const getAssessmentQuestions = async (assessmentId: string) => {
  const response = await api.get(`/assessments/${assessmentId}/questions`);
  return response.data;
};
