import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Protected pages
import Dashboard from './pages/Dashboard';
import ReportCrime from './pages/citizen/ReportCrime';
import MyReports from './pages/citizen/MyReports';
import CrimeList from './pages/police/CrimeList';
import AssignedCases from './pages/police/AssignedCases';
import FIRRequests from './pages/police/FIRRequests';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Profile from './pages/Profile';

// Components
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/dashboard" replace /> : <Register />
            } />
            <Route path="/forgot-password" element={
              user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
            } />
            <Route path="/reset-password" element={
              user ? <Navigate to="/dashboard" replace /> : <ResetPassword />
            } />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Citizen Routes */}
            <Route path="/report-crime" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <ReportCrime />
              </ProtectedRoute>
            } />
            <Route path="/my-reports" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <MyReports />
              </ProtectedRoute>
            } />

            {/* Police Routes */}
            <Route path="/crimes" element={
              <ProtectedRoute allowedRoles={['police', 'admin']}>
                <CrimeList />
              </ProtectedRoute>
            } />
            <Route path="/assigned-cases" element={
              <ProtectedRoute allowedRoles={['police']}>
                <AssignedCases />
              </ProtectedRoute>
            } />
            <Route path="/fir-requests" element={
              <ProtectedRoute allowedRoles={['police', 'admin']}>
                <FIRRequests />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />

            {/* Common Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Default Route */}
            <Route path="/" element={
              <Navigate to={user ? "/dashboard" : "/login"} replace />
            } />

            {/* 404 Route */}
            <Route path="*" element={
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page not found</p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Go Back
                </button>
              </div>
            } />
          </Routes>
        </main>

        {user && <Footer />}
      </div>
    </Router>
  );
};

// Root App Component with Context
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
