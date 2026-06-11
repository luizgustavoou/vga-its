import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Student API
export const studentApi = {
  create: (data: { name: string; email: string; password: string }) =>
    api.post('/students', data),
  login: (data: { email: string; password: string }) =>
    api.post('/students/login', data),
  getById: (id: string) => api.get(`/students/${id}`),
  getProgress: (id: string) => api.get(`/students/${id}/progress`),
  updateMastery: (id: string, nodeId: string, event: string) =>
    api.patch(`/students/${id}/mastery`, { nodeId, event }),
};

// Assessment API
export const assessmentApi = {
  start: (studentId: string) =>
    api.post('/assessments/start', { studentId }),
  getById: (id: string) => api.get(`/assessments/${id}`),
  answer: (id: string, questionId: string, answer: string) =>
    api.post(`/assessments/${id}/answer`, { questionId, answer }),
  finish: (id: string) => api.post(`/assessments/${id}/finish`),
  getResult: (id: string) => api.get(`/assessments/${id}/result`),
};

// Knowledge Graph API
export const knowledgeApi = {
  getGraph: () => api.get('/knowledge-graph'),
  getStudentGraph: (studentId: string) =>
    api.get(`/knowledge-graph/${studentId}`),
};

// Chat API
export const chatApi = {
  createSession: (studentId: string, nodeId: string) =>
    api.post('/chat/sessions', { studentId, nodeId }),
  sendMessage: (sessionId: string, content: string) =>
    api.post('/chat/message', { sessionId, content }),
  getStudentSessions: (studentId: string) =>
    api.get(`/chat/sessions/${studentId}`),
  getSessionMessages: (sessionId: string) =>
    api.get(`/chat/sessions/${sessionId}/messages`),
};
