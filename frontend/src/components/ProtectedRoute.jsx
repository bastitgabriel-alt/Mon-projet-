import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-block">Chargement...</div>;
  if (!user) return <Navigate to="/connexion" replace />;

  return children;
}
