import { useState, useEffect } from 'react';
import { MagnifyingGlass, SlidersHorizontal, MapPin, Clock, CurrencyDollar, CaretDown, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TarjetaTarea } from './TarjetaTarea';
import { TaskDetailDialog } from './TaskDetailDialog';
import { fetchTasks, fetchCategories } from '@/services/api';
import { Task, Category } from '@/lib/types';

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

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

interface BusquedaTareasProps {
  initialSearchTerm?: string;
  initialCategory?: string;
}

export function BusquedaTareas({ initialSearchTerm = '', initialCategory = 'Todas' }: BusquedaTareasProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
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
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const pageSize = 9; // 9 tareas por página (3x3 grid)

  // Debounce para el término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Resetear a la primera página al buscar
    }, 500); // Esperar 500ms después de que el usuario deje de escribir

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar tareas desde el API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Preparar parámetros de filtros para el API
        const priceRangeConfig = priceRanges.find(range => range.value === selectedPriceRange) || priceRanges[0];
        
        // Mapear el ordenamiento al formato del backend
        let ordering: string | undefined = undefined;
        switch (sortBy) {
          case 'fecha-desc':
            ordering = '-created_at';
            break;
          case 'fecha-asc':
            ordering = 'created_at';
            break;
          case 'pago-desc':
            ordering = '-payment';
            break;
          case 'pago-asc':
            ordering = 'payment';
            break;
        }
        
        const [tasksResponse, categoriesData] = await Promise.all([
          fetchTasks({ 
            page: currentPage, 
            page_size: pageSize,
            search: debouncedSearchTerm || undefined,
            category: selectedCategoryId,
            location: selectedLocation !== 'Cualquiera' ? selectedLocation : undefined,
            payment_min: priceRangeConfig.min > 0 ? priceRangeConfig.min : undefined,
            payment_max: priceRangeConfig.max !== Infinity ? priceRangeConfig.max : undefined,
            ordering: ordering
          }),
          fetchCategories()
        ]);
        
        // Verificar si la respuesta es paginada
        if (tasksResponse && typeof tasksResponse === 'object' && 'results' in tasksResponse) {
          setTasks(tasksResponse.results);
          setTotalCount(tasksResponse.count);
          setNextPage(tasksResponse.next);
          setPreviousPage(tasksResponse.previous);
        } else {
          // Respuesta sin paginar (array directo)
          const tasksArray = Array.isArray(tasksResponse) ? tasksResponse : [];
          setTasks(tasksArray);
          setTotalCount(tasksArray.length);
          setNextPage(null);
          setPreviousPage(null);
        }
        
        setCategories(categoriesData);
      } catch (err: any) {
        console.error('Error cargando datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [currentPage, debouncedSearchTerm, selectedCategoryId, selectedLocation, selectedPriceRange, sortBy]);

  // Las tareas ya vienen filtradas y ordenadas del API
  const filteredTasks = tasks;

  // Función para cambiar filtros y resetear a página 1
  const handleCategoryChange = (categoryName: string, categoryId?: number) => {
    setSelectedCategory(categoryName);
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (priceRange: string) => {
    setSelectedPriceRange(priceRange);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  function handleResetFilters() {
    setSearchTerm('');
    setSelectedCategory('Todas');
    setSelectedCategoryId(undefined);
    setSelectedLocation('Cualquiera');
    setSelectedDuration('Cualquiera');
    setSelectedPriceRange('todos');
    setSortBy('relevancia');
    setCurrentPage(1); // Resetear a la primera página
  }

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'Todas' || 
    selectedLocation !== 'Cualquiera' || selectedDuration !== 'Cualquiera' || 
    selectedPriceRange !== 'todos';

  function handleViewDetails(task: Task) {
    setSelectedTask(task);
    setDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simple Estilo ZonaProp */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Barra de búsqueda principal */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <MagnifyingGlass 
                weight="duotone" 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" 
              />
              <Input
                type="text"
                placeholder="Ingresá ciudades o barrios"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-14 text-[15px] border-input"
              />
            </div>

            {/* Selector de categoría */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[200px] h-14 justify-between text-[15px] font-normal border-input">
                  {selectedCategory === 'Todas' ? 'Categoría' : selectedCategory}
                  <CaretDown weight="bold" className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem onClick={() => handleCategoryChange('Todas', undefined)}>
                  Todas
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} onClick={() => handleCategoryChange(category.name, category.id)}>
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ubicación */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[150px] h-14 justify-between text-[15px] font-normal border-input">
                  {selectedLocation === 'Cualquiera' ? 'Ubicación' : selectedLocation}
                  <CaretDown weight="bold" className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[150px]">
                {locations.map((location) => (
                  <DropdownMenuItem key={location} onClick={() => handleLocationChange(location)}>
                    {location}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Precio */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[150px] h-14 justify-between text-[15px] font-normal border-input">
                  {selectedPriceRange === 'todos' ? 'Precio' : priceRanges.find(r => r.value === selectedPriceRange)?.label}
                  <CaretDown weight="bold" className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[150px]">
                {priceRanges.map((range) => (
                  <DropdownMenuItem key={range.value} onClick={() => handlePriceRangeChange(range.value)}>
                    {range.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botón más filtros - Desktop */}
            <Button variant="outline" className="h-14 px-4 text-[15px] border-input hidden md:flex items-center gap-2">
              <SlidersHorizontal weight="duotone" className="w-4 h-4" />
              Más filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Contenedor de Resultados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barra de resultados y ordenamiento */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground text-base">{totalCount}</span> {totalCount === 1 ? 'tarea disponible' : 'tareas disponibles'}
          </p>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">Ordenar:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px] h-9 justify-between text-sm font-normal">
                  {sortOptions.find(o => o.value === sortBy)?.label || 'Relevancia'}
                  <CaretDown weight="bold" className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                {sortOptions.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => handleSortChange(option.value)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Grid de Tareas */}
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TarjetaTarea key={task.id} task={task} onViewDetails={handleViewDetails} />
              ))}
            </div>
            
            {/* Paginación */}
            {totalCount > pageSize && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!previousPage || currentPage === 1}
                  className="gap-1"
                >
                  <CaretLeft weight="bold" size={16} />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                    const totalPages = Math.ceil(totalCount / pageSize);
                    let pageNum;
                    
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!nextPage}
                  className="gap-1"
                >
                  Siguiente
                  <CaretRight weight="bold" size={16} />
                </Button>
              </div>
            )}
          </>
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
              <Button
                onClick={handleResetFilters}
                className="mt-4"
                variant="outline"
              >
                Limpiar todos los filtros
              </Button>
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
