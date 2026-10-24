import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  count = 1,
}) => {
  const baseClasses = 'animate-pulse bg-amber-200/50 rounded-lg';
  const variantClass = variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'h-4 rounded' : '';

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${baseClasses} ${variantClass} ${className}`} />
      ))}
    </>
  );
};
