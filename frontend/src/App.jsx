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

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demographics" element={<ProtectedRoute><DemographicsPage /></ProtectedRoute>} />
            <Route path="/questionnaire" element={<ProtectedRoute><QuestionnairePage /></ProtectedRoute>} />
            <Route path="/sts-assessment" element={<ProtectedRoute><STSAssessmentPage /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
