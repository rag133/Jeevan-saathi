import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon - Using actual image or fallback */}
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        {!imageError ? (
          <img 
            src="/Jeevan Saathi Logo.png" 
            alt="Jeevan Saathi Logo" 
            className={`${sizeClasses[size]} object-contain`}
            onError={handleImageError}
          />
        ) : (
          // Fallback icon when image fails to load
          <div className={`${sizeClasses[size]} bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center`}>
            <span className="text-white font-bold text-xs">JS</span>
          </div>
        )}
      </div>
      
      {/* Brand Name */}
      {showText && (
        <h1 className={`${textSizes[size]} font-bold text-gray-900`}>
          Jeevan Saathi
        </h1>
      )}
    </div>
  );
};

export default Logo; 