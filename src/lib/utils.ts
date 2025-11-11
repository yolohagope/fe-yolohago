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
 * Helper para obtener la imagen de banner de la categoría
 */
export function getCategoryBannerImage(task: Task): string | undefined {
  if (typeof task.category === 'object' && task.category !== null) {
    return task.category.banner_image;
  }
  return undefined;
}

/**
 * Helper para obtener la URL completa de la imagen de banner
 */
export function getCategoryBannerUrl(task: Task): string | undefined {
  const bannerImage = getCategoryBannerImage(task);
  if (bannerImage) {
    // Si ya es una URL completa, devolverla tal cual
    if (bannerImage.startsWith('http')) {
      return bannerImage;
    }
    // Si es una ruta relativa, construir la URL completa
    const getApiBaseUrl = () => {
      const envUrl = import.meta.env.VITE_API_URL;
      const isDevelopment = import.meta.env.DEV;
      
      if (envUrl) return envUrl;
      if (isDevelopment) return 'http://localhost:8000/api';
      return 'https://api.yolohago.pe/api';
    };
    
    const API_BASE_URL = getApiBaseUrl();
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${bannerImage}`;
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
