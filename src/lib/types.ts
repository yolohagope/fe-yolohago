export type TaskCategory = 'Compras' | 'Trámites' | 'Delivery' | 'Limpieza' | 'Tecnología' | 'Otro';

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
