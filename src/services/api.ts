import { 
  Task, 
  Category, 
  UserProfile, 
  UpdateProfilePayload, 
  Balance, 
  Transaction, 
  TransactionsResponse,
  PaymentMethod,
  CreateBankAccountPayload,
  CreateYapePlinPayload,
  CreatePayPalPayload,
  WithdrawalRequest,
  CreateWithdrawalPayload
} from '@/lib/types';
import { authenticatedFetch } from './backend-auth';
import { auth } from '@/lib/firebase';

// Configuración dinámica de API según el ambiente
// En desarrollo: usa localhost:8000 (.env.local)
// En producción: usa https://api.yolohago.pe (.env.production)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.yolohago.pe/api';

console.log('🌐 API Base URL:', API_BASE_URL);

/**
 * Servicio para obtener todas las categorías
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/categories/', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Error al cargar categorías: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Django REST Framework devuelve: {count, next, previous, results: []}
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    
    // Fallback: si es un array directo
    if (Array.isArray(data)) {
      return data;
    }
    
    console.warn('⚠️ Formato de respuesta inesperado:', data);
    return [];
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    
    // Si es error de autenticación, cerrar sesión
    if (error.name === 'AuthenticationError') {
      console.warn('⚠️ Error de autenticación, cerrando sesión...');
      await auth.signOut();
    }
    
    // Retornar array vacío en caso de error
    return [];
  }
}

/**
 * Servicio para obtener todas las tareas
 */
export async function fetchTasks(): Promise<Task[]> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/tasks/', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Error al cargar tareas: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Django REST Framework devuelve: {count, next, previous, results: []}
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    
    // Fallback: si es un array directo
    if (Array.isArray(data)) {
      return data;
    }
    
    console.warn('⚠️ Formato de respuesta inesperado:', data);
    return [];
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    
    // Si es error de autenticación, cerrar sesión
    if (error.name === 'AuthenticationError') {
      console.warn('⚠️ Error de autenticación, cerrando sesión...');
      await auth.signOut();
    }
    
    // Retornar array vacío en caso de error
    return [];
  }
}

/**
 * Servicio para obtener una tarea por ID
 */
