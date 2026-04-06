import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Header from './components/layout/Header';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import { UserRole } from './types';
import { useAuth } from './contexts/AuthContext';
import { useScrollToTop } from './hooks/useScrollToTop';

// Lazy load all route components for better performance
const ThreeScene = lazy(() => import('./components/common/ThreeScene'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ProfileSetupPage = lazy(() => import('./pages/ProfileSetupPage'));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
const ExternalJobsPage = lazy(() => import('./pages/ExternalJobsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PlacementDashboard = lazy(() => import('./pages/PlacementDashboard'));
const PostOpportunityPage = lazy(() => import('./pages/PostOpportunityPage'));
const ManageOpportunitiesPage = lazy(() => import('./pages/ManageOpportunitiesPage'));
const ResumeAnalyzerPage = lazy(() => import('./pages/ResumeAnalyzerPage'));
const CareerPathSimulatorPage = lazy(() => import('./pages/CareerPathSimulatorPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const App: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Enable scroll to top on route changes with refresh position restoration
  useScrollToTop();

  // Determine page types
  const isLanding = location.pathname === '/';
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const isAuthenticated = !!user;

  // Show navigation based on auth state and page type
  const showHeader = !isLanding && !isAuthPage; // Show header on all pages except landing, login, and signup

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your profile..." />;
  }

  // Redirect to profile setup if student profile is incomplete - DISABLED
  // Allow users to access dashboard even with incomplete profile
  // const isProfileIncomplete = user && user.role === UserRole.STUDENT && !user.cgpa;

  // if (isProfileIncomplete && location.pathname !== '/profile-setup' && location.pathname !== '/login' && location.pathname !== '/signup') {
  //   return <Navigate to="/profile-setup" replace />;
  // }

  // Redirect authenticated users from auth pages to their dashboard
  if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
    if (user.role === UserRole.STUDENT) {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === UserRole.PLACEMENT_OFFICER) {
      return <Navigate to="/placement/dashboard" replace />;
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-white dark:bg-black text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-600 dark:selection:bg-neon-purple selection:text-white">
        {/* Dynamic Background for App pages (excluding Landing) */}
        {!isLanding && (
          <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:gradient-bg-purple -z-50" />
        )}

        {/* Lazy-loaded ThreeScene for better performance */}
        {isLanding && (
          <Suspense fallback={null}>
            <ThreeScene />
          </Suspense>
        )}

        {/* Main content wrapper */}
        <div className="flex-1 flex flex-col">
          {/* Header for all users (excluding landing if desired, but logic above handles it) */}
          {showHeader && (
            <Header
              userRole={user?.role}
              userName={user?.name}
              userAvatar={user?.avatar}
              notifications={user?.notifications}
            />
          )}

          <Suspense fallback={<LoadingSpinner fullScreen message="Loading page..." />}>
            <main id="main-content" role="main">
              <AnimatePresence mode="wait">
                <Routes location={location}>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute userRole={user?.role} requiredRole={UserRole.STUDENT}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile-setup"
                    element={
                      <ProtectedRoute userRole={user?.role} requiredRole={UserRole.STUDENT}>
                        <ProfileSetupPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/opportunities"
                    element={
                      <ProtectedRoute userRole={user?.role} requiredRole={UserRole.STUDENT}>
                        <OpportunitiesPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/external-jobs"
                    element={
                      <ProtectedRoute userRole={user?.role} requiredRole={UserRole.STUDENT}>
                        <ExternalJobsPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute userRole={user?.role}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Placement Officer Routes */}
                  <Route
                    path="/placement/dashboard"
                    element={
                      <ProtectedRoute
                        userRole={user?.role}
                        requiredRole={UserRole.PLACEMENT_OFFICER}
                      >
                        <PlacementDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/placement/post"
                    element={
                      <ProtectedRoute
                        userRole={user?.role}
                        requiredRole={UserRole.PLACEMENT_OFFICER}
                      >
                        <PostOpportunityPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/placement/edit/:id"
                    element={
                      <ProtectedRoute
                        userRole={user?.role}
                        requiredRole={UserRole.PLACEMENT_OFFICER}
                      >
                        <PostOpportunityPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/placement/opportunities"
                    element={
                      <ProtectedRoute
                        userRole={user?.role}
                        requiredRole={UserRole.PLACEMENT_OFFICER}
                      >
                        <ManageOpportunitiesPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Profile Route - accessible to all authenticated users */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute userRole={user?.role}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Resume Analyzer Route - accessible to all authenticated users */}
                  <Route
                    path="/resume-analyzer"
                    element={
                      <ProtectedRoute userRole={user?.role}>
                        <ResumeAnalyzerPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Career Path Simulator Route - accessible to students */}
                  <Route
                    path="/career-simulator"
                    element={
                      <ProtectedRoute userRole={user?.role} requiredRole={UserRole.STUDENT}>
                        <CareerPathSimulatorPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Not Found */}
                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute>
                        <CalendarPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AnimatePresence>
            </main>
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
