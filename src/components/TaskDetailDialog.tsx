import { MapPin, Calendar, CheckCircle, Clock, X, User as UserIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Task } from '@/lib/types';
import { getCategoryName, isTaskVerified, getPosterName } from '@/lib/utils';
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
    'Regalos': 'bg-pink-50 text-pink-700 border-pink-200',
    'Otro': 'bg-gray-50 text-gray-700 border-gray-200'
  };

  const formattedDeadline = format(new Date(task.deadline), "d 'de' MMMM, yyyy", { locale: es });
  
  // Usar helpers para obtener valores
  const categoryName = getCategoryName(task);
  const verified = isTaskVerified(task);
  const posterName = getPosterName(task);

  function handleApply() {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }

    if (!task) return;
    // Abrir en nueva pestaña
    window.open(`/propuesta/${task.id}`, '_blank');
    onClose();
  }

  function handleAskQuestion() {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }

    if (!task) return;
    // Abrir en nueva pestaña
    window.open(`/propuesta/${task.id}`, '_blank');
    onClose();
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-[100vh] md:h-[92vh] md:max-w-3xl md:w-full">
        {/* Header con título y detalles */}
        <DrawerHeader className="relative border-b border-slate-200 pb-4 px-6 md:px-8 shrink-0">
          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none cursor-pointer">
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </DrawerClose>
          <DrawerTitle className="text-2xl font-bold pr-10 mb-4">
            {task.title}
          </DrawerTitle>
          
          {/* Descripción */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {task.description}
          </p>
        </DrawerHeader>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1 px-6 md:px-8">
          <div className="space-y-5 pt-6 pb-5">
            {/* Card del publicador + Monto */}
            <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              {/* Info del publicador */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="font-semibold text-primary text-lg">
                    {posterName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{posterName}</p>
                    {verified && (
                      <CheckCircle weight="fill" className="w-4 h-4 text-[#34A853]" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    ★★★★★
                  </div>
                </div>
              </div>

              {/* Monto */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Dispuesto a pagar</p>
                <div className="text-3xl font-bold text-[#34A853] leading-tight">
                  {task.currency} {Number(task.payment).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">por esta tarea</p>
              </div>
            </div>

            {/* Línea separadora */}
            <div className="border-t border-slate-200" />

            {/* Detalles */}
            <div className="space-y-3">
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="text-muted-foreground">Publicado hace </span>
                  {format(new Date(task.created_at || Date.now()), "d 'días'", { locale: es })}
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    <UserIcon weight="duotone" className="w-4 h-4 text-slate-600" />
                    <span className="text-sm">{categoryName}</span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    <Clock weight="duotone" className="w-4 h-4 text-slate-600" />
                    <span className="text-sm">4-5 horas</span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    <Calendar weight="duotone" className="w-4 h-4 text-slate-600" />
                    <span className="text-sm">{formattedDeadline}</span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    <MapPin weight="duotone" className="w-4 h-4 text-slate-600" />
                    <span className="text-sm">{task.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Línea separadora */}
            <div className="border-t border-slate-200" />

            {/* Línea separadora */}
            <div className="border-t border-slate-200" />

            {/* Requisitos */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Requisitos</h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>Contar con teléfono propio con plan de minutos o ilimitado.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>Tener un tono de voz amable y claro.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>Disponibilidad para realizar las llamadas en horario de oficina (9am - 6pm).</span>
                </li>
              </ul>
            </div>

            {/* Línea separadora */}
            <div className="border-t border-slate-200" />

            {/* Adjuntos */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Adjuntos</h3>
              <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">No hay archivos adjuntos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer fijo con botones */}
        <div className="border-t border-slate-200 bg-white px-6 md:px-8 py-4 md:py-5 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleApply}
              className="flex-1 h-12 bg-[#4285F4] hover:bg-[#357ae8] text-white font-medium shadow-sm cursor-pointer"
            >
              Enviar propuesta
            </Button>
            <Button
              onClick={handleAskQuestion}
              variant="outline"
              className="flex-1 h-12 font-medium border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Hacer una pregunta
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
