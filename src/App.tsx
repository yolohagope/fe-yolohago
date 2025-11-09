import { useState, useEffect } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MuroTareas } from './components/MuroTareas';
import { PublicarTarea } from './components/PublicarTarea';
import { MisTareas } from './components/MisTareas';
import { Perfil } from './components/Perfil';
import { Notificaciones } from './components/Notificaciones';
import { PropuestaPage } from './pages/PropuestaPage';

function AppContent() {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Rutas de autenticación */}
        <Route path="/login" element={<LoginForm onSwitchToRegister={() => window.location.href = '/register'} />} />
        <Route path="/register" element={<RegisterForm onSwitchToLogin={() => window.location.href = '/login'} />} />
        
        {/* Ruta para propuestas */}
        <Route path="/propuesta/:taskId" element={<PropuestaPage />} />
        
        {/* Rutas públicas (no requieren autenticación) */}
        <Route path="/explorar" element={
          <>
            <Header />
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
          <MuroTareas />
          <Footer />
        </>
      } />
      
      {/* Rutas que requieren autenticación */}
      <Route path="/publicar" element={<ProtectedRoute><Header /><PublicarTarea /><Footer /></ProtectedRoute>} />
      <Route path="/mis-tareas" element={<ProtectedRoute><Header /><MisTareas /><Footer /></ProtectedRoute>} />
      <Route path="/cuenta/*" element={<ProtectedRoute><Header /><Perfil /><Footer /></ProtectedRoute>} />
      <Route path="/notificaciones" element={<ProtectedRoute><Header /><Notificaciones /><Footer /></ProtectedRoute>} />
      
      {/* Página principal (pública) */}
      <Route path="/" element={
        <>
          <Header />
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
          <MuroTareas />
          <Footer />
        </>
      } />
      
      {/* 404 */}
      <Route path="*" element={
        <>
          <Header />
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
              <p className="text-xl text-muted-foreground mb-6">Página no encontrada</p>
              <a href="/" className="text-primary hover:underline">Volver al inicio</a>
            </div>
          </div>
          <Footer />
        </>
      } />
      </Routes>
    </div>
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