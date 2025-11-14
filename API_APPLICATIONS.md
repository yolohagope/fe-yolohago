# API de Postulaciones (Applications)

## Descripción General

El sistema de postulaciones permite a los usuarios aplicar a tareas publicadas, ofreciendo su propio precio (contraoferta). Los dueños de las tareas pueden revisar las postulaciones y aceptar o rechazar a los candidatos. Al aceptar una postulación, se crea automáticamente un contrato.

## Flujo de Trabajo

```text
1. Usuario A publica una tarea con precio S/ 200
2. Usuario B postula ofreciendo S/ 180 (contraoferta)
3. Usuario C postula ofreciendo S/ 150
4. Usuario A (dueño de la tarea):
   a) Acepta postulación → Se crea contrato + Otras postulaciones se rechazan automáticamente
   b) Rechaza postulación → Estado: rejected
5. Si se acepta: Se inicia el contrato con el precio acordado
```

## Estados de Postulación

| Estado | Descripción | Puede editar | Puede eliminar |
|--------|-------------|--------------|----------------|
| `pending` | Esperando revisión del dueño | ❌ | ✅ Postulante |
| `accepted` | Aceptada (contrato creado) | ❌ | ❌ |
| `rejected` | Rechazada por el dueño | ❌ | ❌ |
| `cancelled` | Cancelada por el postulante | ❌ | ❌ |

## Endpoints

### 1. Listar Postulaciones

**GET** `/api/applications/`

Lista las postulaciones según los filtros proporcionados.

**Query Parameters:**

- `task` (opcional): ID de la tarea para ver todas sus postulaciones
- `mine=true` (opcional): Ver solo mis postulaciones
- `my_tasks=true` (opcional): Ver postulaciones a mis tareas publicadas
- `status` (opcional): Filtrar por estado (`pending`, `accepted`, `rejected`, `cancelled`)

**Ejemplos de uso:**

```bash
# Ver postulaciones a una tarea específica
GET /api/applications/?task=5

# Ver mis postulaciones
GET /api/applications/?mine=true

# Ver postulaciones a mis tareas publicadas
GET /api/applications/?my_tasks=true

# Ver solo postulaciones pendientes a mis tareas
GET /api/applications/?my_tasks=true&status=pending
```

**Respuesta exitosa (200):**

```json
[
  {
    "id": 1,
    "task": 5,
    "task_title": "Diseño de logo para startup",
    "applicant_name": "Juan Pérez",
    "offered_price": "180.00",
    "currency": "S/",
    "status": "pending",
    "created_at": "2025-11-13T10:30:00Z"
  },
  {
    "id": 2,
    "task": 5,
    "task_title": "Diseño de logo para startup",
    "applicant_name": "María García",
    "offered_price": "150.00",
    "currency": "S/",
    "status": "pending",
    "created_at": "2025-11-13T11:15:00Z"
  }
]
```

---

### 2. Crear Postulación

**POST** `/api/applications/`

Crea una nueva postulación a una tarea. El usuario autenticado será registrado automáticamente como el postulante.

**Requisitos:**

- Usuario autenticado
- No ser el dueño de la tarea
- No haber postulado anteriormente a la misma tarea (única postulación por tarea)

**Body:**

```json
{
  "task": 5,
  "offered_price": "180.00",
  "currency": "S/",
  "message": "Hola, soy diseñador con 5 años de experiencia. Puedo entregar el logo en 3 días con 3 revisiones incluidas. Mi portafolio: behance.net/juanperez"
}
```

**Campos:**

- `task` (requerido): ID de la tarea a la que se postula
- `offered_price` (requerido): Precio ofrecido (puede ser diferente al de la tarea)
- `currency` (requerido): Moneda (`S/` o `$`)
- `message` (opcional): Mensaje de presentación y propuesta

**Respuesta exitosa (201):**

```json
{
  "id": 1,
  "task": 5,
  "task_title": "Diseño de logo para startup",
  "applicant": 10,
  "applicant_name": "Juan Pérez",
  "applicant_email": "juan@example.com",
  "poster_name": "María García",
  "offered_price": "180.00",
  "currency": "S/",
  "message": "Hola, soy diseñador con 5 años de experiencia...",
  "status": "pending",
  "created_at": "2025-11-13T10:30:00Z",
  "updated_at": "2025-11-13T10:30:00Z"
}
```

**Errores comunes:**

```json
// 400 - Precio inválido
{
  "offered_price": ["El precio ofertado debe ser mayor a 0"]
}

// 400 - Postulando a propia tarea
{
  "non_field_errors": ["No puedes postular a tu propia tarea"]
}

// 400 - Ya postulaste anteriormente
{
  "detail": "Ya existe una postulación para esta tarea"
}
```

