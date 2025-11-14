import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Hourglass, Clock, Trash, ChatCircle, Upload, Check, PencilSimple, MapPin, Calendar, User as UserIcon, CaretRight, House } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Application, ApplicationStatus, Task } from '@/lib/types';
import { deleteApplication, fetchApplicationById, fetchTaskById } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { getCategoryName, isTaskVerified, getPosterName } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(
    location.state?.application || null
  );
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(!location.state?.application);
  const [loadingTask, setLoadingTask] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('detalles');
  
  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState('');
  const [editedMessage, setEditedMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Solo cargar si no tenemos datos del state
    if (!location.state?.application) {
      loadApplication();
    }
  }, [id, location.state]);

  useEffect(() => {
    // Cargar tarea cuando tengamos la application
    if (application) {
      loadTask();
    }
  }, [application]);

  useEffect(() => {
    // Inicializar valores de edición cuando la aplicación cargue
    if (application) {
      setEditedPrice(application.offered_price.toString());
      setEditedMessage(application.message || '');
    }
  }, [application]);

  useEffect(() => {
    // Detectar cambios
    if (application) {
      const priceChanged = editedPrice !== application.offered_price.toString();
      const messageChanged = editedMessage !== (application.message || '');
      setHasChanges(priceChanged || messageChanged);
    }
  }, [editedPrice, editedMessage, application]);

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

  async function loadTask() {
    if (!application) return;
    
    try {
      setLoadingTask(true);
      const taskData = await fetchTaskById(application.task.toString());
      setTask(taskData);
    } catch (error: any) {
      console.error('Error loading task:', error);
    } finally {
      setLoadingTask(false);
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

  async function handleUpdateApplication() {
    if (!application || !hasChanges) return;

    // TODO: Implementar API call para actualizar
    console.log('Actualizando propuesta:', {
      id: application.id,
      offered_price: parseFloat(editedPrice),
      message: editedMessage
    });

    alert('Función de actualización pendiente de implementar en el backend');
    setIsEditing(false);
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
      {/* Header principal del sitio */}
      <Header />

      {/* Breadcrumb y Badge de estado */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
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
                onClick={() => navigate('/mis-tareas?tab=tomadas')}
                className="hover:text-foreground transition-colors"
              >
                Mis Propuestas
              </button>
              <CaretRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Propuesta #{application.id}</span>
            </nav>

            {/* Badge de estado */}
            {getStatusBadge(application.status)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Información según estado - Ancho completo */}
        {application.status === 'pending' && (
          <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Tu propuesta está en revisión.</strong> El publicador de la tarea la evaluará pronto.
            </p>
          </Card>
        )}

        {application.status === 'rejected' && (
          <Card className="p-4 bg-red-50 border-red-200 mb-6">
            <p className="text-sm text-red-800">
              Tu propuesta no fue seleccionada. Puedes seguir buscando otras tareas que se ajusten a tu perfil.
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información de la tarea */}
            <Card className="p-6">
              {/* Título */}
              <h1 className="text-2xl font-bold mb-4">{application.task_title}</h1>
              
              {/* Descripción */}
              {task && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {task.description}
                </p>
              )}

              <div className="border-t border-slate-200 my-4" />

              {/* Card del publicador + Monto */}
              {task ? (
                <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200 mb-4">
                  {/* Info del publicador */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="font-semibold text-primary text-lg">
                        {getPosterName(task).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{getPosterName(task)}</p>
                        {isTaskVerified(task) && (
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
              ) : loadingTask ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : null}

              <div className="border-t border-slate-200 my-4" />

              {/* Detalles */}
              {task && (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="space-y-2 text-sm text-slate-700">
                      <p>
                        <span className="text-muted-foreground">Publicado hace </span>
                        {format(new Date(task.created_at || Date.now()), "d 'días'", { locale: es })}
                      </p>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                          <UserIcon weight="duotone" className="w-4 h-4 text-slate-600" />
                          <span className="text-sm">{getCategoryName(task)}</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                          <Clock weight="duotone" className="w-4 h-4 text-slate-600" />
                          <span className="text-sm">4-5 horas</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                          <Calendar weight="duotone" className="w-4 h-4 text-slate-600" />
                          <span className="text-sm">
                            {format(new Date(task.deadline), "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                          <MapPin weight="duotone" className="w-4 h-4 text-slate-600" />
                          <span className="text-sm">{task.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 my-4" />

                  {/* Requisitos */}
                  <div className="space-y-3 mb-4">
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

                  <div className="border-t border-slate-200 my-4" />

                  {/* Adjuntos */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Adjuntos</h3>
                    <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">No hay archivos adjuntos</p>
                    </div>
                  </div>
                </>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Card unificado con toda la información y acciones */}
            <Card className="p-6">
              {/* Sección de tu propuesta */}
              <div className="space-y-4 pb-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Tu propuesta</h3>
                  {application.status === 'pending' && !isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8 text-xs gap-1"
                    >
                      <PencilSimple className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                  )}
                </div>

                {/* Monto ofertado */}
                <div>
                  <label className="text-xs text-muted-foreground">Monto ofrecido</label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">{application.currency}</span>
                      <Input
                        type="number"
                        value={editedPrice}
                        onChange={(e) => setEditedPrice(e.target.value)}
                        className="h-9"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-[#34A853] mt-1">
                      {application.currency} {application.offered_price}
                    </div>
                  )}
                </div>

                {/* Mensaje */}
                {(application.message || isEditing) && (
                  <div>
                    <label className="text-xs text-muted-foreground">Tu mensaje</label>
                    {isEditing ? (
                      <Textarea
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        className="mt-1 min-h-[80px]"
                        placeholder="Mensaje para el publicador..."
                      />
                    ) : (
                      <p className="text-sm mt-1">{application.message}</p>
                    )}
                  </div>
                )}

                {/* Botón actualizar (solo si hay cambios) */}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateApplication}
                      disabled={!hasChanges}
                      className="flex-1"
                      size="sm"
                    >
                      Actualizar oferta
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedPrice(application.offered_price.toString());
                        setEditedMessage(application.message || '');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              {/* Zona de peligro - solo para pending */}
              {application.status === 'pending' && (
                <div className="pt-6">
                  <h3 className="font-semibold mb-3 text-red-600 text-sm">Zona de peligro</h3>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDeleteApplication}
                    disabled={deleting}
                    size="sm"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    {deleting ? 'Retirando...' : 'Retirar propuesta'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              )}

              {/* Acciones para accepted */}
              {application.status === 'accepted' && (
                <div className="pt-6">
                  <h3 className="font-semibold mb-3 text-sm">Acciones</h3>
                  <Button className="w-full" variant="default" size="sm">
                    <Check className="w-4 h-4 mr-2" />
                    Marcar como completada
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
