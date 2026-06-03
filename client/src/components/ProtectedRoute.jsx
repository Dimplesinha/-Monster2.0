import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Employer portal paths — unauthenticated visitors go to employer register, not /login
const EMPLOYER_PATHS = ['/dashboard', '/post-job', '/employer/'];

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;

  const isEmployerPath = EMPLOYER_PATHS.some((p) =>
    p.endsWith('/') ? location.pathname.startsWith(p) : location.pathname === p
  );

  if (!user) {
    // Send unauthenticated users to the right login portal
    if (isEmployerPath) {
      return <Navigate to="/employer/register?tab=login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    // Wrong role — send to the right home for their role
    if (user.role === 'employer' || user.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