export async function fetchTaskById(id: string): Promise<Task | null> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, `/tasks/${id}/`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error al cargar tarea: ${response.statusText}`);
    }
    
    const task: Task = await response.json();
    return task;
  } catch (error: any) {
    console.error('Error fetching task by id:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Servicio para obtener las tareas que el usuario ha tomado
 */
export async function fetchMyTasks(): Promise<Task[]> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/tasks/my-tasks/', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Error al cargar mis tareas: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Django REST Framework devuelve: {count, next, previous, results: []}
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    
    // Fallback: si es un array directo
    if (Array.isArray(data)) {
      return data;
    }
    
    console.warn('⚠️ Formato de respuesta inesperado:', data);
    return [];
  } catch (error: any) {
    console.error('Error fetching my tasks:', error);
    
    if (error.name === 'AuthenticationError') {
      console.warn('⚠️ Error de autenticación, cerrando sesión...');
      await auth.signOut();
    }
    
    return [];
  }
}

/**
 * Servicio para obtener las tareas que el usuario ha publicado
 */
export async function fetchMyPublishedTasks(): Promise<Task[]> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/tasks/my-published/', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Error al cargar mis publicaciones: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Django REST Framework devuelve: {count, next, previous, results: []}
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    
    // Fallback: si es un array directo
    if (Array.isArray(data)) {
      return data;
    }
    
    console.warn('⚠️ Formato de respuesta inesperado:', data);
    return [];
  } catch (error: any) {
    console.error('Error fetching my published tasks:', error);
    
    if (error.name === 'AuthenticationError') {
      console.warn('⚠️ Error de autenticación, cerrando sesión...');
      await auth.signOut();
    }
    
    return [];
  }
}

/**
 * Servicio para filtrar tareas
 * Para migrar a API real: envía los parámetros como query params
 * Ejemplo: `${BASE_URL}/api/tasks?search=${search}&category=${category}`
 */
export async function searchTasks(
  search?: string,
  category?: string
): Promise<Task[]> {
  try {
    const tasks = await fetchTasks();
    
    return tasks.filter(task => {
      const matchesSearch = !search || 
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = !category || category === 'Todas' || task.category === category;
      
      return matchesSearch && matchesCategory;
    });
  } catch (error) {
    console.error('Error searching tasks:', error);
    throw error;
  }
}

// Tipos para futuras operaciones de API
export interface CreateTaskPayload {
  title: string;
  description: string;
  category: number; // Cambiado: ahora enviamos el ID de la categoría como number
  payment: number;
  currency: string;
  location: string;
  deadline: string;
  posterName: string;
}

/**
 * Servicio para crear una nueva tarea
 */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/tasks/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Error al crear tarea: ${response.statusText}`);
    }
    
    const task: Task = await response.json();
    return task;
  } catch (error: any) {
    console.error('Error creating task:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Servicio para actualizar una tarea
 */
export async function updateTask(id: string, payload: Partial<Task>): Promise<Task> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, `/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Error al actualizar tarea: ${response.statusText}`);
    }
    
    const task: Task = await response.json();
    return task;
  } catch (error: any) {
    console.error('Error updating task:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Servicio para eliminar una tarea
 */
export async function deleteTask(id: string): Promise<void> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, `/tasks/${id}/`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Error al eliminar tarea: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('Error deleting task:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

// ============================================
// PERFIL DE USUARIO
// ============================================

/**
 * Obtener el perfil del usuario actual
 */
export async function fetchProfile(): Promise<UserProfile> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }
    
    console.log('🔍 Obteniendo perfil del usuario...');
    
    const response = await authenticatedFetch(user, '/profile/', {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error al cargar perfil:', response.status, errorText);
      throw new Error(`Error al cargar perfil: ${response.statusText}`);
    }
    
    const profile: UserProfile = await response.json();
    console.log('✅ Perfil cargado:', profile);
    return profile;
  } catch (error: any) {
    console.error('❌ Error fetching profile:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Actualizar el perfil del usuario (parcial o completo)
 */
export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  try {
    const user = auth.currentUser;
    
    // Si hay archivo de foto, usar FormData
    if (payload.profile_photo) {
      const formData = new FormData();
      
      if (payload.first_name) formData.append('first_name', payload.first_name);
      if (payload.last_name) formData.append('last_name', payload.last_name);
      if (payload.phone) formData.append('phone', payload.phone);
      if (payload.bio) formData.append('bio', payload.bio);
      if (payload.city) formData.append('city', payload.city);
      if (payload.address) formData.append('address', payload.address);
      formData.append('profile_photo', payload.profile_photo);
      
      const firebaseToken = await user!.getIdToken(true);
      
      const response = await fetch(`${API_BASE_URL}/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${firebaseToken}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar perfil: ${response.statusText} - ${errorText}`);
      }
      
      const profile: UserProfile = await response.json();
      return profile;
    } else {
      // Sin archivo, usar JSON normal
      const response = await authenticatedFetch(user, '/profile/', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar perfil: ${response.statusText}`);
      }
      
      const profile: UserProfile = await response.json();
      return profile;
    }
  } catch (error: any) {
    console.error('Error updating profile:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Eliminar foto de perfil personalizada
 */
export async function deleteProfilePhoto(): Promise<void> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/profile/photo/', {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Error al eliminar foto: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('Error deleting profile photo:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Obtener el balance del usuario
 */
export async function fetchBalance(): Promise<Balance> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    console.log('📊 Obteniendo balance del usuario...');
    
    const response = await authenticatedFetch(user, '/transactions/balance/', {
      method: 'GET'
    });
    
    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error al cargar balance: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Balance obtenido:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error fetching balance:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Obtener las transacciones del usuario
 */
export async function fetchTransactions(params?: {
  transaction_type?: 'payment' | 'withdrawal' | 'refund' | 'fee';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  page?: number;
}): Promise<TransactionsResponse> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    // Construir query params
    const queryParams = new URLSearchParams();
    if (params?.transaction_type) queryParams.append('transaction_type', params.transaction_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const url = `/transactions/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('📋 Obteniendo transacciones:', url);
    
    const response = await authenticatedFetch(user, url, {
      method: 'GET'
    });
    
    console.log('📋 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error al cargar transacciones: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Transacciones obtenidas:', data);
    
    // Validar que tenga la estructura esperada
    if (!data.results || !Array.isArray(data.results)) {
      console.warn('⚠️ Respuesta sin formato paginado esperado:', data);
      // Si no tiene results, asumir que es un array directo
      if (Array.isArray(data)) {
        return {
          count: data.length,
          next: null,
          previous: null,
          results: data
        };
      }
      // Si no es array, devolver vacío
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Error fetching transactions:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Obtener todos los métodos de pago del usuario
 */
export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/payment-methods/', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Error al cargar métodos de pago: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Asegurarse de que devolvemos un array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Si la respuesta tiene una propiedad 'results' (paginación)
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }
    
    // Si es un objeto vacío o null, devolver array vacío
    console.warn('fetchPaymentMethods: respuesta inesperada', data);
    return [];
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Crear un nuevo método de pago (cuenta bancaria)
 */
export async function createBankAccount(payload: CreateBankAccountPayload): Promise<PaymentMethod> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/payment-methods/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al crear cuenta bancaria');
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error creating bank account:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Crear un nuevo método de pago (Yape/Plin)
 */
export async function createYapePlin(payload: CreateYapePlinPayload): Promise<PaymentMethod> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/payment-methods/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al crear método de pago');
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error creating Yape/Plin:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Crear un nuevo método de pago (PayPal)
 */
export async function createPayPal(payload: CreatePayPalPayload): Promise<PaymentMethod> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/payment-methods/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al crear PayPal');
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error creating PayPal:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Marcar un método de pago como principal
 */
export async function setPaymentMethodPrimary(id: number): Promise<PaymentMethod> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, `/payment-methods/${id}/set_primary/`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`Error al marcar como principal: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error setting primary payment method:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Desactivar un método de pago
 */
export async function deactivatePaymentMethod(id: number): Promise<PaymentMethod> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, `/payment-methods/${id}/deactivate/`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al desactivar método');
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error deactivating payment method:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Activar un método de pago
 */
export async function activatePaymentMethod(id: number): Promise<PaymentMethod> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, `/payment-methods/${id}/activate/`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`Error al activar método: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error activating payment method:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Eliminar un método de pago
 */
export async function deletePaymentMethod(id: number): Promise<void> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, `/payment-methods/${id}/`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al eliminar método');
    }
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}

/**
 * Crear solicitud de retiro
 */
export async function createWithdrawalRequest(payload: CreateWithdrawalPayload): Promise<WithdrawalRequest> {
  try {
    const user = auth.currentUser;
    const response = await authenticatedFetch(user, '/withdrawal-requests/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al solicitar retiro');
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error creating withdrawal request:', error);
    
    if (error.name === 'AuthenticationError') {
      await auth.signOut();
    }
    
    throw error;
  }
}
