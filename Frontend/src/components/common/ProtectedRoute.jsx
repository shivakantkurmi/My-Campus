import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * Wraps a route so only authenticated users with the correct role can access it.
 * @param {string[]} roles  - allowed roles  (omit to allow any authenticated user)
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user, token } = useAuthStore();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (user.isBlocked) return <Navigate to="/blocked" replace />;

  if (roles.length && !roles.includes(user.role))
    return <Navigate to="/dashboard" replace />;

  return children;
}
