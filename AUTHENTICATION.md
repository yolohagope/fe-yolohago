# 🔐 Sistema de Autenticación YoloHago

## Flujo de Autenticación

El sistema implementa un flujo de autenticación dual entre **Firebase** (frontend) y **Django** (backend):

### 1️⃣ Usuario se loguea con Firebase
- Login con Email/Password
- Login con Google OAuth

### 2️⃣ Autenticación Automática con Backend
Cuando Firebase confirma el login, el sistema automáticamente:

1. Obtiene el `ID Token` de Firebase del usuario
2. Envía `POST` a `https://api.yolohago.pe/api/auth/login` con:
   ```
   Authorization: Bearer <firebase_id_token>
   Body: {
     uid: "firebase_uid",
     email: "user@example.com",
     displayName: "User Name",
     photoURL: "https://..."
   }
   ```

3. El backend Django valida el token de Firebase
4. Retorna un token de autenticación de Django:
   ```json
   {
     "token": "django_auth_token_here"
   }
   ```

5. El frontend guarda el token en una cookie segura:
   - Nombre: `yolohago_auth_token`
   - Atributos: `secure`, `samesite=strict`
   - Expiración: 7 días

### 3️⃣ Peticiones Autenticadas
Todas las peticiones al backend usan el helper `authenticatedFetch()`:

```typescript
import { authenticatedFetch } from '@/services/backend-auth';

const response = await authenticatedFetch('/tasks/', {
  method: 'GET'
});
```

Esto automáticamente incluye el header:
```
Authorization: Token <django_token>
```

## 📁 Archivos Clave

### `src/services/backend-auth.ts`
Maneja toda la lógica de autenticación con el backend:
- `authenticateWithBackend()` - Envía token de Firebase y recibe token de Django
- `setAuthToken()` / `getAuthToken()` - Manejo de cookies
- `authenticatedFetch()` - Wrapper para peticiones autenticadas
- `removeAuthToken()` - Limpia el token al hacer logout

### `src/contexts/AuthContext.tsx`
Contexto global que maneja el estado de autenticación:
- Escucha cambios en Firebase (`onAuthStateChanged`)
- Automáticamente autentica con backend cuando hay usuario
- Limpia token cuando usuario hace logout
- Expone: `user`, `loading`, `backendAuthenticated`

### `src/services/api.ts`
Todos los endpoints del API usan `authenticatedFetch()`:
- `fetchTasks()` - GET /tasks/
- `fetchTaskById(id)` - GET /tasks/{id}/
- `createTask(payload)` - POST /tasks/
- `updateTask(id, payload)` - PATCH /tasks/{id}/
- `deleteTask(id)` - DELETE /tasks/{id}/

## 🔧 Configuración

### Cambiar entre Backend Real y JSON Local

En `src/services/api.ts`:

```typescript
const USE_BACKEND = true; // true = API real, false = JSON local
```

### URL del Backend

En `src/services/backend-auth.ts`:

```typescript
const API_BASE_URL = 'https://api.yolohago.pe/api';
```

## 🧪 Testing del Flujo

1. **Login**: Usuario se loguea con email o Google
2. **Consola del navegador** mostrará:
   ```
   ✅ Usuario autenticado con el backend
   ```
3. **DevTools → Application → Cookies**: Verificar cookie `yolohago_auth_token`
4. **Network → Headers**: Verificar que peticiones incluyen `Authorization: Token ...`

## 🚨 Manejo de Errores

Si falla la autenticación con el backend:
- Se muestra error en consola: `❌ Error al autenticar con el backend`
- `backendAuthenticated` = `false`
- Usuario puede seguir navegando pero las peticiones al API fallarán
- Considerar mostrar mensaje al usuario para reintentar login

## 🔒 Seguridad

### Cookies
- **Producción**: Usar cookies `httpOnly` desde el backend (más seguro)
- **Desarrollo**: Cookies accesibles desde JS (limitación del navegador)

### Tokens
- Token de Django se renueva cada 7 días
- Firebase maneja su propia renovación automática
- Al hacer logout, ambos tokens se limpian

## 📊 Estado de Autenticación

Usar el hook `useAuth()` en cualquier componente:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, backendAuthenticated } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  
  if (!user) return <div>No autenticado</div>;
  
  if (!backendAuthenticated) {
    return <div>Error de conexión con servidor</div>;
  }
  
  return <div>Usuario: {user.email}</div>;
}
```

## 🎯 Próximos Pasos

- [ ] Implementar refresh token para sesiones largas
- [ ] Agregar interceptor para renovar token cuando expire
- [ ] Manejar errores 401 (no autorizado) de forma global
- [ ] Implementar logout desde el backend
- [ ] Agregar indicador visual de estado de conexión con backend
