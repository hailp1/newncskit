'use client';

import { useState, useEffect } from 'react';
import { 
  AnalysisVariable, 
  DemographicType, 
  RankDefinition 
} from '@/types/analysis';
import { DemographicService } from '@/services/demographic.service';
import RankCreator from './RankCreator';
import { 
  Users, 
  Check, 
  Settings, 
  ChevronRight,
  Sparkles,
  Save
} from 'lucide-react';

interface DemographicVariable extends AnalysisVariable {
  semanticName?: string;
  demographicType?: DemographicType;
  ranks?: RankDefinition[];
  ordinalCategories?: string[];
}

interface DemographicConfigProps {
  projectId: string;
  variables: AnalysisVariable[];
  onSave: (demographics: DemographicVariable[]) => void;
  onCancel?: () => void;
}

export default function DemographicConfig({
  projectId,
  variables,
  onSave,
  onCancel,
}: DemographicConfigProps) {
  const [demographics, setDemographics] = useState<DemographicVariable[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  const [showRankCreator, setShowRankCreator] = useState(false);
  const [rankCreatorData, setRankCreatorData] = useState<{
    variable: DemographicVariable;
    dataPreview: number[];
  } | null>(null);

  // Get AI suggestions on mount
  useEffect(() => {
    const suggested = DemographicService.suggestDemographics(variables);
    setSuggestions(suggested);
  }, [variables]);

  const isDemographic = (columnName: string) => {
    return demographics.some(d => d.columnName === columnName);
  };

  const toggleDemographic = (variable: AnalysisVariable) => {
    if (isDemographic(variable.columnName)) {
      // Remove from demographics
      setDemographics(demographics.filter(d => d.columnName !== variable.columnName));
    } else {
      // Add to demographics with defaults
      const semanticName = DemographicService.suggestSemanticName(variable.columnName);
      const demographicType = DemographicService.detectDemographicType(variable);

      setDemographics([
        ...demographics,
        {
          ...variable,
          semanticName,
          demographicType,
          isDemographic: true,
        },
      ]);
    }
  };

  const updateDemographic = (
    columnName: string,
    updates: Partial<DemographicVariable>
  ) => {
    setDemographics(
      demographics.map(d =>
        d.columnName === columnName ? { ...d, ...updates } : d
      )
    );
  };

  const openRankCreator = (demographic: DemographicVariable) => {
    // Generate sample data for preview
    // In real implementation, this would come from the actual CSV data
    const sampleData = generateSampleData(demographic);
    
    setRankCreatorData({
      variable: demographic,
      dataPreview: sampleData,
    });
    setShowRankCreator(true);
  };

  const handleRanksSave = (ranks: RankDefinition[]) => {
    if (rankCreatorData) {
      updateDemographic(rankCreatorData.variable.columnName, { ranks });
      setShowRankCreator(false);
      setRankCreatorData(null);
    }
  };

  const handleSave = () => {
    onSave(demographics);
  };

  // Generate sample data based on variable stats
  const generateSampleData = (variable: AnalysisVariable): number[] => {
    const min = variable.minValue || 0;
    const max = variable.maxValue || 100;
    const mean = variable.meanValue || (min + max) / 2;
    
    // Generate 100 sample points with normal distribution
    const samples: number[] = [];
    for (let i = 0; i < 100; i++) {
      const random = Math.random();
      const value = min + (max - min) * random;
      samples.push(Math.round(value * 100) / 100);
    }
    
    return samples;
  };

  if (showRankCreator && rankCreatorData) {
    return (
      <RankCreator
        variableName={rankCreatorData.variable.columnName}
        dataPreview={rankCreatorData.dataPreview}
        existingRanks={rankCreatorData.variable.ranks}
        onSave={handleRanksSave}
        onCancel={() => {
          setShowRankCreator(false);
          setRankCreatorData(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demographic Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">
            Select and configure demographic variables for group comparisons
          </p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            These variables appear to be demographic based on their names:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((varName) => {
              const variable = variables.find(v => v.columnName === varName);
              if (!variable) return null;

              return (
                <button
                  key={varName}
                  onClick={() => toggleDemographic(variable)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${isDemographic(varName)
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                    }
                  `}
                >
                  {isDemographic(varName) && <Check className="w-3 h-3 inline mr-1" />}
                  {varName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Variable List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">All Variables</h3>
              <p className="text-sm text-gray-600 mt-1">
                Click to select demographic variables
              </p>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {variables.map((variable) => {
                const isSelected = isDemographic(variable.columnName);
                const demographic = demographics.find(
                  d => d.columnName === variable.columnName
                );

                return (
                  <div
                    key={variable.id}
                    className={`
                      p-4 cursor-pointer transition-colors
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => {
                      toggleDemographic(variable);
                      setSelectedVariable(variable.columnName);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center
                            ${isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                            }
                          `}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {variable.columnName}
                            </p>
                            {suggestions.includes(variable.columnName) && (
                              <Sparkles className="w-4 h-4 text-purple-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {variable.dataType} • {variable.uniqueCount} unique values
                          </p>
                        </div>
                      </div>

                      {isSelected && demographic && (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Configuration Panel (shown when selected) */}
                    {isSelected && demographic && selectedVariable === variable.columnName && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                        {/* Semantic Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Semantic Name
                          </label>
                          <input
                            type="text"
                            value={demographic.semanticName || ''}
                            onChange={(e) =>
                              updateDemographic(variable.columnName, {
                                semanticName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., age, gender, income"
                          />
                        </div>

                        {/* Demographic Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Variable Type
                          </label>
                          <select
                            value={demographic.demographicType || 'categorical'}
                            onChange={(e) =>
                              updateDemographic(variable.columnName, {
                                demographicType: e.target.value as DemographicType,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="categorical">Categorical (Nominal)</option>
                            <option value="ordinal">Ordinal (Ordered)</option>
                            <option value="continuous">Continuous (Numeric)</option>
                          </select>
                        </div>

                        {/* Create Ranks Button (for continuous) */}
                        {demographic.demographicType === 'continuous' && (
                          <button
                            onClick={() => openRankCreator(demographic)}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            {demographic.ranks ? 'Edit Ranks' : 'Create Ranks'}
                            {demographic.ranks && (
                              <span className="text-xs bg-purple-500 px-2 py-0.5 rounded-full">
                                {demographic.ranks.length} ranks
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Summary</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Demographics Selected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {demographics.length}
                </p>
              </div>

              {demographics.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected Variables:</p>
                  <div className="space-y-2">
                    {demographics.map((demo) => (
                      <div
                        key={demo.columnName}
                        className="p-2 bg-blue-50 rounded border border-blue-100"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {demo.semanticName || demo.columnName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {demo.demographicType}
                          {demo.ranks && ` • ${demo.ranks.length} ranks`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {demographics.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No demographics selected</p>
                  <p className="text-xs mt-1">
                    Select variables from the list
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
