import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { InternDashboard } from './pages/intern/Dashboard';
import { AssessmentInterface } from './pages/intern/Assessment';
import { TestGate } from './pages/intern/TestGate';
import { Landing } from './pages/Landing';
import { ProtectedRoute } from './components/ProtectedRoute';

function RootRedirect() {
  const { user, role, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Public Assessment Route for Guests */}
        <Route path="/test/:id" element={<TestGate />} />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Intern Routes */}
        <Route element={<ProtectedRoute allowedRoles={['intern']} />}>
          <Route path="/dashboard" element={<InternDashboard />} />
          <Route path="/assessment/:id" element={<AssessmentInterface />} />
        </Route>

        {/* Root Redirect based on role */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
