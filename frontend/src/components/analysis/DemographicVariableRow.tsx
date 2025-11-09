'use client';

import { 
  AnalysisVariable, 
  DemographicSuggestion
} from '@/types/analysis';
import { 
  Sparkles,
  Settings
} from 'lucide-react';

interface DemographicVariableRowProps {
  variable: AnalysisVariable;
  isSelected: boolean;
  isAutoDetected: boolean;
  suggestion?: DemographicSuggestion;
  onToggle: () => void;
  onConfigure?: () => void;
}

/**
 * DemographicVariableRow Component
 * 
 * Displays a single variable row in the demographic selection panel with:
 * - Checkbox for selection
 * - Blue background for selected variables
 * - Green ring for auto-detected variables
 * - Confidence score and detection information
 * - Configure button for selected variables
 * 
 * Requirements: 3.2, 3.3, 4.2, 4.3, 4.5
 */
export default function DemographicVariableRow({
  variable,
  isSelected,
  isAutoDetected,
  suggestion,
  onToggle,
  onConfigure
}: DemographicVariableRowProps) {
  return (
    <div
      className={`
        flex items-center justify-between p-3 transition-all duration-200 cursor-pointer group
        ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100' : 'hover:bg-gray-50 hover:shadow-sm'}
        ${isAutoDetected && !isSelected ? 'ring-2 ring-green-300 ring-inset' : ''}
      `}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Checkbox - Subtask 9.1 */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          aria-label={`Select ${variable.columnName} as demographic variable`}
        />

        {/* Variable Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {variable.columnName}
            </span>
            
            {/* Auto-detected badge - Subtask 9.1 */}
            {isAutoDetected && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Auto-detected
              </span>
            )}
          </div>

          {/* Variable metadata */}
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <span>{variable.dataType}</span>
            <span>•</span>
            <span>{variable.uniqueCount} unique values</span>
            {variable.missingCount > 0 && (
              <>
                <span>•</span>
                <span className="text-orange-600">
                  {variable.missingCount} missing
                </span>
              </>
            )}
          </div>

          {/* Suggestion information - Subtask 9.2 */}
          {suggestion && (
            <div className="mt-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                {/* Confidence score - Subtask 9.2 */}
                <span className="font-medium">
                  Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                </span>
                {/* Detected type - Subtask 9.2 */}
                {suggestion.type && (
                  <>
                    <span>•</span>
                    <span>Type: {suggestion.type}</span>
                  </>
                )}
              </div>
              {/* Reasons for suggestion - Subtask 9.2 */}
              {suggestion.reasons && suggestion.reasons.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {suggestion.reasons.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Configure button - Subtask 9.3 */}
        {isSelected && onConfigure && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfigure();
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-sm opacity-0 group-hover:opacity-100"
            aria-label={`Configure ${variable.columnName}`}
          >
            <Settings className="h-4 w-4" />
            Configure
          </button>
        )}
      </div>
    </div>
  );
}
