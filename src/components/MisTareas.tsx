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

  console.log('🎯 MisTareas: Componente renderizado');
  console.log('📊 MisTareas: Estado actual - applications:', myApplications.length, 'published:', myPublishedTasks.length, 'loading:', loading);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mis Tareas</h1>
          <p className="text-sm text-gray-600">
            Gestiona las tareas que has tomado y las que has publicado
          </p>
        </div>

        {showSuccessBanner && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1.5">
                <CheckCircle className="w-5 h-5 text-white" weight="fill" />
              </div>
              <div>
                <p className="font-semibold text-sm">¡Propuesta enviada exitosamente!</p>
                <p className="text-xs text-green-700">Podrás ver el estado de tu propuesta aquí</p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <XCircle className="w-5 h-5" weight="bold" />
            </button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set('tab', value);
          setSearchParams(newParams);
        }} className="w-full">
          {/* Tabs mejorados */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-1 inline-flex gap-1 mb-6">
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('tab', 'tomadas');
                setSearchParams(newParams);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'tomadas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package weight={activeTab === 'tomadas' ? 'fill' : 'regular'} size={18} />
              <span>Mis Propuestas</span>
              {myApplications.length > 0 && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  activeTab === 'tomadas'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {myApplications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('tab', 'publicadas');
                setSearchParams(newParams);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'publicadas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ClipboardText weight={activeTab === 'publicadas' ? 'fill' : 'regular'} size={18} />
              <span>Mis Publicaciones</span>
              {myPublishedTasks.length > 0 && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  activeTab === 'publicadas'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {myPublishedTasks.length}
                </span>
              )}
            </button>
          </div>

          <TabsContent value="tomadas" className="mt-6">
            {/* Filtros mejorados */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setStatusFilter('all')}
                disabled={loadingApplications}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                disabled={loadingApplications}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'bg-white text-yellow-600 border border-yellow-200 hover:bg-yellow-50'
                }`}
              >
                <Hourglass className="w-4 h-4" weight={statusFilter === 'pending' ? 'fill' : 'regular'} />
                Pendientes
              </button>
              <button
                onClick={() => setStatusFilter('accepted')}
                disabled={loadingApplications}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === 'accepted'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                }`}
              >
                <CheckCircle className="w-4 h-4" weight={statusFilter === 'accepted' ? 'fill' : 'regular'} />
                Aceptadas
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                disabled={loadingApplications}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === 'rejected'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                }`}
              >
                <XCircle className="w-4 h-4" weight={statusFilter === 'rejected' ? 'fill' : 'regular'} />
                Rechazadas
              </button>
            </div>

            {loadingApplications ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : myApplications.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package weight="thin" size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {statusFilter === 'all' 
                    ? 'No has enviado ninguna propuesta' 
                    : `No tienes propuestas ${
                        statusFilter === 'pending' ? 'pendientes' :
                        statusFilter === 'accepted' ? 'aceptadas' :
                        'rechazadas'
                      }`
                  }
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {statusFilter === 'all'
                    ? 'Explora el muro de tareas y envía propuestas a las que te interesen'
                    : 'Intenta con otro filtro o explora más tareas'
                  }
                </p>
                <Button 
                  onClick={() => statusFilter === 'all' ? window.location.href = '/' : setStatusFilter('all')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {statusFilter === 'all' ? 'Explorar Tareas' : 'Ver Todas'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.map((application) => (
                  <div key={application.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{application.task_title}</h3>
                          {getStatusBadge(application.status)}
                        </div>

                        {application.message && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Tu mensaje:</p>
                            <p className="text-sm text-blue-800">{application.message}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-1.5">
                            <CurrencyDollar className="w-5 h-5 text-green-600" weight="bold" />
                            <span className="font-bold text-green-600">S/ {application.offered_price}</span>
                            <span className="text-sm text-gray-500">tu oferta</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {new Date(application.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewApplicationDetail(application)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium shrink-0"
                      >
                        Ver detalle
                        <CaretRight className="w-5 h-5 ml-1" weight="bold" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="publicadas" className="mt-6">
            {myPublishedTasks.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardText weight="thin" size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No has publicado ninguna tarea</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Publica tu primera tarea y recibe propuestas de trabajadores
                </p>
                <Button 
                  onClick={() => window.location.href = '/?view=publicar'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Publicar Tarea
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myPublishedTasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 flex-1">{task.title}</h3>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs shrink-0">
                            {getCategoryName(task)}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {task.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <CurrencyDollar className="w-5 h-5 text-green-600" weight="bold" />
                            <span className="font-bold text-green-600">S/ {task.payment}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{task.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(task.deadline).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/publicaciones/${task.id}`)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium shrink-0"
                      >
                        Ver detalle
                        <CaretRight className="w-5 h-5 ml-1" weight="bold" />
                      </Button>
                    </div>
                  </div>
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
