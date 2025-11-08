import { Task, Category, UserProfile, UpdateProfilePayload } from '@/lib/types';
import { authenticatedFetch } from './backend-auth';
import { auth } from '@/lib/firebase';

const API_BASE_URL = 'https://api.yolohago.pe/api';

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
  category: Task['category'];
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
