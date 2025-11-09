export type TaskCategory = string; // Mantenemos para compatibilidad con componentes existentes

export interface Category {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  banner_image?: string; // URL de la imagen de banner para la categoría
}

export interface Task {
  id: string | number;
  title: string;
  description: string;
  category: Category | string; // Puede ser objeto Category (del API) o string (mock data)
  category_id?: number;   // ID de la categoría (para referencia, deprecado)
  payment: string | number; // API devuelve string desde DecimalField, pero puede ser number en mock data
  currency: string;
  location: string;
  deadline: string;
  image?: string | null; // Imagen de la tarea (opcional)
  is_verified?: boolean; // Nuevo nombre del API
  isVerified?: boolean; // Nombre antiguo (mock data)
  poster_name?: string; // Nuevo nombre del API
  posterName?: string; // Nombre antiguo (mock data)
  poster_email?: string; // Del API
  tasker?: number | null; // ID del usuario que tomó la tarea
  tasker_name?: string | null;
  tasker_email?: string | null;
  has_contract?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  city: string;
  address: string;
  profile_photo: string | null;
  photo_url: string | null; // URL completa de la foto (puede ser de Google)
  rating: number; // Calificación promedio (0-5)
  rating_count: number; // Número de calificaciones recibidas
  tasks_published: number; // Número de tareas publicadas
  tasks_completed: number; // Número de tareas completadas
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  city?: string;
  address?: string;
  profile_photo?: File;
}

export interface Balance {
  id: number;
  user: number;
  user_name: string;
  user_email: string; // Campo adicional del API
  available_amount_pen: string; // API devuelve string desde DecimalField
  available_amount_usd: string;
  pending_amount_pen: string;
  pending_amount_usd: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  transaction_id: string;
  user: number;
  user_name: string;
  transaction_type: 'payment' | 'withdrawal' | 'refund' | 'fee';
  amount: string; // API devuelve string desde DecimalField
  signed_amount: string; // API devuelve string
  currency: 'PEN' | 'USD';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  contract: number | null;
  task_title: string | null;
  description: string;
  notes: string;
  metadata: Record<string, any>;
  created_at: string;
  completed_at: string | null;
}

export interface TransactionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
}

export type PaymentMethodType = 'bank_account' | 'yape' | 'plin' | 'paypal' | 'wallet';
export type Currency = 'PEN' | 'USD';
export type AccountType = 'savings' | 'checking';

export interface PaymentMethod {
  id: number;
  user: number;
  user_name: string;
  method_type: PaymentMethodType;
  method_type_display: string;
  identifier: string;
  masked_identifier: string;
  display_name: string;
  currency: Currency;
  currency_symbol: string;
  details: Record<string, any>;
  is_primary: boolean;
  is_verified: boolean;
  is_active: boolean;
  notes: string;
  display_info: {
    id: number;
    type: PaymentMethodType;
    type_display: string;
    name: string;
    identifier: string;
    currency: Currency;
    currency_symbol: string;
    is_primary: boolean;
    is_verified: boolean;
    is_active: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateBankAccountPayload {
  method_type: 'bank_account';
  display_name: string;
  currency: Currency;
  is_primary?: boolean;
  bank_name: string;
  account_number: string;
  account_type: AccountType;
  account_holder_name: string;
  account_holder_dni?: string;
  swift_code?: string;
  notes?: string;
}

export interface CreateYapePlinPayload {
  method_type: 'yape' | 'plin';
  wallet_type: 'yape' | 'plin';
  display_name: string;
  currency: 'PEN';
  identifier: string;
  phone_number: string;
  account_holder_name: string;
  is_primary?: boolean;
  notes?: string;
}

export interface CreatePayPalPayload {
  method_type: 'paypal';
  wallet_type: 'paypal';
  display_name: string;
  currency: Currency;
  identifier: string;
  account_email: string;
  account_holder_name: string;
  is_primary?: boolean;
  notes?: string;
}

export interface WithdrawalRequest {
  id: number;
  user: number;
  user_name: string;
  payment_method: number;
  payment_method_display: string;
  payment_method_type: PaymentMethodType;
  amount: string;
  currency: Currency;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  status_display: string;
  user_notes: string;
  admin_notes: string;
  transaction: number | null;
  requested_at: string;
  processed_at: string | null;
}

export interface CreateWithdrawalPayload {
  payment_method_id: number;
  amount: number;
  user_notes?: string;
}
