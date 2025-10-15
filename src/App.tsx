import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import LoginPage from './components/LoginPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CompanyAdminDashboard from './components/CompanyAdminDashboard';
import TeamInchargeDashboard from './components/TeamInchargeDashboard';
import TelecallerDashboard from './components/TelecallerDashboard';

const getDashboardPath = (role?: string) => {
  switch (role) {
    case 'SuperAdmin': return '/superadmin';
    case 'CompanyAdmin': return '/companyadmin';
    case 'TeamIncharge': return '/teamincharge';
    case 'Telecaller': return '/telecaller';
    default: return '/login';
  }
};

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const { tenant, isLoading: tenantLoading, error: tenantError } = useTenant();

  // Show loading while tenant is being detected
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenant...</p>
        </div>
      </div>
    );
  }


  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Navigate to={getDashboardPath(user?.role)} replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
        />
        <Route
          path="/superadmin"
          element={
            isAuthenticated && user?.role === 'SuperAdmin' ? (
              <SuperAdminDashboard user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/companyadmin"
          element={
            isAuthenticated && (user?.role === 'CompanyAdmin' || user?.role === 'SuperAdmin') ? (
              <CompanyAdminDashboard user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/teamincharge"
          element={
            isAuthenticated && ['TeamIncharge', 'CompanyAdmin', 'SuperAdmin'].includes(user?.role || '') ? (
              <TeamInchargeDashboard user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/telecaller"
          element={
            isAuthenticated ? (
              <TelecallerDashboard user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <AppContent />
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;