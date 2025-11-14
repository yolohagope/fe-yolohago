import { useState, useEffect } from 'react';
import { Star, CheckCircle, Clock, CaretRight, House, MapPin, Calendar, User as UserIcon } from '@phosphor-icons/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTaskById, createApplication } from '@/services/api';
import { Task } from '@/lib/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getCategoryName, isTaskVerified, getPosterName } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function PropuestaPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offeredPrice, setOfferedPrice] = useState('');
  const [currency, setCurrency] = useState('S/');
  const [message, setMessage] = useState('');
  const [consultaMessage, setConsultaMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [consultaLoading, setConsultaLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('propuesta');

  useEffect(() => {
    async function loadTask() {
      if (!taskId) {
        setError('ID de tarea no proporcionado');
        setTaskLoading(false);
        return;
      }
      
      setTaskLoading(true);
      setError(null);
      
      try {
        console.log('Cargando tarea con ID:', taskId);
        const taskData = await fetchTaskById(taskId);
        if (taskData) {
          console.log('Tarea cargada:', taskData);
          setTask(taskData);
          // Pre-llenar con el precio y moneda de la tarea
          setOfferedPrice(taskData.payment.toString());
          setCurrency(taskData.currency);
        } else {
          console.log('Tarea no encontrada');
          setError('Tarea no encontrada');
        }
      } catch (err: any) {
        console.error('Error loading task:', err);
        setError(`Error al cargar los detalles de la tarea: ${err.message || 'Error desconocido'}`);
      } finally {
        setTaskLoading(false);
      }
    }

    loadTask();
  }, [taskId]);

  // Stats del usuario (en el futuro vendrán de la API)
  const userStats = {
    tasksCompleted: 12,
    rating: 4.8,
    projectsPublished: 5,
    projectsPaid: 10,
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Mostrar loading
  if (taskLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Cargando detalles de la tarea...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar error
  if (error || !task) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <p className="text-red-600 mb-4">{error || 'Tarea no encontrada'}</p>
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Determinar el badge de estado (por ahora mostrar siempre "Evaluando propuestas")
  const getStatusBadge = () => {
    return (
      <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
        Evaluando propuestas
      </Badge>
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    try {
      if (!taskId) {
        throw new Error('ID de tarea no válido');
      }

      await createApplication({
        task: parseInt(taskId),
        offered_price: offeredPrice,
        currency: currency,
        message: message || undefined,
      });

      console.log('Postulación enviada exitosamente');

      // Redirigir a Mis Tareas con el tab de "tomadas" activo
      navigate('/mis-tareas?tab=tomadas&propuesta=enviada');
    } catch (err: any) {
      console.error('Error al enviar postulación:', err);
      setSubmitError(err.message || 'Error al enviar la postulación. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  }

  async function handleConsulta(e: React.FormEvent) {
    e.preventDefault();
    setConsultaLoading(true);

    try {
      // TODO: Implementar API para enviar consulta
      console.log('Consulta enviada:', consultaMessage);
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Consulta enviada exitosamente');
      setConsultaMessage('');
    } catch (err: any) {
      console.error('Error al enviar consulta:', err);
      alert('Error al enviar la consulta');
    } finally {
      setConsultaLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header principal del sitio */}
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              onClick={() => navigate('/buscar')}
              className="hover:text-foreground transition-colors"
            >
              Buscar tareas
            </button>
            <CaretRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Preparar propuesta</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Layout de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs: Propuesta y Consulta */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 h-auto rounded-none">
            <TabsTrigger 
              value="propuesta"
              className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:shadow-none px-6 py-3"
            >
              Enviar propuesta
            </TabsTrigger>
            <TabsTrigger 
              value="consulta"
              className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:shadow-none px-6 py-3"
            >
              Hacer consulta
            </TabsTrigger>
          </TabsList>

          {/* Tab de Propuesta */}
          <TabsContent value="propuesta">
            <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Tu Propuesta</h2>
            
            <div className="space-y-4">
              <div className="bg-accent/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Esta es tu propuesta para el proyecto y tu lugar para lucirte. Cuanto más completo esté tu primer mensaje, más posibilidades tendrás de destacarte. Sigue las buenas prácticas para orientarte.
                </p>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">{submitError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="offeredPrice" className="block text-sm font-medium mb-2">
                    ¿Cuánto cobrarás por este trabajo?
                  </label>
                  <Input
                    id="offeredPrice"
                    type="number"
                    placeholder="Ingresa tu monto"
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(e.target.value)}
                    required
                    min="0.01"
                    step="0.01"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    El publicador ofreció {task.currency} {task.payment}
                  </p>
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium mb-2">
                    Moneda
                  </label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S/">Soles (S/)</SelectItem>
                      <SelectItem value="$">Dólares ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Escribe por qué deberían elegirte a ti
                </label>
                <Textarea
                  id="message"
                  placeholder="Cuéntale al cliente por qué consideras que eres la persona ideal para su proyecto. Destaca tu experiencia, habilidades y motivación..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  El mensaje es opcional pero aumenta tus posibilidades de ser seleccionado
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 h-12 bg-[#4285F4] hover:bg-[#357ae8] text-white font-medium"
              disabled={loading}
            >
              {loading ? 'Enviando propuesta...' : 'Realizar propuesta'}
            </Button>
          </div>
        </form>
      </TabsContent>

      {/* Tab de Consulta */}
      <TabsContent value="consulta">
        <form onSubmit={handleConsulta} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Hacer una consulta</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  Si tienes dudas sobre la tarea antes de enviar tu propuesta, puedes hacer una consulta al publicador. Esto te ayudará a preparar una mejor oferta.
                </p>
              </div>

              <div>
                <label htmlFor="consultaMessage" className="block text-sm font-medium mb-2">
                  Tu consulta
                </label>
                <Textarea
                  id="consultaMessage"
                  placeholder="Escribe tu pregunta o consulta sobre la tarea..."
                  value={consultaMessage}
                  onChange={(e) => setConsultaMessage(e.target.value)}
                  required
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 h-12 font-medium"
              variant="outline"
              disabled={consultaLoading}
            >
              {consultaLoading ? 'Enviando consulta...' : 'Enviar consulta'}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  </div>

  {/* Columna lateral (1/3) */}
  <div className="space-y-6">
    {/* Card Resumen de la Tarea */}
    <Card className="p-6">
      <h3 className="font-bold mb-3">{task.title}</h3>
      
      {/* Descripción */}
      <p className="text-xs text-muted-foreground mb-4 line-clamp-3">
        {task.description}
      </p>

      <div className="border-t border-slate-200 my-4" />

      {/* Presupuesto en una línea */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Presupuesto</span>
        <div className="text-2xl font-bold text-[#34A853]">
          {task.currency} {Number(task.payment).toFixed(2)}
        </div>
      </div>
    </Card>

    {/* Card del Publicador */}
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shrink-0">
          <span className="font-semibold text-primary text-xl">
            {getPosterName(task).charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold">{getPosterName(task)}</h3>
            {isTaskVerified(task) && (
              <CheckCircle weight="fill" className="w-4 h-4 text-[#34A853]" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">Perú</p>
          <div className="flex items-center gap-1 text-amber-500 text-sm mt-1">
            ★★★★★ <span className="text-xs text-muted-foreground ml-1">4.8</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-semibold">Proyectos:</span> Publicados: 5 / Pagos: 10 (200%)
        </div>
        <div>
          <span className="font-semibold">Registrado desde:</span> Mayo, 2019
        </div>
      </div>

      <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 w-full justify-center mt-4">
        Evaluando propuestas
      </Badge>
    </Card>
  </div>
</div>
</div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
