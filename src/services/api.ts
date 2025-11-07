import { Task } from '@/lib/types';
import { authenticatedFetch } from './backend-auth';
import { auth } from '@/lib/firebase';

const API_BASE_URL = 'https://api.yolohago.pe/api';

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
    
    const tasks: Task[] = await response.json();
    return tasks;
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    
    // Si es error de autenticación, cerrar sesión
    if (error.name === 'AuthenticationError') {
      console.warn('⚠️ Error de autenticación, cerrando sesión...');
      await auth.signOut();
    }
    
    throw error;
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
