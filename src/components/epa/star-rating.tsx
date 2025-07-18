
"use client";
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  starCount?: number;
}

export function StarRating({ rating, onRatingChange, starCount = 5 }: StarRatingProps) {
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
              "cursor-pointer transition-colors",
              starValue <= (hover || rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
            )}
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        );
      })}
    </div>
  );
}
