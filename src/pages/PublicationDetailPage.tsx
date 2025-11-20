import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  User as UserIcon,
  Package,
  ChatCircle
} from '@phosphor-icons/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  fetchTaskById, 
  fetchTaskApplications, 
  acceptApplication, 
  rejectApplication,
  fetchTaskInquiries,
  answerInquiry
} from '@/services/api';
import { Task, Application, ApplicationStatus, Inquiry } from '@/lib/types';
import { getCategoryName } from '@/lib/utils';
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
  
  // Estado para consultas
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    loadTaskAndApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Cargar consultas después de cargar la tarea exitosamente
        loadInquiries(parseInt(taskId));
      } else {
        setError('Tarea no encontrada');
      }
    } catch (err: any) {
      console.error('Error loading task and applications:', err);
      setError(err.message || 'Error al cargar los detalles de la tarea');
    } finally {
      setLoading(false);
    }
  }

  async function loadInquiries(taskId: number) {
    try {
      setLoadingInquiries(true);
      const inquiriesData = await fetchTaskInquiries(taskId);
      setInquiries(inquiriesData);
    } catch (err: any) {
      console.error('Error loading inquiries (non-critical):', err);
      // No mostramos error al usuario, solo dejamos las consultas vacías
      setInquiries([]);
    } finally {
      setLoadingInquiries(false);
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

  async function handleReplyInquiry(inquiryId: number) {
    const replyText = replyTexts[inquiryId]?.trim();
    if (!replyText) {
      alert('Por favor escribe una respuesta');
      return;
    }

    try {
      setReplyingTo(inquiryId);
      await answerInquiry(inquiryId, { answer: replyText });
      
      // Recargar consultas
      if (taskId) {
        await loadInquiries(parseInt(taskId));
      }
      
      // Limpiar el campo de respuesta
      setReplyTexts(prev => ({ ...prev, [inquiryId]: '' }));
    } catch (error: any) {
      alert(error.message || 'Error al enviar respuesta');
    } finally {
      setReplyingTo(null);
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
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Cargando detalles de la publicación...</p>
            </div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h2>
            <p className="text-red-600 mb-4">{error || 'Tarea no encontrada'}</p>
            <Button onClick={() => navigate('/mis-tareas?tab=publicadas')}>
              Volver a Mis Publicaciones
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');

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
          {/* Columna izquierda: Tabs de Propuestas y Consultas (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="propuestas" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="propuestas" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                >
                  <Package className="w-4 h-4" />
                  Propuestas ({applications.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="consultas" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                >
                  <ChatCircle className="w-4 h-4" />
                  Consultas ({inquiries.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab de Propuestas */}
              <TabsContent value="propuestas" className="space-y-4 mt-6">
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    {applications.length} propuesta{applications.length !== 1 ? 's' : ''} en total
                    {pendingApplications.length > 0 && ` · ${pendingApplications.length} pendiente${pendingApplications.length !== 1 ? 's' : ''}`}
                  </p>
                </div>

                {applications.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Package weight="thin" size={64} className="mx-auto mb-4 text-muted-foreground" />
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
                                {processingId === application.id ? 'Procesando...' : 'Aceptar'}
                              </Button>
                              <Button
                                onClick={() => handleRejectApplication(application.id)}
                                disabled={processingId === application.id}
                                variant="outline"
                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" weight="fill" />
                                {processingId === application.id ? 'Procesando...' : 'Rechazar'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab de Consultas - Estilo foro */}
              <TabsContent value="consultas" className="space-y-4 mt-6">
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    {inquiries.length} consulta{inquiries.length !== 1 ? 's' : ''} en total
                  </p>
                </div>

                {loadingInquiries ? (
                  <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Cargando consultas...</p>
                  </Card>
                ) : inquiries.length === 0 ? (
                  <Card className="p-12 text-center">
                    <ChatCircle weight="thin" size={64} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No hay consultas aún</h3>
                    <p className="text-muted-foreground">
                      Las consultas aparecerán aquí cuando alguien haga preguntas sobre tu tarea
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <Card key={inquiry.id} className="p-6">
                        <div className="space-y-4">
                          {/* Pregunta original */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                              <span className="font-semibold text-blue-600 text-sm">
                                {(inquiry.sender_name || inquiry.inquirer_name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{inquiry.sender_name || inquiry.inquirer_name || 'Usuario'}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(inquiry.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                                </span>
                                {inquiry.is_public === false && (
                                  <Badge variant="outline" className="text-xs">
                                    Privada
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm">{inquiry.question}</p>
                            </div>
                          </div>

                          {/* Respuesta si existe */}
                          {inquiry.answer && (
                            <div className="ml-10 pl-4 border-l-2 border-primary/20">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shrink-0">
                                  <UserIcon className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">Tú</span>
                                    {inquiry.answered_at && (
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(inquiry.answered_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm">{inquiry.answer}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Campo de respuesta si no hay respuesta */}
                          {!inquiry.answer && (
                            <div className="ml-10 space-y-2">
                              <Textarea
                                placeholder="Escribe tu respuesta..."
                                value={replyTexts[inquiry.id] || ''}
                                onChange={(e) => setReplyTexts(prev => ({ ...prev, [inquiry.id]: e.target.value }))}
                                rows={3}
                                className="resize-none"
                              />
                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleReplyInquiry(inquiry.id)}
                                  disabled={replyingTo === inquiry.id || !replyTexts[inquiry.id]?.trim()}
                                  size="sm"
                                >
                                  {replyingTo === inquiry.id ? 'Enviando...' : 'Responder'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
