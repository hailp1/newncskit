'use client';

import { useState } from 'react';
import { 
  DemographicVariable,
  DemographicType,
  RankDefinition
} from '@/types/analysis';
import { 
  Edit2,
  Check,
  X,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import RankCreator from './RankCreator';

interface DemographicConfigCardProps {
  demographic: DemographicVariable;
  onUpdate: (updates: Partial<DemographicVariable>) => void;
  dataPreview?: number[]; // For rank creation preview
}

/**
 * DemographicConfigCard Component
 * 
 * Displays configuration options for a selected demographic variable:
 * - Editable semantic name (Subtask 10.1)
 * - Type selection dropdown (Subtask 10.2)
 * - Rank/category configuration (Subtask 10.3)
 * 
 * Requirements: 3.3, 4.4
 */
export default function DemographicConfigCard({
  demographic,
  onUpdate,
  dataPreview = []
}: DemographicConfigCardProps) {
  // Subtask 10.1: Semantic name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(demographic.semanticName);
  
  // Subtask 10.3: Rank/category configuration state
  const [showRankCreator, setShowRankCreator] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Subtask 10.1: Handle semantic name save
  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdate({ semanticName: editedName.trim() });
      setIsEditingName(false);
    }
  };

  // Subtask 10.1: Handle semantic name cancel
  const handleCancelName = () => {
    setEditedName(demographic.semanticName);
    setIsEditingName(false);
  };

  // Subtask 10.2: Handle type change
  const handleTypeChange = (newType: DemographicType) => {
    onUpdate({ demographicType: newType });
  };

  // Subtask 10.3: Handle rank save
  const handleSaveRanks = (ranks: RankDefinition[]) => {
    onUpdate({ ranks });
    setShowRankCreator(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">
                {demographic.columnName}
              </span>
            </div>
            
            {/* Subtask 10.1: Semantic Name Editing */}
            <div className="mt-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleCancelName();
                    }}
                    className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter semantic name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    title="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancelName}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {demographic.semanticName}
                  </h4>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit semantic name"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Confidence and Reasons */}
        {demographic.confidence && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">
              Confidence: {(demographic.confidence * 100).toFixed(0)}%
            </span>
            {demographic.reasons && demographic.reasons.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                ({demographic.reasons.join(', ')})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Configuration Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Subtask 10.2: Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demographic Type
            </label>
            <select
              value={demographic.demographicType}
              onChange={(e) => handleTypeChange(e.target.value as DemographicType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="categorical">Categorical (Nominal)</option>
              <option value="ordinal">Ordinal (Ordered Categories)</option>
              <option value="continuous">Continuous (Numeric Ranges)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {demographic.demographicType === 'categorical' && 
                'Unordered categories (e.g., gender, location)'}
              {demographic.demographicType === 'ordinal' && 
                'Ordered categories (e.g., education level, income bracket)'}
              {demographic.demographicType === 'continuous' && 
                'Numeric values that can be grouped into ranges (e.g., age)'}
            </p>
          </div>

          {/* Subtask 10.3: Rank/Category Configuration */}
          {(demographic.demographicType === 'ordinal' || demographic.demographicType === 'continuous') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {demographic.demographicType === 'continuous' ? 'Rank Ranges' : 'Category Order'}
                </label>
                <button
                  onClick={() => setShowRankCreator(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {demographic.ranks && demographic.ranks.length > 0 ? 'Edit Ranks' : 'Create Ranks'}
                </button>
              </div>

              {/* Show existing ranks */}
              {demographic.ranks && demographic.ranks.length > 0 && (
                <div className="space-y-2">
                  {demographic.ranks.map((rank, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {rank.label}
                      </span>
                      <span className="text-xs text-gray-600">
                        {rank.isOpenEndedMin && rank.maxValue !== undefined && `< ${rank.maxValue}`}
                        {rank.isOpenEndedMax && rank.minValue !== undefined && `> ${rank.minValue}`}
                        {!rank.isOpenEndedMin && !rank.isOpenEndedMax && 
                          rank.minValue !== undefined && rank.maxValue !== undefined &&
                          `${rank.minValue} - ${rank.maxValue}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {(!demographic.ranks || demographic.ranks.length === 0) && (
                <p className="text-sm text-gray-500 italic">
                  No ranks defined. Click "Create Ranks" to set up ranges.
                </p>
              )}
            </div>
          )}

          {/* Subtask 10.3: Category List for Nominal */}
          {demographic.demographicType === 'categorical' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              
              {demographic.ordinalCategories && demographic.ordinalCategories.length > 0 ? (
                <div className="space-y-2">
                  {demographic.ordinalCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <span className="text-sm text-gray-900">{category}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  Categories will be automatically detected from your data values.
                </div>
              )}
            </div>
          )}

          {/* Variable Metadata */}
          <div className="pt-3 border-t border-gray-200">
            <h5 className="text-xs font-semibold text-gray-700 mb-2">Variable Information</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Data Type:</span>
                <span className="ml-2 font-medium text-gray-900">{demographic.dataType}</span>
              </div>
              <div>
                <span className="text-gray-600">Unique Values:</span>
                <span className="ml-2 font-medium text-gray-900">{demographic.uniqueCount}</span>
              </div>
              {demographic.missingCount > 0 && (
                <div>
                  <span className="text-gray-600">Missing:</span>
                  <span className="ml-2 font-medium text-orange-600">{demographic.missingCount}</span>
                </div>
              )}
              {demographic.minValue !== undefined && demographic.maxValue !== undefined && (
                <div>
                  <span className="text-gray-600">Range:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {demographic.minValue} - {demographic.maxValue}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rank Creator Modal */}
      {showRankCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <RankCreator
                variableName={demographic.semanticName}
                dataPreview={dataPreview}
                existingRanks={demographic.ranks}
                onSave={handleSaveRanks}
                onCancel={() => setShowRankCreator(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
