import { useState, useEffect } from 'react';
import { MagnifyingGlass, Funnel, SlidersHorizontal, MapPin, Clock, CurrencyDollar } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TarjetaTarea } from './TarjetaTarea';
import { TaskDetailDialog } from './TaskDetailDialog';
import { fetchTasks, fetchCategories } from '@/services/api';
import { Task, TaskCategory, Category } from '@/lib/types';
import { getCategoryName } from '@/lib/utils';

const locations = ['Cualquiera', 'Centro de Lima', 'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'Barranco', 'Remoto'];
const durations = ['Cualquiera', 'Menos de 1 hora', '1-2 horas', '2-4 horas', 'Más de 4 horas'];
const priceRanges = [
  { value: 'todos', label: 'Todos', min: 0, max: Infinity },
  { value: '10-30', label: 'S/10 a S/30', min: 10, max: 30 },
  { value: '30-50', label: 'S/30 a S/50', min: 30, max: 50 },
  { value: '50-100', label: 'S/50 a S/100', min: 50, max: 100 },
  { value: '100+', label: 'Más de S/100', min: 100, max: Infinity },
];
const sortOptions = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'fecha-desc', label: 'Más recientes' },
  { value: 'fecha-asc', label: 'Más antiguos' },
  { value: 'pago-desc', label: 'Mayor pago' },
  { value: 'pago-asc', label: 'Menor pago' },
];

export function MuroTareas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedLocation, setSelectedLocation] = useState('Cualquiera');
  const [selectedDuration, setSelectedDuration] = useState('Cualquiera');
  const [sortBy, setSortBy] = useState('relevancia');
  const [selectedPriceRange, setSelectedPriceRange] = useState('todos');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Filtrar y ordenar tareas
  const filteredTasks = (Array.isArray(tasks) ? tasks : [])
    .filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const categoryName = getCategoryName(task);
      const matchesCategory = selectedCategory === 'Todas' || categoryName === selectedCategory;
      
      const matchesLocation = selectedLocation === 'Cualquiera' || task.location.includes(selectedLocation) || selectedLocation === 'Remoto';
      
      // Para duración, por ahora no filtramos ya que no está en el tipo Task
      const matchesDuration = selectedDuration === 'Cualquiera';
      
      const priceRangeConfig = priceRanges.find(range => range.value === selectedPriceRange) || priceRanges[0];
      const taskPayment = typeof task.payment === 'string' ? parseFloat(task.payment) : task.payment;
      const matchesPrice = taskPayment >= priceRangeConfig.min && taskPayment <= priceRangeConfig.max;
      
      return matchesSearch && matchesCategory && matchesLocation && matchesDuration && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'fecha-desc':
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        case 'fecha-asc':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'pago-desc': {
          const paymentA = typeof a.payment === 'string' ? parseFloat(a.payment) : a.payment;
          const paymentB = typeof b.payment === 'string' ? parseFloat(b.payment) : b.payment;
          return paymentB - paymentA;
        }
        case 'pago-asc': {
          const paymentA = typeof a.payment === 'string' ? parseFloat(a.payment) : a.payment;
          const paymentB = typeof b.payment === 'string' ? parseFloat(b.payment) : b.payment;
          return paymentA - paymentB;
        }
        default:
          return 0;
      }
    });

  function handleResetFilters() {
    setSearchTerm('');
    setSelectedCategory('Todas');
    setSelectedLocation('Cualquiera');
    setSelectedDuration('Cualquiera');
    setSelectedPriceRange('todos');
    setSortBy('relevancia');
  }

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'Todas' || 
    selectedLocation !== 'Cualquiera' || selectedDuration !== 'Cualquiera' || 
    selectedPriceRange !== 'todos';

  function handleViewDetails(task: Task) {
    setSelectedTask(task);
    setDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            Tareas Disponibles
          </h1>
          <p className="text-muted-foreground">
            Encuentra la tarea perfecta para ti y comienza a ganar dinero hoy
          </p>
        </header>

        {/* Barra de Filtros Enriquecida - Desktop */}
        <div className="bg-card rounded-lg border border-border mb-8 shadow-sm">
          {/* Header con título y ordenar */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Funnel weight="duotone" className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Filtrar Tareas</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:inline">Ordenar por:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros - Desktop */}
          <div className="hidden md:block p-4">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
              {/* Búsqueda */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <MagnifyingGlass 
                    weight="duotone" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                  />
                  <Input
                    type="text"
                    placeholder="Buscar tareas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10"
                  />
                </div>
              </div>

              {/* Categoría */}
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Distancia/Ubicación */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Distancia" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location === 'Cualquiera' ? (
                        <div className="flex items-center gap-2">
                          <MapPin weight="duotone" className="w-4 h-4 text-muted-foreground" />
                          <span>Distancia</span>
                        </div>
                      ) : (
                        location
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Duración */}
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Duración Máxima" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration === 'Cualquiera' ? (
                        <div className="flex items-center gap-2">
                          <Clock weight="duotone" className="w-4 h-4 text-muted-foreground" />
                          <span>Duración Máxima</span>
                        </div>
                      ) : (
                        duration
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Pago */}
              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pago (mínimo)" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.value === 'todos' ? (
                        <div className="flex items-center gap-2">
                          <CurrencyDollar weight="duotone" className="w-4 h-4 text-muted-foreground" />
                          <span>Pago (mínimo)</span>
                        </div>
                      ) : (
                        range.label
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros - Mobile (Sheet/Drawer) */}
          <div className="md:hidden p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlass 
                  weight="duotone" 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                />
                <Input
                  type="text"
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                    <SlidersHorizontal weight="duotone" className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh]">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] pb-6">
                    {/* Categoría */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Categoría</label>
                      <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Todas">Todas</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ubicación */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        <MapPin weight="duotone" className="w-4 h-4 inline mr-1" />
                        Ubicación
                      </label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Duración */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        <Clock weight="duotone" className="w-4 h-4 inline mr-1" />
                        Duración Máxima
                      </label>
                      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rango de Pago */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        <CurrencyDollar weight="duotone" className="w-4 h-4 inline mr-1" />
                        Pago
                      </label>
                      <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priceRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleResetFilters}
                      >
                        Limpiar filtros
                      </Button>
                      <Button 
                        className="flex-1 bg-[#4285F4] hover:bg-[#4285F4]/90"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        Aplicar filtros
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Resumen de resultados */}
          {hasActiveFilters && (
            <div className="px-4 pb-4">
              <div className="bg-muted/50 rounded-md p-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredTasks.length}</span> {filteredTasks.length === 1 ? 'tarea encontrada' : 'tareas encontradas'}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="text-xs h-7"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
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
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TarjetaTarea key={task.id} task={task} onViewDetails={handleViewDetails} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <MagnifyingGlass weight="duotone" className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {hasActiveFilters ? 'No se encontraron tareas' : 'No hay tareas publicadas'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {hasActiveFilters 
                ? 'No hay tareas que coincidan con tus filtros actuales. Intenta ajustar los criterios de búsqueda.'
                : 'Aún no hay tareas publicadas. Sé el primero en publicar una tarea o vuelve más tarde para ver nuevas oportunidades.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-[#4285F4] text-white rounded-md hover:bg-[#4285F4]/90 transition-colors"
              >
                Limpiar todos los filtros
              </button>
            )}
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
