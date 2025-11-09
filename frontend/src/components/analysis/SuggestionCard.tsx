'use client';

import { useState } from 'react';
import { VariableGroupSuggestion } from '@/types/analysis';
import { Check, X } from 'lucide-react';

interface SuggestionCardProps {
  suggestion: VariableGroupSuggestion;
  onAccept: () => void;
  onReject: () => void;
}

/**
 * SuggestionCard Component
 * 
 * Displays a variable grouping suggestion with confidence score and reasoning.
 * Provides accept/reject actions for user to confirm or dismiss the suggestion.
 * 
 * Requirements: 2.1, 6.1 (animations)
 */
export default function SuggestionCard({ 
  suggestion, 
  onAccept, 
  onReject 
}: SuggestionCardProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleAccept = () => {
    setIsExiting(true);
    setTimeout(() => onAccept(), 300);
  };

  const handleReject = () => {
    setIsExiting(true);
    setTimeout(() => onReject(), 300);
  };

  return (
    <div 
      className={`
        bg-white rounded-lg p-3 border border-blue-100 hover:border-blue-300 
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'}
        animate-in fade-in slide-in-from-left-4 duration-300
      `}
    >
      <div className="flex items-start justify-between">
        {/* Suggestion Content */}
        <div className="flex-1">
          {/* Group Name and Confidence */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">
              {suggestion.suggestedName}
            </h4>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
              {Math.round(suggestion.confidence * 100)}% confidence
            </span>
          </div>
          
          {/* Reason for Grouping */}
          <p className="text-sm text-gray-600 mb-2">
            {suggestion.reason}
          </p>
          
          {/* Variable Preview */}
          <div className="flex flex-wrap gap-1">
            {suggestion.variables.slice(0, 5).map((varName) => (
              <span
                key={varName}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
              >
                {varName}
              </span>
            ))}
            {suggestion.variables.length > 5 && (
              <span className="text-xs px-2 py-1 text-gray-500">
                +{suggestion.variables.length - 5} more
              </span>
            )}
          </div>
        </div>
        
        {/* Accept/Reject Buttons */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleAccept}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            title="Accept suggestion"
            aria-label="Accept suggestion"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleReject}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            title="Reject suggestion"
            aria-label="Reject suggestion"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
