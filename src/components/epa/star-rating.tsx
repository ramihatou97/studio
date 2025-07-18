
"use client";
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  starCount?: number;
  disabled?: boolean;
}

export function StarRating({ rating, onRatingChange, starCount = 5, disabled = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center">
      {[...Array(starCount)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            className={cn(
              "transition-colors",
              disabled ? "cursor-not-allowed" : "cursor-pointer",
              starValue <= (hover || rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
            )}
            onClick={() => !disabled && onRatingChange(starValue)}
            onMouseEnter={() => !disabled && setHover(starValue)}
            onMouseLeave={() => !disabled && setHover(0)}
            disabled={disabled}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        );
      })}
    </div>
  );
}
