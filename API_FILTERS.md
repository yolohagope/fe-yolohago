# Filtros API de Tareas

## Endpoint
```
GET /api/tasks/
```

## Búsqueda

```bash
# Buscar en título y descripción
/api/tasks/?search=pintura
```

## Filtros

### Por Categoría
```bash
/api/tasks/?category=1
```

### Por Estado de Verificación
```bash
/api/tasks/?is_verified=true
```

### Por Rango de Pago
```bash
# Pago mínimo
/api/tasks/?payment_min=50

# Pago máximo
/api/tasks/?payment_max=200

# Rango completo
/api/tasks/?payment_min=50&payment_max=200
```

### Por Fecha Límite
```bash
# Después de una fecha
/api/tasks/?deadline_after=2024-01-01

# Antes de una fecha
/api/tasks/?deadline_before=2024-12-31

# Rango de fechas
/api/tasks/?deadline_after=2024-01-01&deadline_before=2024-12-31
```

### Por Usuario
```bash
# Tareas creadas por un usuario
/api/tasks/?poster=123

# Tareas asignadas a un usuario
/api/tasks/?tasker=456
```

## Ordenamiento

```bash
# Por fecha de creación (más recientes primero)
/api/tasks/?ordering=-created_at

# Por pago (mayor a menor)
/api/tasks/?ordering=-payment

# Por fecha límite
/api/tasks/?ordering=deadline
```

## Paginación

```bash
# Primeros 9 resultados
/api/tasks/?limit=9

# Siguiente página
/api/tasks/?limit=9&offset=9

# Cambiar cantidad de resultados
/api/tasks/?limit=20
```

## Combinación de Filtros

```bash
# Buscar tareas verificadas de limpieza con pago entre S/50 y S/150
/api/tasks/?search=limpieza&is_verified=true&category=2&payment_min=50&payment_max=150&ordering=-created_at&limit=9
```