---

### 3. Obtener Detalles de Postulación

**GET** `/api/applications/{id}/`

Obtiene los detalles completos de una postulación.

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "task": 5,
  "task_title": "Diseño de logo para startup",
  "applicant": 10,
  "applicant_name": "Juan Pérez",
  "applicant_email": "juan@example.com",
  "poster_name": "María García",
  "offered_price": "180.00",
  "currency": "S/",
  "message": "Hola, soy diseñador con 5 años de experiencia...",
  "status": "pending",
  "created_at": "2025-11-13T10:30:00Z",
  "updated_at": "2025-11-13T10:30:00Z"
}
```

---

### 4. Actualizar Postulación

**PATCH** `/api/applications/{id}/`

**⚠️ Solo el dueño de la tarea puede actualizar postulaciones** (generalmente para cambiar el estado).

**Nota:** Los postulantes NO pueden editar sus postulaciones una vez enviadas. Si necesitan cambiar algo, deben eliminarla y crear una nueva (solo si está en estado `pending`).

**Body:**

```json
{
  "status": "rejected"
}
```

**Errores:**

```json
// 403 - No eres el dueño de la tarea
{
  "error": "Solo el dueño de la tarea puede modificar postulaciones"
}
```

---

### 5. Eliminar Postulación

**DELETE** `/api/applications/{id}/`

Elimina una postulación. Solo el postulante puede eliminar sus propias postulaciones pendientes.

**Requisitos:**

- Ser el postulante (dueño de la postulación)
- Postulación en estado `pending`

**Respuesta exitosa (204):**

```
(Sin contenido)
```

**Errores:**

```json
// 403 - No eres el postulante
{
  "error": "Solo puedes eliminar tus propias postulaciones"
}

// 403 - Estado no válido
{
  "error": "Solo puedes eliminar postulaciones pendientes"
}
```

---

### 6. Aceptar Postulación

**POST** `/api/applications/{id}/accept/`

Acepta una postulación y crea automáticamente un contrato. Solo el dueño de la tarea puede aceptar postulaciones.

**Requisitos:**

- Ser el dueño de la tarea
- Postulación en estado `pending`
- La tarea no debe tener un contrato activo

**Proceso automático:**

1. Cambia el estado de la postulación a `accepted`
2. Crea un contrato con el precio acordado (offered_price)
3. Rechaza automáticamente todas las demás postulaciones pendientes

**Respuesta exitosa (200):**

```json
{
  "message": "Postulación aceptada y contrato creado",
  "application_id": 1,
  "contract_id": 15
}
```

**Errores:**

```json
// 403 - No eres el dueño
{
  "error": "Solo el dueño de la tarea puede aceptar postulaciones"
}

// 400 - Estado no válido
{
  "error": "Solo se pueden aceptar postulaciones pendientes"
}

// 400 - Ya existe contrato
{
  "error": "Esta tarea ya tiene un contrato activo"
}
```

---

### 7. Rechazar Postulación

**POST** `/api/applications/{id}/reject/`

Rechaza una postulación. Solo el dueño de la tarea puede rechazar postulaciones.

**Requisitos:**

- Ser el dueño de la tarea
- Postulación en estado `pending`

**Respuesta exitosa (200):**

```json
{
  "message": "Postulación rechazada"
}
```

**Errores:**

```json
// 403 - No eres el dueño
{
  "error": "Solo el dueño de la tarea puede rechazar postulaciones"
}

