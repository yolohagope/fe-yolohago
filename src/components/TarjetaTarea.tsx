import { MapPin, Calendar, CheckCircle } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import { getCategoryName, isTaskVerified, getCategoryBannerUrl } from '@/lib/utils';
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

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl border-0 rounded-2xl bg-white">
      {/* Imagen de Banner - Aspecto ratio 16:9 pero más corta */}
      <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
        {bannerUrl ? (
          <img 
            src={bannerUrl} 
            alt={categoryName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback si la imagen no carga
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
            📋
          </div>
        )}
        
        {/* Overlay gradient para mejor legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Badge de categoría en la imagen */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant="secondary"
            className="bg-white/95 backdrop-blur-sm text-foreground border-0 shadow-lg"
          >
            {categoryName}
          </Badge>
        </div>

        {/* Badge verificado */}
        {verified && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/95 backdrop-blur-sm rounded-full shadow-lg">
              <CheckCircle weight="fill" className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-medium text-white">
                Verificado
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Contenido - Altura dinámica con transición */}
      <div className="p-5 space-y-3 transition-all duration-300">
        {/* Título */}
        <h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
          {task.title}
        </h3>

        {/* Descripción - 1 línea por defecto, expande en hover */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1 group-hover:line-clamp-3 transition-all duration-300">
          {task.description}
        </p>

        {/* Información adicional */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin weight="duotone" className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{task.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar weight="duotone" className="w-4 h-4 flex-shrink-0" />
            <span>Hasta el {formattedDeadline}</span>
          </div>
        </div>

        {/* Footer con precio y botón */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Pago</span>
            <span className="text-2xl font-bold text-primary">
              {task.currency} {Number(task.payment).toFixed(2)}
            </span>
          </div>
          
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
            onClick={() => onViewDetails(task)}
          >
            Ver Detalles
          </Button>
        </div>
      </div>
    </Card>
  );
}
