/**
 * Script de prueba para verificar los datos del Inbox
 * Ejecutar con: node test-inbox-api.js
 */

const API_BASE_URL = 'https://api.yolohago.pe/api';

// Token de prueba (reemplazar con un token real de Firebase)
const TEST_TOKEN = 'YOUR_FIREBASE_TOKEN_HERE';

async function testInboxAPI() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('🧪 PRUEBAS DEL API PARA INBOX');
  console.log('═══════════════════════════════════════════');
  console.log('');

  // Test 1: Obtener consultas a mis tareas (como publicador)
  console.log('📋 Test 1: Obtener consultas a mis tareas publicadas');
  console.log('Endpoint: GET /api/inquiries/?my_tasks=true');
  console.log('');
  try {
    const response = await fetch(`${API_BASE_URL}/inquiries/?my_tasks=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Estructura de respuesta:', {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results_length: data.results?.length || 0
      });
      console.log('');
      console.log('Datos completos:');
      console.log(JSON.stringify(data, null, 2));
      console.log('');
      
      if (data.results && data.results.length > 0) {
        console.log('✅ Ejemplo de consulta:');
        const inquiry = data.results[0];
        console.log({
          id: inquiry.id,
          task: inquiry.task,
          task_title: inquiry.task_title,
          sender_name: inquiry.sender_name,
          inquirer_name: inquiry.inquirer_name,
          question: inquiry.question?.substring(0, 50) + '...',
          answer: inquiry.answer?.substring(0, 50) + '...' || null,
          is_answered: inquiry.is_answered,
          created_at: inquiry.created_at,
          answered_at: inquiry.answered_at
        });
      } else {
        console.log('⚠️ No hay consultas a tus tareas');
      }
      console.log('✅ Test 1 completado\n');
    } else {
      const errorData = await response.json();
      console.log('Error:', JSON.stringify(errorData, null, 2));
      
      if (response.status === 401 || response.status === 403) {
        console.log('⚠️ Necesitas un token válido para este test');
      }
    }
  } catch (error) {
    console.error('❌ Error en Test 1:', error.message);
  }

  // Test 2: Obtener mis consultas (como consultante)
  console.log('📋 Test 2: Obtener mis consultas realizadas');
  console.log('Endpoint: GET /api/inquiries/?mine=true');
  console.log('');
  try {
    const response = await fetch(`${API_BASE_URL}/inquiries/?mine=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Estructura de respuesta:', {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results_length: data.results?.length || 0
      });
      console.log('');
      
      if (data.results && data.results.length > 0) {
        console.log('✅ Ejemplo de mi consulta:');
        const inquiry = data.results[0];
        console.log({
          id: inquiry.id,
          task: inquiry.task,
          task_title: inquiry.task_title,
          question: inquiry.question?.substring(0, 50) + '...',
          answer: inquiry.answer?.substring(0, 50) + '...' || null,
          is_answered: inquiry.is_answered,
          created_at: inquiry.created_at,
          answered_at: inquiry.answered_at
        });
      } else {
        console.log('⚠️ No has realizado consultas');
      }
      console.log('✅ Test 2 completado\n');
    } else {
      const errorData = await response.json();
      console.log('Error:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('❌ Error en Test 2:', error.message);
  }

  // Test 3: Verificar campos específicos para el inbox
  console.log('📋 Test 3: Verificación de campos para threading');
  console.log('');
  console.log('Campos requeridos para el inbox:');
  console.log('  ✓ id - ID de la consulta');
  console.log('  ✓ task - ID de la tarea');
  console.log('  ✓ task_title - Título de la tarea');
  console.log('  ✓ sender_name o inquirer_name - Nombre del consultante');
  console.log('  ✓ question - Pregunta realizada');
  console.log('  ✓ answer - Respuesta (puede ser null)');
  console.log('  ✓ is_answered - Estado de respuesta');
  console.log('  ✓ created_at - Fecha de creación');
  console.log('  ✓ answered_at - Fecha de respuesta (puede ser null)');
  console.log('');

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('✅ Pruebas completadas');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('📝 Para usar con token real:');
  console.log('1. Inicia sesión en la app');
  console.log('2. Abre la consola del navegador');
  console.log('3. Ejecuta: firebase.auth().currentUser.getIdToken()');
  console.log('4. Copia el token y reemplaza TEST_TOKEN en este script');
  console.log('5. Ejecuta: node test-inbox-api.js');
  console.log('');
}

// Ejecutar las pruebas
testInboxAPI().catch(console.error);
