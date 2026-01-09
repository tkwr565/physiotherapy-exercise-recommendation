/**
 * LocalStorage utilities for session persistence
 */

export const storage = {
  // Patient questionnaire storage
  saveQuestionnaireProgress(data) {
    localStorage.setItem('patient_questionnaire', JSON.stringify(data));
  },

  getQuestionnaireProgress() {
    const data = localStorage.getItem('patient_questionnaire');
    return data ? JSON.parse(data) : null;
  },

  clearQuestionnaireProgress() {
    localStorage.removeItem('patient_questionnaire');
  },

  // Physio session storage
  savePhysioSession(data) {
    localStorage.setItem('physio_session', JSON.stringify(data));
  },

  getPhysioSession() {
    const data = localStorage.getItem('physio_session');
    return data ? JSON.parse(data) : null;
  },

  clearPhysioSession() {
    localStorage.removeItem('physio_session');
  },

  // Physio authentication
  savePhysioAuth() {
    localStorage.setItem('physio_auth', 'true');
  },

  isPhysioAuthenticated() {
    return localStorage.getItem('physio_auth') === 'true';
  },

  clearPhysioAuth() {
    localStorage.removeItem('physio_auth');
  },

  // User logout - clear all session data
  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('questionnaireCompleted');
    localStorage.removeItem('stsAssessmentCompleted');
    localStorage.removeItem('patient_questionnaire');
    localStorage.removeItem('patient_language');
    // Redirect to home page
    window.location.href = '/home.html';
  }
};
