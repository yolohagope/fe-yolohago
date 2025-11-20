# API de Consultas (Inquiries)

## Descripción General

El sistema de consultas permite a los usuarios hacer preguntas al publicador de una tarea antes de decidir si postular. Los publicadores pueden responder estas consultas, y las consultas públicas pueden ser vistas por otros usuarios interesados.

## Flujo de Trabajo

```text
1. Usuario interesado ve una tarea
2. Usuario hace una consulta al publicador → Estado: is_answered = false
3. Publicador responde la consulta → Estado: is_answered = true
4. La consulta puede ser:
   - Pública (todos pueden verla)
   - Privada (solo el consultante y publicador)
```

## Características

- 📝 **Consultas antes de postular**: Los usuarios pueden preguntar detalles antes de comprometerse
- 👁️ **Visibilidad pública**: Las consultas públicas ayudan a otros usuarios con dudas similares
- 🔒 **Consultas privadas**: Para preguntas sensibles o específicas
- ✅ **Sistema de respuesta**: Solo el publicador puede responder
- 📊 **Filtros avanzados**: Por tarea, usuario, estado de respuesta, visibilidad

## Endpoints

### 1. Listar Consultas

**GET** `/api/inquiries/`

Lista las consultas según los filtros y permisos del usuario.

**Permisos:**
- Sin autenticación: Solo consultas públicas respondidas
- Autenticado: Consultas públicas + propias consultas + consultas a sus tareas

**Query Parameters:**

- `task` (opcional): ID de la tarea para filtrar
- `mine=true` (opcional): Ver solo mis consultas
- `my_tasks=true` (opcional): Ver consultas a mis tareas publicadas
- `is_answered` (opcional): Filtrar por respondidas (`true`/`false`)
- `is_public` (opcional): Filtrar por visibilidad (`true`/`false`)

**Ejemplos de uso:**

```bash
# Ver consultas públicas de una tarea (sin autenticación)
GET /api/inquiries/?task=5

# Ver mis consultas
GET /api/inquiries/?mine=true

# Ver consultas a mis tareas publicadas (sin responder)
GET /api/inquiries/?my_tasks=true&is_answered=false

# Ver todas las consultas públicas respondidas de una tarea
GET /api/inquiries/?task=5&is_public=true&is_answered=true
```

**Respuesta exitosa (200):**

```json
[
  {
    "id": 1,
    "task": 5,
    "task_title": "Diseño de logo para startup",
    "sender_name": "Juan Pérez",
    "question_preview": "¿Cuántas revisiones incluye el trabajo? ¿Entregas los archivos fuente?",
    "is_answered": true,
    "is_public": true,
    "created_at": "2025-11-13T10:30:00Z"
  },
  {
    "id": 2,
    "task": 5,
    "task_title": "Diseño de logo para startup",
    "sender_name": "María García",
    "question_preview": "¿Tienes experiencia con startups tecnológicas?",
    "is_answered": false,
    "is_public": true,
    "created_at": "2025-11-13T11:45:00Z"
  }
]
```

---

### 2. Crear Consulta

**POST** `/api/inquiries/`

Crea una nueva consulta sobre una tarea. El usuario autenticado será registrado automáticamente como el consultante.

**Requisitos:**

- Usuario autenticado
- No ser el publicador de la tarea

**Body:**

```json
{
  "task": 5,
  "question": "Hola, ¿cuántas revisiones incluye el diseño del logo? ¿También entregas los archivos fuente en formato vectorial?",
  "is_public": true
}
```

**Campos:**

- `task` (requerido): ID de la tarea sobre la que se consulta
- `question` (requerido): Pregunta o consulta
- `is_public` (opcional, default: `true`): Si la consulta será visible públicamente

**Respuesta exitosa (201):**

