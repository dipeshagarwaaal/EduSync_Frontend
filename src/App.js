import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './assets/css/custom.css';

import { AuthProvider } from './utils/AuthContext';
import { NotificationProvider } from './utils/NotificationContext';

import Navbar from './components/common/Navbar';
import Unauthorized from './components/common/Unauthorized';
import Notifications from './components/common/Notifications';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './components/auth/Login';
import Register from './components/auth/Register';

import CourseList from './components/courses/CourseList';
import CourseDetail from './components/courses/CourseDetail';
import EditableForm from './components/courses/EditableForm';

import AssessmentList from './components/assessments/AssessmentList';
import AssessmentDetail from './components/assessments/AssessmentDetail';
import AssessmentForm from './components/assessments/AssessmentForm';

import ResultList from './components/results/ResultList';

import Home from './pages/Home';
import Loading from './components/common/Loading';
import ApiConfigManager from './utils/ApiConfigManager';
import SessionTimeout from './components/common/SessionTimeout';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app-container d-flex flex-column min-vh-100">
            <SessionTimeout />
            <Navbar />
            <Notifications />
            
            <main className="flex-grow-1">
              <ApiConfigManager />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected Routes - Accessible by all authenticated users */}
                <Route path="/courses" element={
                  <ProtectedRoute>
                    <CourseList />
                  </ProtectedRoute>
                } />
                
                <Route path="/courses/:id" element={
                  <ProtectedRoute>
                    <CourseDetail />
                  </ProtectedRoute>
                } />

                {/* Instructor Only Routes */}
                <Route path="/courses/create" element={
                  <ProtectedRoute requiredRole="Instructor">
                    <EditableForm />
                  </ProtectedRoute>
                } />

                <Route path="/courses/edit/:id" element={
                  <ProtectedRoute requiredRole="Instructor">
                    <EditableForm />
                  </ProtectedRoute>
                } />

                {/* Assessment Routes */}
                <Route path="/assessments" element={
                  <ProtectedRoute>
                    <AssessmentList />
                  </ProtectedRoute>
                } />

                <Route path="/assessments/:id" element={
                  <ProtectedRoute>
                    <AssessmentDetail />
                  </ProtectedRoute>
                } />

                <Route path="/assessments/create" element={
                  <ProtectedRoute requiredRole="Instructor">
                    <AssessmentForm />
                  </ProtectedRoute>
                } />

                <Route path="/assessments/edit/:id" element={
                  <ProtectedRoute requiredRole="Instructor">
                    <AssessmentForm />
                  </ProtectedRoute>
                } />

                {/* Results Routes */}
                <Route path="/results" element={
                  <ProtectedRoute>
                    <ResultList />
                  </ProtectedRoute>
                } />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
