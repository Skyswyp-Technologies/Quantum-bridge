import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', color = 'white' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`
          ${sizeClasses[size]}
          border-gray-300
          rounded-full
          animate-spin
        `}
        style={{ borderTopColor: color }}
      ></div>
    </div>
  );
};

export default Loader;