# 🎯 Guía de Inicio Rápido - YoLoHago

Esta guía te ayudará a poner en marcha el proyecto en menos de 5 minutos.

## ✅ Pre-requisitos

- **Node.js** 18 o superior ([Descargar](https://nodejs.org/))
- **npm** o **yarn**
- **Git** ([Descargar](https://git-scm.com/))
- Editor de código (recomendado: VS Code)

## 🚀 Instalación Local

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/yolohagope/fe-yolohago.git
cd fe-yolohago
```

### Paso 2: Instalar dependencias

```bash
npm install
```

Este proceso puede tardar unos minutos la primera vez.

### Paso 3: Iniciar el servidor de desarrollo

```bash
npm run dev
```

Deberías ver algo como:

```
VITE v6.3.5  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Paso 4: Abrir en el navegador

Abre tu navegador y ve a: `http://localhost:5173`

¡Deberías ver el muro de tareas funcionando! 🎉

## 🔧 Verificación de Funcionamiento

### ✓ Checklist

- [ ] El sitio carga sin errores
- [ ] Ves las tarjetas de tareas
- [ ] Puedes escribir en el campo de búsqueda
- [ ] El selector de categorías funciona
- [ ] Los filtros actualizan las tareas mostradas
- [ ] El diseño se ve bien en móvil (reduce el tamaño de la ventana)

### 🐛 Si algo no funciona

1. **Verifica la versión de Node.js**
   ```bash
   node --version
   # Debe ser v18.0.0 o superior
   ```

2. **Limpia la caché y reinstala**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verifica que no haya otro proceso usando el puerto 5173**
   ```bash
   # En macOS/Linux
   lsof -ti:5173 | xargs kill -9
   
   # O usa el script incluido
   npm run kill
   ```

4. **Revisa la consola del navegador** (F12)
   - No debería haber errores en rojo
   - Solo warnings en amarillo son normales

## 📝 Modificar las Tareas

### Editar tareas existentes

1. Abre el archivo: `public/data/tasks.json`
2. Modifica cualquier tarea
3. Guarda el archivo
4. Refresca el navegador (⌘+R o Ctrl+R)

### Añadir una nueva tarea

1. Abre `public/data/tasks.json`
2. Añade un nuevo objeto al array:

```json
{
  "id": "13",
  "title": "Tu nueva tarea",
  "description": "Descripción detallada de la tarea",
  "category": "Compras",
  "payment": 50.00,
  "currency": "S/",
  "location": "Tu distrito, Lima",
  "deadline": "2024-11-15",
  "isVerified": true,
  "posterName": "Tu Nombre"
}
```

3. Guarda y refresca el navegador

### Categorías válidas

- `"Compras"`
- `"Trámites"`
- `"Delivery"`
- `"Limpieza"`
- `"Tecnología"`
- `"Otro"`

## 🎨 Personalizar el Diseño

### Cambiar colores

Los colores se definen en `src/components/TarjetaTarea.tsx`:

```typescript
const categoryColors: Record<string, string> = {
  'Compras': 'bg-blue-50 text-blue-700 border-blue-200',
  'Trámites': 'bg-red-50 text-red-700 border-red-200',
  // Añade o modifica aquí
};
```

### Colores de Tailwind disponibles

- `blue`, `red`, `yellow`, `green`, `purple`, `pink`, `indigo`, `gray`
- Tonos: `50`, `100`, `200`, ..., `900`

Ejemplo: `bg-pink-100 text-pink-800 border-pink-300`

## 🧪 Probar el Build de Producción

```bash
# Crear el build
npm run build

# Ver el build en local
npm run preview
```

El build estará en la carpeta `dist/`.

## 📤 Desplegar a GitHub Pages

### Setup inicial (solo una vez)

1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages**
3. En **Source**, selecciona **GitHub Actions**

### Desplegar

```bash
git add .
git commit -m "Mensaje descriptivo"
git push origin main
```

Espera 2-3 minutos y tu sitio estará en:
```
https://yolohagope.github.io/fe-yolohago/
```

## 🔄 Workflow de Desarrollo Diario

```bash
# 1. Asegúrate de estar en la última versión
git pull origin main

# 2. Crea una rama para tu cambio
git checkout -b feature/mi-nueva-funcionalidad

# 3. Haz tus cambios
# ... edita archivos ...

# 4. Prueba localmente
npm run dev

# 5. Si todo funciona, haz commit
git add .
git commit -m "Descripción clara del cambio"

# 6. Sube tu rama
git push origin feature/mi-nueva-funcionalidad

# 7. Crea un Pull Request en GitHub
# (o haz merge directo a main si trabajas solo)
```

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Build de producción
npm run preview          # Preview del build

# Linting
npm run lint             # Revisar código

# Optimización
npm run optimize         # Optimizar dependencias

# Limpieza
rm -rf node_modules      # Limpiar node_modules
rm -rf dist              # Limpiar build
npm install              # Reinstalar dependencias
```

## 🌐 Estructura de URLs

En desarrollo local:
```
http://localhost:5173/
```

En GitHub Pages:
```
https://yolohagope.github.io/fe-yolohago/
```

## 📚 Siguientes Pasos

Una vez que tengas el proyecto funcionando:

1. **Familiarízate con el código**
   - Lee `src/App.tsx` (punto de entrada)
   - Revisa `src/components/MuroTareas.tsx` (componente principal)
   - Entiende `src/services/api.ts` (capa de datos)

2. **Experimenta con los datos**
   - Añade más tareas en `public/data/tasks.json`
   - Prueba diferentes categorías y precios
   - Juega con las fechas límite

3. **Personaliza el diseño**
   - Cambia colores de categorías
   - Modifica textos y títulos
   - Ajusta el layout si lo deseas

4. **Planifica el backend**
   - Revisa `ROADMAP.md` para ideas
   - Decide qué funcionalidades necesitas primero
   - Lee `README-DEPLOYMENT.md` para más detalles técnicos

## 💬 ¿Necesitas Ayuda?

- **Errores de compilación**: Revisa la terminal donde corre `npm run dev`
- **Errores en el navegador**: Abre la consola con F12
- **Problemas de estilo**: Verifica que Tailwind esté funcionando
- **GitHub Pages no funciona**: Revisa el tab "Actions" en GitHub

## 🎓 Recursos de Aprendizaje

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

**¡Listo! Ahora estás preparado para desarrollar YoLoHago 🚀**

Si tienes dudas o problemas, no dudes en abrir un issue en GitHub.
