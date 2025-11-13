# API de Notificaciones - Yolohago

Sistema de notificaciones **dinámico y configurable** que se dispara automáticamente mediante signals en operaciones CRUD. Los administradores pueden crear y gestionar notificaciones sin modificar código.

## 🎯 Características

- ✅ **Notificaciones automáticas** mediante Django signals
- ✅ **Templates dinámicos** con placeholders (`{user.name}`, `{instance.title}`)
- ✅ **Configuración desde admin** sin necesidad de deployments
- ✅ **Multi-canal**: In-app, email, push notifications
- ✅ **Condiciones personalizadas** con expresiones Python
- ✅ **Polling eficiente** con filtro `since` para obtener solo nuevas notificaciones
- ✅ **Scopes flexibles**: personal (usuario específico) o global (todos los usuarios)

## Arquitectura

### Modelos

#### 1. **Notification**
Notificación universal que se crea automáticamente cuando se dispara un signal.

**Campos principales:**
- `recipient`: Usuario que recibe la notificación (automático según scope)
- `actor`: Usuario que genera la acción (opcional)
- `notification_type`: Tipo de notificación (message, alert, reminder, promotion, info)
- `priority`: low, normal, high, urgent
- `title`: Título procesado desde el template
- `message`: Mensaje procesado desde el template
- `content_type` + `object_id`: GenericForeignKey para asociar a cualquier modelo
- `payload`: JSON con datos del template y metadatos
- `is_read`: Estado de lectura
- `action_url`: URL procesada desde el template
- `action_label`: Texto del botón procesado desde el template
- `created_at`: Timestamp para filtrado con `since`

**Tipos de notificación:**

```python
'message'    # � Mensaje general
'alert'      # ⚠️ Alerta
'reminder'   # ⏰ Recordatorio
'promotion'  # 🎁 Promoción
'info'       # ℹ️ Información
'welcome'    # 👋 Bienvenida
```

**Eventos del sistema (signals):**

Los siguientes eventos se disparan automáticamente y pueden tener notificaciones configuradas:

```python
# Usuarios
'user_created'        # Nuevo usuario registrado
'user_updated'        # Usuario actualizado

# Tareas
'task_created'        # Nueva tarea publicada
'task_updated'        # Tarea modificada
'task_deleted'        # Tarea eliminada

# Aplicaciones
'application_created' # Nueva aplicación a tarea
'application_updated' # Aplicación modificada

# Contratos
'contract_created'    # Contrato creado
'contract_updated'    # Contrato actualizado

# Pagos
'payment_created'     # Nuevo pago registrado
'payment_updated'     # Estado de pago actualizado

# Reseñas
'rating_created'      # Nueva reseña recibida

# Retiros
'withdrawal_created'  # Solicitud de retiro creada
'withdrawal_updated'  # Estado de retiro actualizado
```

#### 2. **NotificationPreference**
Preferencias de notificación por usuario.

**Campos:**
- `enable_in_app`: Notificaciones en la app (default: true)
- `enable_email`: Notificaciones por email (default: true)
- `enable_push`: Notificaciones push (default: true)
- `quiet_hours_enabled`: Horario de silencio
- `quiet_hours_start/end`: Rango de horario de silencio
- `email_digest_frequency`: instant, daily, weekly, never
- `notification_types_config`: JSON con configuración por tipo

---

## Endpoints del API

### Base URL: `/api/notifications/`

### 1. **Listar Notificaciones**

```http
GET /api/notifications/
```

**Query Parameters:**

- `is_read`: `true` | `false` - Filtrar por leídas/no leídas
- `type`: `message` | `alert` | `reminder` | `promotion` | `info` - Filtrar por tipo
- `priority`: `low` | `normal` | `high` | `urgent`
- `since`: `2024-01-15T10:00:00Z` - **Obtener solo notificaciones creadas después de este timestamp** (útil para polling)
- `limit`: Número de resultados por página (default: 20)
- `offset`: Índice de inicio para paginación

**Response:**

