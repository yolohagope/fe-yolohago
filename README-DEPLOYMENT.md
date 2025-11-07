# Guía de Deployment a GitHub Pages

## 🚀 Configuración Inicial

### 1. Habilitar GitHub Pages en tu repositorio

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source**, selecciona **GitHub Actions**

### 2. Push del código

```bash
git add .
git commit -m "Configurar para GitHub Pages"
git push origin main
```

El workflow se ejecutará automáticamente y desplegará tu sitio.

## 📁 Estructura de Datos

Los datos ahora se cargan desde archivos JSON en `/public/data/`:

```
public/
  data/
    tasks.json    # Lista de tareas
```

### Añadir o modificar tareas

Edita el archivo `public/data/tasks.json` con el formato:

```json
{
  "id": "13",
  "title": "Título de la tarea",
  "description": "Descripción detallada",
  "category": "Compras",
  "payment": 50.00,
  "currency": "S/",
  "location": "Lima, Perú",
  "deadline": "2024-02-20",
  "isVerified": true,
  "posterName": "Nombre del publicador"
}
```

## 🔄 Migración a API Real

Cuando tengas tu backend listo, solo necesitas:

### 1. Configurar la URL de tu API

Crea un archivo `.env` (o configura en tu hosting):

```env
VITE_API_URL=https://api.yolohago.com
```

### 2. Actualizar el servicio de API

El archivo `src/services/api.ts` ya está preparado. Solo descomenta y ajusta las funciones que necesites:

```typescript
// En fetchTasks(), la URL automáticamente cambiará de:
// /data/tasks.json (local)
// a:
// https://api.yolohago.com/data/tasks.json (producción)

// O puedes cambiar completamente la ruta:
const response = await fetch(`${BASE_URL}/api/v1/tasks`);
```

### 3. Implementar operaciones CRUD

Las funciones `createTask()`, `updateTask()`, y `deleteTask()` están listas para ser implementadas cuando tengas el backend.

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción local
- `npm run build:gh-pages` - Build específico para GitHub Pages
- `npm run preview` - Preview del build de producción
- `npm run lint` - Ejecutar linter

## 🌐 URLs

Después del deployment, tu sitio estará disponible en:

```
https://yolohagope.github.io/fe-yolohago/
```

## ⚙️ Configuración Avanzada

### Cambiar el base path

Si tu repositorio tiene otro nombre, actualiza en `vite.config.ts`:

```typescript
base: process.env.GITHUB_PAGES === 'true' ? '/tu-repo-name/' : '/',
```

### Variables de Entorno en GitHub Actions

Si necesitas variables de entorno en el build de GitHub Pages:

1. Ve a Settings > Secrets and variables > Actions
2. Añade tus secrets
3. Actualiza `.github/workflows/deploy.yml`:

```yaml
- name: Build
  run: npm run build:gh-pages
  env:
    GITHUB_PAGES: true
    VITE_API_URL: ${{ secrets.API_URL }}
```

## 🐛 Troubleshooting

### El sitio no carga correctamente

Verifica que el `base` path en `vite.config.ts` coincida con el nombre de tu repositorio.

### Los datos no cargan

1. Verifica que `public/data/tasks.json` existe
2. Revisa la consola del navegador para errores
3. Asegúrate de que el archivo JSON tiene formato válido

### Error 404 en las rutas

GitHub Pages sirve aplicaciones SPA. Si usas React Router en el futuro, necesitarás añadir un archivo `404.html` que redirija a `index.html`.

## 📚 Más Información

- [Documentación de Vite](https://vitejs.dev/)
- [GitHub Pages](https://pages.github.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
