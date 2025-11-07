# Datos de la Aplicación

Este directorio contiene los archivos JSON que alimentan la aplicación en su versión actual.

## 📄 Archivos

### tasks.json
Contiene todas las tareas disponibles en el muro.

#### Estructura de una tarea:

```json
{
  "id": "string",           // ID único de la tarea
  "title": "string",        // Título de la tarea
  "description": "string",  // Descripción detallada
  "category": "string",     // Una de: "Compras", "Trámites", "Delivery", "Limpieza", "Tecnología", "Otro"
  "payment": number,        // Monto a pagar (decimal)
  "currency": "string",     // Moneda (ej: "S/", "USD", "$")
  "location": "string",     // Ubicación de la tarea
  "deadline": "string",     // Fecha límite formato ISO (YYYY-MM-DD)
  "isVerified": boolean,    // Si el pagador está verificado
  "posterName": "string"    // Nombre de quien publica la tarea
}
```

## 🔄 Actualización de Datos

Para añadir, editar o eliminar tareas:

1. Edita el archivo `tasks.json`
2. Asegúrate de mantener el formato JSON válido
3. Guarda los cambios
4. Haz commit y push:
   ```bash
   git add public/data/tasks.json
   git commit -m "Actualizar tareas"
   git push
   ```

El sitio se actualizará automáticamente con el nuevo deploy.

## 🚀 Migración Futura a API

Estos archivos JSON son temporales. Cuando el backend esté listo, la aplicación cargará los datos desde la API real sin necesidad de cambiar los componentes React, solo la configuración en `src/services/api.ts`.
