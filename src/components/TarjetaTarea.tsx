import { MapPin, Calendar, CheckCircle, User } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import { getCategoryName, isTaskVerified, getCategoryBannerUrl, getPosterName } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TarjetaTareaProps {
  task: Task;
  onViewDetails: (task: Task) => void;
}

export function TarjetaTarea({ task, onViewDetails }: TarjetaTareaProps) {
  const categoryColors: Record<string, string> = {
    'Compras': 'bg-blue-50 text-blue-700 border-blue-200',
    'Trámites': 'bg-red-50 text-red-700 border-red-200',
    'Delivery': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Limpieza': 'bg-green-50 text-green-700 border-green-200',
    'Tecnología': 'bg-purple-50 text-purple-700 border-purple-200',
    'Regalos': 'bg-pink-50 text-pink-700 border-pink-200',
    'Otro': 'bg-gray-50 text-gray-700 border-gray-200'
  };

  const formattedDeadline = format(new Date(task.deadline), "d 'de' MMMM", { locale: es });
  
  // Usar helpers para obtener valores
  const categoryName = getCategoryName(task);
  const verified = isTaskVerified(task);
  const bannerUrl = getCategoryBannerUrl(task);
  const posterFullName = getPosterName(task);
  
  // Mostrar nombre + inicial del apellido (ej: "Juan P.")
  const nameParts = posterFullName.split(' ');
  const posterName = nameParts.length > 1 
    ? `${nameParts[0]} ${nameParts[1].charAt(0)}.`
    : nameParts[0];
  
  // Extraer primera letra del nombre para el avatar
  const posterInitial = nameParts[0].charAt(0).toUpperCase();

  const handleYoloHago = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se dispare el click de la tarjeta
    // TODO: Implementar lógica de "Yolo Hago" (aplicar a la tarea)
    console.log('¡Yolo Hago! para tarea:', task.id);
  };

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl border border-border/50 rounded-3xl bg-white h-[420px] cursor-pointer p-0"
      onClick={() => onViewDetails(task)}
    >
      {/* Imagen de Banner */}
      <div 
        className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={bannerUrl ? { backgroundImage: `url('${bannerUrl}')` } : {}}
      >
        {!bannerUrl && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-30">📋</div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Badge de categoría pequeño en el header */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs bg-white/90 backdrop-blur-sm">
            {categoryName}
          </Badge>
        </div>
      </div>

      {/* Contenido - Crece hacia arriba descubriendo la descripción */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 space-y-3 transition-all duration-300 h-56 group-hover:h-80">
        {/* Precio destacado */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">S/ {Number(task.payment).toFixed(0)}</span>
          <span className="text-sm text-muted-foreground">{task.currency}</span>
        </div>

        {/* Título compacto */}
        <h3 className="font-semibold text-base leading-snug text-foreground line-clamp-2">
          {task.title}
        </h3>

        {/* Descripción - Oculta inicialmente, se descubre al crecer el contenedor */}
        <div className="overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {task.description}
          </p>
        </div>

        {/* Metadata - Mantiene posición relativa */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <Calendar weight="bold" className="w-4 h-4" />
            <span>Hace 5 días</span>
          </div>
          <span>•</span>
          <span>{task.location}</span>
        </div>

        {/* Footer - Mantiene posición relativa */}
        <div className="flex items-center justify-between pt-3 border-t">
          {/* Botón de acción principal */}
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-full"
            onClick={handleYoloHago}
          >
            ¡Yolo Hago!
          </Button>

          {/* Estado verificado */}
          {verified && (
            <CheckCircle weight="fill" className="w-6 h-6 text-green-500 ml-3" />
          )}
        </div>
      </div>
    </Card>
  );
}
