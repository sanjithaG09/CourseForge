import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyLearning from './pages/MyLearning';
import Profile from './pages/Profile';
import InstructorCourses from './pages/InstructorCourses';
import DraftCourses from './pages/DraftCourses';
import CourseForm from './pages/CourseForm';
import Wishlist from './pages/Wishlist';
import Payment from './pages/Payment';

import './styles/global.css';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <Routes>
              {/* Public auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Public routes — accessible without login */}
              <Route path="/courses" element={
                <PublicLayout><Courses /></PublicLayout>
              } />

              <Route path="/courses/:id" element={
                <PublicLayout><CourseDetail /></PublicLayout>
              } />

              {/* Protected routes with sidebar layout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/my-learning" element={
                <ProtectedRoute>
                  <Layout><MyLearning /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Layout><Wishlist /></Layout>
                </ProtectedRoute>
              } />

              {/* Instructor-only routes */}
              <Route path="/instructor" element={
                <ProtectedRoute requiredRole="instructor">
                  <Layout><InstructorCourses /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/instructor/drafts" element={
                <ProtectedRoute requiredRole="instructor">
                  <Layout><DraftCourses /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/instructor/create" element={
                <ProtectedRoute requiredRole="instructor">
                  <Layout><CourseForm /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/instructor/edit/:id" element={
                <ProtectedRoute requiredRole="instructor">
                  <Layout><CourseForm /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/payment/:courseId" element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } />

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/courses" replace />} />
              <Route path="*" element={<Navigate to="/courses" replace />} />
            </Routes>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;