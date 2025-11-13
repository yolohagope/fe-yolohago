import { useState } from 'react';
import { SignIn, GoogleLogo, Eye, EyeSlash } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loginWithEmail, loginWithGoogle } from '@/services/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await loginWithEmail(email, password);
      // Redirigir al home después del login exitoso
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');
    
    try {
      await loginWithGoogle();
      // Redirigir al home después del login exitoso
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetSuccess(false);
    
    try {
      console.log('📧 Enviando correo de recuperación a:', resetEmail);
      await sendPasswordResetEmail(auth, resetEmail, {
        url: 'https://yolohago.pe',
        handleCodeInApp: false
      });
      console.log('✅ Correo de recuperación enviado exitosamente');
      setResetSuccess(true);
    } catch (err: any) {
      console.error('❌ Error al enviar correo:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico');
      } else if (err.code === 'auth/invalid-email') {
        setError('Correo electrónico inválido');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Por favor, espera unos minutos e intenta de nuevo');
      } else {
        setError(err.message || 'Error al enviar el correo de recuperación');
      }
    } finally {
      setLoading(false);
    }
  }

  // Vista de recuperar contraseña
  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Lado izquierdo - Formulario */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="text-xl font-bold">YoLoHago</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Recuperar contraseña</h1>
              <p className="text-muted-foreground">
                Ingresa tu correo y te enviaremos un link para restablecer tu contraseña
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {resetSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm space-y-2">
                <p className="font-semibold">✓ Correo enviado exitosamente</p>
                <p className="text-xs">
                  Si no recibes el correo en los próximos minutos:
                </p>
                <ul className="text-xs list-disc list-inside space-y-1 ml-2">
                  <li>Revisa tu carpeta de spam o correo no deseado</li>
                  <li>Verifica que el correo <strong>{resetEmail}</strong> sea correcto</li>
                  <li>Espera unos minutos, a veces tarda en llegar</li>
                </ul>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium mb-2">
                  Correo electrónico
                </label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="tu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar correo de recuperación'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(false);
                  setError('');
                  setResetEmail('');
                }}
                className="text-primary font-semibold hover:underline"
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>

        {/* Lado derecho - Ilustración */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
          {/* Imagen de fondo */}
          <div className="absolute inset-0">
            <img 
              src="/images/auth/right_0.png" 
              alt="Ilustración de recuperación"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Overlay gradient más fuerte para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 via-purple-600/70 to-purple-700/70"></div>
          </div>

          {/* Contenido de texto sobre la imagen */}
          <div className="relative text-white text-center space-y-6 max-w-lg z-10 p-12">
            <h2 className="text-4xl font-bold drop-shadow-2xl">Recupera tu acceso</h2>
            <p className="text-xl text-white drop-shadow-lg">
              Te ayudaremos a recuperar tu contraseña de forma segura
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Lado izquierdo - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <span className="text-xl font-bold">YoLoHago</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground">Inicia sesión ingresando la información a continuación</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-muted-foreground">Recuérdame</span>
              </label>
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-primary hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <GoogleLogo weight="bold" className="mr-2" size={20} />
            Continuar con Google
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary font-semibold hover:underline"
            >
              Regístrate
            </button>
          </div>
        </div>
      </div>

        {/* Lado derecho - Ilustración */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
          {/* Imagen de fondo */}
          <div className="absolute inset-0">
            <img 
              src="/images/auth/right_0.png" 
              alt="Ilustración de login"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Overlay gradient más fuerte para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 via-purple-600/70 to-purple-700/70"></div>
          </div>
          
          {/* Contenido de texto sobre la imagen */}
          <div className="relative text-white text-center space-y-6 max-w-lg z-10 p-12">
            <h2 className="text-4xl font-bold leading-tight drop-shadow-2xl">
              El tiempo es corto,<br />
              úsalo en lo que más te importa
            </h2>
            <p className="text-xl text-white drop-shadow-lg">
              Para todo lo demás, usa YoLoHago
            </p>
          </div>
        </div>
    </div>
  );
}
