import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Task } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper para obtener el nombre de la categoría de una tarea
 * Maneja tanto el formato nuevo (objeto) como el antiguo (string)
 */
export function getCategoryName(task: Task): string {
  if (typeof task.category === 'object' && task.category !== null) {
    return task.category.name;
  }
  if (typeof task.category === 'string') {
    return task.category;
  }
  return 'Otro';
}

/**
 * Helper para obtener el ID de la categoría de una tarea
 */
export function getCategoryId(task: Task): number | undefined {
  if (typeof task.category === 'object' && task.category !== null) {
    return task.category.id;
  }
  return task.category_id;
}

/**
 * Helper para obtener el ícono de la categoría de una tarea
 */
export function getCategoryIcon(task: Task): string | undefined {
  if (typeof task.category === 'object' && task.category !== null) {
    return task.category.icon;
  }
  return undefined;
}

/**
 * Helper para obtener si la tarea está verificada
 * Maneja tanto is_verified como isVerified
 */
export function isTaskVerified(task: Task): boolean {
  return task.is_verified ?? task.isVerified ?? false;
}

/**
 * Helper para obtener el nombre del publicador
 * Maneja tanto poster_name como posterName
 */
export function getPosterName(task: Task): string {
  return task.poster_name ?? task.posterName ?? 'Usuario';
}
