import { Task } from '@/lib/types';
import { authenticatedFetch, getAuthToken } from './backend-auth';

/**
 * Configuración de la API
 * Usa el backend real de YoloHago
 */
const API_BASE_URL = 'https://api.yolohago.pe/api';
const USE_BACKEND = false; // Cambiar a true cuando el backend permita CORS desde localhost

/**
 * Servicio para obtener todas las tareas
 */
export async function fetchTasks(): Promise<Task[]> {
  try {
    if (USE_BACKEND) {
      const response = await authenticatedFetch('/tasks/', {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar tareas: ${response.statusText}`);
      }
      
      const tasks: Task[] = await response.json();
      return tasks;
    } else {
      // Fallback a JSON local
      const response = await fetch('/data/tasks.json');
      if (!response.ok) {
        throw new Error(`Error al cargar tareas: ${response.statusText}`);
      }
      const tasks: Task[] = await response.json();
      return tasks;
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

/**
 * Servicio para obtener una tarea por ID
 */
export async function fetchTaskById(id: string): Promise<Task | null> {
  try {
    if (USE_BACKEND) {
      const response = await authenticatedFetch(`/tasks/${id}/`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Error al cargar tarea: ${response.statusText}`);
      }
      
      const task: Task = await response.json();
      return task;
    } else {
      // Fallback a JSON local
      const tasks = await fetchTasks();
      const task = tasks.find(t => t.id === id);
      return task || null;
    }
  } catch (error) {
    console.error('Error fetching task by id:', error);
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
    const response = await authenticatedFetch('/tasks/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Error al crear tarea: ${response.statusText}`);
    }
    
    const task: Task = await response.json();
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Servicio para actualizar una tarea
 */
export async function updateTask(id: string, payload: Partial<Task>): Promise<Task> {
  try {
    const response = await authenticatedFetch(`/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Error al actualizar tarea: ${response.statusText}`);
    }
    
    const task: Task = await response.json();
    return task;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

/**
 * Servicio para eliminar una tarea
 */
export async function deleteTask(id: string): Promise<void> {
  try {
    const response = await authenticatedFetch(`/tasks/${id}/`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Error al eliminar tarea: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}
