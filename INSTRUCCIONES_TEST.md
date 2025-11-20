# 🧪 INSTRUCCIONES PARA TEST COMPARATIVO

## Objetivo
Comparar PublicationDetailPage CON y SIN la API de inquiries para identificar si esa es la causa del problema.

## Rutas creadas

### 1️⃣ VERSIÓN ORIGINAL (CON inquiries):
```
/publicaciones/:taskId
```
Esta es la versión que actualmente muestra página blanca.

### 2️⃣ VERSIÓN DE PRUEBA (SIN inquiries):
```
/publicaciones-test/:taskId
```
Esta versión NO carga inquiries, solo task y applications.

## Pasos para hacer el test

### Paso 1: Iniciar el servidor
```bash
yarn dev
```

### Paso 2: Ir a Mis Publicaciones
1. Inicia sesión
2. Ve a "Mis Tareas" → tab "Publicadas"
3. Busca una publicación que tenga ID (ej: taskId = 123)

### Paso 3: Probar AMBAS URLs

#### A) Probar versión ORIGINAL (con inquiries):
```
http://localhost:5001/publicaciones/123
```
**¿Qué esperas ver?**
- ❌ Página blanca (el problema actual)
- O algún error en la consola

#### B) Probar versión TEST (sin inquiries):
```
http://localhost:5001/publicaciones-test/123
```
**¿Qué esperas ver?**
- ✅ Página renderizada correctamente
- Banner amarillo que dice "🧪 VERSIÓN DE PRUEBA - SIN INQUIRIES"
- Lista de propuestas recibidas
- Detalles de la tarea

## ¿Qué buscar en la consola del navegador?

### En la versión CON inquiries (/publicaciones/123):
Busca mensajes como:
```
📋 Consultando inquiries de tarea 123
❌ Error fetching task inquiries: ...
⚠️ Error cargando consultas (no crítico): ...
```

### En la versión SIN inquiries (/publicaciones-test/123):
Busca mensajes como:
```
🧪 TEST: Cargando SIN inquiries
✅ TEST: Datos cargados (sin inquiries)
```

## Resultados esperados

### Si la página TEST funciona pero la ORIGINAL no:
✅ **CONFIRMADO:** El problema es la integración de inquiries.

Posibles causas:
1. El endpoint `/api/inquiries/` no existe en el backend
2. Hay un error de permisos en el endpoint
3. El formato de respuesta del backend es incorrecto
4. Hay un problema de CORS

### Si AMBAS páginas fallan:
❌ El problema NO es inquiries, es otra cosa (posiblemente en fetchTaskById o fetchTaskApplications)

### Si AMBAS páginas funcionan:
🤔 El problema podría ser intermitente o específico de ciertos taskIds

## Siguiente paso según resultado

### Si TEST funciona y ORIGINAL falla:
Ejecuta en la consola del navegador (en la página ORIGINAL):
```javascript
console.log('Errores de red:', performance.getEntries().filter(e => e.name.includes('inquiries')))
```

Y también revisa el tab "Network" en DevTools:
1. Filtra por "inquiries"
2. ¿Hay una petición a `/api/inquiries/?task=123`?
3. ¿Cuál es el status code? (200, 404, 500, etc.)
4. ¿Qué responde el servidor?

### Si ambas funcionan:
Intenta con diferentes taskIds para ver si es específico de ciertas tareas.

## Archivos creados para este test
- `src/pages/PublicationDetailPage.test-version.tsx` - Versión sin inquiries
- `src/pages/__tests__/inquiry-api.test.ts` - Tests de lógica
- `INSTRUCCIONES_TEST.md` - Este archivo

## Para limpiar después del test
Una vez identificado el problema, puedes:
1. Eliminar la ruta temporal en `App.tsx`
2. Eliminar el archivo `PublicationDetailPage.test-version.tsx`
3. O convertir esta versión test en la principal si funciona
