import { SignOut, User, PlusCircle, MagnifyingGlass } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface HeaderProps {
  currentView: 'explorar' | 'publicar';
  onViewChange: (view: 'explorar' | 'publicar') => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { user } = useAuth();

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
            <h2 className="text-xl font-bold text-foreground">YoLoHago</h2>
            
            <nav className="hidden md:flex gap-2">
              <Button
                variant={currentView === 'explorar' ? 'default' : 'ghost'}
                onClick={() => onViewChange('explorar')}
                className="gap-2"
              >
                <MagnifyingGlass weight="bold" size={18} />
                Explorar tareas
              </Button>
              <Button
                variant={currentView === 'publicar' ? 'default' : 'ghost'}
                onClick={() => onViewChange('publicar')}
                className={`gap-2 ${currentView === 'publicar' ? 'bg-[#4285F4] hover:bg-[#357ae8] text-white' : ''}`}
              >
                <PlusCircle weight="bold" size={18} />
                Publicar tarea
              </Button>
            </nav>
          </div>
          
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
                <DropdownMenuItem onClick={() => onViewChange('explorar')}>
                  <MagnifyingGlass className="mr-2 h-4 w-4" />
                  <span>Explorar tareas</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('publicar')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Publicar tarea</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Mi perfil</span>
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
    </header>
  );
}
