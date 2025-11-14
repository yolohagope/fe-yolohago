import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Hourglass, Clock, CurrencyDollar, Trash, ChatCircle, Upload, Check } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Application, ApplicationStatus } from '@/lib/types';
import { deleteApplication, fetchApplicationById } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(
    location.state?.application || null
  );
  const [loading, setLoading] = useState(!location.state?.application);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('detalles');

  useEffect(() => {
    // Solo cargar si no tenemos datos del state
    if (!location.state?.application) {
      loadApplication();
    }
  }, [id, location.state]);

  async function loadApplication() {
    try {
      setLoading(true);
      const data = await fetchApplicationById(Number(id));
      setApplication(data);
    } catch (error: any) {
      console.error('Error loading application:', error);
      // Si hay error, application quedará null y se mostrará el mensaje de error
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteApplication() {
    if (!application || !confirm('¿Estás seguro de que deseas retirar esta propuesta?')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteApplication(application.id);
      navigate('/mis-tareas?tab=tomadas');
    } catch (error: any) {
      alert(error.message || 'Error al retirar propuesta');
      setDeleting(false);
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
      <Badge variant="outline" className={`${className} flex items-center gap-1.5 w-fit`}>
        {icon}
        <span>{text}</span>
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">Propuesta no encontrada</h3>
          <p className="text-muted-foreground mb-6">
            No se pudo cargar la información de esta propuesta
          </p>
          <Button onClick={() => navigate('/mis-tareas?tab=tomadas')}>
            Volver a Mis Propuestas
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/mis-tareas?tab=tomadas')}
              className="gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </Button>
            {getStatusBadge(application.status)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información de la tarea */}
            <Card className="p-6">
              <h1 className="text-2xl font-bold mb-4">{application.task_title}</h1>
              
              <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border mb-4">
                <span className="text-sm font-medium text-muted-foreground">Tu oferta</span>
                <div className="text-3xl font-bold text-[#34A853]">
                  {application.currency} {application.offered_price}
                </div>
              </div>

              {application.message && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Tu mensaje</p>
                  <div className="p-4 bg-accent/20 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap">{application.message}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Tabs según estado */}
            {application.status === 'accepted' && (
              <Card className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat" className="gap-2">
                      <ChatCircle className="w-4 h-4" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="entregables" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Entregables
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="mt-4">
                    <div className="space-y-4">
                      {/* Lista de mensajes */}
                      <div className="min-h-[300px] max-h-[400px] overflow-y-auto space-y-3 p-4 bg-accent/20 rounded-lg">
                        <p className="text-center text-sm text-muted-foreground">
                          El chat estará disponible próximamente
                        </p>
                      </div>

                      {/* Input de mensaje */}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Escribe un mensaje..."
                          className="resize-none"
                          rows={2}
                        />
                        <Button className="self-end">
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="entregables" className="mt-4">
                    <div className="space-y-4">
                      <div className="text-center p-8 border-2 border-dashed rounded-lg">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Sube los archivos de tu trabajo
                        </p>
                        <Button variant="outline">
                          Seleccionar archivos
                        </Button>
                      </div>

                      {/* Lista de entregables */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Archivos subidos</p>
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay archivos subidos aún
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            )}

            {/* Información según estado */}
            {application.status === 'pending' && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Tu propuesta está en revisión.</strong> El publicador de la tarea la evaluará pronto.
                </p>
              </Card>
            )}

            {application.status === 'rejected' && (
              <Card className="p-4 bg-red-50 border-red-200">
                <p className="text-sm text-red-800">
                  Tu propuesta no fue seleccionada. Puedes seguir buscando otras tareas que se ajusten a tu perfil.
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Información</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <div>
                    <p className="text-xs">Enviada el</p>
                    <p className="font-medium text-foreground">
                      {new Date(application.created_at).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {application.status === 'pending' && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-red-600">Zona de peligro</h3>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeleteApplication}
                  disabled={deleting}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  {deleting ? 'Retirando...' : 'Retirar propuesta'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Esta acción no se puede deshacer
                </p>
              </Card>
            )}

            {application.status === 'accepted' && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Acciones</h3>
                <Button className="w-full" variant="default">
                  <Check className="w-4 h-4 mr-2" />
                  Marcar como completada
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
