import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Users ────────────────────────────────────────────────────────────────────

export const verifyPasscode = (passcode) =>
  api.post('/users/verify-passcode', { passcode });

export const createOrLoginUser = (username) =>
  api.post('/users/', { username });

export const getUserProgress = (username) =>
  api.get(`/users/${username}/progress`);

// ── Demographics ─────────────────────────────────────────────────────────────

export const upsertDemographics = (data) =>
  api.post('/demographics/', data);

export const getDemographics = (username) =>
  api.get(`/demographics/${username}`);

// ── Questionnaire ────────────────────────────────────────────────────────────

export const upsertQuestionnaire = (data) =>
  api.post('/questionnaire/', data);

export const getQuestionnaire = (username) =>
  api.get(`/questionnaire/${username}`);

// ── STS Assessment ───────────────────────────────────────────────────────────

export const upsertSTSAssessment = (data) =>
  api.post('/sts-assessment/', data);

export const getSTSAssessment = (username) =>
  api.get(`/sts-assessment/${username}`);

// ── Exercises ────────────────────────────────────────────────────────────────

export const listExercises = () =>
  api.get('/exercises/');

// ── Recommendations ──────────────────────────────────────────────────────────

export const getAlgorithmRecommendations = (username) =>
  api.post('/recommendations/algorithm', { username });

export const getLLMRecommendations = (username, language = 'en') =>
  api.post('/recommendations/llm', { username, language });

export const getDeepSeekRecommendations = (username, language = 'en') =>
  api.post('/recommendations/deepseek', { username, language });

export default api;
