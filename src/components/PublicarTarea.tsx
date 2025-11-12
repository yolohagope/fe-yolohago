import { useState, useEffect } from 'react';
import { PlusCircle, Paperclip, X, MagnifyingGlass, Lightbulb, CreditCard, ArrowRight, ArrowLeft } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Category } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { createTask, CreateTaskPayload, fetchCategories } from '@/services/api';

export function PublicarTarea() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showFullForm, setShowFullForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Detalles de tarea, 2: Pago
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [duration, setDuration] = useState('Menos de 1 hora');
  const [payment, setPayment] = useState('');
  const [location, setLocation] = useState('Lima');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Estados para el pago
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  
  // Estados para errores por campo
  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    description: '',
    category: '',
    payment: '',
    paymentMethod: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    terms: ''
  });

  // Tarjetas guardadas (simulado - en producción vendrían del backend)
  const savedCards = [
    { id: '1', last4: '4242', brand: 'Visa', expiry: '12/25' },
    { id: '2', last4: '5555', brand: 'Mastercard', expiry: '08/26' },
  ];

  const taskIdeas = [
    'Buscar un regalo para mi pareja',
    'Cotizar un producto en diferentes tiendas',
    'Buscar un departamento en Miraflores',
    'Comprar entradas para el cine',
    'Recorrer tiendas y buscar el mejor precio',
    'Investigar opciones de restaurantes para una cena',
    'Comparar precios de laptops en tiendas',
    'Buscar talleres de reparación de celulares',
    'Cotizar servicios de limpieza',
    'Investigar gimnasios en mi zona',
    'Buscar opciones de cursos online',
    'Comparar planes de telefonía móvil',
  ];

  // Cargar categorías al montar el componente
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
        // Establecer la primera categoría como default
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (err) {
        console.error('Error cargando categorías:', err);
      }
    }
    loadCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Limpiar errores de campos
    const newErrors = { ...fieldErrors };
    let hasError = false;

    // Validar método de pago
    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = 'Por favor selecciona un método de pago';
      hasError = true;
    }

    // Validar datos de tarjeta nueva si aplica
    if (selectedPaymentMethod === 'new') {
      if (!newCard.number) {
        newErrors.cardNumber = 'Por favor ingresa el número de tarjeta';
        hasError = true;
      }
      if (!newCard.name) {
        newErrors.cardName = 'Por favor ingresa el nombre del titular';
        hasError = true;
      }
      if (!newCard.expiry) {
        newErrors.cardExpiry = 'Por favor ingresa la fecha de vencimiento';
        hasError = true;
      }
      if (!newCard.cvv) {
        newErrors.cardCvv = 'Por favor ingresa el CVV';
        hasError = true;
      }
    }

    // Validar términos
    if (!acceptTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    const paymentNum = parseFloat(payment);

    try {
      // Preparar el payload para el API
      const payload: CreateTaskPayload = {
        title: title.trim(),
        description: description.trim(),
        category_id: selectedCategoryId!, // Enviamos el ID de la categoría
        payment: paymentNum,
        currency: 'S/',
        location,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días desde ahora
        posterName: user?.displayName || user?.email?.split('@')[0] || 'Usuario',
      };

      console.log('📤 Enviando tarea al backend:', payload);

      // Llamar al API
      const newTask = await createTask(payload);
      
      console.log('✅ Tarea creada:', newTask);
      
      // TODO: Subir archivos si hay
      if (files.length > 0) {
        console.log('📎 Archivos adjuntos (pendiente implementar upload):', files.map(f => f.name));
      }
      
      setSuccess(true);
      setTitle('');
      setDescription('');
      setPayment('');
      setLocation('Lima');
      setFiles([]);
      if (categories.length > 0) {
        setSelectedCategoryId(categories[0].id);
      }
      setDuration('Menos de 1 hora');

      setTimeout(() => {
        navigate('/?tarea=publicada');
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Error al publicar tarea:', err);
      setError(err.message || 'Error al publicar la tarea');
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  function handleQuickPublish() {
    if (title.trim()) {
      setShowFullForm(true);
    }
  }

  function handleTaskIdeaClick(idea: string) {
    setTitle(idea);
    setShowFullForm(true);
  }

  function handleNextStep() {
    // Limpiar errores previos
    setFieldErrors({
      title: '',
      description: '',
      category: '',
      payment: '',
      paymentMethod: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
      terms: ''
    });

    let hasError = false;
    const newErrors = { ...fieldErrors };

    // Validar paso 1 antes de continuar
    if (!title.trim()) {
      newErrors.title = 'Por favor ingresa el título de la tarea';
      hasError = true;
    }

    if (!description.trim()) {
      newErrors.description = 'Por favor describe la tarea con más detalles';
      hasError = true;
    }

    if (!selectedCategoryId) {
      newErrors.category = 'Por favor selecciona una categoría';
      hasError = true;
    }

    if (!payment) {
      newErrors.payment = 'Por favor ingresa el pago sugerido';
      hasError = true;
    } else {
      const paymentNum = parseFloat(payment);
      if (isNaN(paymentNum) || paymentNum <= 0) {
        newErrors.payment = 'El pago debe ser un número válido mayor a 0';
        hasError = true;
      }
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

    setError('');
    setCurrentStep(2);
  }

  function handlePreviousStep() {
    setCurrentStep(1);
    setError('');
    setFieldErrors({
      title: '',
      description: '',
      category: '',
      payment: '',
      paymentMethod: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
      terms: ''
    });
  }

  function handleCancelForm() {
    setShowFullForm(false);
    setCurrentStep(1);
    setTitle('');
    setDescription('');
    setPayment('');
    setFiles([]);
    setSelectedPaymentMethod('');
    setAcceptTerms(false);
    setError('');
    setFieldErrors({
      title: '',
      description: '',
      category: '',
      payment: '',
      paymentMethod: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
      terms: ''
    });
  }

  // Si no se ha mostrado el formulario completo, mostrar el hero
  if (!showFullForm) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section con fondo azul */}
        <div className="bg-gradient-to-br from-[#4285F4] via-[#5A8FF5] to-[#7B5FED] pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            {/* Hero Section */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                El tiempo es corto,<br />
                <span className="text-white/90">úsalo en lo que más te importa</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-12">
                Para todo lo demás, usa YoLoHago
              </p>

              {/* Quick Input */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-2">
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 flex items-center px-4">
                      <span className="text-muted-foreground mr-2 font-medium whitespace-nowrap text-base">Necesito</span>
                      <Input
                        type="text"
                        placeholder="¿qué necesitas que alguien haga por ti?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleQuickPublish()}
                        className="border-0 h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <Button
                      onClick={handleQuickPublish}
                      disabled={!title.trim()}
                      className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-base rounded-xl cursor-pointer"
                    >
                      Publicar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ideas Section con fondo blanco */}
        <div className="bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-8">
                <Lightbulb weight="fill" size={28} className="text-yellow-500" />
                <h2 className="text-2xl font-bold text-foreground">
                  Ideas de tareas que puedes publicar
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskIdeas.map((idea, index) => (
                  <button
                    key={index}
                    onClick={() => handleTaskIdeaClick(idea)}
                    className="group bg-white hover:bg-gray-50 text-gray-700 p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-xl text-left border border-gray-100 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <MagnifyingGlass 
                        weight="bold" 
                        size={20} 
                        className="text-[#4285F4] mt-0.5 flex-shrink-0" 
                      />
                      <span className="text-sm font-medium leading-relaxed">
                        {idea}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario completo - Wizard
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          {/* Header con indicador de pasos */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Publica una microtarea
              </h1>
              <p className="text-muted-foreground">
                Paso {currentStep} de 2
              </p>
            </div>

            {/* Indicador de progreso */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`flex-1 h-2 rounded-full ${currentStep >= 1 ? 'bg-[#4285F4]' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-2 rounded-full ${currentStep >= 2 ? 'bg-[#4285F4]' : 'bg-gray-200'}`} />
            </div>
          </div>

          {success && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
              ✓ Tarea publicada exitosamente
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PASO 1: Detalles de la tarea */}
            {currentStep === 1 && (
              <>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    ¿Qué necesitas?
                  </label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Ej. Ayuda para pintar una habitación"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`h-12 ${fieldErrors.title ? 'border-red-500' : ''}`}
                  />
                  {fieldErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Da más detalles
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Incluye dimensiones, herramientas necesarias, o cualquier cosa que ayude a entender mejor la tarea."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className={`resize-none ${fieldErrors.description ? 'border-red-500' : ''}`}
                  />
                  {fieldErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">
                      Categoría
                    </label>
                    <Select 
                      value={selectedCategoryId?.toString() || ''} 
                      onValueChange={(value) => setSelectedCategoryId(parseInt(value))}
                    >
                      <SelectTrigger id="category" className={`h-12 ${fieldErrors.category ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Elige una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.category && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.category}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-2">
                      Ubicación
                    </label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger id="location" className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lima">Lima</SelectItem>
                        <SelectItem value="Arequipa">Arequipa</SelectItem>
                        <SelectItem value="Cusco">Cusco</SelectItem>
                        <SelectItem value="Trujillo">Trujillo</SelectItem>
                        <SelectItem value="Remoto">Remoto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label htmlFor="payment" className="block text-sm font-medium mb-2">
                    Pago sugerido (S/)
                  </label>
                  <Input
                    id="payment"
                    type="number"
                    placeholder="S/ 50"
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    min="1"
                    step="0.01"
                    className={`h-12 ${fieldErrors.payment ? 'border-red-500' : ''}`}
                  />
                  {fieldErrors.payment && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.payment}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="files" className="block text-sm font-medium mb-2">
                    Adjuntar archivos (opcional)
                  </label>
                  <div className="space-y-3">
                    <label
                      htmlFor="files"
                      className="flex items-center justify-center gap-2 h-12 px-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <Paperclip weight="bold" size={20} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Haz clic para adjuntar archivos
                      </span>
                      <input
                        id="files"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                    </label>

                    {files.length > 0 && (
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Paperclip weight="bold" size={16} className="text-primary flex-shrink-0" />
                              <span className="text-sm truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-destructive hover:bg-destructive/10 p-1 rounded"
                            >
                              <X size={16} weight="bold" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones del Paso 1 */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 h-12 text-base font-medium bg-[#4285F4] hover:bg-[#357ae8] text-white cursor-pointer"
                  >
                    Siguiente
                    <ArrowRight weight="bold" className="ml-2" size={20} />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelForm}
                    className="flex-1 h-12 text-base font-medium bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                  >
                    <X weight="bold" className="mr-2" size={20} />
                    Cancelar
                  </Button>
                </div>
              </>
            )}

            {/* PASO 2: Método de pago */}
            {currentStep === 2 && (
              <>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Método de pago</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Registra tu tarjeta para futuras transacciones
                    </p>
                  </div>

                  {/* Tarjetas guardadas */}
                  <div className="space-y-3">
                    {savedCards.map((card) => (
                      <label
                        key={card.id}
                        className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                        style={{ borderColor: selectedPaymentMethod === card.id ? '#4285F4' : 'hsl(var(--border))' }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={card.id}
                          checked={selectedPaymentMethod === card.id}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="mr-4"
                        />
                        <CreditCard weight="duotone" size={32} className="mr-3 text-[#4285F4]" />
                        <div className="flex-1">
                          <div className="font-medium">{card.brand} •••• {card.last4}</div>
                          <div className="text-sm text-muted-foreground">Expira {card.expiry}</div>
                        </div>
                      </label>
                    ))}

                    {/* Nueva tarjeta */}
                    <label
                      className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                      style={{ borderColor: selectedPaymentMethod === 'new' ? '#4285F4' : 'hsl(var(--border))' }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="new"
                        checked={selectedPaymentMethod === 'new'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="mr-4"
                      />
                      <CreditCard weight="duotone" size={32} className="mr-3 text-[#4285F4]" />
                      <div className="font-medium">Agregar nueva tarjeta</div>
                    </label>
                    {fieldErrors.paymentMethod && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.paymentMethod}</p>
                    )}
                  </div>

                  {/* Formulario de nueva tarjeta */}
                  {selectedPaymentMethod === 'new' && (
                    <div className="space-y-4 p-4 bg-accent/30 rounded-lg mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Número de tarjeta</label>
                        <Input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={newCard.number}
                          onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                          maxLength={19}
                          className={`h-12 ${fieldErrors.cardNumber ? 'border-red-500' : ''}`}
                        />
                        {fieldErrors.cardNumber && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.cardNumber}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Nombre del titular</label>
                        <Input
                          type="text"
                          placeholder="JUAN PEREZ"
                          value={newCard.name}
                          onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                          className={`h-12 ${fieldErrors.cardName ? 'border-red-500' : ''}`}
                        />
                        {fieldErrors.cardName && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.cardName}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Vencimiento</label>
                          <Input
                            type="text"
                            placeholder="MM/AA"
                            value={newCard.expiry}
                            onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                            maxLength={5}
                            className={`h-12 ${fieldErrors.cardExpiry ? 'border-red-500' : ''}`}
                          />
                          {fieldErrors.cardExpiry && (
                            <p className="text-red-500 text-sm mt-1">{fieldErrors.cardExpiry}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">CVV</label>
                          <Input
                            type="text"
                            placeholder="123"
                            value={newCard.cvv}
                            onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                            maxLength={4}
                            className={`h-12 ${fieldErrors.cardCvv ? 'border-red-500' : ''}`}
                          />
                          {fieldErrors.cardCvv && (
                            <p className="text-red-500 text-sm mt-1">{fieldErrors.cardCvv}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resumen de comisión */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Comisión de la plataforma:</span>
                      <span className="text-lg font-bold text-[#4285F4]">S/ 5.00</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      💡 Esta comisión solo se cobrará si la tarea se completa exitosamente
                    </p>
                  </div>

                  {/* Términos y condiciones */}
                  <div>
                    <div className={`flex items-start gap-3 p-4 border rounded-lg ${fieldErrors.terms ? 'border-red-500' : ''}`}>
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
                      <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                        Acepto los{' '}
                        <a href="/terminos" className="text-[#4285F4] hover:underline">
                          términos y condiciones
                        </a>{' '}
                        y la{' '}
                        <a href="/privacidad" className="text-[#4285F4] hover:underline">
                          política de privacidad
                        </a>
                      </label>
                    </div>
                    {fieldErrors.terms && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.terms}</p>
                    )}
                  </div>
                </div>

                {/* Botones del Paso 2 */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="flex-1 h-12 text-base font-medium cursor-pointer"
                  >
                    <ArrowLeft weight="bold" className="mr-2" size={20} />
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-base font-medium bg-[#4285F4] hover:bg-[#357ae8] text-white cursor-pointer"
                    disabled={loading}
                  >
                    <PlusCircle weight="bold" className="mr-2" size={20} />
                    {loading ? 'Publicando...' : '¡Publicar ahora!'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
