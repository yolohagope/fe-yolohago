import { Task } from '@/lib/types';

/**
 * Configuración de la API
 * En desarrollo: carga datos desde archivos JSON locales
 * En producción: cambia BASE_URL a tu API real
 */
const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Servicio para obtener todas las tareas
 * Para migrar a API real: simplemente actualiza la URL y mantén el resto del código
 */
export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch(`${BASE_URL}/data/tasks.json`);
    
    if (!response.ok) {
      throw new Error(`Error al cargar tareas: ${response.statusText}`);
    }
    
    const tasks: Task[] = await response.json();
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

/**
 * Servicio para obtener una tarea por ID
 * Para migrar a API real: cambia la URL a `${BASE_URL}/api/tasks/${id}`
 */
export async function fetchTaskById(id: string): Promise<Task | null> {
  try {
    const tasks = await fetchTasks();
    const task = tasks.find(t => t.id === id);
    return task || null;
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
 * Servicio para crear una nueva tarea (placeholder para futuro)
 * Para implementar con API real: descomentar y actualizar URL
 */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  // TODO: Implementar cuando tengas API backend
  // const response = await fetch(`${BASE_URL}/api/tasks`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(payload),
  // });
  // return response.json();
  
  throw new Error('createTask no está implementado todavía');
}

/**
 * Servicio para actualizar una tarea (placeholder para futuro)
 */
export async function updateTask(id: string, payload: Partial<Task>): Promise<Task> {
  // TODO: Implementar cuando tengas API backend
  // const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
  //   method: 'PATCH',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(payload),
  // });
  // return response.json();
  
  throw new Error('updateTask no está implementado todavía');
}

/**
 * Servicio para eliminar una tarea (placeholder para futuro)
 */
export async function deleteTask(id: string): Promise<void> {
  // TODO: Implementar cuando tengas API backend
  // await fetch(`${BASE_URL}/api/tasks/${id}`, {
  //   method: 'DELETE',
  // });
  
  throw new Error('deleteTask no está implementado todavía');
}
