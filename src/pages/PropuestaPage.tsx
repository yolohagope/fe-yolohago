import { useState, useEffect } from 'react';
import { ArrowLeft, Star, CheckCircle, Clock } from '@phosphor-icons/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTaskById } from '@/services/api';
import { Task } from '@/lib/types';

export function PropuestaPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTask() {
      if (!taskId) return;
      
      setTaskLoading(true);
      setError(null);
      
      try {
        const taskData = await fetchTaskById(taskId);
        if (taskData) {
          setTask(taskData);
        } else {
          setError('Tarea no encontrada');
        }
      } catch (err: any) {
        console.error('Error loading task:', err);
        setError('Error al cargar los detalles de la tarea');
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
        <div className="border-b border-border bg-card">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Cargando detalles de la tarea...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error || !task) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <p className="text-red-600 mb-4">{error || 'Tarea no encontrada'}</p>
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </Card>
        </div>
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

    // TODO: Implementar envío de propuesta a API
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Propuesta enviada:', {
      taskId,
      amount,
      message,
      userId: user?.uid,
    });

    navigate('/?propuesta=enviada');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Perfil del usuario y stats */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL || undefined} alt={displayName} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  <CheckCircle weight="fill" className="w-5 h-5 text-[#4285F4]" />
                </div>
                <p className="text-sm text-muted-foreground">Perú</p>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        weight={i < Math.floor(userStats.rating) ? 'fill' : 'regular'}
                        className={`w-4 h-4 ${i < Math.floor(userStats.rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{userStats.rating}</span>
                </div>

                <div className="text-sm">
                  <span className="font-semibold">Proyectos:</span> Publicados: {userStats.projectsPublished} / Pagos: {userStats.projectsPaid} ({Math.round((userStats.projectsPaid / userStats.projectsPublished) * 100)}%)
                </div>

                <div className="text-sm">
                  <span className="font-semibold">Registrado desde:</span> Mayo, 2019
                </div>
              </div>
            </div>

            <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
              Evaluando propuestas
            </Badge>
          </div>
        </Card>

        {/* Info de la tarea */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Pasarela de pago</h1>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-muted-foreground mb-1">Proyecto:</p>
              <p className="font-semibold">{task.title}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Presupuesto:</p>
              <p className="font-semibold">{task.currency} {task.payment}</p>
            </div>
          </div>
        </div>

        {/* Formulario de propuesta */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Propuesta</h2>
            
            <div className="space-y-4">
              <div className="bg-accent/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Esta es tu postulación para el proyecto y tu lugar para lucirte. Cuanto más completo esté tu primer mensaje, más posibilidades tendrás de destacarte. Sigue las buenas prácticas para orientarte.
                </p>
                <p className="text-sm font-medium text-foreground">
                  Recuerda que todo intento de comunicación por afuera de la plataforma será penalizado. No te arriesgues compartiendo información de contacto.
                </p>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-2">
                  ¿Cuánto cobrarás por este trabajo? (S/)
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ingresa tu monto"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  step="0.01"
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  El publicador ofreció {task.currency} {task.payment}
                </p>
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
              className="flex-1 h-12 bg-[#4285F4] hover:bg-[#357ae8] text-white font-medium"
              disabled={loading}
            >
              {loading ? 'Enviando propuesta...' : 'Realizar propuesta'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8"
              onClick={() => navigate(-1)}
            >
              Consulta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
