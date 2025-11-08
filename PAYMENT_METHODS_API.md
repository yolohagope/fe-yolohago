# API de Métodos de Pago

Guía completa para gestionar métodos de pago de usuarios (cuentas bancarias, Yape, Plin, PayPal, etc.)

## 📋 Tabla de Contenidos

- [Listar Métodos de Pago](#listar-métodos-de-pago)
- [Crear Cuenta Bancaria](#crear-cuenta-bancaria)
- [Crear Yape/Plin](#crear-yapeplin)
- [Crear PayPal](#crear-paypal)
- [Ver Detalle de Método](#ver-detalle-de-método)
- [Marcar como Principal](#marcar-como-principal)
- [Activar/Desactivar](#activardesactivar)
- [Eliminar Método](#eliminar-método)
- [Filtrar por Moneda](#filtrar-por-moneda)
- [Solicitar Retiro](#solicitar-retiro)

---

## 🔑 Autenticación

Todos los endpoints requieren autenticación. Incluye el token en el header:

```http
Authorization: Token tu_token_aqui
```

---

## 📝 Listar Métodos de Pago

Lista todos los métodos de pago del usuario autenticado.

**Endpoint:** `GET /api/payment-methods/`

**Respuesta exitosa:**

```json
[
  {
    "id": 1,
    "user": 1,
    "user_name": "Joel Ibaceta",
    "method_type": "bank_account",
    "method_type_display": "Cuenta Bancaria",
    "identifier": "191-12345678-0-12",
    "masked_identifier": "****5678",
    "display_name": "Mi BCP principal",
    "currency": "PEN",
    "currency_symbol": "S/",
    "details": {
      "bank_name": "BCP",
      "account_type": "savings",
      "account_holder_name": "Joel Ibaceta"
    },
    "is_primary": true,
    "is_verified": true,
    "is_active": true,
    "notes": "",
    "display_info": {
      "id": 1,
      "type": "bank_account",
      "type_display": "Cuenta Bancaria",
      "name": "Mi BCP principal",
      "identifier": "****5678",
      "currency": "PEN",
      "currency_symbol": "S/",
      "is_primary": true,
      "is_verified": true,
      "is_active": true
    },
    "created_at": "2025-11-08T10:00:00Z",
    "updated_at": "2025-11-08T10:00:00Z"
  },
  {
    "id": 2,
    "user": 1,
    "user_name": "Joel Ibaceta",
    "method_type": "yape",
    "method_type_display": "Yape",
    "identifier": "987654321",
    "masked_identifier": "***4321",
    "display_name": "Mi Yape",
    "currency": "PEN",
    "currency_symbol": "S/",
    "details": {
      "provider": "yape",
      "account_holder_name": "Joel Ibaceta"
    },
    "is_primary": false,
    "is_verified": true,
    "is_active": true,
    "notes": "",
    "display_info": {
      "id": 2,
      "type": "yape",
      "type_display": "Yape",
      "name": "Mi Yape",
      "identifier": "***4321",
      "currency": "PEN",
      "currency_symbol": "S/",
      "is_primary": false,
      "is_verified": true,
      "is_active": true
    },
    "created_at": "2025-11-08T11:00:00Z",
    "updated_at": "2025-11-08T11:00:00Z"
  }
]
```

### Filtros disponibles

**Por tipo:**
```bash
GET /api/payment-methods/?type=bank_account
GET /api/payment-methods/?type=yape
GET /api/payment-methods/?type=paypal
```

---

## 🏦 Crear Cuenta Bancaria

Registra una nueva cuenta bancaria como método de pago.

**Endpoint:** `POST /api/payment-methods/`

**Request body:**

```json
{
  "method_type": "bank_account",
  "display_name": "Mi BCP principal",
  "currency": "PEN",
  "is_primary": true,
  "bank_name": "BCP",
  "account_number": "191-12345678-0-12",
  "account_type": "savings",
  "account_holder_name": "Joel Ibaceta",
  "account_holder_dni": "12345678",
  "swift_code": "",
  "notes": "Cuenta para retiros"
}
```

**Campos:**

- `method_type`: **Requerido** - Siempre `"bank_account"` para cuentas bancarias
- `display_name`: **Requerido** - Nombre descriptivo (ej: "Mi BCP principal")
- `currency`: **Requerido** - `"PEN"` o `"USD"`
- `is_primary`: Opcional - `true` para marcar como principal (default: `false`)
- `bank_name`: **Requerido** - Nombre del banco (ej: "BCP", "BBVA", "Interbank")
- `account_number`: **Requerido** - Número de cuenta completo
- `account_type`: **Requerido** - `"savings"` (ahorros) o `"checking"` (corriente)
- `account_holder_name`: **Requerido** - Nombre del titular
- `account_holder_dni`: Opcional - DNI del titular
- `swift_code`: Opcional - Para transferencias internacionales
- `notes`: Opcional - Notas adicionales

**Respuesta exitosa:** `201 Created`

```json
{
  "id": 1,
  "user": 1,
  "user_name": "Joel Ibaceta",
  "method_type": "bank_account",
  "method_type_display": "Cuenta Bancaria",
  "identifier": "191-12345678-0-12",
  "masked_identifier": "****5678",
  "display_name": "Mi BCP principal",
  "currency": "PEN",
  "currency_symbol": "S/",
  "details": {
    "bank_name": "BCP",
    "account_type": "savings",
    "account_holder_name": "Joel Ibaceta"
  },
  "is_primary": true,
  "is_verified": false,
  "is_active": true,
  "notes": "Cuenta para retiros",
  "created_at": "2025-11-08T10:00:00Z",
  "updated_at": "2025-11-08T10:00:00Z"
}
```

**Errores comunes:**

```json
// 400 - Cuenta duplicada
{
  "account_number": ["Ya tienes esta cuenta registrada"]
}

// 400 - Tipo de método no válido
{
  "detail": "Tipo de método no soportado. Usa: bank_account, yape, plin, paypal, wallet"
}
```

---

## 📱 Crear Yape/Plin

Registra una billetera digital Yape o Plin.

**Endpoint:** `POST /api/payment-methods/`

### Yape

**Request body:**

```json
{
  "method_type": "yape",
  "wallet_type": "yape",
  "display_name": "Mi Yape",
  "currency": "PEN",
  "identifier": "987654321",
  "phone_number": "987654321",
  "account_holder_name": "Joel Ibaceta",
  "is_primary": false,
  "notes": ""
}
```

### Plin

**Request body:**

```json
{
  "method_type": "plin",
  "wallet_type": "plin",
  "display_name": "Mi Plin",
  "currency": "PEN",
  "identifier": "987654321",
  "phone_number": "987654321",
  "account_holder_name": "Joel Ibaceta",
  "is_primary": false,
  "notes": ""
}
```

**Campos:**

- `method_type`: **Requerido** - `"yape"` o `"plin"`
- `wallet_type`: **Requerido** - `"yape"` o `"plin"`
- `display_name`: **Requerido** - Nombre descriptivo
- `currency`: **Requerido** - `"PEN"` (Yape/Plin solo PEN)
- `identifier`: **Requerido** - Número de celular
- `phone_number`: **Requerido** - Número de celular (debe coincidir con identifier)
- `account_holder_name`: **Requerido** - Nombre del titular
- `is_primary`: Opcional - Marcar como principal
- `notes`: Opcional - Notas

**Respuesta exitosa:** `201 Created`

```json
{
  "id": 2,
  "user": 1,
  "user_name": "Joel Ibaceta",
  "method_type": "yape",
  "method_type_display": "Yape",
  "identifier": "987654321",
  "masked_identifier": "***4321",
  "display_name": "Mi Yape",
  "currency": "PEN",
  "currency_symbol": "S/",
  "details": {
    "provider": "yape",
    "account_holder_name": "Joel Ibaceta"
  },
  "is_primary": false,
  "is_verified": false,
  "is_active": true,
  "notes": "",
  "created_at": "2025-11-08T11:00:00Z",
  "updated_at": "2025-11-08T11:00:00Z"
}
```

---

## 💳 Crear PayPal

Registra una cuenta PayPal como método de pago.

**Endpoint:** `POST /api/payment-methods/`

**Request body:**

```json
{
  "method_type": "paypal",
  "wallet_type": "paypal",
  "display_name": "PayPal USA",
  "currency": "USD",
  "identifier": "joel@example.com",
  "account_email": "joel@example.com",
  "account_holder_name": "Joel Ibaceta",
  "is_primary": false,
  "notes": "Para retiros en dólares"
}
```

**Campos:**

- `method_type`: **Requerido** - `"paypal"`
- `wallet_type`: **Requerido** - `"paypal"`
- `display_name`: **Requerido** - Nombre descriptivo
- `currency`: **Requerido** - `"USD"` (PayPal generalmente USD)
- `identifier`: **Requerido** - Email de PayPal
- `account_email`: **Requerido** - Email de PayPal (debe coincidir con identifier)
- `account_holder_name`: **Requerido** - Nombre del titular
- `is_primary`: Opcional - Marcar como principal
- `notes`: Opcional - Notas

**Respuesta exitosa:** `201 Created`

```json
{
  "id": 3,
  "user": 1,
  "user_name": "Joel Ibaceta",
  "method_type": "paypal",
  "method_type_display": "PayPal",
  "identifier": "joel@example.com",
  "masked_identifier": "j***@example.com",
  "display_name": "PayPal USA",
  "currency": "USD",
  "currency_symbol": "$",
  "details": {
    "provider": "paypal",
    "account_holder_name": "Joel Ibaceta"
  },
  "is_primary": false,
  "is_verified": false,
  "is_active": true,
  "notes": "Para retiros en dólares",
  "created_at": "2025-11-08T12:00:00Z",
  "updated_at": "2025-11-08T12:00:00Z"
}
```

---

## 🔍 Ver Detalle de Método

Obtiene los detalles completos de un método de pago.

**Endpoint:** `GET /api/payment-methods/{id}/`

**Respuesta exitosa:** `200 OK`

```json
{
  "id": 1,
  "user": 1,
  "user_name": "Joel Ibaceta",
  "method_type": "bank_account",
  "method_type_display": "Cuenta Bancaria",
  "identifier": "191-12345678-0-12",
  "masked_identifier": "****5678",
  "display_name": "Mi BCP principal",
  "currency": "PEN",
  "currency_symbol": "S/",
  "details": {
    "bank_name": "BCP",
    "account_type": "savings",
    "account_holder_name": "Joel Ibaceta"
  },
  "is_primary": true,
  "is_verified": true,
  "is_active": true,
  "notes": "",
  "display_info": {
    "id": 1,
    "type": "bank_account",
    "type_display": "Cuenta Bancaria",
    "name": "Mi BCP principal",
    "identifier": "****5678",
    "currency": "PEN",
    "currency_symbol": "S/",
    "is_primary": true,
    "is_verified": true,
    "is_active": true
  },
  "created_at": "2025-11-08T10:00:00Z",
  "updated_at": "2025-11-08T10:00:00Z"
}
```

---

## ⭐ Marcar como Principal

Establece un método de pago como el principal. Automáticamente desmarca los demás.

**Endpoint:** `POST /api/payment-methods/{id}/set_primary/`

**Respuesta exitosa:** `200 OK`

```json
{
  "id": 2,
  "method_type": "yape",
  "display_name": "Mi Yape",
  "is_primary": true,
  ...
}
```

**Ejemplo de uso:**

```bash
curl -X POST http://localhost:8000/api/payment-methods/2/set_primary/ \
  -H "Authorization: Token tu_token_aqui"
```

---

## 🔄 Activar/Desactivar

### Desactivar

Desactiva un método de pago (no se podrá usar para retiros).

**Endpoint:** `POST /api/payment-methods/{id}/deactivate/`

**Respuesta exitosa:** `200 OK`

```json
{
  "id": 2,
  "is_active": false,
  ...
}
```

**Error:**

```json
// 400 - No se puede desactivar el método principal
{
  "detail": "No puedes desactivar tu método principal. Marca otro como principal primero."
}
```

### Activar

Reactiva un método de pago desactivado.

**Endpoint:** `POST /api/payment-methods/{id}/activate/`

**Respuesta exitosa:** `200 OK`

```json
{
  "id": 2,
  "is_active": true,
  ...
}
```

---

## 🗑️ Eliminar Método

Elimina un método de pago (no se puede eliminar el principal).

**Endpoint:** `DELETE /api/payment-methods/{id}/`

**Respuesta exitosa:** `204 No Content`

**Error:**

```json
// 400 - No se puede eliminar el método principal
{
  "detail": "No puedes eliminar tu método principal. Marca otro como principal primero."
}
```

---

## 💰 Filtrar por Moneda

Lista métodos agrupados por moneda (solo activos).

**Endpoint:** `GET /api/payment-methods/by_currency/`

**Respuesta exitosa:** `200 OK`

```json
{
  "PEN": [
    {
      "id": 1,
      "method_type": "bank_account",
      "display_name": "Mi BCP principal",
      "masked_identifier": "****5678",
      "currency": "PEN",
      "currency_symbol": "S/",
      "is_primary": true,
      ...
    },
    {
      "id": 2,
      "method_type": "yape",
      "display_name": "Mi Yape",
      "masked_identifier": "***4321",
      "currency": "PEN",
      "currency_symbol": "S/",
      "is_primary": false,
      ...
    }
  ],
  "USD": [
    {
      "id": 3,
      "method_type": "paypal",
      "display_name": "PayPal USA",
      "masked_identifier": "j***@example.com",
      "currency": "USD",
      "currency_symbol": "$",
      "is_primary": false,
      ...
    }
  ]
}
```

---

## 💸 Solicitar Retiro

Crea una solicitud de retiro usando un método de pago guardado.

**Endpoint:** `POST /api/withdrawal-requests/`

**Request body:**

```json
{
  "payment_method_id": 1,
  "amount": 500.00,
  "user_notes": "Retiro quincenal"
}
```

**Campos:**

- `payment_method_id`: **Requerido** - ID del método de pago a usar
- `amount`: **Requerido** - Monto a retirar
- `user_notes`: Opcional - Notas del usuario

**Respuesta exitosa:** `201 Created`

```json
{
  "id": 1,
  "user": 1,
  "user_name": "Joel Ibaceta",
  "payment_method": 1,
  "payment_method_display": "Cuenta Bancaria - Mi BCP principal (****5678)",
  "payment_method_type": "bank_account",
  "amount": "500.00",
  "currency": "PEN",
  "status": "pending",
  "status_display": "Pendiente",
  "user_notes": "Retiro quincenal",
  "admin_notes": "",
  "transaction": null,
  "requested_at": "2025-11-08T15:00:00Z",
  "processed_at": null
}
```

**Errores:**

```json
// 400 - Método de pago no encontrado o no pertenece al usuario
{
  "detail": "Método de pago no encontrado"
}

// 400 - Saldo insuficiente
{
  "detail": "Saldo insuficiente. Disponible: S/ 300.00"
}

// 400 - Método de pago inactivo
{
  "payment_method_id": ["El método de pago debe estar activo"]
}
```

---

## 📊 Flujo Completo de Usuario

### 1. Registrar métodos de pago

```bash
# Registrar cuenta bancaria principal
POST /api/payment-methods/
{
  "method_type": "bank_account",
  "display_name": "Mi BCP principal",
  "currency": "PEN",
  "is_primary": true,
  "bank_name": "BCP",
  "account_number": "191-12345678-0-12",
  "account_type": "savings",
  "account_holder_name": "Joel Ibaceta"
}

# Registrar Yape como alternativa
POST /api/payment-methods/
{
  "method_type": "yape",
  "wallet_type": "yape",
  "display_name": "Mi Yape",
  "currency": "PEN",
  "identifier": "987654321",
  "phone_number": "987654321",
  "account_holder_name": "Joel Ibaceta"
}

# Registrar PayPal para USD
POST /api/payment-methods/
{
  "method_type": "paypal",
  "wallet_type": "paypal",
  "display_name": "PayPal USA",
  "currency": "USD",
  "identifier": "joel@example.com",
  "account_email": "joel@example.com",
  "account_holder_name": "Joel Ibaceta"
}
```

### 2. Listar métodos disponibles

```bash
GET /api/payment-methods/
```

### 3. Solicitar retiro

```bash
# Ver balance disponible
GET /api/transactions/balance/

# Solicitar retiro usando método principal (ID 1)
POST /api/withdrawal-requests/
{
  "payment_method_id": 1,
  "amount": 500.00,
  "user_notes": "Retiro quincenal"
}
```

### 4. Gestionar métodos

```bash
# Cambiar método principal
POST /api/payment-methods/2/set_primary/

# Desactivar método temporal
POST /api/payment-methods/3/deactivate/

# Eliminar método no usado
DELETE /api/payment-methods/4/
```

---

## 🔒 Seguridad

### Identificadores enmascarados

La API siempre devuelve identificadores enmascarados para proteger datos sensibles:

- **Cuentas bancarias:** `****5678` (últimos 4 dígitos)
- **Emails (PayPal):** `j***@example.com` (primera letra + dominio)
- **Teléfonos (Yape/Plin):** `***4321` (últimos 4 dígitos)
- **Crypto:** `0x12ab...cd34` (primeros 6 + últimos 4)

### Verificación

Los métodos de pago requieren verificación admin antes de permitir retiros grandes:

- `is_verified`: `false` → Método pendiente de verificación
- `is_verified`: `true` → Método verificado por admin

---

## 📱 Ejemplo de UI

### Vista lista de métodos

```
Mis Métodos de Pago

⭐ Cuenta Bancaria - Mi BCP principal
   ****5678 | S/ | Verificado
   [Editar] [Desactivar]

   Yape - Mi Yape
   ***4321 | S/ | Verificado
   [Marcar principal] [Editar] [Eliminar]

   PayPal - PayPal USA
   j***@example.com | $ | Pendiente
   [Marcar principal] [Editar] [Eliminar]

[+ Agregar método de pago]
```

### Formulario solicitar retiro

```
Solicitar Retiro

Método de pago:
[ Dropdown: Mis Métodos de Pago ]
  - ⭐ Mi BCP principal (****5678) - S/
  - Mi Yape (***4321) - S/
  - PayPal USA (j***@example.com) - $

Monto: [______] S/
Disponible: S/ 1,500.00

Notas (opcional):
[________________________]

[Solicitar Retiro]
```

---

## 🚀 Testing

### cURL Examples

```bash
# Listar métodos
curl http://localhost:8000/api/payment-methods/ \
  -H "Authorization: Token tu_token"

# Crear cuenta bancaria
curl -X POST http://localhost:8000/api/payment-methods/ \
  -H "Authorization: Token tu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "method_type": "bank_account",
    "display_name": "Mi BCP",
    "currency": "PEN",
    "bank_name": "BCP",
    "account_number": "191-12345678-0-12",
    "account_type": "savings",
    "account_holder_name": "Joel Ibaceta"
  }'

# Solicitar retiro
curl -X POST http://localhost:8000/api/withdrawal-requests/ \
  -H "Authorization: Token tu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method_id": 1,
    "amount": 500.00,
    "user_notes": "Retiro quincenal"
  }'
```

---

## ❓ FAQs

**Q: ¿Puedo tener múltiples cuentas del mismo tipo?**  
A: Sí, puedes tener múltiples cuentas bancarias, Yapes, etc. Solo deben tener identificadores únicos.

**Q: ¿Qué pasa si elimino mi método principal?**  
A: No puedes eliminar el método principal. Primero marca otro como principal.

**Q: ¿Puedo cambiar la moneda de un método?**  
A: No, la moneda es fija al crear el método. Crea uno nuevo si necesitas otra moneda.

**Q: ¿Cuándo se verifica mi método de pago?**  
A: Un administrador verifica manualmente cada método. Los retiros pequeños pueden permitirse sin verificación.

**Q: ¿Puedo usar un método para retiros en otra moneda?**  
A: No, cada método solo soporta la moneda con la que fue registrado.

---

## 📞 Soporte

Para más información contacta al equipo de desarrollo.
