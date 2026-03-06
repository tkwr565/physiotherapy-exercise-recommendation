import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // TODO: restore auth check — muted for development
  const [currentUser, setCurrentUser] = useState(
    () => localStorage.getItem('currentUser') || 'dev_user'
  );

  const login = useCallback((username) => {
    localStorage.setItem('currentUser', username);
    setCurrentUser(username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('questionnaireCompleted');
    localStorage.removeItem('stsAssessmentCompleted');
    localStorage.removeItem('patient_language');
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
