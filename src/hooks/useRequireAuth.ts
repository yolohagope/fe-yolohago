import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para requerir autenticación antes de ejecutar una acción
 */
export function useRequireAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /**
   * Ejecuta una función solo si el usuario está autenticado
   * Si no está autenticado, redirige al login
   */
  const requireAuth = (callback: () => void) => {
    if (!user) {
      navigate('/login');
      return;
    }
    callback();
  };

  return { requireAuth, isAuthenticated: !!user };
}