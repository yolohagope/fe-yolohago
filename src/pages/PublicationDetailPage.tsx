import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CurrencyDollar, 
  CheckCircle, 
  XCircle, 
  Hourglass,
  House,
  CaretRight,
  User as UserIcon
} from '@phosphor-icons/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { fetchTaskById, fetchTaskApplications, acceptApplication, rejectApplication } from '@/services/api';
import { Task, Application, ApplicationStatus } from '@/lib/types';
import { getCategoryName, isTaskVerified, getPosterName } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function PublicationDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadTaskAndApplications();
  }, [taskId]);

  async function loadTaskAndApplications() {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);

      const [taskData, applicationsData] = await Promise.all([
        fetchTaskById(taskId),
        fetchTaskApplications(parseInt(taskId))
      ]);

      if (taskData) {
        setTask(taskData);
        setApplications(applicationsData);
      } else {
        setError('Tarea no encontrada');
      }
    } catch (err: any) {
      console.error('Error loading task and applications:', err);
      setError('Error al cargar los detalles de la tarea');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptApplication(applicationId: number) {
    if (!confirm('¿Estás seguro de que deseas aceptar esta propuesta?')) {
      return;
    }

    try {
      setProcessingId(applicationId);
      await acceptApplication(applicationId);
      // Recargar applications
      await loadTaskAndApplications();
    } catch (error: any) {
      alert(error.message || 'Error al aceptar propuesta');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRejectApplication(applicationId: number) {
    if (!confirm('¿Estás seguro de que deseas rechazar esta propuesta?')) {
      return;
    }

    try {
      setProcessingId(applicationId);
      await rejectApplication(applicationId);
      // Recargar applications
      await loadTaskAndApplications();
    } catch (error: any) {
      alert(error.message || 'Error al rechazar propuesta');
    } finally {
      setProcessingId(null);
    }
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Cargando detalles...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <p className="text-red-600 mb-4">{error || 'Tarea no encontrada'}</p>
            <Button onClick={() => navigate('/mis-tareas?tab=publicadas')}>Volver</Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate('/')}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <House className="w-4 h-4" />
              Inicio
            </button>
            <CaretRight className="w-4 h-4" />
            <button
              onClick={() => navigate('/mis-tareas?tab=publicadas')}
              className="hover:text-foreground transition-colors"
            >
              Mis Publicaciones
            </button>
            <CaretRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{task.title}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Lista de propuestas (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Propuestas Recibidas</h2>
              <p className="text-muted-foreground">
                {applications.length} propuesta{applications.length !== 1 ? 's' : ''} en total
                {pendingApplications.length > 0 && ` · ${pendingApplications.length} pendiente${pendingApplications.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {applications.length === 0 ? (
              <Card className="p-12 text-center">
                <Hourglass weight="thin" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No hay propuestas aún</h3>
                <p className="text-muted-foreground">
                  Las propuestas aparecerán aquí cuando los trabajadores se postulen a tu tarea
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <span className="font-semibold text-primary text-lg">
                              {application.applicant_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{application.applicant_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Aplicó el {format(new Date(application.created_at), "d 'de' MMMM", { locale: es })}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      <div className="flex items-center gap-2">
                        <CurrencyDollar className="w-5 h-5 text-[#34A853]" />
                        <span className="text-2xl font-bold text-[#34A853]">
                          {application.currency} {application.offered_price}
                        </span>
                      </div>

                      {application.message && (
                        <div className="p-4 bg-accent/30 rounded-lg">
                          <p className="text-sm font-medium mb-1">Mensaje del postulante:</p>
                          <p className="text-sm">{application.message}</p>
                        </div>
                      )}

                      {application.status === 'pending' && (
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleAcceptApplication(application.id)}
                            disabled={processingId === application.id}
                            className="flex-1 bg-[#34A853] hover:bg-[#2d8f47]"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" weight="fill" />
                            Aceptar
                          </Button>
                          <Button
                            onClick={() => handleRejectApplication(application.id)}
                            disabled={processingId === application.id}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" weight="fill" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Columna derecha: Detalles de la tarea (1/3) */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="font-bold text-lg mb-4">Detalles de la Tarea</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{task.title}</h4>
                  <Badge variant="secondary" className="text-xs mb-3">
                    {getCategoryName(task)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Presupuesto</span>
                    <div className="text-xl font-bold text-[#34A853]">
                      {task.currency} {Number(task.payment).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{task.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Vence: {format(new Date(task.deadline), "d 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Publicado: {format(new Date(task.created_at || Date.now()), "d 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/mis-tareas?tab=publicadas')}
                  >
                    Volver a Mis Publicaciones
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
