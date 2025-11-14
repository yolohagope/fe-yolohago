import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardText, Package, Clock, MapPin, CurrencyDollar } from '@phosphor-icons/react';
import { fetchMyTasks, fetchMyPublishedTasks } from '@/services/api';
import { Task } from '@/lib/types';
import { getCategoryName, getPosterName } from '@/lib/utils';
import { TaskDetailDialog } from './TaskDetailDialog';

export function MisTareas() {
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myPublishedTasks, setMyPublishedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        const [taken, published] = await Promise.all([
          fetchMyTasks(),
          fetchMyPublishedTasks()
        ]);
        setMyTasks(taken);
        setMyPublishedTasks(published);
      } catch (error) {
        console.error('Error cargando mis tareas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  function handleTaskClick(task: Task) {
    setSelectedTask(task);
    setDialogOpen(true);
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

        <Tabs defaultValue="tomadas" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tomadas" className="flex items-center gap-2 cursor-pointer">
              <Package weight="bold" size={18} />
              Tareas Tomadas
              {myTasks.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {myTasks.length}
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
            {myTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <Package weight="thin" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No has tomado ninguna tarea</h3>
                <p className="text-muted-foreground mb-6">
                  Explora el muro de tareas y encuentra algo que te interese
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Explorar Tareas
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                    type="tomada"
                  />
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
                    onClick={() => handleTaskClick(task)}
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
