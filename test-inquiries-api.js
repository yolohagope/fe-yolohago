/**
 * Script de prueba para el API de Inquiries (Consultas)
 * Ejecutar con: node test-inquiries-api.js
 */

const API_BASE_URL = 'https://api.yolohago.pe/api';

// Token de prueba (reemplazar con un token real de Firebase)
const TEST_TOKEN = 'YOUR_FIREBASE_TOKEN_HERE';

async function testInquiriesAPI() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('🧪 PRUEBAS DEL API DE INQUIRIES');
  console.log('═══════════════════════════════════════════');
  console.log('');

  // Test 1: Obtener consultas de una tarea (sin autenticación - públicas)
  console.log('📋 Test 1: Obtener consultas públicas de una tarea');
  try {
    const taskId = 1; // Cambiar por una tarea real
    const response = await fetch(`${API_BASE_URL}/inquiries/?task=${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Respuesta:', JSON.stringify(data, null, 2));
    console.log('Número de consultas:', data.results ? data.results.length : data.length);
    console.log('✅ Test 1 completado\n');
  } catch (error) {
    console.error('❌ Error en Test 1:', error.message);
  }

  // Test 2: Crear una nueva consulta (requiere autenticación)
  console.log('📝 Test 2: Crear nueva consulta');
  try {
    const newInquiry = {
      task: 1, // ID de la tarea
      question: '¿Cuánto tiempo tomará completar esta tarea? ¿Incluye revisiones?'
    };

    const response = await fetch(`${API_BASE_URL}/inquiries/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(newInquiry)
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Consulta creada:', JSON.stringify(data, null, 2));
      console.log('✅ Test 2 completado\n');
    } else {
      const errorData = await response.json();
      console.log('Error:', JSON.stringify(errorData, null, 2));
      
      if (response.status === 401) {
        console.log('⚠️ Necesitas un token válido para este test');
      } else if (response.status === 403) {
        console.log('⚠️ No puedes consultar tu propia tarea');
      }
    }
  } catch (error) {
    console.error('❌ Error en Test 2:', error.message);
  }

  // Test 3: Responder una consulta (requiere ser el publicador)
  console.log('💬 Test 3: Responder una consulta');
  try {
    const inquiryId = 1; // ID de la consulta
    const answer = {
      answer: 'El tiempo estimado es de 3-5 días hábiles. Sí, incluye 2 revisiones sin costo adicional.'
    };

    const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/answer/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(answer)
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Respuesta enviada:', JSON.stringify(data, null, 2));
      console.log('✅ Test 3 completado\n');
    } else {
      const errorData = await response.json();
      console.log('Error:', JSON.stringify(errorData, null, 2));
      
      if (response.status === 403) {
        console.log('⚠️ Solo el publicador puede responder consultas');
      }
    }
  } catch (error) {
    console.error('❌ Error en Test 3:', error.message);
  }

  // Test 4: Obtener consultas filtradas (mis consultas)
  console.log('📋 Test 4: Obtener mis consultas');
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
      console.log('Mis consultas:', JSON.stringify(data, null, 2));
      console.log('Número de consultas:', data.results ? data.results.length : data.length);
      console.log('✅ Test 4 completado\n');
    } else {
      const errorData = await response.json();
      console.log('Error:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('❌ Error en Test 4:', error.message);
  }

  // Test 5: Obtener consultas a mis tareas publicadas
  console.log('📋 Test 5: Obtener consultas a mis tareas');
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
      console.log('Consultas a mis tareas:', JSON.stringify(data, null, 2));
      console.log('Número de consultas:', data.results ? data.results.length : data.length);
      console.log('✅ Test 5 completado\n');
    } else {
      const errorData = await response.json();
      console.log('Error:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('❌ Error en Test 5:', error.message);
  }

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('✅ Pruebas completadas');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('📝 Instrucciones:');
  console.log('1. Reemplaza TEST_TOKEN con un token válido de Firebase');
  console.log('2. Actualiza los IDs de tareas y consultas con datos reales');
  console.log('3. Ejecuta: node test-inquiries-api.js');
  console.log('');
}

// Ejecutar las pruebas
testInquiriesAPI().catch(console.error);
