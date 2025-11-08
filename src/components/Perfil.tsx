import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, CreditCard, Wallet, Lock, Camera, Star, ArrowUp, ArrowDown, Bank, X, Plus, Check } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { fetchProfile, updateProfile, deleteProfilePhoto, fetchBalance, fetchTransactions, fetchPaymentMethods, setPaymentMethodPrimary, activatePaymentMethod, deactivatePaymentMethod, deletePaymentMethod, createBankAccount, createYapePlin, createPayPal } from '@/services/api';
import { UserProfile, Balance, Transaction, PaymentMethod, CreateBankAccountPayload, CreateYapePlinPayload, CreatePayPalPayload } from '@/lib/types';
import { sendPasswordResetEmail, EmailAuthProvider, linkWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Section = 'datos-personales' | 'finanzas' | 'metodos-pago' | 'metodos-cobro' | 'seguridad';

export function Perfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener sección activa desde la URL
  const currentSection = location.pathname.split('/cuenta/')[1] || 'datos-personales';
  const activeSection = currentSection as Section;

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        console.log('📥 Cargando perfil...');
        const data = await fetchProfile();
        setProfile(data);
        console.log('✅ Perfil cargado exitosamente');
      } catch (error: any) {
        console.error('❌ Error cargando perfil:', error);
        // Si hay error, mostrar datos básicos de Firebase
        console.log('⚠️ Usando datos de Firebase como fallback');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProfile();
    }
  }, [user]);

  const menuItems = [
    { id: 'datos-personales', label: 'Datos Personales', icon: User },
    { id: 'finanzas', label: 'Mis Finanzas', icon: Bank },
    { id: 'metodos-pago', label: 'Métodos de Pago', icon: CreditCard },
    { id: 'metodos-cobro', label: 'Métodos de Cobro', icon: Wallet },
    { id: 'seguridad', label: 'Seguridad', icon: Lock },
  ] as const;

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : user.displayName || user.email?.split('@')[0] || 'Usuario';
  const photoURL = profile?.photo_url || profile?.profile_photo || user.photoURL;
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mi Cuenta</h1>
          <p className="text-muted-foreground">
            Administra tu información personal, finanzas y configuración de cuenta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menú lateral */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={photoURL || undefined} alt={displayName} />
                    <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
                  >
                    <Camera weight="bold" size={14} />
                  </Button>
                </div>
                <h3 className="mt-2 font-semibold text-base text-center">{displayName}</h3>
                <p className="text-xs text-muted-foreground text-center break-all px-2 mt-0.5">{profile?.email || user.email}</p>
                
                {/* Rating con estrellas */}
                <div className="mt-1.5">
                  {profile && profile.rating > 0 ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            weight={star <= Math.round(profile.rating) ? 'fill' : 'regular'}
                            size={14}
                            className={star <= Math.round(profile.rating) ? 'text-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                        <span className="text-xs font-medium ml-1">
                          {profile.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {profile.rating_count} {profile.rating_count === 1 ? 'calificación' : 'calificaciones'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            weight="regular"
                            size={13}
                            className="text-gray-300"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Sin calificaciones
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Estadísticas de tareas */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {profile?.tasks_published ?? 0}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    Publicadas
                  </div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {profile?.tasks_completed ?? 0}
                  </div>
                  <div className="text-xs text-green-700 font-medium">
                    Realizadas
                  </div>
                </div>
              </div>

              <nav className="space-y-1 mt-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/cuenta/${item.id}`)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon weight="bold" size={18} />
                      <span className="text-left">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {activeSection === 'datos-personales' && <DatosPersonales profile={profile} onUpdate={setProfile} />}
            {activeSection === 'finanzas' && <Finanzas />}
            {activeSection === 'metodos-pago' && <MetodosPago />}
            {activeSection === 'metodos-cobro' && <MetodosCobro />}
            {activeSection === 'seguridad' && <Seguridad />}
          </div>
        </div>
      </div>
    </div>
  );
}

function DatosPersonales({ profile, onUpdate }: { profile: UserProfile | null; onUpdate: (profile: UserProfile) => void }) {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    address: profile?.address || '',
    city: profile?.city || 'Lima',
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Actualizar formData cuando cambia el perfil
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        address: profile.address || '',
        city: profile.city || 'Lima',
      });
    }
  }, [profile]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        bio: formData.bio,
        city: formData.city,
        address: formData.address,
      };

      if (profilePhoto) {
        payload.profile_photo = profilePhoto;
      }

      const updatedProfile = await updateProfile(payload);
      onUpdate(updatedProfile);
      setSuccess(true);
      setProfilePhoto(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Datos Personales</h2>
      
      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
          ✓ Perfil actualizado exitosamente
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto de perfil */}
        <div>
          <Label htmlFor="profilePhoto">Foto de perfil</Label>
          <div className="mt-2 flex items-center gap-4">
            <Input
              id="profilePhoto"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="flex-1"
            />
            {profilePhoto && (
              <span className="text-sm text-muted-foreground">
                {profilePhoto.name}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Formatos: JPG, PNG. Máximo 5MB
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Juan"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="last_name">Apellido</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Pérez"
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+51 999 999 999"
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email || ''}
            disabled
            className="mt-2 bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            El correo no puede ser modificado
          </p>
        </div>

        <div>
          <Label htmlFor="bio">Biografía</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Cuéntanos un poco sobre ti..."
            className="mt-2 resize-none"
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Máximo 500 caracteres
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Lima"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Av. Principal 123"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#4285F4] hover:bg-[#357ae8]"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Finanzas() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFinancialData() {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar balance y transacciones en paralelo
        const [balanceData, transactionsData] = await Promise.all([
          fetchBalance(),
          fetchTransactions()
        ]);
        
        setBalance(balanceData);
        setTransactions(transactionsData.results);
      } catch (err: any) {
        console.error('Error cargando datos financieros:', err);
        setError(err.message || 'Error al cargar datos financieros');
      } finally {
        setLoading(false);
      }
    }

    loadFinancialData();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando datos financieros...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !balance) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Error al cargar datos'}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </Card>
    );
  }

  const saldoDisponible = parseFloat(String(balance.available_amount_pen)) || 0;
  
  // Separar transacciones de pagos y retiros
  const movimientos = transactions.filter(t => t.transaction_type === 'payment' || t.transaction_type === 'refund');
  const retiros = transactions.filter(t => t.transaction_type === 'withdrawal');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
      failed: { label: 'Fallido', color: 'bg-red-100 text-red-700' },
      cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>{config.label}</span>;
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Columna izquierda: Título y descripción (2/3) */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-2">Mis Finanzas</h2>
          <p className="text-muted-foreground mb-4">
            Administra tu saldo y visualiza tus movimientos financieros
          </p>
          <div className="flex gap-3">
            <Button 
              variant="default" 
              size="sm" 
              className="bg-[#4285F4] hover:bg-[#357ae8]"
              disabled={saldoDisponible === 0}
            >
              <Wallet weight="bold" className="mr-2" size={16} />
              Solicitar retiro
            </Button>
            <Button variant="outline" size="sm">
              Ver métodos de cobro
            </Button>
          </div>
        </div>

        {/* Columna derecha: Saldo disponible (1/3 - más cuadrado) */}
        <div className={`rounded-xl p-6 text-white flex flex-col justify-center items-center ${
          saldoDisponible === 0 
            ? 'bg-gray-400' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600'
        }`}>
          <p className="text-sm opacity-90 mb-2">Saldo disponible</p>
          <p className="text-4xl font-bold">S/ {saldoDisponible.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs de Movimientos y Retiros */}
      <Tabs defaultValue="movimientos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="retiros">Retiros</TabsTrigger>
        </TabsList>

        {/* Tab de Movimientos */}
        <TabsContent value="movimientos" className="mt-4">
          <div className="space-y-3">
            {movimientos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tienes movimientos registrados
              </div>
            ) : (
              movimientos.map((transaction) => {
                const isIncome = parseFloat(String(transaction.signed_amount)) > 0;
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isIncome
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDown weight="bold" size={20} />
                        ) : (
                          <ArrowUp weight="bold" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        {transaction.task_title && (
                          <p className="text-xs text-muted-foreground">{transaction.task_title}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          isIncome ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isIncome ? '+' : ''}S/ {Math.abs(parseFloat(String(transaction.amount)) || 0).toFixed(2)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Tab de Retiros */}
        <TabsContent value="retiros" className="mt-4">
          <div className="space-y-3">
            {retiros.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tienes retiros registrados
              </div>
            ) : (
              retiros.map((transaction) => {
                const bankName = transaction.metadata?.bank_name || 'Banco';
                const accountNumber = transaction.metadata?.account_number || 'N/A';
                // Mostrar solo los últimos 4 dígitos
                const maskedAccount = accountNumber.length > 4 
                  ? `**** ${accountNumber.slice(-4)}` 
                  : accountNumber;
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Bank weight="bold" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{bankName} {maskedAccount}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                        {transaction.notes && (
                          <p className="text-xs text-muted-foreground italic">{transaction.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">S/ {parseFloat(String(transaction.amount)).toFixed(2)}</p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function MetodosPago() {
  const [cards, setCards] = useState<any[]>([]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-2">Métodos de Pago</h2>
      <p className="text-muted-foreground mb-6">
        Administra tus tarjetas y métodos de pago para contratar servicios
      </p>

      {cards.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard weight="thin" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No tienes métodos de pago</h3>
          <p className="text-muted-foreground mb-6">
            Agrega una tarjeta para realizar pagos más rápido
          </p>
          <Button className="bg-[#4285F4] hover:bg-[#357ae8]">
            <CreditCard weight="bold" className="mr-2" size={18} />
            Agregar tarjeta
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Lista de tarjetas */}
        </div>
      )}
    </Card>
  );
}

function MetodosCobro() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedMethodType, setSelectedMethodType] = useState<'bank' | 'yape' | 'plin' | 'paypal' | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form states para cuenta bancaria
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_number: '',
    account_type: 'savings' as 'savings' | 'checking',
    account_holder_name: '',
    account_holder_dni: '',
    currency: 'PEN' as 'PEN' | 'USD',
    display_name: ''
  });

  // Form states para Yape/Plin
  const [yapePlinForm, setYapePlinForm] = useState({
    wallet_type: 'yape' as 'yape' | 'plin',
    phone_number: '',
    account_holder_name: '',
    display_name: ''
  });

  // Form states para PayPal
  const [paypalForm, setPaypalForm] = useState({
    account_email: '',
    account_holder_name: '',
    display_name: ''
  });

  const peruBanks = [
    'BCP',
    'BBVA',
    'Interbank',
    'Scotiabank',
    'BanBif',
    'Banco Pichincha',
    'Banco de la Nación',
    'Banco de Comercio',
    'Banco Falabella',
    'Banco Ripley',
    'Banco Azteca',
    'Citibank',
    'ICBC',
    'Mibanco',
    'Alfin Banco',
    'Banco GNB'
  ];

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  async function loadPaymentMethods() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPaymentMethods();
      
      // Asegurar que siempre sea un array
      if (Array.isArray(data)) {
        setPaymentMethods(data);
      } else {
        console.error('fetchPaymentMethods no devolvió un array:', data);
        setPaymentMethods([]);
        setError('Formato de respuesta inesperado');
      }
    } catch (err: any) {
      console.error('Error loading payment methods:', err);
      setError(err.message || 'Error al cargar métodos de cobro');
      setPaymentMethods([]); // Asegurar que sea array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }

  function resetForms() {
    setBankForm({
      bank_name: '',
      account_number: '',
      account_type: 'savings',
      account_holder_name: '',
      account_holder_dni: '',
      currency: 'PEN',
      display_name: ''
    });
    setYapePlinForm({
      wallet_type: 'yape',
      phone_number: '',
      account_holder_name: '',
      display_name: ''
    });
    setPaypalForm({
      account_email: '',
      account_holder_name: '',
      display_name: ''
    });
  }

  function handleOpenDialog() {
    resetForms();
    setSelectedMethodType(null);
    setShowAddDialog(true);
  }

  async function handleSubmitBankAccount(e: React.FormEvent) {
    e.preventDefault();
    
    if (!bankForm.bank_name || !bankForm.account_number || !bankForm.account_holder_name || !bankForm.account_holder_dni) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitLoading(true);
      const payload: CreateBankAccountPayload = {
        method_type: 'bank_account',
        bank_name: bankForm.bank_name,
        account_number: bankForm.account_number,
        account_type: bankForm.account_type,
        account_holder_name: bankForm.account_holder_name,
        account_holder_dni: bankForm.account_holder_dni,
        currency: bankForm.currency,
        display_name: bankForm.display_name || `${bankForm.bank_name} - ${bankForm.account_number.slice(-4)}`
      };
      
      await createBankAccount(payload);
      await loadPaymentMethods();
      setShowAddDialog(false);
      resetForms();
    } catch (err: any) {
      console.error('Error creating bank account:', err);
      alert(err.message || 'Error al agregar cuenta bancaria');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleSubmitYapePlin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!yapePlinForm.phone_number || !yapePlinForm.account_holder_name) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitLoading(true);
      const walletType = selectedMethodType as 'yape' | 'plin';
      const payload: CreateYapePlinPayload = {
        method_type: walletType,
        wallet_type: walletType,
        phone_number: yapePlinForm.phone_number,
        account_holder_name: yapePlinForm.account_holder_name,
        display_name: yapePlinForm.display_name || `${walletType.toUpperCase()} - ${yapePlinForm.phone_number.slice(-4)}`,
        currency: 'PEN',
        identifier: yapePlinForm.phone_number
      };
      
      await createYapePlin(payload);
      await loadPaymentMethods();
      setShowAddDialog(false);
      resetForms();
    } catch (err: any) {
      console.error('Error creating Yape/Plin:', err);
      alert(err.message || 'Error al agregar método de pago');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleSubmitPayPal(e: React.FormEvent) {
    e.preventDefault();
    
    if (!paypalForm.account_email || !paypalForm.account_holder_name) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitLoading(true);
      const payload: CreatePayPalPayload = {
        method_type: 'paypal',
        wallet_type: 'paypal',
        account_email: paypalForm.account_email,
        account_holder_name: paypalForm.account_holder_name,
        display_name: paypalForm.display_name || `PayPal - ${paypalForm.account_email}`,
        currency: 'USD',
        identifier: paypalForm.account_email
      };
      
      await createPayPal(payload);
      await loadPaymentMethods();
      setShowAddDialog(false);
      resetForms();
    } catch (err: any) {
      console.error('Error creating PayPal:', err);
      alert(err.message || 'Error al agregar PayPal');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleSetPrimary(id: number) {
    try {
      setActionLoading(id);
      await setPaymentMethodPrimary(id);
      await loadPaymentMethods();
    } catch (err: any) {
      console.error('Error setting primary:', err);
      alert(err.message || 'Error al marcar como principal');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleActive(method: PaymentMethod) {
    if (method.is_primary && method.is_active) {
      alert('No puedes desactivar el método principal. Marca otro como principal primero.');
      return;
    }

    try {
      setActionLoading(method.id);
      if (method.is_active) {
        await deactivatePaymentMethod(method.id);
      } else {
        await activatePaymentMethod(method.id);
      }
      await loadPaymentMethods();
    } catch (err: any) {
      console.error('Error toggling active:', err);
      alert(err.message || 'Error al cambiar estado');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(method: PaymentMethod) {
    if (method.is_primary) {
      alert('No puedes eliminar el método principal. Marca otro como principal primero.');
      return;
    }

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar ${method.display_name}?`
    );
    
    if (!confirmed) return;

    try {
      setActionLoading(method.id);
      await deletePaymentMethod(method.id);
      await loadPaymentMethods();
    } catch (err: any) {
      console.error('Error deleting:', err);
      alert(err.message || 'Error al eliminar método');
    } finally {
      setActionLoading(null);
    }
  }

  function getMethodIcon(type: string) {
    switch (type) {
      case 'bank_account':
        return <Bank weight="fill" size={24} />;
      case 'yape':
      case 'plin':
        return <Wallet weight="fill" size={24} />;
      case 'paypal':
        return <CreditCard weight="fill" size={24} />;
      default:
        return <Wallet weight="fill" size={24} />;
    }
  }

  function getMethodTypeLabel(type: string) {
    const labels: Record<string, string> = {
      bank_account: 'Cuenta Bancaria',
      yape: 'Yape',
      plin: 'Plin',
      paypal: 'PayPal',
      wallet: 'Billetera'
    };
    return labels[type] || type;
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando métodos de cobro...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadPaymentMethods} variant="outline">
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Métodos de Cobro</h2>
          <p className="text-muted-foreground">
            Configura tus métodos de pago para recibir retiros
          </p>
        </div>
        <Button 
          onClick={handleOpenDialog}
          className="bg-[#34A853] hover:bg-[#2d9548] cursor-pointer"
        >
          <Plus weight="bold" className="mr-2" size={18} />
          Agregar método
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-12">
          <Wallet weight="thin" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No tienes métodos de cobro</h3>
          <p className="text-muted-foreground mb-6">
            Agrega un método de pago para poder solicitar retiros
          </p>
          <Button 
            onClick={handleOpenDialog}
            className="bg-[#34A853] hover:bg-[#2d9548] cursor-pointer"
          >
            <Wallet weight="bold" className="mr-2" size={18} />
            Agregar método
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map(method => (
            <Card key={method.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {getMethodIcon(method.method_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {method.display_name}
                      </h3>
                      {method.is_primary && (
                        <Badge variant="default" className="bg-yellow-500">
                          <Star weight="fill" size={12} className="mr-1" />
                          Principal
                        </Badge>
                      )}
                      {method.is_verified && (
                        <Badge variant="default" className="bg-green-500">
                          <Check weight="bold" size={12} className="mr-1" />
                          Verificado
                        </Badge>
                      )}
                      {!method.is_active && (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {getMethodTypeLabel(method.method_type)}
                    </p>
                    
                    <p className="text-sm font-mono text-muted-foreground">
                      {method.masked_identifier}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Moneda: {method.currency}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {!method.is_primary && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetPrimary(method.id)}
                      disabled={actionLoading === method.id}
                      className="cursor-pointer"
                    >
                      {actionLoading === method.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      ) : (
                        <>
                          <Star size={14} className="mr-1" />
                          Marcar principal
                        </>
                      )}
                    </Button>
                  )}
                  
                  {!method.is_primary && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(method)}
                      disabled={actionLoading === method.id}
                      className="cursor-pointer"
                    >
                      {method.is_active ? 'Desactivar' : 'Activar'}
                    </Button>
                  )}
                  
                  {!method.is_primary && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(method)}
                      disabled={actionLoading === method.id}
                      className="cursor-pointer"
                    >
                      <X size={14} className="mr-1" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para agregar método */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Método de Cobro</DialogTitle>
            <DialogDescription>
              Selecciona el tipo de método de pago que deseas agregar
            </DialogDescription>
          </DialogHeader>

          {!selectedMethodType ? (
            <div className="grid grid-cols-2 gap-4 py-6">
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3 cursor-pointer hover:bg-primary/10 hover:border-primary"
                onClick={() => setSelectedMethodType('bank')}
              >
                <Bank size={32} />
                <span className="font-semibold">Cuenta Bancaria</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3 cursor-pointer hover:bg-primary/10 hover:border-primary"
                onClick={() => setSelectedMethodType('yape')}
              >
                <Wallet size={32} />
                <span className="font-semibold">Yape</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3 cursor-pointer hover:bg-primary/10 hover:border-primary"
                onClick={() => setSelectedMethodType('plin')}
              >
                <Wallet size={32} />
                <span className="font-semibold">Plin</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3 cursor-pointer hover:bg-primary/10 hover:border-primary"
                onClick={() => setSelectedMethodType('paypal')}
              >
                <CreditCard size={32} />
                <span className="font-semibold">PayPal</span>
              </Button>
            </div>
          ) : selectedMethodType === 'bank' ? (
            <form onSubmit={handleSubmitBankAccount} className="space-y-4 py-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMethodType(null)}
                  className="cursor-pointer"
                >
                  ← Volver
                </Button>
                <h3 className="font-semibold">Cuenta Bancaria</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_name">Banco *</Label>
                <Select
                  value={bankForm.bank_name}
                  onValueChange={(value) => setBankForm({ ...bankForm, bank_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {peruBanks.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Número de cuenta *</Label>
                <Input
                  id="account_number"
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                  placeholder="1234567890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_type">Tipo de cuenta *</Label>
                <Select
                  value={bankForm.account_type}
                  onValueChange={(value) => setBankForm({ ...bankForm, account_type: value as 'savings' | 'checking' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Ahorros</SelectItem>
                    <SelectItem value="checking">Corriente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_holder_name">Titular de la cuenta *</Label>
                <Input
                  id="account_holder_name"
                  value={bankForm.account_holder_name}
                  onChange={(e) => setBankForm({ ...bankForm, account_holder_name: e.target.value })}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_holder_dni">DNI del titular *</Label>
                <Input
                  id="account_holder_dni"
                  value={bankForm.account_holder_dni}
                  onChange={(e) => setBankForm({ ...bankForm, account_holder_dni: e.target.value })}
                  placeholder="12345678"
                  maxLength={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda *</Label>
                <Select
                  value={bankForm.currency}
                  onValueChange={(value) => setBankForm({ ...bankForm, currency: value as 'PEN' | 'USD' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEN">Soles (PEN)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Nombre para mostrar (opcional)</Label>
                <Input
                  id="display_name"
                  value={bankForm.display_name}
                  onChange={(e) => setBankForm({ ...bankForm, display_name: e.target.value })}
                  placeholder="Ej: Mi cuenta BCP"
                />
                <p className="text-xs text-muted-foreground">
                  Si no lo ingresas, se generará automáticamente
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={submitLoading}
                  className="flex-1 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-[#34A853] hover:bg-[#2d9548] cursor-pointer"
                >
                  {submitLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    'Agregar cuenta'
                  )}
                </Button>
              </div>
            </form>
          ) : selectedMethodType === 'yape' || selectedMethodType === 'plin' ? (
            <form onSubmit={handleSubmitYapePlin} className="space-y-4 py-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMethodType(null)}
                  className="cursor-pointer"
                >
                  ← Volver
                </Button>
                <h3 className="font-semibold">{selectedMethodType === 'yape' ? 'Yape' : 'Plin'}</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Número de celular *</Label>
                <Input
                  id="phone_number"
                  value={yapePlinForm.phone_number}
                  onChange={(e) => {
                    setYapePlinForm({ 
                      ...yapePlinForm, 
                      phone_number: e.target.value,
                      wallet_type: selectedMethodType as 'yape' | 'plin'
                    });
                  }}
                  placeholder="987654321"
                  maxLength={9}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Número asociado a tu cuenta {selectedMethodType === 'yape' ? 'Yape' : 'Plin'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yape_plin_holder_name">Titular de la cuenta *</Label>
                <Input
                  id="yape_plin_holder_name"
                  value={yapePlinForm.account_holder_name}
                  onChange={(e) => setYapePlinForm({ ...yapePlinForm, account_holder_name: e.target.value })}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yape_plin_display_name">Nombre para mostrar (opcional)</Label>
                <Input
                  id="yape_plin_display_name"
                  value={yapePlinForm.display_name}
                  onChange={(e) => setYapePlinForm({ ...yapePlinForm, display_name: e.target.value })}
                  placeholder={`Ej: Mi ${selectedMethodType === 'yape' ? 'Yape' : 'Plin'}`}
                />
                <p className="text-xs text-muted-foreground">
                  Si no lo ingresas, se generará automáticamente
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={submitLoading}
                  className="flex-1 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-[#34A853] hover:bg-[#2d9548] cursor-pointer"
                >
                  {submitLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    `Agregar ${selectedMethodType === 'yape' ? 'Yape' : 'Plin'}`
                  )}
                </Button>
              </div>
            </form>
          ) : selectedMethodType === 'paypal' ? (
            <form onSubmit={handleSubmitPayPal} className="space-y-4 py-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMethodType(null)}
                  className="cursor-pointer"
                >
                  ← Volver
                </Button>
                <h3 className="font-semibold">PayPal</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_email">Correo de PayPal *</Label>
                <Input
                  id="account_email"
                  type="email"
                  value={paypalForm.account_email}
                  onChange={(e) => setPaypalForm({ ...paypalForm, account_email: e.target.value })}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypal_holder_name">Titular de la cuenta *</Label>
                <Input
                  id="paypal_holder_name"
                  value={paypalForm.account_holder_name}
                  onChange={(e) => setPaypalForm({ ...paypalForm, account_holder_name: e.target.value })}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypal_display_name">Nombre para mostrar (opcional)</Label>
                <Input
                  id="paypal_display_name"
                  value={paypalForm.display_name}
                  onChange={(e) => setPaypalForm({ ...paypalForm, display_name: e.target.value })}
                  placeholder="Ej: Mi PayPal"
                />
                <p className="text-xs text-muted-foreground">
                  Si no lo ingresas, se generará automáticamente
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  💡 Los retiros a PayPal solo están disponibles en USD
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={submitLoading}
                  className="flex-1 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-[#34A853] hover:bg-[#2d9548] cursor-pointer"
                >
                  {submitLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    'Agregar PayPal'
                  )}
                </Button>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Seguridad() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Detectar si el usuario tiene contraseña (proveedores de autenticación)
  const hasPasswordProvider = user?.providerData.some(
    provider => provider.providerId === 'password'
  );

  async function handleSendPasswordReset() {
    if (!user || !user.email) {
      setError('No se pudo obtener el correo del usuario');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      await sendPasswordResetEmail(auth, user.email, {
        url: 'https://yolohago.pe',
        handleCodeInApp: false
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error al enviar correo de recuperación:', error);
      
      if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Por favor, espera unos minutos e intenta de nuevo');
      } else {
        setError(error.message || 'Error al enviar el correo de recuperación');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user || !user.email) {
      setError('No se pudo obtener el correo del usuario');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      // Crear credencial de email/password
      const credential = EmailAuthProvider.credential(user.email, newPassword);
      
      // Vincular la credencial a la cuenta existente
      await linkWithCredential(user, credential);
      
      setSuccess(true);
      setShowAddPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error al agregar contraseña:', error);
      
      if (error.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Este correo ya está en uso');
      } else if (error.code === 'auth/provider-already-linked') {
        setError('Ya tienes una contraseña configurada');
      } else {
        setError(error.message || 'Error al agregar contraseña');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-2">Seguridad</h2>
      <p className="text-muted-foreground mb-6">
        Administra la seguridad de tu cuenta
      </p>

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm space-y-2">
          <p className="font-semibold">✓ {hasPasswordProvider ? 'Correo enviado exitosamente' : 'Contraseña agregada exitosamente'}</p>
          {hasPasswordProvider ? (
            <>
              <p className="text-xs">
                Hemos enviado un correo a <strong>{user?.email}</strong> con instrucciones para cambiar tu contraseña.
              </p>
              <p className="text-xs">
                Revisa tu bandeja de entrada y carpeta de spam.
              </p>
            </>
          ) : (
            <p className="text-xs">
              Ahora puedes iniciar sesión con tu correo y contraseña además de Google.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Métodos de autenticación actuales */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Métodos de inicio de sesión</h3>
          <div className="space-y-2">
            {user?.providerData.map((provider) => (
              <div key={provider.providerId} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {provider.providerId === 'google.com' && (
                  <>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Google</p>
                      <p className="text-xs text-muted-foreground">{provider.email}</p>
                    </div>
                  </>
                )}
                {provider.providerId === 'password' && (
                  <>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Lock weight="bold" className="text-primary-foreground" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Correo y contraseña</p>
                      <p className="text-xs text-muted-foreground">{provider.email}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Cambiar o agregar contraseña */}
        <div>
          {hasPasswordProvider ? (
            // Usuario ya tiene contraseña - mostrar opción de cambiar
            <>
              <h3 className="text-lg font-semibold mb-2">Cambiar contraseña</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Te enviaremos un correo con un enlace seguro para cambiar tu contraseña.
              </p>
              <Button
                onClick={handleSendPasswordReset}
                disabled={loading}
                className="bg-[#EA4335] hover:bg-[#d33426]"
              >
                {loading ? 'Enviando correo...' : 'Enviar correo para cambiar contraseña'}
              </Button>
            </>
          ) : (
            // Usuario no tiene contraseña - mostrar opción de agregar
            <>
              <h3 className="text-lg font-semibold mb-2">Agregar contraseña</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Actualmente solo puedes iniciar sesión con Google. Agrega una contraseña para también poder iniciar sesión con tu correo.
              </p>
              
              {!showAddPassword ? (
                <Button
                  onClick={() => setShowAddPassword(true)}
                  className="bg-[#4285F4] hover:bg-[#357ae8]"
                >
                  Agregar contraseña
                </Button>
              ) : (
                <form onSubmit={handleAddPassword} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddPassword(false);
                        setNewPassword('');
                        setConfirmPassword('');
                        setError('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-[#4285F4] hover:bg-[#357ae8]"
                    >
                      {loading ? 'Agregando...' : 'Agregar contraseña'}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        <Separator className="my-6" />

        <div>
          <h3 className="text-lg font-semibold mb-2">Autenticación de dos factores</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Agrega una capa adicional de seguridad a tu cuenta
          </p>
          <Button variant="outline" disabled>
            Configurar 2FA (Próximamente)
          </Button>
        </div>
      </div>
    </Card>
  );
}