```json
{
  "count": 25,
  "next": "http://api.yolohago.com/api/notifications/?limit=20&offset=20",
  "previous": null,
  "results": [
    {
      "id": 1,
      "notification_type": "message",
      "type_display": "� Mensaje",
      "priority": "normal",
      "priority_display": "Normal",
      "title": "👋 ¡Bienvenido a YoloHago, Pedro García!",
      "message": "Gracias por formar parte de nuestra comunidad. Te invitamos a completar tu perfil para que puedas comenzar a recibir ofertas de trabajo.",
      "actor": null,
      "actor_name": null,
      "actor_avatar": null,
      "related_object_type": "user",
      "related_object_id": 5,
      "payload": {
        "template_id": 1,
        "template_name": "Bienvenida a YoloHago",
        "signal": "user_created",
        "title": "👋 ¡Bienvenido a YoloHago, Pedro García!",
        "message": "Gracias por formar parte...",
        "action_url": "/profile/edit",
        "action_label": "Completar mi perfil"
      },
      "is_read": false,
      "read_at": null,
      "action_url": "/profile/edit",
      "action_label": "Completar mi perfil",
      "sent_via_email": false,
      "sent_via_push": false,
      "is_expired": false,
      "expires_at": null,
      "created_at": "2025-11-13T21:39:47.938528Z",
      "time_ago": "Hace 2 horas"
    }
  ]
}
```

**Ejemplo de uso con `since` para polling:**

```javascript
// Primera carga: obtener todas las notificaciones
const response = await fetch('/api/notifications/');
const data = await response.json();
console.log(data.results); // Todas las notificaciones

// Guardar timestamp de la última notificación
const lastCheck = new Date().toISOString();

// Después de 30 segundos: obtener solo las nuevas
setTimeout(async () => {
  const newNotifications = await fetch(
    `/api/notifications/?since=${lastCheck}`
  );
  const newData = await newNotifications.json();
  console.log(newData.results); // Solo notificaciones nuevas desde lastCheck
}, 30000);
```

### 2. **Conteo de No Leídas**
```http
GET /api/notifications/unread_count/
```

**Response:**
```json
{
  "unread_count": 5
}
```

### 3. **Marcar como Leída**
```http
POST /api/notifications/{id}/mark_as_read/
```

**Response:**
```json
{
  "id": 1,
  "is_read": true,
  "read_at": "2025-11-08T12:30:00Z",
  ...
}
```

### 4. **Marcar Múltiples como Leídas**
```http
POST /api/notifications/mark_multiple_as_read/
```

**Body:**
```json
{
  "notification_ids": [1, 2, 3]
}
```

Si `notification_ids` está vacío, marca TODAS como leídas.

**Response:**
```json
{
  "message": "3 notificación(es) marcada(s) como leída(s)",
  "count": 3
}
```

### 5. **Marcar Todas como Leídas**
```http
POST /api/notifications/mark_all_as_read/
```

**Response:**
```json
{
  "message": "Todas las notificaciones marcadas como leídas",
  "count": 15
}
```

### 6. **Eliminar Notificaciones Leídas**
```http
DELETE /api/notifications/delete_read/
```

**Response:**
```json
{
  "message": "10 notificación(es) eliminada(s)",
  "count": 10
}
```

### 7. **Obtener Tipos de Notificación**
```http
GET /api/notifications/types/
```

**Response:**
```json
{
  "notification_types": [
    {
      "value": "task_assigned",
      "label": "📋 Tarea asignada",
      "emoji": "📋"
    },
    {
      "value": "payment_received",
      "label": "💰 Pago recibido",
      "emoji": "💰"
    }
  ]
}
```

### 8. **Broadcast (Solo Admin/Staff)**
```http
POST /api/notifications/broadcast/
```

Envía notificación a múltiples usuarios a la vez.

**Body:**
```json
{
  "recipient_ids": [1, 2, 3, 4, 5],
  "notification_type": "system_announcement",
  "title": "Mantenimiento programado",
  "message": "El sistema estará en mantenimiento el sábado de 2am a 4am",
  "priority": "high",
  "payload": {
    "maintenance_start": "2025-11-10T02:00:00Z",
    "maintenance_end": "2025-11-10T04:00:00Z"
  },
  "action_url": "/announcements/maintenance-nov-10",
  "action_label": "Ver detalles",
  "send_email": true,
  "send_push": true,
  "expires_at": "2025-11-10T04:00:00Z"
}
```

**Response:**
```json
{
  "message": "5 notificación(es) enviada(s)",
  "count": 5,
  "notifications": [...]
}
```

---

## Preferencias de Notificación

### Base URL: `/api/notification-preferences/`

