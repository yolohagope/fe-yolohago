import { useState, useEffect } from 'react';
import { PlusCircle, Paperclip, X } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCategory, Category } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { createTask, CreateTaskPayload, fetchCategories } from '@/services/api';

export function PublicarTarea() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<TaskCategory>('');
  const [duration, setDuration] = useState('Menos de 1 hora');
  const [payment, setPayment] = useState('');
  const [location, setLocation] = useState('Lima');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Cargar categorías al montar el componente
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
        // Establecer la primera categoría como default
        if (data.length > 0) {
          setCategory(data[0].name);
        }
      } catch (err) {
        console.error('Error cargando categorías:', err);
      }
    }
    loadCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!title.trim() || !description.trim() || !payment) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    const paymentNum = parseFloat(payment);
    if (isNaN(paymentNum) || paymentNum <= 0) {
      setError('El pago debe ser un número válido mayor a 0');
      setLoading(false);
      return;
    }

    try {
      // Preparar el payload para el API
      const payload: CreateTaskPayload = {
        title: title.trim(),
        description: description.trim(),
        category,
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
        setCategory(categories[0].name);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Publica una microtarea
            </h1>
            <p className="text-muted-foreground">
              Simple, rápido y efectivo.
            </p>
          </div>

          {success && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
              ✓ Tarea publicada exitosamente
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                required
                className="h-12"
              />
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
                required
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Categoría
                </label>
                <Select value={category} onValueChange={(value) => setCategory(value)}>
                  <SelectTrigger id="category" className="h-12">
                    <SelectValue placeholder="Elige una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                required
                min="1"
                step="0.01"
                className="h-12"
              />
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

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-[#4285F4] hover:bg-[#357ae8] text-white"
              disabled={loading}
            >
              <PlusCircle weight="bold" className="mr-2" size={20} />
              {loading ? '¡Publicando ahora!' : '¡Publicar ahora!'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
