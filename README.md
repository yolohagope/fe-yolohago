# 🚀 YoLoHago - Plataforma de Microtareas

YoLoHago es una plataforma web tipo TaskRabbit para publicar y descubrir microtareas en Perú. Los usuarios pueden encontrar oportunidades para ganar dinero realizando tareas cotidianas como compras, trámites, delivery, limpieza, y más.

## ✨ Características

- 🎯 Muro de tareas con diseño moderno y responsivo
- 🔍 Búsqueda en tiempo real por palabra clave
- 🏷️ Filtrado por categorías (Compras, Trámites, Delivery, Limpieza, Tecnología, Otro)
- ✅ Indicador de pagadores verificados
- 💰 Información clara de pagos y ubicaciones
- 📱 Diseño móvil-first con Tailwind CSS
- ⚡ Performance optimizada con React 19 y Vite

## 🛠️ Tecnologías

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **Radix UI** - Componentes accesibles
- **Phosphor Icons** - Iconos modernos
- **date-fns** - Manejo de fechas

## � Instalación

```bash
# Clonar el repositorio
git clone https://github.com/yolohagope/fe-yolohago.git
cd fe-yolohago

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

## 🚀 Deployment a GitHub Pages

Este proyecto está configurado para desplegarse automáticamente en GitHub Pages.

### Configuración de una sola vez:

1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages**
3. En **Source**, selecciona **GitHub Actions**

### Deployment automático:

Cada vez que hagas push a `main`, el sitio se desplegará automáticamente:

```bash
git add .
git commit -m "Tu mensaje"
git push origin main
```

Tu sitio estará disponible en: `https://yolohagope.github.io/fe-yolohago/`

Para más detalles, consulta [README-DEPLOYMENT.md](./README-DEPLOYMENT.md)

## 📁 Estructura del Proyecto

```
fe-yolohago/
├── public/
│   └── data/
│       └── tasks.json          # Datos de tareas (temporal)
├── src/
│   ├── components/
│   │   ├── ui/                 # Componentes de UI reutilizables
│   │   ├── MuroTareas.tsx      # Componente principal del muro
│   │   └── TarjetaTarea.tsx    # Tarjeta individual de tarea
│   ├── services/
│   │   └── api.ts              # Servicio de API (listo para migrar)
│   ├── lib/
│   │   ├── types.ts            # Definiciones de tipos
│   │   └── utils.ts            # Utilidades
│   └── App.tsx                 # Componente raíz
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
└── README-DEPLOYMENT.md        # Guía detallada de deployment
```

## 📊 Gestión de Datos

### Actualmente (Archivos JSON)

Los datos se cargan desde `public/data/tasks.json`. Para modificar las tareas:

1. Edita el archivo `public/data/tasks.json`
2. Mantén el formato JSON válido
3. Haz commit y push

### Futura Migración a API

El código está preparado para una fácil migración a API:

1. Configura tu variable de entorno:
   ```env
   VITE_API_URL=https://api.yolohago.com
   ```

2. El servicio en `src/services/api.ts` automáticamente usará la API
3. Las funciones CRUD están listas para implementar

**No necesitas cambiar ningún componente React**, solo la configuración del servicio.

## 🎨 Personalización

### Categorías de Tareas

Edita en `src/lib/types.ts`:

```typescript
export type TaskCategory = 'Compras' | 'Trámites' | 'Delivery' | 'Limpieza' | 'Tecnología' | 'Otro';
```

### Colores de Categorías

Personaliza en `src/components/TarjetaTarea.tsx`:

```typescript
const categoryColors: Record<string, string> = {
  'Compras': 'bg-blue-50 text-blue-700 border-blue-200',
  // ... añade más
};
```

## 🧪 Scripts Disponibles

```bash
npm run dev              # Desarrollo local
npm run build            # Build para producción
npm run build:gh-pages   # Build para GitHub Pages
npm run preview          # Preview del build
npm run lint             # Ejecutar linter
```

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Los recursos de la plantilla Spark están bajo licencia MIT. Ver [LICENSE](./LICENSE) para más información.

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en GitHub.

---

**¡Hecho con ❤️ para la comunidad peruana!**
