import { useState } from 'react';
import { CheckCircle, XCircle, IdentificationCard, EnvelopeSimple, Phone, Upload, Clock } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

type VerificationStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: VerificationStatus;
  icon: any;
}

export function Verificacion() {
  const [identityFrontFile, setIdentityFrontFile] = useState<File | null>(null);
  const [identityBackFile, setIdentityBackFile] = useState<File | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulación de estados - esto vendría del backend
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'identity',
      title: 'Verificación de Identidad',
      description: 'Carga tu DNI o documento de identidad (ambos lados)',
      status: 'not_started',
      icon: IdentificationCard
    },
    {
      id: 'email',
      title: 'Verificación de Correo Electrónico',
      description: 'Confirma tu dirección de correo',
      status: 'not_started',
      icon: EnvelopeSimple
    },
    {
      id: 'phone',
      title: 'Verificación de Teléfono',
      description: 'Verifica tu número de celular',
      status: 'not_started',
      icon: Phone
    }
  ]);

  const getStatusBadge = (status: VerificationStatus) => {
    const config = {
      not_started: { label: 'No iniciado', color: 'bg-gray-100 text-gray-700', icon: null },
      pending: { label: 'En revisión', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      verified: { label: 'Verificado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    const statusConfig = config[status];
    const Icon = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${statusConfig.color}`}>
        {Icon && <Icon size={14} weight="fill" />}
        {statusConfig.label}
      </span>
    );
  };

  const handleIdentityUpload = async () => {
    if (!identityFrontFile || !identityBackFile) {
      alert('Por favor selecciona ambos lados del documento');
      return;
    }

    setLoading(true);
    try {
      // Aquí iría la llamada al API para subir los documentos
      // await uploadIdentityDocuments(identityFrontFile, identityBackFile);
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setVerificationSteps(prev => prev.map(step => 
        step.id === 'identity' ? { ...step, status: 'pending' } : step
      ));
      
      alert('Documentos subidos exitosamente. En revisión.');
    } catch (error) {
      alert('Error al subir los documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailVerification = async () => {
    setLoading(true);
    try {
      // Aquí iría la llamada al API
      // await sendEmailVerification();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailVerificationSent(true);
      
      setVerificationSteps(prev => prev.map(step => 
        step.id === 'email' ? { ...step, status: 'pending' } : step
      ));
    } catch (error) {
      alert('Error al enviar correo de verificación');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Por favor ingresa un número de teléfono válido');
      return;
    }

    setLoading(true);
    try {
      // Aquí iría la llamada al API
      // await sendSMSVerification(phoneNumber);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSmsSent(true);
    } catch (error) {
      alert('Error al enviar SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      alert('Por favor ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      // Aquí iría la llamada al API
      // await verifyOTP(phoneNumber, otpCode);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerificationSteps(prev => prev.map(step => 
        step.id === 'phone' ? { ...step, status: 'verified' } : step
      ));
      
      alert('Teléfono verificado exitosamente');
    } catch (error) {
      alert('Código OTP inválido');
    } finally {
      setLoading(false);
    }
  };

  const allVerified = verificationSteps.every(step => step.status === 'verified');
  const anyPending = verificationSteps.some(step => step.status === 'pending');

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Verificación de Cuenta</h2>
        <p className="text-muted-foreground">
          Completa los siguientes pasos para verificar tu cuenta y acceder a todas las funcionalidades
        </p>
      </div>

      {/* Alerta informativa */}
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Clock className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-800 ml-2">
          <p className="font-semibold mb-1">Proceso de verificación manual</p>
          <p className="text-sm">
            La verificación de identidad requiere revisión manual y puede consultar fuentes adicionales 
            por seguridad. El proceso puede tomar hasta <strong>48 horas</strong>. Te notificaremos 
            por correo cuando tu cuenta sea verificada.
          </p>
        </AlertDescription>
      </Alert>

      {allVerified && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" weight="fill" />
          <AlertDescription className="text-green-800 ml-2">
            <p className="font-semibold">¡Cuenta completamente verificada! ✓</p>
            <p className="text-sm mt-1">
              Tu cuenta ha sido verificada exitosamente. Ahora tienes acceso completo a todas las funcionalidades.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {anyPending && !allVerified && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <Clock className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800 ml-2">
            <p className="font-semibold">Verificación en proceso</p>
            <p className="text-sm mt-1">
              Estamos revisando tu información. Te notificaremos cuando el proceso esté completo.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de pasos de verificación */}
      <div className="space-y-6">
        {/* Verificación de Identidad */}
        <Card className="p-6 border-2 border-gray-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <IdentificationCard size={24} weight="bold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Verificación de Identidad</h3>
                <p className="text-sm text-muted-foreground">
                  Carga tu DNI o documento de identidad (ambos lados)
                </p>
              </div>
            </div>
            {getStatusBadge(verificationSteps.find(s => s.id === 'identity')?.status || 'not_started')}
          </div>

          {verificationSteps.find(s => s.id === 'identity')?.status === 'not_started' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="front">Frente del documento</Label>
                  <div className="mt-2">
                    <Input
                      id="front"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIdentityFrontFile(e.target.files?.[0] || null)}
                    />
                    {identityFrontFile && (
                      <p className="text-xs text-green-600 mt-1">✓ {identityFrontFile.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="back">Reverso del documento</Label>
                  <div className="mt-2">
                    <Input
                      id="back"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIdentityBackFile(e.target.files?.[0] || null)}
                    />
                    {identityBackFile && (
                      <p className="text-xs text-green-600 mt-1">✓ {identityBackFile.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  • Asegúrate de que la foto sea clara y legible<br />
                  • Formatos aceptados: JPG, PNG<br />
                  • Tamaño máximo: 5MB por archivo
                </p>
              </div>

              <Button
                onClick={handleIdentityUpload}
                disabled={loading || !identityFrontFile || !identityBackFile}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <Upload className="mr-2" size={18} weight="bold" />
                {loading ? 'Subiendo...' : 'Subir documentos'}
              </Button>
            </div>
          )}

          {verificationSteps.find(s => s.id === 'identity')?.status === 'pending' && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                Tus documentos están en revisión. Recibirás una notificación cuando el proceso esté completo.
              </p>
            </div>
          )}
        </Card>

        {/* Verificación de Email */}
        <Card className="p-6 border-2 border-gray-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <EnvelopeSimple size={24} weight="bold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Verificación de Correo Electrónico</h3>
                <p className="text-sm text-muted-foreground">
                  Confirma tu dirección de correo
                </p>
              </div>
            </div>
            {getStatusBadge(verificationSteps.find(s => s.id === 'email')?.status || 'not_started')}
          </div>

          {verificationSteps.find(s => s.id === 'email')?.status === 'not_started' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Te enviaremos un correo con un enlace de verificación. Haz clic en el enlace para confirmar tu dirección.
              </p>

              <Button
                onClick={handleSendEmailVerification}
                disabled={loading || emailVerificationSent}
                className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
              >
                <EnvelopeSimple className="mr-2" size={18} weight="bold" />
                {loading ? 'Enviando...' : emailVerificationSent ? 'Correo enviado' : 'Enviar correo de verificación'}
              </Button>

              {emailVerificationSent && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ Correo enviado. Revisa tu bandeja de entrada y carpeta de spam.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Verificación de Teléfono */}
        <Card className="p-6 border-2 border-gray-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Phone size={24} weight="bold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Verificación de Teléfono</h3>
                <p className="text-sm text-muted-foreground">
                  Verifica tu número de celular
                </p>
              </div>
            </div>
            {getStatusBadge(verificationSteps.find(s => s.id === 'phone')?.status || 'not_started')}
          </div>

          {verificationSteps.find(s => s.id === 'phone')?.status === 'not_started' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Número de celular</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="987654321"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={9}
                    className="flex-1"
                    disabled={smsSent}
                  />
                  <Button
                    onClick={handleSendSMS}
                    disabled={loading || smsSent || !phoneNumber}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer"
                  >
                    {loading ? 'Enviando...' : 'Enviar SMS'}
                  </Button>
                </div>
              </div>

              {smsSent && (
                <>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      ✓ SMS enviado a {phoneNumber}. Ingresa el código de 6 dígitos que recibiste.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="otp">Código de verificación</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={loading || !otpCode || otpCode.length !== 6}
                        className="bg-green-600 hover:bg-green-700 cursor-pointer"
                      >
                        {loading ? 'Verificando...' : 'Verificar'}
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="link"
                    onClick={() => {
                      setSmsSent(false);
                      setOtpCode('');
                    }}
                    className="text-sm cursor-pointer"
                  >
                    ¿No recibiste el código? Reenviar
                  </Button>
                </>
              )}
            </div>
          )}

          {verificationSteps.find(s => s.id === 'phone')?.status === 'verified' && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                ✓ Teléfono verificado exitosamente
              </p>
            </div>
          )}
        </Card>
      </div>
    </Card>
  );
}