### 1. **Obtener Preferencias**
```http
GET /api/notification-preferences/
```

**Response:**
```json
{
  "enable_in_app": true,
  "enable_email": true,
  "enable_push": false,
  "notification_types_config": {
    "task_assigned": {
      "in_app": true,
      "email": true,
      "push": false
    },
    "payment_received": {
      "in_app": true,
      "email": true,
      "push": true
    }
  },
  "quiet_hours_enabled": true,
  "quiet_hours_start": "22:00:00",
  "quiet_hours_end": "08:00:00",
  "email_digest_frequency": "daily"
}
```

### 2. **Actualizar Preferencias**
```http
PUT /api/notification-preferences/
PATCH /api/notification-preferences/
```

**Body (ejemplo):**
```json
{
  "enable_push": true,
  "quiet_hours_enabled": true,
  "quiet_hours_start": "23:00:00",
  "quiet_hours_end": "07:00:00"
}
```

### 3. **Resetear Preferencias**
```http
POST /api/notification-preferences/reset/
```

Resetea todas las preferencias a valores por defecto.

---

## 🔧 Sistema Dinámico de Notificaciones

### ¿Cómo funciona?

El sistema es **100% automático** y configurable desde el Django Admin:

1. **Signals globales** ya están configurados en todos los modelos CRUD (User, Task, Application, Contract, Payment, Rating, Withdrawal)
2. **Admins crean configuraciones** de notificaciones desde el panel admin sin tocar código
3. **Templates con placeholders** que se procesan automáticamente: `{user.name}`, `{instance.title}`, `{actor.email}`
4. **Condiciones opcionales** con Python expressions para envío condicional
5. **Multi-canal**: In-app, email, push notifications

### Configurar Notificación desde Admin

**Paso 1:** Ir a Django Admin → Notification Templates → Add

**Paso 2:** Llenar formulario:

```yaml
Name: "Nueva aplicación recibida"
Description: "Notificar al poster cuando alguien aplica a su tarea"

Signal: "application_created"
Notification Type: "message"
Scope: "personal"
Recipient Field: "task.poster"  # Navega por relaciones

Template Config (JSON):
{
  "title": "📬 Nueva aplicación para: {instance.task.title}",
  "message": "{actor.name} ha aplicado a tu tarea '{instance.task.title}'. Revisa su perfil y propuesta.",
  "action_url": "/tasks/{instance.task.id}/applications",
  "action_label": "Ver aplicaciones"
}

Conditions (opcional):
"""
instance.task.poster.email_verified == True
"""

Priority: "normal"
☑ Send In-App
☑ Send Email
☐ Send Push
```

**Paso 3:** Guardar y activar

¡Listo! Ahora cada vez que alguien aplique a una tarea, el poster recibirá automáticamente la notificación.

### Placeholders Disponibles

En los templates puedes usar:

- `{user.field}` - Datos del usuario destinatario: `{user.name}`, `{user.email}`
- `{instance.field}` - Datos del objeto que disparó el signal: `{instance.title}`, `{instance.amount}`
- `{actor.field}` - Datos del usuario que realizó la acción: `{actor.name}`, `{actor.avatar_url}`
- **Navegación por relaciones**: `{instance.task.poster.name}`, `{instance.contract.worker.email}`

### Eventos Disponibles

Todos estos signals ya están configurados y listos para usar:

| Signal | Cuándo se dispara | Variables disponibles |
|--------|-------------------|----------------------|
| `user_created` | Nuevo usuario registrado | `user`, `instance` |
| `user_updated` | Usuario actualizado | `user`, `instance` |
| `task_created` | Nueva tarea publicada | `instance`, `actor` (poster) |
| `task_updated` | Tarea modificada | `instance`, `actor` (poster) |
| `application_created` | Nueva aplicación | `instance`, `actor` (applicant), `user` (poster) |
| `contract_created` | Contrato creado | `instance`, `user` (worker), `actor` (poster) |
| `payment_updated` | Pago actualizado | `instance`, `user` |
| `rating_created` | Nueva reseña | `instance`, `user` (rated), `actor` (rater) |
| `withdrawal_updated` | Retiro actualizado | `instance`, `user` |

### Ejemplo Completo: Pago Recibido

