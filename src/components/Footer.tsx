import { Link } from 'react-router-dom';
import { 
  InstagramLogo, 
  FacebookLogo, 
  TwitterLogo, 
  LinkedinLogo,
  EnvelopeSimple,
  Phone,
  MapPin
} from '@phosphor-icons/react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1: Sobre YoLoHago */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">YoLoHago</h3>
            <p className="text-sm text-gray-300 mb-4">
              La plataforma que conecta a personas que necesitan ayuda con profesionales calificados en Lima, Perú.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <InstagramLogo size={20} weight="fill" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <FacebookLogo size={20} weight="fill" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <TwitterLogo size={20} weight="fill" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <LinkedinLogo size={20} weight="fill" />
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explorar" className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Explorar tareas
                </Link>
              </li>
              <li>
                <Link to="/publicar" className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Publicar tarea
                </Link>
              </li>
              <li>
                <Link to="/mis-tareas" className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Mis tareas
                </Link>
              </li>
              <li>
                <Link to="/cuenta" className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Mi cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Soporte */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Centro de ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Política de privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <EnvelopeSimple size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <a 
                  href="mailto:contacto@yolohago.pe" 
                  className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  contacto@yolohago.pe
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <a 
                  href="tel:+51987654321" 
                  className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  +51 987 654 321
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">
                  Lima, Perú
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} YoLoHago. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                Cookies
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                Privacidad
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                Legal
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