```json
{
  "id": 1,
  "task": 5,
  "task_title": "Diseño de logo para startup",
  "sender": 10,
  "sender_name": "Juan Pérez",
  "poster_name": "María García",
  "question": "Hola, ¿cuántas revisiones incluye el diseño del logo? ¿También entregas los archivos fuente en formato vectorial?",
  "answer": "",
  "is_answered": false,
  "answered_at": null,
  "is_public": true,
  "created_at": "2025-11-13T10:30:00Z",
  "updated_at": "2025-11-13T10:30:00Z"
}
```

**Errores comunes:**

```json
// 403 - Consultando propia tarea
{
  "error": "No puedes hacer consultas a tu propia tarea."
}

// 404 - Tarea no encontrada
{
  "error": "Tarea no encontrada."
}
```

---

### 3. Obtener Detalles de Consulta

**GET** `/api/inquiries/{id}/`

Obtiene los detalles completos de una consulta, incluyendo la respuesta si existe.

**Permisos:**
- Sin autenticación: Solo si es pública y respondida
- Autenticado: Si es pública, o es tu consulta, o es consulta a tu tarea

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "task": 5,
  "task_title": "Diseño de logo para startup",
  "sender": 10,
  "sender_name": "Juan Pérez",
  "poster_name": "María García",
  "question": "Hola, ¿cuántas revisiones incluye el diseño del logo? ¿También entregas los archivos fuente en formato vectorial?",
  "answer": "Hola Juan! El diseño incluye 3 revisiones sin costo adicional. Sí, entrego todos los archivos fuente en formato vectorial (AI, SVG, EPS) además de las versiones en PNG y JPG.",
  "is_answered": true,
  "answered_at": "2025-11-13T15:20:00Z",
  "is_public": true,
  "created_at": "2025-11-13T10:30:00Z",
  "updated_at": "2025-11-13T15:20:00Z"
}
```

---

### 4. Actualizar Consulta

**PATCH** `/api/inquiries/{id}/`

Actualiza una consulta existente. Solo el consultante puede actualizar su consulta, y solo si no ha sido respondida.

**Requisitos:**

- Ser el consultante (sender)
- Consulta no respondida (`is_answered = false`)

**Body:**

```json
{
  "question": "Hola, además de las revisiones, ¿cuál es el tiempo estimado de entrega?",
  "is_public": false
}
```

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "question": "Hola, además de las revisiones, ¿cuál es el tiempo estimado de entrega?",
  "is_public": false,
  ...
}
```

**Errores:**

```json
// 403 - No eres el consultante
{
  "error": "Solo puedes actualizar tus propias consultas."
}

// 400 - Ya fue respondida
{
  "error": "No puedes actualizar una consulta que ya ha sido respondida."
}
```

---

### 5. Eliminar Consulta

**DELETE** `/api/inquiries/{id}/`

Elimina una consulta. Solo el consultante puede eliminar su consulta, y solo si no ha sido respondida.

**Requisitos:**

- Ser el consultante (sender)
- Consulta no respondida (`is_answered = false`)

**Respuesta exitosa (204):**

```json
{
  "message": "Consulta eliminada exitosamente."
}
```

**Errores:**

```json
// 403 - No eres el consultante
{
  "error": "Solo puedes eliminar tus propias consultas."
}

// 400 - Ya fue respondida
{
  "error": "No puedes eliminar una consulta que ya ha sido respondida."
}
```

---

### 6. Responder Consulta

**POST** `/api/inquiries/{id}/answer/`

Permite al publicador de la tarea responder una consulta. Solo el publicador puede responder.

**Requisitos:**

- Ser el publicador de la tarea
- Consulta no respondida previamente

**Body:**

```json
{
  "answer": "Hola Juan! El diseño incluye 3 revisiones sin costo adicional. Sí, entrego todos los archivos fuente en formato vectorial (AI, SVG, EPS) además de las versiones en PNG y JPG. El tiempo de entrega es de 5 días hábiles desde la aceptación."
}
```

**Respuesta exitosa (200):**

