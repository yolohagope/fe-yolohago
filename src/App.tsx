import { useState, useEffect } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Header } from './components/Header';
import { MuroTareas } from './components/MuroTareas';
import { PublicarTarea } from './components/PublicarTarea';
import { PropuestaPage } from './pages/PropuestaPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState<'explorar' | 'publicar'>('explorar');
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get('propuesta') === 'enviada') {
      setShowSuccessBanner(true);
      setSearchParams({});
      setTimeout(() => setShowSuccessBanner(false), 8000);
    } else if (searchParams.get('tarea') === 'publicada') {
      setShowSuccessBanner(true);
      setSearchParams({});
      setTimeout(() => setShowSuccessBanner(false), 8000);
    }
  }, [searchParams, setSearchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <Routes>
      <Route path="/propuesta/:taskId" element={<PropuestaPage />} />
      <Route
        path="/"
        element={
          <>
            <Header currentView={currentView} onViewChange={setCurrentView} />
            {showSuccessBanner && (
              <div className="bg-[#34A853] text-white py-3 px-4 shadow-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">
                      {searchParams.get('propuesta') === 'enviada' || window.location.search.includes('propuesta')
                        ? '¡Propuesta enviada exitosamente!'
                        : '¡Tarea publicada exitosamente!'}
                    </span>
                    <span className="hidden sm:inline text-white/90">
                      {searchParams.get('propuesta') === 'enviada' || window.location.search.includes('propuesta')
                        ? 'Si deseas cambiar algo podrás ir a la sección "Mis tareas"'
                        : 'Pronto llegarán las primeras propuestas. Podrás verlas en "Mis tareas"'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSuccessBanner(false)}
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            {currentView === 'explorar' ? (
              <MuroTareas />
            ) : (
              <PublicarTarea onSuccess={() => setCurrentView('explorar')} />
            )}
          </>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App