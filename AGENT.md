# 🤖 Agent Configuration Guide

Esta es la configuración específica para agentes de desarrollo (GitHub Copilot, etc.) que trabajen en el proyecto **YoLoHago**.

## 🛠️ Configuración de Entorno

### Node.js Version
```bash
# Usar Node.js v22 con nvm
source ~/.nvm/nvm.sh
nvm use 22.3.0
```

**⚠️ Importante**: Este proyecto requiere Node.js v22 o superior. Siempre verificar que esté activo antes de ejecutar comandos.

### Verificación de Entorno
```bash
# Verificar versiones
node --version  # Debe ser v22.x.x
npm --version   # Debe ser v10.x.x
```

## 🚀 Comandos de Desarrollo

### Desarrollo Local
```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en:
# http://localhost:5173
```

### Build y Testing
```bash
# Compilar para producción
npm run build

# Verificar tipos TypeScript
npm run lint

# Optimizar dependencias
npm run optimize
```

### Instalación de Dependencias
```bash
# Solo si es necesario (node_modules ya existe)
npm install
```

## 📋 Reglas de Desarrollo

### 1. Estructura del Proyecto
- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI
- **Auth**: Firebase Authentication
- **Backend**: API REST (Django) en `https://api.yolohago.pe/api`

### 2. Patrones de Código
- **Componentes**: Usar PascalCase (`MuroTareas.tsx`)
- **Hooks**: Prefijo `use` (`useAuth`, `useMobile`)
- **Tipos**: Interfaces en `src/lib/types.ts`
- **API**: Servicios en `src/services/api.ts`

### 3. API Integration
- **Base URL**: `https://api.yolohago.pe/api`
- **Auth**: Firebase JWT tokens
- **Formato**: JSON con autenticación Bearer

**Ejemplo de payload para crear tareas:**
```typescript
const payload: CreateTaskPayload = {
  title: string,
  description: string,
  category: number, // ⚠️ ID de categoría, NO string
  payment: number,
  currency: string,
  location: string,
  deadline: string,
  posterName: string
}
```

### 4. Categorías
- **NUNCA** usar strings para categorías (`"Regalos"`)
- **SIEMPRE** usar IDs numéricos (`5`)
- Cargar categorías con `fetchCategories()` antes de usar

### 5. Autenticación
- **Acceso público**: Lista de tareas, detalles, categorías (sin login)
- **Acceso protegido**: Crear tarea, mis tareas, perfil (requiere login)
- **Header dinámico**: Cambia según estado de autenticación
- Usar `ProtectedRoute` para rutas que requieren login
- Usar `useAuth()` hook para verificar estado de usuario

### 6. APIs Públicas vs Protegidas
**APIs Públicas (sin autenticación):**
- `fetchTasks()` - Lista de tareas
- `fetchCategories()` - Lista de categorías  
- `fetchTaskById()` - Detalle de tarea

**APIs Protegidas (requieren autenticación):**
- `createTask()` - Crear tarea
- `fetchMyTasks()` - Mis tareas tomadas
- `fetchMyPublishedTasks()` - Mis tareas publicadas
- Todo lo relacionado con perfil y pagos

## 🔧 Troubleshooting

### Error: "command not found: npm"
```bash
# Activar nvm primero
source ~/.nvm/nvm.sh
nvm use 22.3.0
```

### Error: "category expected primary key"
```typescript
// ❌ Incorrecto
category: "Regalos"

// ✅ Correcto  
category: 5 // ID numérico de la categoría
```

### Error de Compilación TypeScript
```bash
# Verificar tipos
npm run build

# Si hay errores, revisar:
# - Importaciones correctas
# - Tipos en src/lib/types.ts
# - Interfaces de API
```

## 📁 Archivos Clave

### Componentes Principales
- `src/App.tsx` - Router y layout principal
- `src/components/PublicarTarea.tsx` - Formulario crear tareas
- `src/components/MuroTareas.tsx` - Lista de tareas
- `src/contexts/AuthContext.tsx` - Autenticación

### Configuración
- `src/lib/types.ts` - Definiciones TypeScript
- `src/services/api.ts` - Servicios backend
- `src/lib/firebase.ts` - Configuración Firebase

### Build & Deploy
- `vite.config.ts` - Configuración Vite
- `tailwind.config.js` - Configuración Tailwind
- `package.json` - Scripts y dependencias

## 🎯 Casos de Uso Comunes

### Crear Nueva Tarea
1. Usuario llena formulario en `/publicar`
2. Selecciona categoría (se guarda ID internamente)
3. Envía payload con `category: number`
4. Backend recibe y procesa correctamente

### Debugging API
```typescript
// Ver payload antes de enviar
console.log('📤 Enviando tarea:', payload);

// Ver respuesta del backend
console.log('✅ Respuesta:', response);
```

### Testing Local
```bash
# 1. Activar Node.js 22
source ~/.nvm/nvm.sh && nvm use 22.3.0

# 2. Iniciar desarrollo
npm run dev

# 3. Abrir browser en http://localhost:5173
```

## 🚨 Reglas Críticas

1. **SIEMPRE** usar nvm con Node.js 22+
2. **NUNCA** commitear cambios sin `npm run build` exitoso
3. **SIEMPRE** usar IDs numéricos para categorías
4. **VERIFICAR** autenticación antes de hacer peticiones API
5. **MANTENER** compatibilidad con tipos TypeScript

---

*Este archivo debe ser consultado por cualquier agente antes de realizar cambios en el proyecto.*