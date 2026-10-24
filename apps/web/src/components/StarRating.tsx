import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 3
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 3,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';

  return (
    <div className="flex items-center gap-1.5 justify-center py-1">
      {Array.from({ length: maxStars }, (_, i) => {
        const isFilled = i < rating;
        return (
          <Star
            key={i}
            className={`${iconSize} transition-all duration-300 ${
              isFilled
                ? 'fill-amber-400 text-amber-500 scale-110 drop-shadow-md animate-bounce'
                : 'text-amber-200 fill-amber-100'
            }`}
          />
        );
      })}
    </div>
  );
};
