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

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon - Using actual image */}
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <img 
          src="/Jeevan Saathi Logo.png" 
          alt="Jeevan Saathi Logo" 
          className={`${sizeClasses[size]} object-contain`}
        />
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