import { useState, useMemo } from 'react';
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TarjetaTarea } from './TarjetaTarea';
import { mockTasks } from '@/lib/mockData';
import { TaskCategory } from '@/lib/types';

const categories: (TaskCategory | 'Todas')[] = ['Todas', 'Compras', 'Trámites', 'Delivery', 'Limpieza', 'Tecnología', 'Otro'];

export function MuroTareas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'Todas'>('Todas');

  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Todas' || task.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            Muro de Tareas
          </h1>
          <p className="text-muted-foreground">
            Descubre oportunidades para ganar dinero realizando microtareas
          </p>
        </header>

        <div className="bg-card rounded-lg border border-border p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Funnel weight="duotone" className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Filtros</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass 
                weight="duotone" 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" 
              />
              <Input
                id="search-tasks"
                type="text"
                placeholder="Buscar tareas por palabra clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as TaskCategory | 'Todas')}>
              <SelectTrigger id="category-filter" className="w-full sm:w-[200px] h-11">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || selectedCategory !== 'Todas') && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{filteredTasks.length}</span> {filteredTasks.length === 1 ? 'tarea' : 'tareas'}
                {selectedCategory !== 'Todas' && ` en categoría "${selectedCategory}"`}
                {searchTerm && ` que coinciden con "${searchTerm}"`}
              </p>
            </div>
          )}
        </div>

        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TarjetaTarea key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <MagnifyingGlass weight="duotone" className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No se encontraron tareas
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No hay tareas que coincidan con tus filtros actuales. 
              Intenta ajustar los criterios de búsqueda o vuelve más tarde para ver nuevas oportunidades.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
