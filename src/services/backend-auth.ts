import { User } from 'firebase/auth';

const API_BASE_URL = 'https://api.yolohago.pe/api';

/**
 * Obtiene el token de Firebase del usuario actual
 */
export async function getFirebaseToken(user: User): Promise<string> {
  return await user.getIdToken();
}

/**
 * Hace una petición autenticada al backend usando el token de Firebase
 */
export async function authenticatedFetch(user: User | null, endpoint: string, options: RequestInit = {}): Promise<Response> {
  if (!user) {
    const error = new Error('Usuario no autenticado');
    error.name = 'AuthenticationError';
    throw error;
  }

  const firebaseToken = await getFirebaseToken(user);

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${firebaseToken}`,
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
    
    // Si es 401, el token expiró o es inválido
    if (response.status === 401) {
      const error = new Error('Token inválido o expirado');
      error.name = 'AuthenticationError';
      throw error;
    }
  }

  return response;
}