```json
{
  "message": "Consulta respondida exitosamente.",
  "inquiry": {
    "id": 1,
    "task": 5,
    "task_title": "Diseño de logo para startup",
    "sender": 10,
    "sender_name": "Juan Pérez",
    "poster_name": "María García",
    "question": "Hola, ¿cuántas revisiones incluye el diseño del logo?...",
    "answer": "Hola Juan! El diseño incluye 3 revisiones sin costo adicional...",
    "is_answered": true,
    "answered_at": "2025-11-13T15:20:00Z",
    "is_public": true,
    "created_at": "2025-11-13T10:30:00Z",
    "updated_at": "2025-11-13T15:20:00Z"
  }
}
```

**Errores:**

```json
// 403 - No eres el publicador
{
  "error": "Solo el publicador de la tarea puede responder consultas."
}

// 400 - Ya respondida
{
  "error": "Esta consulta ya ha sido respondida."
}

// 400 - Respuesta vacía
{
  "answer": ["La respuesta no puede estar vacía"]
}
```

---

## Validaciones Importantes

### 1. No Consultar Propias Tareas

El sistema previene que los publicadores hagan consultas a sus propias tareas.

```json
{
  "error": "No puedes hacer consultas a tu propia tarea."
}
```

### 2. Solo Actualizar/Eliminar Consultas Sin Responder

Una vez que el publicador responde, la consulta queda "cerrada" y no puede ser modificada ni eliminada.

### 3. Solo el Publicador Puede Responder

Los consultantes no pueden responder sus propias consultas. Solo el publicador de la tarea puede hacerlo.

---

## Visibilidad de Consultas

### Consultas Públicas (`is_public: true`)

✅ **Pueden ver:**
- Usuarios sin autenticación (si están respondidas)
- Usuarios autenticados (respondidas o no)
- Cualquier persona interesada en la tarea

💡 **Ideal para:**
- Preguntas sobre detalles técnicos
- Dudas sobre el alcance del trabajo
- Preguntas sobre tiempos de entrega
- Información que puede ayudar a otros usuarios

### Consultas Privadas (`is_public: false`)

🔒 **Solo pueden ver:**
- El consultante
- El publicador de la tarea

💡 **Ideal para:**
- Negociaciones de precio
- Dudas sobre disponibilidad específica
- Preguntas sensibles o confidenciales

---

## Ejemplos de Uso

### Ejemplo 1: Usuario Consulta Antes de Postular

```javascript
// Ver consultas públicas existentes de la tarea
const existingInquiries = await fetch('/api/inquiries/?task=5&is_public=true&is_answered=true')
  .then(r => r.json());

console.log(`${existingInquiries.length} consultas ya respondidas`);

// Si mi duda no está respondida, hacer una nueva consulta
const newInquiry = await fetch('/api/inquiries/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Token abc123...'
  },
  body: JSON.stringify({
    task: 5,
    question: "¿Tienes experiencia diseñando para el sector de tecnología blockchain?",
    is_public: true
  })
}).then(r => r.json());

console.log(`Consulta creada: ${newInquiry.id}`);
console.log('Espera la respuesta del publicador...');
```

### Ejemplo 2: Publicador Responde Consultas

```javascript
// Ver consultas pendientes de respuesta en mis tareas
const pendingInquiries = await fetch(
  '/api/inquiries/?my_tasks=true&is_answered=false',
  {
    headers: { 'Authorization': 'Token xyz789...' }
  }
).then(r => r.json());

console.log(`${pendingInquiries.length} consultas sin responder`);

// Responder una consulta
const response = await fetch('/api/inquiries/1/answer/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Token xyz789...'
  },
  body: JSON.stringify({
    answer: "Sí, tengo amplia experiencia en el sector blockchain. He diseñado para 3 proyectos DeFi y 2 exchanges. Puedes ver mi portafolio en..."
  })
}).then(r => r.json());

console.log('Consulta respondida exitosamente');
```

