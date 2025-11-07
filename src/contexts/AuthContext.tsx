import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authenticateWithBackend, removeAuthToken } from '@/services/backend-auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  backendAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  backendAuthenticated: false 
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendAuthenticated, setBackendAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Usuario logueado en Firebase, ahora autenticar con backend
        try {
          await authenticateWithBackend(firebaseUser);
          setBackendAuthenticated(true);
          console.log('✅ Usuario autenticado con el backend');
        } catch (error) {
          console.error('❌ Error al autenticar con el backend:', error);
          console.warn('⚠️ Continuando sin autenticación de backend (modo desarrollo)');
          setBackendAuthenticated(false);
        }
      } else {
        // Usuario no logueado, limpiar token
        removeAuthToken();
        setBackendAuthenticated(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, backendAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
