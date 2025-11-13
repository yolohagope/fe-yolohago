/**
 * Script de prueba para validar el API de notificaciones
 * Ejecutar con: node test-notifications-api.js
 */

const API_BASE_URL = 'http://localhost:8000/api';

// Coloca aquí un token válido de Firebase para probar
const FIREBASE_TOKEN = process.env.FIREBASE_TOKEN || 'YOUR_FIREBASE_TOKEN_HERE';

async function testNotificationsAPI() {
  console.log('🧪 Iniciando pruebas del API de Notificaciones\n');
  
  const headers = {
    'Authorization': `Bearer ${FIREBASE_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Obtener contador de notificaciones no leídas
    console.log('1️⃣ Probando: GET /api/notifications/unread_count/');
    const countResponse = await fetch(`${API_BASE_URL}/notifications/unread_count/`, {
      headers
    });
    
    if (!countResponse.ok) {
      console.error('❌ Error:', countResponse.status, countResponse.statusText);
      const errorData = await countResponse.text();
      console.error('Detalles:', errorData);
    } else {
      const countData = await countResponse.json();
      console.log('✅ Resultado:', countData);
      console.log(`📊 Notificaciones no leídas: ${countData.unread_count}\n`);
    }

    // 2. Listar notificaciones
    console.log('2️⃣ Probando: GET /api/notifications/');
    const listResponse = await fetch(`${API_BASE_URL}/notifications/?limit=5`, {
      headers
    });
    
    if (!listResponse.ok) {
      console.error('❌ Error:', listResponse.status, listResponse.statusText);
      const errorData = await listResponse.text();
      console.error('Detalles:', errorData);
    } else {
      const listData = await listResponse.json();
      console.log('✅ Resultado:');
      console.log(`📋 Total: ${listData.count} notificaciones`);
      console.log(`📄 Mostrando: ${listData.results.length} notificaciones\n`);
      
      if (listData.results.length > 0) {
        console.log('📬 Primera notificación:');
        const first = listData.results[0];
        console.log({
          id: first.id,
          type: first.notification_type,
          title: first.title,
          message: first.message.substring(0, 100) + '...',
          is_read: first.is_read,
          created_at: first.created_at,
          time_ago: first.time_ago
        });
        console.log();
        
        // 3. Marcar una notificación como leída
        if (!first.is_read) {
          console.log(`3️⃣ Probando: POST /api/notifications/${first.id}/mark_as_read/`);
          const markReadResponse = await fetch(
            `${API_BASE_URL}/notifications/${first.id}/mark_as_read/`,
            {
              method: 'POST',
              headers
            }
          );
          
          if (!markReadResponse.ok) {
            console.error('❌ Error:', markReadResponse.status, markReadResponse.statusText);
          } else {
            const markReadData = await markReadResponse.json();
            console.log('✅ Notificación marcada como leída');
            console.log(`📖 is_read: ${markReadData.is_read}`);
            console.log(`🕐 read_at: ${markReadData.read_at}\n`);
          }
        }
      }
    }

    // 4. Filtrar solo notificaciones no leídas
    console.log('4️⃣ Probando: GET /api/notifications/?is_read=false');
    const unreadResponse = await fetch(`${API_BASE_URL}/notifications/?is_read=false&limit=3`, {
      headers
    });
    
    if (!unreadResponse.ok) {
      console.error('❌ Error:', unreadResponse.status, unreadResponse.statusText);
    } else {
      const unreadData = await unreadResponse.json();
      console.log('✅ Resultado:');
      console.log(`📭 Notificaciones no leídas: ${unreadData.results.length}`);
      unreadData.results.forEach((notif, index) => {
        console.log(`  ${index + 1}. [${notif.notification_type}] ${notif.title}`);
      });
      console.log();
    }

    // 5. Probar filtro con timestamp (since)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sinceTimestamp = yesterday.toISOString();
    
    console.log('5️⃣ Probando: GET /api/notifications/?since=' + sinceTimestamp);
    const sinceResponse = await fetch(
      `${API_BASE_URL}/notifications/?since=${sinceTimestamp}&limit=5`,
      { headers }
    );
    
    if (!sinceResponse.ok) {
      console.error('❌ Error:', sinceResponse.status, sinceResponse.statusText);
    } else {
      const sinceData = await sinceResponse.json();
      console.log('✅ Resultado:');
      console.log(`📅 Notificaciones desde ayer: ${sinceData.results.length}`);
      console.log();
    }

    // 6. Probar preferencias de notificación
    console.log('6️⃣ Probando: GET /api/notification-preferences/');
    const prefsResponse = await fetch(`${API_BASE_URL}/notification-preferences/`, {
      headers
    });
    
    if (!prefsResponse.ok) {
      console.error('❌ Error:', prefsResponse.status, prefsResponse.statusText);
      const errorData = await prefsResponse.text();
      console.error('Detalles:', errorData);
    } else {
      const prefsData = await prefsResponse.json();
      console.log('✅ Preferencias de notificación:');
      console.log({
        in_app: prefsData.enable_in_app,
        email: prefsData.enable_email,
        push: prefsData.enable_push,
        quiet_hours: prefsData.quiet_hours_enabled,
        email_digest: prefsData.email_digest_frequency
      });
      console.log();
    }

    console.log('🎉 Pruebas completadas!\n');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error(error);
  }
}

// Ejecutar pruebas
testNotificationsAPI();