```json
{
  "name": "Pago exitoso",
  "signal_name": "payment_updated",
  "notification_type": "message",
  "scope": "personal",
  "recipient_field": "user",
  "template_config": {
    "title": "💰 ¡Pago recibido exitosamente!",
    "message": "Tu pago de {instance.currency} {instance.amount} ha sido procesado correctamente. Ya puedes ver tu nuevo balance.",
    "action_url": "/balance",
    "action_label": "Ver mi balance"
  },
  "conditions": "instance.status == 'succeeded'",
  "priority": "high",
  "send_in_app": true,
  "send_email": true,
  "send_push": true
}
```

---

## 📱 Integración Frontend

### Servicio de Notificaciones (React/Next.js)

```javascript
// services/NotificationService.js
class NotificationService {
  constructor(authToken) {
    this.baseUrl = '/api/notifications/';
    this.authToken = authToken;
    this.lastCheck = null;
  }

  async getNotifications(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.is_read !== undefined) {
      params.append('is_read', filters.is_read);
    }
    if (filters.type) {
      params.append('type', filters.type);
    }
    if (filters.priority) {
      params.append('priority', filters.priority);
    }
    if (filters.since) {
      params.append('since', filters.since);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    if (filters.offset) {
      params.append('offset', filters.offset);
    }

    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: { 'Authorization': `Bearer ${this.authToken}` }
    });
    
    return await response.json();
  }

  /**
   * Obtiene solo las notificaciones nuevas desde la última consulta
   * Útil para polling sin traer datos duplicados
   */
  async getNewNotifications() {
    const filters = this.lastCheck ? { since: this.lastCheck } : {};
    const data = await this.getNotifications(filters);
    
    // Actualizar timestamp para próxima consulta
    if (data.results.length > 0) {
      this.lastCheck = new Date().toISOString();
    }
    
    return data;
  }

  async getUnreadCount() {
    const response = await fetch(`${this.baseUrl}unread_count/`, {
      headers: { 'Authorization': `Bearer ${this.authToken}` }
    });
    return await response.json();
  }

  async markAsRead(notificationId) {
    const response = await fetch(
      `${this.baseUrl}${notificationId}/mark_as_read/`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      }
    );
    return await response.json();
  }

  async markMultipleAsRead(notificationIds) {
    const response = await fetch(
      `${this.baseUrl}mark_multiple_as_read/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_ids: notificationIds })
      }
    );
    return await response.json();
  }

  async markAllAsRead() {
    const response = await fetch(
      `${this.baseUrl}mark_all_as_read/`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      }
    );
    return await response.json();
  }

  /**
   * Inicia polling automático para obtener nuevas notificaciones
   * @param {Function} onNewNotifications - Callback cuando hay nuevas notificaciones
   * @param {number} intervalMs - Intervalo en milisegundos (default: 30000 = 30s)
   */
  startPolling(onNewNotifications, intervalMs = 30000) {
    this.lastCheck = new Date().toISOString();
    
    this.pollingInterval = setInterval(async () => {
      try {
        const data = await this.getNewNotifications();
        if (data.results.length > 0) {
          onNewNotifications(data.results);
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

export default NotificationService;
```

### Hook de React

```javascript
// hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import NotificationService from '../services/NotificationService';

export function useNotifications(authToken) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [service] = useState(() => new NotificationService(authToken));

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await service.getNotifications({ limit: 20 });
      setNotifications(data.results);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await service.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [service]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await service.markAsRead(notificationId);
      await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [service, fetchNotifications, fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      await service.markAllAsRead();
      await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [service, fetchNotifications, fetchUnreadCount]);

  // Iniciar polling al montar el componente
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Polling cada 30 segundos para notificaciones nuevas
    service.startPolling((newNotifications) => {
      setNotifications(prev => [...newNotifications, ...prev]);
      fetchUnreadCount();
      
      // Mostrar toast o notificación del sistema
      if (newNotifications.length > 0) {
        showNotificationToast(newNotifications[0]);
      }
    }, 30000);

    return () => {
      service.stopPolling();
    };
  }, [service, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}

function showNotificationToast(notification) {
  // Implementar con tu librería de toasts favorita
  // Ejemplo: react-hot-toast, react-toastify, etc.
  console.log('Nueva notificación:', notification.title);
}
```

### Componente de UI

```javascript
// components/NotificationBell.jsx
import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationBell({ authToken }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = 
    useNotifications(authToken);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No tienes notificaciones
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notif.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notif.id);
                    if (notif.action_url) {
                      window.location.href = notif.action_url;
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{notif.title}</h4>
                    <span className="text-xs text-gray-500">{notif.time_ago}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                  {notif.action_label && (
                    <span className="text-xs text-blue-600">
                      {notif.action_label} →
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## ✅ Mejores Prácticas

### Para Administradores

1. **Templates claros y accionables**
   - Usa emojis para mejor reconocimiento visual: 📬 💰 ⭐ ✅
   - Incluye siempre `action_url` y `action_label` útiles
   - Mensajes cortos y directos (máximo 2-3 líneas)

2. **Usar condiciones para filtrado fino**
   ```python
   # Solo notificar pagos exitosos mayores a 100
   instance.status == 'succeeded' and instance.amount > 100
   ```

3. **Probar templates antes de activar**
   - Usa el botón "Test with sample data" en el admin
   - Verifica que los placeholders se resuelvan correctamente

4. **Prioridades adecuadas**
   - `urgent`: Requiere acción inmediata (pagos fallidos, disputas)
   - `high`: Importante pero no crítico (nueva aplicación, contrato)
   - `normal`: Informativo (bienvenida, actualizaciones)
   - `low`: Puede esperar (tips, promociones)

5. **Multi-canal inteligente**
   - In-app: Siempre activado
   - Email: Para eventos importantes que requieren acción
   - Push: Solo para eventos urgentes o de alto valor

### Para Desarrolladores Frontend

1. **Usar filtro `since` para polling eficiente**
   ```javascript
   // ❌ MAL: Traer todas las notificaciones cada vez
   setInterval(() => fetch('/api/notifications/'), 30000);
   
   // ✅ BIEN: Solo traer nuevas desde última consulta
   const lastCheck = new Date().toISOString();
   setInterval(() => 
     fetch(`/api/notifications/?since=${lastCheck}`), 
     30000
   );
   ```

2. **Mostrar feedback inmediato**
   - Update local state optimistically antes de la respuesta del servidor
   - Usar toast notifications para nuevas notificaciones en tiempo real

3. **Paginación y límites razonables**
   ```javascript
   // Cargar 20 notificaciones inicialmente
   fetch('/api/notifications/?limit=20')
   
   // Cargar más con offset
   fetch('/api/notifications/?limit=20&offset=20')
   ```

4. **Caché inteligente**
   - Usar React Query o SWR para caché automático
   - Revalidar cada 30-60 segundos
   - Invalidar caché al marcar como leída

5. **Experiencia de usuario fluida**
   ```javascript
   // Abrir notificación debe marcarla como leída Y redirigir
   const handleNotificationClick = async (notification) => {
     await markAsRead(notification.id);
     router.push(notification.action_url);
   };
   ```

### Para el Backend

1. **Payload estructurado**
   ```python
   # El sistema ya incluye metadatos automáticamente:
   payload = {
     "template_id": 1,
     "template_name": "Bienvenida",
     "signal": "user_created",
     "title": "Título procesado",
     "message": "Mensaje procesado",
     ...
   }
   ```

2. **Testing de signals**
   ```python
   # Testear que las notificaciones se crean correctamente
   user = User.objects.create(email="test@example.com")
   notifications = Notification.objects.filter(recipient=user)
   assert notifications.count() == 1
   assert "Bienvenido" in notifications.first().title
   ```

3. **Performance**
   - Los signals ya están optimizados con `select_related` donde aplica
   - Las notificaciones se crean en la misma transacción del objeto
   - Para envío masivo, considerar usar Celery tasks

---

## 🔮 Futuro: WebSocket (Opcional)

Para notificaciones en tiempo **verdadero real-time** sin polling, se puede integrar Django Channels:

```python
# consumers.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        await self.channel_layer.group_add(
            f"notifications_{self.user.id}",
            self.channel_name
        )
        await self.accept()
    
    async def notification_message(self, event):
        await self.send_json(event["notification"])
```

```javascript
// Frontend WebSocket
const ws = new WebSocket('ws://api.yolohago.com/ws/notifications/');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  showNotificationToast(notification);
  updateNotificationList(notification);
};
```

**Nota:** Por ahora, el sistema de polling con `since` es suficiente para la mayoría de casos de uso y es mucho más simple de mantener.
