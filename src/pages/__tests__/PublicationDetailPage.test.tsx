import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PublicationDetailPage } from '../PublicationDetailPage';
import * as api from '@/services/api';

// Mock de utils para evitar import.meta
jest.mock('@/lib/utils', () => ({
  getCategoryName: () => 'Categoría de prueba',
  cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

// Mock de Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-123' }
  }
}));

// Mock del módulo de API
jest.mock('@/services/api');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ taskId: '123' }),
  useNavigate: () => jest.fn(),
}));

const mockTask = {
  id: 123,
  title: 'Tarea de prueba',
  description: 'Descripción de prueba',
  category: 'cleaning',
  subcategory: 'home',
  payment: 100,
  currency: 'S/',
  location: 'Lima, Perú',
  deadline: '2025-12-31T00:00:00Z',
  created_at: '2025-11-01T00:00:00Z',
  status: 'open',
  poster: 1,
  poster_name: 'Usuario Test'
};

const mockApplications = [
  {
    id: 1,
    task: 123,
    applicant: 2,
    applicant_name: 'Trabajador Test',
    offered_price: 80,
    currency: 'S/',
    message: 'Mensaje de prueba',
    status: 'pending' as const,
    created_at: '2025-11-10T00:00:00Z',
    updated_at: '2025-11-10T00:00:00Z'
  }
];

const mockInquiries = [
  {
    id: 1,
    task: 123,
    inquirer: 3,
    inquirer_name: 'Consultor Test',
    question: '¿Cuándo empieza el trabajo?',
    answer: null,
    answered_by: null,
    answered_by_name: null,
    answered_at: null,
    created_at: '2025-11-12T00:00:00Z',
    updated_at: '2025-11-12T00:00:00Z'
  }
];

describe('PublicationDetailPage - Prueba con/sin API de Inquiries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1️⃣ PRUEBA SIN API DE INQUIRIES - Debe renderizar correctamente', async () => {
    console.log('🧪 TEST 1: SIN fetchTaskInquiries');
    
    // Mock solo task y applications, NO inquiries
    (api.fetchTaskById as jest.Mock).mockResolvedValue(mockTask);
    (api.fetchTaskApplications as jest.Mock).mockResolvedValue(mockApplications);
    // fetchTaskInquiries NO está mockeado, causará error

    render(
      <BrowserRouter>
        <PublicationDetailPage />
      </BrowserRouter>
    );

    // Esperar a que termine de cargar
    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles de la publicación...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Verificar que la página renderizó
    const title = screen.queryByText('Tarea de prueba');
    console.log('📊 Resultado TEST 1:', title ? '✅ RENDERIZÓ' : '❌ NO RENDERIZÓ (BLANCO)');
    
    expect(title).toBeInTheDocument();
  });

  test('2️⃣ PRUEBA CON API DE INQUIRIES (que falla) - Debe manejar el error sin romper', async () => {
    console.log('🧪 TEST 2: CON fetchTaskInquiries que FALLA');
    
    // Mock task y applications exitosos
    (api.fetchTaskById as jest.Mock).mockResolvedValue(mockTask);
    (api.fetchTaskApplications as jest.Mock).mockResolvedValue(mockApplications);
    
    // Mock fetchTaskInquiries que FALLA
    (api.fetchTaskInquiries as jest.Mock).mockRejectedValue(new Error('Error de red'));

    render(
      <BrowserRouter>
        <PublicationDetailPage />
      </BrowserRouter>
    );

    // Esperar a que termine de cargar
    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles de la publicación...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Verificar que la página renderizó AUNQUE inquiries falló
    const title = screen.queryByText('Tarea de prueba');
    console.log('📊 Resultado TEST 2:', title ? '✅ RENDERIZÓ (con .catch())' : '❌ NO RENDERIZÓ (sin .catch())');
    
    expect(title).toBeInTheDocument();
  });

  test('3️⃣ PRUEBA CON API DE INQUIRIES (exitosa) - Debe renderizar con consultas', async () => {
    console.log('🧪 TEST 3: CON fetchTaskInquiries EXITOSO');
    
    // Mock de todos los endpoints exitosos
    (api.fetchTaskById as jest.Mock).mockResolvedValue(mockTask);
    (api.fetchTaskApplications as jest.Mock).mockResolvedValue(mockApplications);
    (api.fetchTaskInquiries as jest.Mock).mockResolvedValue(mockInquiries);

    render(
      <BrowserRouter>
        <PublicationDetailPage />
      </BrowserRouter>
    );

    // Esperar a que termine de cargar
    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles de la publicación...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Verificar que la página renderizó con todos los datos
    const title = screen.queryByText('Tarea de prueba');
    const consultation = screen.queryByText('¿Cuándo empieza el trabajo?');
    
    console.log('📊 Resultado TEST 3:', {
      tarea: title ? '✅' : '❌',
      consulta: consultation ? '✅' : '❌'
    });
    
    expect(title).toBeInTheDocument();
    expect(consultation).toBeInTheDocument();
  });

  test('4️⃣ PRUEBA: Verificar que Promise.all tiene .catch() para inquiries', () => {
    console.log('🧪 TEST 4: Verificando código fuente');
    
    // Leer el archivo y verificar que tiene .catch()
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../PublicationDetailPage.tsx');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Buscar la línea de fetchTaskInquiries con .catch()
    const hasCatch = fileContent.includes('fetchTaskInquiries') && 
                     fileContent.includes('.catch(err => {');
    
    console.log('📊 Resultado TEST 4:', hasCatch ? '✅ Tiene .catch()' : '❌ NO tiene .catch()');
    
    expect(hasCatch).toBe(true);
  });
});
