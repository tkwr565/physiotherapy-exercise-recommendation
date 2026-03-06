import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import DemographicsPage from './pages/DemographicsPage';
import QuestionnairePage from './pages/QuestionnairePage';
import STSAssessmentPage from './pages/STSAssessmentPage';
import ResultsPage from './pages/ResultsPage';
import './styles/shared.css';

// TODO: restore ProtectedRoute when auth is re-enabled
// function ProtectedRoute({ children }) {
//   const { currentUser } = useAuth();
//   if (!currentUser) return <Navigate to="/" replace />;
//   return children;
// }

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Header />
          <Routes>
            {/* Auth muted — redirect home straight to demographics */}
            <Route path="/" element={<Navigate to="/demographics" replace />} />
            <Route path="/demographics" element={<DemographicsPage />} />
            <Route path="/questionnaire" element={<QuestionnairePage />} />
            <Route path="/sts-assessment" element={<STSAssessmentPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
