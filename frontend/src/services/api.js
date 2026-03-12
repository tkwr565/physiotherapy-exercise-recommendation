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

export const getDeepSeekRecommendations = (username, language = 'en') => {
  console.log('API: Sending DeepSeek request to /recommendations/deepseek with:', { username, language });
  return api.post('/recommendations/deepseek', { username, language });
};

// ── Video Analysis ──────────────────────────────────────────────────────────

export function uploadVideo(videoBlob, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress tracking
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(e.loaded / e.total);  // Fraction 0.0-1.0
      }
    };

    // Success handler
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Invalid response from server'));
        }
      } else {
        let detail = `HTTP ${xhr.status}`;
        try {
          detail = JSON.parse(xhr.responseText).detail || detail;
        } catch { /* ignore */ }
        reject(new Error(detail));
      }
    };

    // Error handler
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Upload timeout'));

    // Timeout
    xhr.timeout = 300000; // 5 minutes

    // FormData construction
    const ext = videoBlob.type.includes('mp4') ? '.mp4' : '.webm';
    const fd = new FormData();
    fd.append('file', videoBlob, `recording${ext}`);

    // POST to /video-analysis/analyze-sts-video endpoint
    xhr.open('POST', '/api/video-analysis/analyze-sts-video');
    xhr.send(fd);
  });
}

export default api;
