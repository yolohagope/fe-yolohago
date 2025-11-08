import { SignOut, User, PlusCircle, MagnifyingGlass, ListChecks, Bell } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/services/auth';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // TODO: Este dato debería venir del backend
  const notificationCount: number = 3;

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'Usuario';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              YoLoHago
            </button>
            
            <nav className="hidden md:flex gap-2">
              <Button
                variant={currentPath === '/' || currentPath === '/explorar' ? 'default' : 'ghost'}
                onClick={() => navigate('/explorar')}
                className="gap-2"
              >
                <MagnifyingGlass weight="bold" size={18} />
                Explorar tareas
              </Button>
              <Button
                variant={currentPath === '/publicar' ? 'default' : 'ghost'}
                onClick={() => navigate('/publicar')}
                className={`gap-2 ${currentPath === '/publicar' ? 'bg-[#4285F4] hover:bg-[#357ae8] text-white' : ''}`}
              >
                <PlusCircle weight="bold" size={18} />
                Publicar tarea
              </Button>
              <Button
                variant={currentPath === '/mis-tareas' ? 'default' : 'ghost'}
                onClick={() => navigate('/mis-tareas')}
                className="gap-2"
              >
                <ListChecks weight="bold" size={18} />
                Mis tareas
              </Button>
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Campanita de notificaciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell weight="bold" size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between">
                    <span>Notificaciones</span>
                    {notificationCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {notificationCount} nueva{notificationCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Notificaciones de ejemplo - TODO: Traer del backend */}
                <DropdownMenuItem className="flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-start gap-2 w-full">
                    <div className="bg-blue-100 rounded-full p-2">
                      <User weight="bold" size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nueva propuesta recibida</p>
                      <p className="text-xs text-muted-foreground">
                        Juan Pérez envió una propuesta para "Reparación de laptop"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Hace 2 horas</p>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-start gap-2 w-full">
                    <div className="bg-green-100 rounded-full p-2">
                      <ListChecks weight="bold" size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tarea completada</p>
                      <p className="text-xs text-muted-foreground">
                        Se marcó como completada "Limpieza de casa"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Hace 5 horas</p>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-start gap-2 w-full">
                    <div className="bg-yellow-100 rounded-full p-2">
                      <PlusCircle weight="bold" size={16} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Recordatorio</p>
                      <p className="text-xs text-muted-foreground">
                        Tienes una tarea programada para mañana
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Hace 1 día</p>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="justify-center text-blue-600 cursor-pointer"
                  onClick={() => navigate('/notificaciones')}
                >
                  <span className="text-sm font-medium">Ver todas las notificaciones</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Avatar del usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.photoURL || undefined} alt={displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="md:hidden">
                  <DropdownMenuItem onClick={() => navigate('/explorar')}>
                    <MagnifyingGlass className="mr-2 h-4 w-4" />
                    <span>Explorar tareas</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/publicar')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Publicar tarea</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/mis-tareas')}>
                    <ListChecks className="mr-2 h-4 w-4" />
                    <span>Mis tareas</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
                <DropdownMenuItem onClick={() => navigate('/cuenta')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi cuenta</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <SignOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
