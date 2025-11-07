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