// 400 - Estado no válido
{
  "error": "Solo se pueden rechazar postulaciones pendientes"
}
```

---

## Validaciones Importantes

### 1. Unicidad por Tarea

Un usuario solo puede postular **una vez** a cada tarea. Si intenta postular nuevamente, recibirá un error.

```python
# Si ya postulaste, debes eliminar tu postulación anterior (si está pending)
DELETE /api/applications/{id}/
# Luego puedes crear una nueva
POST /api/applications/
```

### 2. No Postular a Propias Tareas

El sistema previene que los usuarios postulen a sus propias tareas publicadas.

```json
{
  "non_field_errors": ["No puedes postular a tu propia tarea"]
}
```

### 3. Precio Mayor a Cero

El `offered_price` debe ser siempre mayor a 0.

```json
{
  "offered_price": ["El precio ofertado debe ser mayor a 0"]
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Trabajador Postula a una Tarea

```javascript
// Ver detalles de la tarea
const task = await fetch('/api/tasks/5/', {
  headers: { 'Authorization': 'Token abc123...' }
}).then(r => r.json());

console.log(`Tarea: ${task.title}`);
console.log(`Precio sugerido: ${task.currency} ${task.payment}`);

// Postular con precio diferente (contraoferta)
const application = await fetch('/api/applications/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Token abc123...'
  },
  body: JSON.stringify({
    task: 5,
    offered_price: "180.00",  // Tarea pedía 200, ofrezco 180
    currency: "S/",
    message: "Tengo experiencia en proyectos similares. Portafolio: ..."
  })
}).then(r => r.json());

console.log(`Postulación creada: ${application.id}`);
```

### Ejemplo 2: Dueño Revisa Postulaciones

```javascript
// Ver todas las postulaciones a mi tarea
const applications = await fetch('/api/applications/?task=5', {
  headers: { 'Authorization': 'Token xyz789...' }
}).then(r => r.json());

console.log(`${applications.length} postulaciones recibidas`);

applications.forEach(app => {
  console.log(`- ${app.applicant_name}: ${app.currency} ${app.offered_price}`);
});

// Revisar detalles de una postulación
const details = await fetch('/api/applications/1/', {
  headers: { 'Authorization': 'Token xyz789...' }
}).then(r => r.json());

console.log(`Mensaje: ${details.message}`);

// Aceptar la postulación
const result = await fetch('/api/applications/1/accept/', {
  method: 'POST',
  headers: { 'Authorization': 'Token xyz789...' }
}).then(r => r.json());

console.log(`Contrato creado: ${result.contract_id}`);
```

### Ejemplo 3: Ver Mis Postulaciones

```javascript
// Ver todas mis postulaciones
const myApplications = await fetch('/api/applications/?mine=true', {
  headers: { 'Authorization': 'Token abc123...' }
}).then(r => r.json());

// Agrupar por estado
const byStatus = myApplications.reduce((acc, app) => {
  acc[app.status] = acc[app.status] || [];
  acc[app.status].push(app);
  return acc;
}, {});

console.log(`Pendientes: ${byStatus.pending?.length || 0}`);
console.log(`Aceptadas: ${byStatus.accepted?.length || 0}`);
console.log(`Rechazadas: ${byStatus.rejected?.length || 0}`);
```

### Ejemplo 4: Eliminar Postulación Pendiente

```javascript
// Si cometí un error o quiero cambiar mi oferta
const deleteResult = await fetch('/api/applications/1/', {
  method: 'DELETE',
  headers: { 'Authorization': 'Token abc123...' }
});

if (deleteResult.ok) {
  console.log('Postulación eliminada');
  
  // Crear nueva postulación con datos corregidos
  const newApp = await fetch('/api/applications/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Token abc123...'
    },
    body: JSON.stringify({
      task: 5,
      offered_price: "160.00",  // Precio corregido
      currency: "S/",
      message: "Mensaje actualizado..."
    })
  }).then(r => r.json());
}
```

### Ejemplo 5: React Component para Postular

```jsx
function ApplicationForm({ taskId, taskPrice, taskCurrency }) {
  const [formData, setFormData] = useState({
    offered_price: taskPrice,
    currency: taskCurrency,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/applications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${getToken()}`
        },
        body: JSON.stringify({
          task: taskId,
          ...formData
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.non_field_errors?.[0] || 'Error al postular');
      }

      const application = await response.json();
      alert(`¡Postulación enviada! ID: ${application.id}`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Postular a esta tarea</h3>
      
      <label>
        Tu precio ofrecido:
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={formData.offered_price}
          onChange={(e) => setFormData({
            ...formData,
            offered_price: e.target.value
          })}
          required
        />
      </label>

      <label>
        Moneda:
        <select
          value={formData.currency}
          onChange={(e) => setFormData({
            ...formData,
            currency: e.target.value
          })}
        >
          <option value="S/">Soles (S/)</option>
          <option value="$">Dólares ($)</option>
        </select>
      </label>

      <label>
        Mensaje de presentación:
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({
            ...formData,
            message: e.target.value
          })}
          placeholder="Cuéntale al cliente por qué eres la mejor opción..."
          rows={5}
        />
      </label>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Postulación'}
      </button>
    </form>
  );
}
```

### Ejemplo 6: React Component para Gestionar Postulaciones

```jsx
function ApplicationsManager({ taskId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [taskId]);

  const loadApplications = async () => {
    const response = await fetch(
      `/api/applications/?task=${taskId}`,
      {
        headers: { 'Authorization': `Token ${getToken()}` }
      }
    );
    const data = await response.json();
    setApplications(data);
    setLoading(false);
  };

  const handleAccept = async (applicationId) => {
    if (!confirm('¿Aceptar esta postulación? Se creará un contrato.')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/accept/`,
        {
          method: 'POST',
          headers: { 'Authorization': `Token ${getToken()}` }
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        alert(`¡Contrato creado! ID: ${data.contract_id}`);
        loadApplications();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error al aceptar postulación');
    }
  };

  const handleReject = async (applicationId) => {
    if (!confirm('¿Rechazar esta postulación?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/reject/`,
        {
          method: 'POST',
          headers: { 'Authorization': `Token ${getToken()}` }
        }
      );

      if (response.ok) {
        alert('Postulación rechazada');
        loadApplications();
      }
    } catch (err) {
      alert('Error al rechazar postulación');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="applications-list">
      <h3>{applications.length} Postulaciones</h3>
      
      {applications.map(app => (
        <div key={app.id} className={`application-card ${app.status}`}>
          <div className="applicant-info">
            <strong>{app.applicant_name}</strong>
            <span className="price">
              {app.currency} {app.offered_price}
            </span>
          </div>
          
          <div className="status-badge">{app.status}</div>
          
          {app.status === 'pending' && (
            <div className="actions">
              <button onClick={() => handleAccept(app.id)}>
                ✅ Aceptar
              </button>
              <button onClick={() => handleReject(app.id)}>
                ❌ Rechazar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Permisos y Seguridad

### Trabajador (Postulante)

- ✅ Crear postulaciones a tareas de otros usuarios
- ✅ Ver sus propias postulaciones
- ✅ Eliminar sus postulaciones pendientes
- ❌ Postular a sus propias tareas
- ❌ Postular más de una vez a la misma tarea
- ❌ Editar postulaciones ya enviadas
- ❌ Aceptar/rechazar postulaciones

### Cliente (Dueño de la Tarea)

- ✅ Ver todas las postulaciones a sus tareas
- ✅ Aceptar postulaciones (crea contrato automático)
- ✅ Rechazar postulaciones
- ❌ Crear postulaciones a sus propias tareas
- ❌ Eliminar postulaciones de otros

---

## Integración con Contratos

Cuando un dueño de tarea acepta una postulación:

1. Se crea automáticamente un **Contract** con:
   - `agreed_price`: El `offered_price` de la postulación
   - `currency`: La moneda de la postulación
   - `poster`: Dueño de la tarea
   - `tasker`: El postulante
   - `application`: Referencia a la postulación

2. Todas las demás postulaciones pendientes se rechazan automáticamente

3. El contrato queda listo para iniciar el trabajo

---

## Buenas Prácticas

### Para Trabajadores

1. **Mensaje de presentación**: Incluye experiencia relevante, portafolio, tiempos de entrega
2. **Precio competitivo**: Ofrece un precio justo basado en tu experiencia
3. **Revisa antes de enviar**: No podrás editar después, solo eliminar y crear nueva
4. **Sé específico**: Menciona qué incluye tu oferta (revisiones, archivos fuente, etc.)

### Para Clientes

1. **Revisa todas las postulaciones**: Compara precios y perfiles antes de decidir
2. **Lee los mensajes**: La calidad del mensaje indica profesionalismo
3. **Acepta rápido**: No dejes esperando a los postulantes mucho tiempo
4. **Una aceptación = Un contrato**: Solo acepta si estás seguro

---

## Notificaciones Sugeridas

Puedes integrar notificaciones para estos eventos:

- 📬 Nueva postulación recibida (para dueño de tarea)
- ✅ Tu postulación fue aceptada (para trabajador)
- ❌ Tu postulación fue rechazada (para trabajador)
- 🔔 Alguien ofreció un precio mejor (para postulantes)

---

## Preguntas Frecuentes

**P: ¿Puedo cambiar mi oferta después de postular?**

R: No directamente. Debes eliminar tu postulación pendiente y crear una nueva con el precio corregido.

**P: ¿Cuántas veces puedo postular a una tarea?**

R: Solo una vez por tarea. El sistema previene postulaciones duplicadas.

**P: ¿Qué pasa si el dueño acepta otra postulación?**

R: Tu postulación se rechaza automáticamente y recibes una notificación.

**P: ¿Puedo postular con un precio mayor al sugerido?**

R: Sí, el `offered_price` puede ser mayor, menor o igual al precio de la tarea.

**P: ¿Puedo ver quiénes más postularon?**

R: Solo el dueño de la tarea puede ver todas las postulaciones. Los trabajadores solo ven sus propias postulaciones.

---

## Próximas Características (Roadmap)

- [ ] Sistema de puntuación/rating para postulantes
- [ ] Postulaciones destacadas (premium)
- [ ] Mensajes directos entre dueño y postulante antes de aceptar
- [ ] Historial de postulaciones anteriores
- [ ] Sugerencias de precio basadas en mercado
- [ ] Notificaciones en tiempo real
