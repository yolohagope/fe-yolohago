import { ReactNode } from 'react';

interface HeroSectionProps {
  imageSrc: string;
  title: string | ReactNode;
  subtitle: string;
  children?: ReactNode;
  className?: string;
}

export function HeroSection({ 
  imageSrc, 
  title, 
  subtitle, 
  children,
  className = ''
}: HeroSectionProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <img 
          src={imageSrc}
          alt="Hero background"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 via-blue-700/60 to-purple-600/60"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto drop-shadow-lg">
            {subtitle}
          </p>
        </div>

        {/* Contenido adicional (buscador, botones, etc.) */}
        {children && (
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
