import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, ArrowRight, CaretDown } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TarjetaTarea } from './TarjetaTarea';
import { TaskDetailDialog } from './TaskDetailDialog';
import { fetchTasks, fetchCategories } from '@/services/api';
import { Task, Category } from '@/lib/types';

export function MuroTareas() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Cargar tareas desde el API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tasksData, categoriesData] = await Promise.all([
          fetchTasks(),
          fetchCategories()
        ]);
        setTasks(tasksData);
        setCategories(categoriesData);
      } catch (err: any) {
        console.error('Error cargando datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Mostrar solo las últimas 6 tareas
  const latestTasks = tasks.slice(0, 6);

  function handleViewDetails(task: Task) {
    setSelectedTask(task);
    setDialogOpen(true);
  }

  function handleSearch() {
    // Navegar a la página de búsqueda con los parámetros
    navigate(`/buscar?q=${encodeURIComponent(searchTerm)}&categoria=${encodeURIComponent(selectedCategory)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[length:40px_40px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Encontrá tu próxima tarea
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Miles de oportunidades te esperan. Ganá dinero haciendo lo que mejor sabés hacer.
            </p>
          </div>

          {/* Buscador Principal */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <MagnifyingGlass 
                    weight="duotone" 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" 
                  />
                  <Input
                    type="text"
                    placeholder="¿Qué tarea estás buscando?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 h-14 border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="md:w-[200px] h-14 border-0 bg-muted/50 justify-between text-base font-normal">
                      {selectedCategory === 'Todas' ? 'Categoría' : selectedCategory}
                      <CaretDown weight="bold" className="w-4 h-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuItem onClick={() => setSelectedCategory('Todas')}>
                      Todas las categorías
                    </DropdownMenuItem>
                    {categories.map((category) => (
                      <DropdownMenuItem key={category.id} onClick={() => setSelectedCategory(category.name)}>
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  onClick={handleSearch}
                  className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-base rounded-xl"
                >
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Tareas Recientes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Tareas Recientes
            </h2>
            <p className="text-muted-foreground">
              Las últimas oportunidades publicadas
            </p>
          </div>
          <Button 
            variant="ghost" 
            className="hidden md:flex items-center gap-2"
            onClick={() => navigate('/buscar')}
          >
            Ver todas
            <ArrowRight weight="bold" className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 animate-pulse">
              <MagnifyingGlass weight="duotone" className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Cargando tareas...
            </h3>
            <p className="text-muted-foreground">
              Por favor espera un momento
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <MagnifyingGlass weight="duotone" className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Error al cargar tareas
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {error}
            </p>
          </div>
        ) : latestTasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestTasks.map((task) => (
                <TarjetaTarea key={task.id} task={task} onViewDetails={handleViewDetails} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/buscar')}
                className="px-8"
              >
                Ver todas las tareas
                <ArrowRight weight="bold" className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <MagnifyingGlass weight="duotone" className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No hay tareas publicadas
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Aún no hay tareas publicadas. Sé el primero en publicar una tarea o vuelve más tarde para ver nuevas oportunidades.
            </p>
          </div>
        )}
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
