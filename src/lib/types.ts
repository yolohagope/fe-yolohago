export type TaskCategory = string; // Ahora es dinámico desde el backend

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  payment: number;
  currency: string;
  location: string;
  deadline: string;
  isVerified: boolean;
  posterName: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  city: string;
  address: string;
  profile_photo: string | null;
  photo_url: string | null; // URL completa de la foto (puede ser de Google)
  rating: number; // Calificación promedio (0-5)
  rating_count: number; // Número de calificaciones recibidas
  tasks_published: number; // Número de tareas publicadas
  tasks_completed: number; // Número de tareas completadas
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  city?: string;
  address?: string;
  profile_photo?: File;
}
