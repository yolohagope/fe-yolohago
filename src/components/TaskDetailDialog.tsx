import { MapPin, Calendar, CheckCircle, Clock, X, User as UserIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

export function TaskDetailDialog({ task, open, onClose }: TaskDetailDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!task) return null;

  const categoryColors: Record<string, string> = {
    'Compras': 'bg-blue-50 text-blue-700 border-blue-200',
    'Trámites': 'bg-red-50 text-red-700 border-red-200',
    'Delivery': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Limpieza': 'bg-green-50 text-green-700 border-green-200',
    'Tecnología': 'bg-purple-50 text-purple-700 border-purple-200',
    'Otro': 'bg-gray-50 text-gray-700 border-gray-200'
  };

  const formattedDeadline = format(new Date(task.deadline), "d 'de' MMMM, yyyy", { locale: es });

  function handleApply() {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }

    if (!task) return;
    onClose();
    navigate(`/propuesta/${task.id}`);
  }

  function handleAskQuestion() {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }

    if (!task) return;
    onClose();
    navigate(`/propuesta/${task.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Precio destacado */}
          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">Pago ofrecido</span>
            <div className="text-3xl font-bold text-[#34A853]">
              {task.currency} {task.payment.toFixed(2)}
            </div>
          </div>

          {/* Información importante del solicitante */}
          <div className="border-l-4 border-primary bg-accent/30 p-4 rounded-r-lg">
            <div className="flex gap-2 mb-2">
              <span className="font-semibold">ℹ️ Descripción de la tarea</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {task.description}
            </p>
          </div>

          {/* Detalles de la Tarea */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Detalles de la Tarea</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserIcon weight="duotone" className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                  <Badge variant="outline" className={`${categoryColors[task.category]} mt-1`}>
                    {task.category}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock weight="duotone" className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duración Estimada</p>
                  <p className="font-medium mt-1">4-5 horas (flexible)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar weight="duotone" className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plazo</p>
                  <p className="font-medium mt-1">Hasta el {formattedDeadline}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin weight="duotone" className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                  <p className="font-medium mt-1">{task.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requisitos Adicionales */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Requisitos Adicionales</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>Contar con teléfono propio con plan de minutos o ilimitado.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>Tener un tono de voz amable y claro.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>Disponibilidad para realizar las llamadas en horario de oficina (9am - 6pm).</span>
              </li>
            </ul>
          </div>

          {/* Publicado por */}
          <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="font-semibold text-primary">
                {task.posterName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Publicado por</p>
              <p className="font-semibold">{task.posterName}</p>
            </div>
            {task.isVerified && (
              <div className="ml-auto">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full">
                  <CheckCircle weight="fill" className="w-4 h-4 text-[#34A853]" />
                  <span className="text-xs font-medium text-[#34A853]">
                    Verificado
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleApply}
              className="flex-1 h-12 bg-[#4285F4] hover:bg-[#357ae8] text-white font-medium"
            >
              ¡Yo lo hago!
            </Button>
            <Button
              onClick={handleAskQuestion}
              variant="outline"
              className="flex-1 h-12 font-medium"
            >
              Hacer una pregunta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
