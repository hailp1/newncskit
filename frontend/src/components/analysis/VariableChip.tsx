'use client';

import { X } from 'lucide-react';

interface VariableChipProps {
  name: string;
  onRemove: () => void;
  variant?: 'default' | 'compact';
}

/**
 * VariableChip Component
 * 
 * Displays a variable name as a chip with a remove button.
 * Includes hover effects for better user interaction.
 * 
 * Requirements: 5.4
 */
export default function VariableChip({ 
  name, 
  onRemove,
  variant = 'default'
}: VariableChipProps) {
  const isCompact = variant === 'compact';
  
  return (
    <div 
      className={`
        inline-flex items-center gap-1 
        bg-blue-50 text-blue-700 
        rounded-full border border-blue-200 
        hover:bg-blue-100 hover:border-blue-300
        hover:shadow-sm hover:scale-105
        transition-all duration-200
        group
        ${isCompact ? 'px-2 py-0.5' : 'px-3 py-1'}
      `}
    >
      <span className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
        {name}
      </span>
      <button
        onClick={onRemove}
        className="
          p-0.5 
          hover:bg-blue-200 
          rounded-full 
          transition-all duration-200
          hover:scale-110
          active:scale-95
          opacity-70 group-hover:opacity-100
          focus:outline-none 
          focus:ring-2 
          focus:ring-blue-400
          focus:ring-offset-1
        "
        title={`Remove ${name}`}
        aria-label={`Remove ${name} from group`}
      >
        <X className={isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </button>
    </div>
  );
}