### Ejemplo 3: Ver Detalles de Consulta Específica

```javascript
// Ver detalles completos de una consulta
const inquiry = await fetch('/api/inquiries/1/', {
  headers: { 'Authorization': 'Token abc123...' }
}).then(r => r.json());

console.log(`Pregunta: ${inquiry.question}`);
console.log(`Respuesta: ${inquiry.answer || 'Sin responder aún'}`);
console.log(`Estado: ${inquiry.is_answered ? 'Respondida' : 'Pendiente'}`);
```

### Ejemplo 4: React Component para Q&A de Tarea

```jsx
function TaskInquiries({ taskId }) {
  const [inquiries, setInquiries] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInquiries();
  }, [taskId]);

  const loadInquiries = async () => {
    // Cargar consultas públicas y respondidas
    const response = await fetch(
      `/api/inquiries/?task=${taskId}&is_public=true&is_answered=true`
    );
    const data = await response.json();
    setInquiries(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/inquiries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${getToken()}`
        },
        body: JSON.stringify({
          task: taskId,
          question: newQuestion,
          is_public: isPublic
        })
      });

      if (response.ok) {
        const inquiry = await response.json();
        alert('¡Consulta enviada! El publicador será notificado.');
        setNewQuestion('');
        
        // Recargar consultas si es pública
        if (isPublic) {
          loadInquiries();
        }
      }
    } catch (err) {
      alert('Error al enviar consulta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-inquiries">
      <h3>Preguntas y Respuestas</h3>

      {/* Listado de consultas públicas respondidas */}
      <div className="inquiries-list">
        {inquiries.length === 0 ? (
          <p>No hay consultas aún. ¡Sé el primero en preguntar!</p>
        ) : (
          inquiries.map(inquiry => (
            <div key={inquiry.id} className="inquiry-card">
              <div className="question">
                <strong>Q:</strong> {inquiry.question_preview}
                <span className="author">- {inquiry.sender_name}</span>
              </div>
              {inquiry.is_answered && inquiry.answer && (
                <div className="answer">
                  <strong>A:</strong> {inquiry.answer}
                </div>
              )}
              <div className="meta">
                {new Date(inquiry.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario para nueva consulta */}
      <form onSubmit={handleSubmit} className="new-inquiry-form">
        <h4>Hacer una consulta</h4>
        
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Escribe tu pregunta..."
          required
          rows={4}
        />

        <label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Hacer pública mi consulta (otros usuarios podrán verla)
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Consulta'}
        </button>
      </form>
    </div>
  );
}
```

### Ejemplo 5: Panel de Publicador para Responder

```jsx
function PublisherInquiriesPanel() {
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    loadPendingInquiries();
  }, []);

  const loadPendingInquiries = async () => {
    const response = await fetch(
      '/api/inquiries/?my_tasks=true&is_answered=false',
      {
        headers: { 'Authorization': `Token ${getToken()}` }
      }
    );
    const data = await response.json();
    setInquiries(data);
  };

  const handleAnswer = async (inquiryId) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}/answer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${getToken()}`
        },
        body: JSON.stringify({ answer })
      });

      if (response.ok) {
        alert('¡Consulta respondida!');
        setAnswer('');
        setSelectedInquiry(null);
        loadPendingInquiries();
      }
    } catch (err) {
      alert('Error al responder');
    }
  };

  return (
    <div className="publisher-inquiries">
      <h3>Consultas Pendientes ({inquiries.length})</h3>

      {inquiries.length === 0 ? (
        <p>No tienes consultas pendientes.</p>
      ) : (
        <div className="inquiries-grid">
          {inquiries.map(inquiry => (
            <div key={inquiry.id} className="inquiry-item">
              <div className="task-info">
                <strong>{inquiry.task_title}</strong>
              </div>
              
              <div className="question-section">
                <p><strong>Pregunta de {inquiry.sender_name}:</strong></p>
                <p>{inquiry.question_preview}</p>
              </div>

              <button onClick={() => setSelectedInquiry(inquiry.id)}>
                Responder
              </button>

              {selectedInquiry === inquiry.id && (
                <div className="answer-form">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    rows={4}
                  />
                  <button onClick={() => handleAnswer(inquiry.id)}>
                    Enviar Respuesta
                  </button>
                  <button onClick={() => setSelectedInquiry(null)}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Permisos y Seguridad

### Usuario Consultante

- ✅ Hacer consultas a tareas de otros usuarios
- ✅ Ver sus propias consultas
- ✅ Actualizar sus consultas sin responder
- ✅ Eliminar sus consultas sin responder
- ✅ Ver consultas públicas de otras personas
- ❌ Hacer consultas a sus propias tareas
- ❌ Responder consultas
- ❌ Ver consultas privadas de otros

### Publicador de Tarea

- ✅ Ver todas las consultas a sus tareas
- ✅ Responder consultas
- ✅ Ver consultas públicas de todas las tareas
- ❌ Editar/eliminar consultas de otros
- ❌ Ver consultas privadas de tareas ajenas

### Usuario Sin Autenticación

- ✅ Ver consultas públicas respondidas
- ❌ Crear consultas
- ❌ Ver consultas sin responder
- ❌ Ver consultas privadas

---

## Integración con Otros Sistemas

### Con Notificaciones

Se recomienda crear notificaciones para:

- 📬 Nueva consulta recibida (para publicador)
- ✅ Tu consulta fue respondida (para consultante)
- ⏰ Recordatorio de consultas sin responder (para publicador)

### Con Applications

El flujo típico sería:

1. Usuario ve la tarea
2. Usuario hace consultas para aclarar dudas
3. Publicador responde
4. Usuario decide postular con la información completa

```javascript
// Después de ver las respuestas, postular
const inquiry = await fetch('/api/inquiries/1/').then(r => r.json());

if (inquiry.is_answered && inquiry.answer) {
  console.log('Respuesta recibida:', inquiry.answer);
  
  // Ahora sí, postular con confianza
  const application = await createApplication(taskId);
}
```

---

## Buenas Prácticas

### Para Consultantes

1. **Revisa consultas existentes**: Antes de preguntar, verifica si alguien ya hizo esa consulta
2. **Sé específico**: Haz preguntas claras y directas
3. **Consultas públicas por defecto**: Ayudas a la comunidad compartiendo información
4. **Espera la respuesta**: Dale tiempo al publicador para responder antes de postular

### Para Publicadores

1. **Responde rápido**: Las consultas rápidas generan más postulaciones
2. **Sé detallado**: Respuestas completas reducen dudas adicionales
3. **Mantén profesionalismo**: Tus respuestas reflejan tu calidad como empleador
4. **Aprovecha consultas públicas**: Una buena respuesta pública puede atraer más candidatos

---

## Estadísticas Sugeridas

Puedes crear dashboards con:

```javascript
// Consultas por tarea
GET /api/inquiries/?task=5

// Tasa de respuesta del publicador
const inquiries = await fetch('/api/inquiries/?my_tasks=true').then(r => r.json());
const answered = inquiries.filter(i => i.is_answered).length;
const responseRate = (answered / inquiries.length * 100).toFixed(1);
console.log(`Tasa de respuesta: ${responseRate}%`);

// Tiempo promedio de respuesta
// Calcular diferencia entre created_at y answered_at
```

---

## Próximas Características (Roadmap)

- [ ] Respuestas con formato Markdown
- [ ] Notificaciones en tiempo real
- [ ] Likes/reacciones a consultas útiles
- [ ] Marcar consultas como "frecuentes"
- [ ] Sistema de seguimiento (follow-up questions)
- [ ] Archivos adjuntos en consultas
- [ ] Traducción automática de consultas
- [ ] Análisis de sentimiento en respuestas
