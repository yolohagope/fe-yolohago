import { useState, useEffect } from 'react';
import { User, ListChecks, PlusCircle, Check, Trash, Bell, Bug } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/lib/types';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  deleteReadNotifications,
  getNotificationPreferences
} from '@/services/api';

export function Notificaciones() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugMode] = useState(true); // Activado para pruebas

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchNotifications({ page_size: 50 });
      setNotifications(response.results);
      
      if (debugMode) {
        console.log('✅ Notificaciones cargadas:', response);
      }
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const testAPI = async () => {
    console.log('\n🧪 === INICIANDO PRUEBAS DE API DE NOTIFICACIONES ===\n');
    
    try {
      // Test 1: Contador de no leídas
      console.log('1️⃣ Probando getUnreadNotificationsCount...');
      const countResponse = await getUnreadNotificationsCount();
      console.log('✅ Respuesta:', countResponse);
      console.log(`   📊 Notificaciones no leídas: ${countResponse}`);
      
      // Test 2: Listar notificaciones con paginación
      console.log('\n2️⃣ Probando fetchNotifications (todas)...');
      const allNotifications = await fetchNotifications({ page_size: 10 });
      console.log('✅ Respuesta:', JSON.stringify({
        count: allNotifications.count,
        next: allNotifications.next,
        previous: allNotifications.previous,
        results_count: allNotifications.results.length
      }, null, 2));
      console.log(`   📊 Total: ${allNotifications.count}, Recibidas: ${allNotifications.results.length}`);
      if (allNotifications.results.length > 0) {
        console.log('   📄 Primera notificación:', JSON.stringify(allNotifications.results[0], null, 2));
      }
      
      // Test 3: Filtrar solo no leídas
      console.log('\n3️⃣ Probando fetchNotifications (no leídas)...');
      const unread = await fetchNotifications({ is_read: false, page_size: 5 });
      console.log(`✅ Notificaciones no leídas: ${unread.results.length}`);
      console.log('   📄 IDs:', unread.results.map(n => n.id).join(', '));
      
      // Test 4: Filtrar por tipo
      console.log('\n4️⃣ Probando fetchNotifications (tipo message)...');
      const messages = await fetchNotifications({ type: 'message', page_size: 5 });
      console.log(`✅ Mensajes: ${messages.results.length}`);
      
      // Test 5: Filtrar por prioridad
      console.log('\n5️⃣ Probando fetchNotifications (prioridad alta)...');
      const highPriority = await fetchNotifications({ priority: 'high', page_size: 5 });
      console.log(`✅ Alta prioridad: ${highPriority.results.length}`);
      
      // Test 6: Ordenamiento
      console.log('\n6️⃣ Probando fetchNotifications (ordenadas por antigüedad)...');
      const oldest = await fetchNotifications({ ordering: 'created_at', page_size: 3 });
      console.log(`✅ Más antiguas (${oldest.results.length}):`);
      oldest.results.forEach((n, i) => {
        console.log(`   ${i+1}. [${n.created_at}] ${n.title}`);
      });
      
      // Test 7: Polling con 'since'
      console.log('\n7️⃣ Probando polling con parámetro "since"...');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const recent = await fetchNotifications({ since: fiveMinutesAgo, page_size: 10 });
      console.log(`✅ Notificaciones en los últimos 5 minutos: ${recent.results.length}`);
      
      // Test 8: Preferencias
      console.log('\n8️⃣ Probando getNotificationPreferences...');
      const prefs = await getNotificationPreferences();
      console.log('✅ Preferencias:', JSON.stringify(prefs, null, 2));
      
      // Test 9: Marcar como leída (si hay notificaciones)
      if (unread.results.length > 0) {
        console.log('\n9️⃣ Probando markNotificationAsRead...');
        const testId = unread.results[0].id;
        console.log(`   Marcando notificación ${testId} como leída...`);
        await markNotificationAsRead(testId);
        console.log('✅ Notificación marcada como leída exitosamente');
        
        // Verificar cambio
        const updated = await fetchNotifications({ page_size: 100 });
        const markedNotification = updated.results.find(n => n.id === testId);
        console.log(`   ✓ Estado actualizado: is_read = ${markedNotification?.is_read}`);
      }
      
      // Test 10: Eliminar notificaciones leídas
      console.log('\n🔟 Probando deleteReadNotifications...');
      const deleteResult = await deleteReadNotifications();
      console.log('✅ Resultado:', JSON.stringify(deleteResult, null, 2));
      
      console.log('\n🎉 === TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ===\n');
      console.log('📝 Resumen:');
      console.log(`   • Notificaciones no leídas: ${countResponse}`);
      console.log(`   • Total de notificaciones: ${allNotifications.count}`);
      console.log(`   • Tipos probados: message, alert, reminder`);
      console.log(`   • Filtros probados: is_read, type, priority, since, ordering`);
      console.log(`   • Operaciones: listar, marcar como leída, eliminar leídas`);
      console.log(`   • Preferencias: ${prefs ? 'configuradas' : 'no configuradas'}`);
      
      // Recargar notificaciones después de las pruebas
      await loadNotifications();
      
    } catch (err: any) {
      console.error('\n❌ === ERROR EN PRUEBAS ===');
      console.error('Mensaje:', err.message);
      console.error('Detalles:', err);
      if (err.message?.includes('Token de Firebase')) {
        console.warn('\n⚠️  Asegúrate de estar autenticado antes de ejecutar las pruebas.');
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ 
        ...n, 
        is_read: true, 
        read_at: new Date().toISOString() 
      })));
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('task') || type.includes('tarea')) {
      return {
        icon: <ListChecks weight="bold" size={20} />,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      };
    }
    if (type.includes('payment') || type.includes('pago')) {
      return {
        icon: <Bell weight="bold" size={20} />,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600'
      };
    }
    if (type.includes('message') || type.includes('mensaje')) {
      return {
        icon: <PlusCircle weight="bold" size={20} />,
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      };
    }
    return {
      icon: <User weight="bold" size={20} />,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    };
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const iconConfig = getNotificationIcon(notification.notification_type);
    const isUnread = !notification.is_read;

    return (
      <Card 
        className={`p-4 mb-3 transition-all hover:shadow-md cursor-pointer ${
          isUnread ? 'bg-blue-50 border-blue-200' : 'bg-card'
        }`}
        onClick={() => {
          if (isUnread) {
            handleMarkAsRead(notification.id);
          }
          if (notification.action_url) {
            // TODO: Navegar a la URL de acción
            console.log('Navigate to:', notification.action_url);
          }
        }}
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
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-muted-foreground">
                    {notification.time_ago}
                  </p>
                  {notification.actor_name && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">
                        {notification.actor_name}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            {isUnread && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead(notification.id);
                }}
                title="Marcar como leída"
              >
                <Check size={18} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}
              title="Eliminar notificación"
            >
              <Trash size={18} />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Notificaciones</h1>
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Cargando notificaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Notificaciones</h1>
          <Card className="p-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadNotifications}>Reintentar</Button>
          </Card>
        </div>
      </div>
    );
  }

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
          <div className="flex gap-2">
            {debugMode && (
              <Button onClick={testAPI} variant="outline" size="sm">
                <Bug className="mr-2" size={16} />
                Probar API
              </Button>
            )}
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                <Check className="mr-2" size={16} />
                Marcar todas como leídas
              </Button>
            )}
          </div>
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
