import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardText, Package, Clock, MapPin, CurrencyDollar, CheckCircle, XCircle, Hourglass, Trash, CaretRight } from '@phosphor-icons/react';
import { fetchMyApplications, fetchMyPublishedTasks, deleteApplication } from '@/services/api';
import { Task, Application, ApplicationStatus } from '@/lib/types';
import { getCategoryName, getPosterName } from '@/lib/utils';
import { TaskDetailDialog } from './TaskDetailDialog';

export function MisTareas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [myPublishedTasks, setMyPublishedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');

  // Obtener tab activo desde URL o usar default
  const activeTab = searchParams.get('tab') || 'tomadas';

  useEffect(() => {
    // Mostrar banner de éxito si viene desde propuesta
    if (searchParams.get('propuesta') === 'enviada') {
      setShowSuccessBanner(true);
      // Limpiar el parámetro después de mostrarlo
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('propuesta');
      setSearchParams(newParams, { replace: true });
      // Ocultar después de 8 segundos
      setTimeout(() => setShowSuccessBanner(false), 8000);
    }
  }, [searchParams, setSearchParams]);

  // Cargar todo al inicio
  useEffect(() => {
    loadInitialData();
  }, []);

  // Solo recargar applications cuando cambia el filtro
  useEffect(() => {
    if (!loading) { // Solo si ya se cargó la data inicial
      loadApplications();
    }
  }, [statusFilter]);

  async function loadInitialData() {
    try {
      setLoading(true);
      console.log('🔄 MisTareas: Cargando datos iniciales...');
      const [applications, published] = await Promise.all([
        fetchMyApplications(statusFilter !== 'all' ? statusFilter : undefined),
        fetchMyPublishedTasks()
      ]);
      console.log('✅ MisTareas: Applications:', applications);
      console.log('✅ MisTareas: Published tasks:', published);
      setMyApplications(applications);
      setMyPublishedTasks(published);
    } catch (error) {
      console.error('❌ MisTareas: Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications() {
    try {
      setLoadingApplications(true);
      console.log('🔄 MisTareas: Recargando applications con filtro:', statusFilter);
      const applications = await fetchMyApplications(statusFilter !== 'all' ? statusFilter : undefined);
      console.log('✅ MisTareas: Applications actualizadas:', applications);
      setMyApplications(applications);
    } catch (error) {
      console.error('❌ MisTareas: Error recargando applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  }

  async function handleDeleteApplication(applicationId: number) {
    if (!confirm('¿Estás seguro de que deseas retirar esta propuesta?')) {
      return;
    }

    try {
      setDeletingId(applicationId);
      await deleteApplication(applicationId);
      // Recargar solo applications
      await loadApplications();
    } catch (error: any) {
      alert(error.message || 'Error al retirar propuesta');
    } finally {
      setDeletingId(null);
    }
  }

  function handleViewApplicationDetail(application: Application) {
    navigate(`/propuestas/${application.id}`, { state: { application } });
  }

  function getStatusBadge(status: ApplicationStatus) {
    const config = {
      pending: {
        icon: <Hourglass className="w-4 h-4" />,
        text: 'Pendiente',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-300'
      },
      accepted: {
        icon: <CheckCircle className="w-4 h-4" weight="fill" />,
        text: 'Aceptada',
        className: 'bg-green-50 text-green-700 border-green-300'
      },
      rejected: {
        icon: <XCircle className="w-4 h-4" weight="fill" />,
        text: 'Rechazada',
        className: 'bg-red-50 text-red-700 border-red-300'
      },
      cancelled: {
        icon: <XCircle className="w-4 h-4" />,
        text: 'Cancelada',
        className: 'bg-gray-50 text-gray-700 border-gray-300'
      }
    };

    const { icon, text, className } = config[status];

    return (
      <Badge variant="outline" className={className}>
        <div className="flex items-center gap-1">
          {icon}
          <span>{text}</span>
        </div>
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando tus tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Tareas</h1>
          <p className="text-muted-foreground">
            Gestiona las tareas que has tomado y las que has publicado
          </p>
        </div>

        {showSuccessBanner && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-1.5">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">¡Propuesta enviada exitosamente!</p>
                <p className="text-sm text-green-700">Podrás ver el estado de tu propuesta aquí</p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set('tab', value);
          setSearchParams(newParams);
        }} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tomadas" className="flex items-center gap-2 cursor-pointer">
              <Package weight="bold" size={18} />
              Mis Propuestas
              {myApplications.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {myApplications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="publicadas" className="flex items-center gap-2 cursor-pointer">
              <ClipboardText weight="bold" size={18} />
              Mis Publicaciones
              {myPublishedTasks.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {myPublishedTasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tomadas" className="mt-6">
            {/* Filtros por estado */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                disabled={loadingApplications}
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                disabled={loadingApplications}
                className={statusFilter === 'pending' ? '' : 'text-yellow-600 border-yellow-300 hover:bg-yellow-50'}
              >
                <Hourglass className="w-4 h-4 mr-1" />
                Pendientes
              </Button>
              <Button
                variant={statusFilter === 'accepted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('accepted')}
                disabled={loadingApplications}
                className={statusFilter === 'accepted' ? '' : 'text-green-600 border-green-300 hover:bg-green-50'}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aceptadas
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('rejected')}
                disabled={loadingApplications}
                className={statusFilter === 'rejected' ? '' : 'text-red-600 border-red-300 hover:bg-red-50'}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rechazadas
              </Button>
            </div>

            {loadingApplications ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : myApplications.length === 0 ? (
              <Card className="p-12 text-center">
                <Package weight="thin" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {statusFilter === 'all' 
                    ? 'No has enviado ninguna propuesta' 
                    : `No tienes propuestas ${
                        statusFilter === 'pending' ? 'pendientes' :
                        statusFilter === 'accepted' ? 'aceptadas' :
                        'rechazadas'
                      }`
                  }
                </h3>
                <p className="text-muted-foreground mb-6">
                  {statusFilter === 'all'
                    ? 'Explora el muro de tareas y envía propuestas a las que te interesen'
                    : 'Intenta con otro filtro o explora más tareas'
                  }
                </p>
                <Button onClick={() => statusFilter === 'all' ? window.location.href = '/' : setStatusFilter('all')}>
                  {statusFilter === 'all' ? 'Explorar Tareas' : 'Ver Todas'}
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {myApplications.map((application) => (
                  <Card key={application.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">{application.task_title}</h3>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>

                        {application.message && (
                          <div className="mt-3 p-3 bg-accent/30 rounded-lg">
                            <p className="text-sm text-muted-foreground font-medium mb-1">Tu mensaje:</p>
                            <p className="text-sm">{application.message}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-1">
                            <CurrencyDollar className="w-5 h-5 text-muted-foreground" />
                            <span className="font-semibold">{application.currency} {application.offered_price}</span>
                            <span className="text-sm text-muted-foreground">tu oferta</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {new Date(application.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewApplicationDetail(application)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                      >
                        Ver detalle
                        <CaretRight className="w-5 h-5 ml-1" weight="bold" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="publicadas" className="mt-6">
            {myPublishedTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <ClipboardText weight="thin" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No has publicado ninguna tarea</h3>
                <p className="text-muted-foreground mb-6">
                  Publica tu primera tarea y recibe propuestas de trabajadores
                </p>
                <Button onClick={() => window.location.href = '/?view=publicar'}>
                  Publicar Tarea
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myPublishedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => {
                      setSelectedTask(task);
                      setDialogOpen(true);
                    }}
                    type="publicada"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  type: 'tomada' | 'publicada';
}

function TaskCard({ task, onClick, type }: TaskCardProps) {
  // Usar helpers para obtener valores
  const categoryName = getCategoryName(task);
  const posterName = getPosterName(task);
  
  return (
    <Card
      className="p-5 hover:shadow-lg transition-all cursor-pointer border-l-4"
      style={{ borderLeftColor: type === 'tomada' ? '#4285F4' : '#34A853' }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <Badge variant={type === 'tomada' ? 'default' : 'secondary'}>
          {type === 'tomada' ? 'En progreso' : 'Publicada'}
        </Badge>
        <span className="text-sm text-muted-foreground">{categoryName}</span>
      </div>

      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{task.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin weight="bold" size={16} />
          <span>{task.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock weight="bold" size={16} />
          <span>Vence: {new Date(task.deadline).toLocaleDateString('es-PE')}</span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-[#34A853]">
          <CurrencyDollar weight="bold" size={16} />
          <span>{task.currency}{task.payment}</span>
        </div>
      </div>

      {type === 'publicada' && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Publicado por: <span className="font-medium text-foreground">{posterName}</span>
          </p>
        </div>
      )}
    </Card>
  );
}
