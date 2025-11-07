import { MapPin, Calendar, CheckCircle } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TarjetaTareaProps {
  task: Task;
}

export function TarjetaTarea({ task }: TarjetaTareaProps) {
  const categoryColors: Record<string, string> = {
    'Compras': 'bg-blue-50 text-blue-700 border-blue-200',
    'Trámites': 'bg-red-50 text-red-700 border-red-200',
    'Delivery': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Limpieza': 'bg-green-50 text-green-700 border-green-200',
    'Tecnología': 'bg-purple-50 text-purple-700 border-purple-200',
    'Otro': 'bg-gray-50 text-gray-700 border-gray-200'
  };

  const formattedDeadline = format(new Date(task.deadline), "d 'de' MMMM", { locale: es });

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-border">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-2 mb-2">
              {task.title}
            </h3>
            <Badge 
              variant="outline" 
              className={`${categoryColors[task.category]} text-xs font-medium`}
            >
              {task.category}
            </Badge>
          </div>
          
          <div className="flex-shrink-0 bg-accent/10 rounded-lg px-3 py-2 border border-accent/30">
            <div className="text-2xl font-bold text-accent-foreground leading-none">
              {task.currency} {task.payment.toFixed(2)}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <MapPin weight="duotone" className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="truncate">{task.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar weight="duotone" className="w-4 h-4 text-destructive flex-shrink-0" />
            <span>Hasta el {formattedDeadline}</span>
          </div>
        </div>

        {task.isVerified && (
          <div className="flex items-center gap-1.5 pt-2">
            <CheckCircle weight="fill" className="w-4 h-4 text-[oklch(0.640_0.155_145)]" />
            <span className="text-xs font-medium text-[oklch(0.640_0.155_145)]">
              Pagador Verificado
            </span>
          </div>
        )}

        <Button 
          className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          size="default"
        >
          Ver Detalles
        </Button>
      </div>
    </Card>
  );
}
