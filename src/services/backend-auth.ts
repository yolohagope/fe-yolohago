import { User } from 'firebase/auth';

const API_BASE_URL = 'https://api.yolohago.pe/api';
const TOKEN_COOKIE_NAME = 'yolohago_auth_token';

interface BackendAuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    phone: string;
    photo_url: string;
    created_at: string;
  };
}

/**
 * Envía el token de Firebase al backend y recibe un token de Django
 */
export async function authenticateWithBackend(firebaseUser: User): Promise<string> {
  try {
    // Obtener el token de Firebase
    const firebaseToken = await firebaseUser.getIdToken();
    
    // Enviar al backend
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend response:', response.status, errorText);
      throw new Error(`Error al autenticar con el servidor: ${response.status} ${errorText}`);
    }

    const data: BackendAuthResponse = await response.json();
    
    if (!data.success) {
      throw new Error('Autenticación fallida en el backend');
    }

    const djangoToken = data.token;

    // Guardar token en cookie segura
    setAuthToken(djangoToken);

    console.log('✅ Usuario backend:', data.user);

    return djangoToken;
  } catch (error) {
    console.error('Error en authenticateWithBackend:', error);
    throw error;
  }
}

/**
 * Guarda el token de autenticación en una cookie segura
 */
export function setAuthToken(token: string): void {
  // Cookie segura con httpOnly simulado (en producción usar httpOnly real desde el servidor)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // Expira en 7 días

  document.cookie = `${TOKEN_COOKIE_NAME}=${token}; expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`;
}

/**
 * Obtiene el token de autenticación de la cookie
 */
export function getAuthToken(): string | null {
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TOKEN_COOKIE_NAME) {
      return value;
    }
  }
  
  return null;
}

/**
 * Elimina el token de autenticación
 */
export function removeAuthToken(): void {
  document.cookie = `${TOKEN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`;
}

/**
 * Verifica si hay un token válido
 */
export function hasAuthToken(): boolean {
  return getAuthToken() !== null;
}

/**
 * Hace una petición autenticada al backend
 */
export async function authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  console.log('🔑 Usando token:', token.substring(0, 20) + '...');

  const headers = {
    ...options.headers,
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error en petición autenticada:', {
      endpoint,
      status: response.status,
      error: errorText
    });
  }

  return response;
}
