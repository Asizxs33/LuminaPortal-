/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import TestStart from './pages/TestStart';
import TestTake from './pages/TestTake';
import AdminConstructor from './pages/AdminConstructor';
import ResultsDashboard from './pages/ResultsDashboard';
import Login from './pages/Login';
import StudentResults from './pages/StudentResults';
import StudyMaterials from './pages/StudyMaterials';
import TestResult from './pages/TestResult';
import ProfileSettings from './pages/ProfileSettings';
import AdminStudents from './pages/AdminStudents';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute requireRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/test/:id/start" element={
            <ProtectedRoute requireRole="student">
              <TestStart />
            </ProtectedRoute>
          } />
          <Route path="/test/:id/take" element={
            <ProtectedRoute requireRole="student">
              <TestTake />
            </ProtectedRoute>
          } />
          <Route path="/test/:id/result" element={
            <ProtectedRoute requireRole="student">
              <TestResult />
            </ProtectedRoute>
          } />
          <Route path="/profile/settings" element={
            <ProtectedRoute requireRole={['student', 'admin']}>
              <ProfileSettings />
            </ProtectedRoute>
          } />
          <Route path="/student/results" element={
            <ProtectedRoute requireRole="student">
              <StudentResults />
            </ProtectedRoute>
          } />
          <Route path="/student/materials" element={
            <ProtectedRoute requireRole="student">
              <StudyMaterials />
            </ProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireRole="admin">
              <AdminConstructor />
            </ProtectedRoute>
          } />
          <Route path="/admin/results" element={
            <ProtectedRoute requireRole="admin">
              <ResultsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute requireRole="admin">
              <AdminStudents />
            </ProtectedRoute>
          } />

          <Route path="/locked" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900">
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Тест бұғатталды</h1>
                <p className="text-slate-600 mb-6">Сіздің тестіңіз анти-читерлік саясатты бұзуға байланысты бұғатталды (мысалы, қойындыларды ауыстыру).</p>
                <Link to="/student" className="px-6 py-2 bg-[#4848e5] text-white rounded-lg font-semibold hover:bg-[#4848e5]/90 transition-colors">
                  Басқару панеліне оралу
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
