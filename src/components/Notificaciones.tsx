import { useState } from 'react';
import { User, ListChecks, PlusCircle, Check, Trash, Bell } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type NotificationType = 'propuesta' | 'tarea' | 'recordatorio' | 'pago';
type NotificationStatus = 'unread' | 'read';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  status: NotificationStatus;
}

export function Notificaciones() {
  // TODO: Estos datos deberían venir del backend
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'propuesta',
      title: 'Nueva propuesta recibida',
      description: 'Juan Pérez envió una propuesta para "Reparación de laptop"',
      timestamp: 'Hace 2 horas',
      status: 'unread'
    },
    {
      id: 2,
      type: 'tarea',
      title: 'Tarea completada',
      description: 'Se marcó como completada "Limpieza de casa"',
      timestamp: 'Hace 5 horas',
      status: 'unread'
    },
    {
      id: 3,
      type: 'recordatorio',
      title: 'Recordatorio',
      description: 'Tienes una tarea programada para mañana',
      timestamp: 'Hace 1 día',
      status: 'unread'
    },
    {
      id: 4,
      type: 'propuesta',
      title: 'Propuesta aceptada',
      description: 'María García aceptó tu propuesta para "Instalación de software"',
      timestamp: 'Hace 2 días',
      status: 'read'
    },
    {
      id: 5,
      type: 'pago',
      title: 'Pago recibido',
      description: 'Has recibido S/ 150.00 por completar "Reparación de laptop"',
      timestamp: 'Hace 3 días',
      status: 'read'
    },
    {
      id: 6,
      type: 'tarea',
      title: 'Nueva tarea disponible',
      description: 'Una tarea de "Plomería" coincide con tu perfil',
      timestamp: 'Hace 4 días',
      status: 'read'
    },
  ]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const unreadNotifications = notifications.filter(n => n.status === 'unread');
  const readNotifications = notifications.filter(n => n.status === 'read');

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, status: 'read' as NotificationStatus } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, status: 'read' as NotificationStatus })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'propuesta':
        return {
          icon: <User weight="bold" size={20} />,
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      case 'tarea':
        return {
          icon: <ListChecks weight="bold" size={20} />,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'recordatorio':
        return {
          icon: <PlusCircle weight="bold" size={20} />,
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 'pago':
        return {
          icon: <Bell weight="bold" size={20} />,
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600'
        };
    }
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const iconConfig = getNotificationIcon(notification.type);
    const isUnread = notification.status === 'unread';

    return (
      <Card 
        className={`p-4 mb-3 transition-all hover:shadow-md ${
          isUnread ? 'bg-blue-50 border-blue-200' : 'bg-card'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`${iconConfig.bgColor} rounded-full p-2 flex-shrink-0`}>
            <span className={iconConfig.iconColor}>{iconConfig.icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{notification.title}</h3>
                  {isUnread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {notification.timestamp}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            {isUnread && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => markAsRead(notification.id)}
                title="Marcar como leída"
              >
                <Check size={18} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteNotification(notification.id)}
              title="Eliminar notificación"
            >
              <Trash size={18} />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Notificaciones</h1>
            <p className="text-muted-foreground">
              Mantente al tanto de todas tus actualizaciones
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="mr-2" size={16} />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="todas">
              Todas
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="no-leidas">
              No leídas
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2 bg-blue-600">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="leidas">
              Leídas
              {readNotifications.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {readNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas">
            {notifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes notificaciones</h3>
                <p className="text-muted-foreground">
                  Cuando recibas notificaciones, aparecerán aquí
                </p>
              </Card>
            ) : (
              notifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>

          <TabsContent value="no-leidas">
            {unreadNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Check size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">¡Todo al día!</h3>
                <p className="text-muted-foreground">
                  No tienes notificaciones sin leer
                </p>
              </Card>
            ) : (
              unreadNotifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>

          <TabsContent value="leidas">
            {readNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay notificaciones leídas</h3>
                <p className="text-muted-foreground">
                  Las notificaciones que marques como leídas aparecerán aquí
                </p>
              </Card>
            ) : (
              readNotifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
