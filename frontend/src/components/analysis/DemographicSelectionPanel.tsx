'use client';

import { useState, useEffect } from 'react';
import { 
  AnalysisVariable, 
  DemographicSuggestion,
  DemographicVariable
} from '@/types/analysis';
import { DemographicService } from '@/services/demographic.service';
import { useVariableGroupingAutoSave } from '@/hooks/useVariableGroupingAutoSave';
import { useToast } from '@/components/ui/toast';
import { 
  Sparkles,
  Save,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import DemographicVariableRow from './DemographicVariableRow';
import DemographicConfigCard from './DemographicConfigCard';

interface DemographicSelectionPanelProps {
  variables: AnalysisVariable[];
  initialDemographics?: DemographicVariable[];
  onDemographicsChange: (demographics: DemographicVariable[]) => void;
  onSave: () => void;
}

export default function DemographicSelectionPanel({
  variables,
  initialDemographics,
  onDemographicsChange,
  onSave
}: DemographicSelectionPanelProps) {
  // Toast notifications
  const { showError, showSuccess } = useToast();
  
  const [demographics, setDemographics] = useState<DemographicVariable[]>(
    initialDemographics || []
  );
  const [suggestions, setSuggestions] = useState<DemographicSuggestion[]>([]);
  const [isDetecting, setIsDetecting] = useState(true);

  // Auto-save hook (Task 11: Auto-save functionality)
  const {
    hasUnsavedChanges,
    lastSaved,
    isSaving,
    saveNow,
    clearUnsavedChanges,
    retryStatus,
    saveError,
  } = useVariableGroupingAutoSave({
    projectId: variables[0]?.projectId || 'unknown',
    groups: [], // No groups in this panel
    demographics,
    interval: 30000, // 30 seconds
    enabled: true,
    onSave: async (data) => {
      // Import dynamically to avoid circular dependencies
      const { AnalysisService } = await import('@/services/analysis.service');
      await AnalysisService.saveGroupsAndDemographics(
        data.projectId,
        data.groups,
        data.demographics
      );
    },
  });

  // Auto-detect demographics on mount (Task 8.2)
  // Requirements: 4.1, 4.2, 4.5
  useEffect(() => {
    if (variables && variables.length > 0) {
      setIsDetecting(true);
      
      // Simulate async detection with slight delay for better UX
      setTimeout(() => {
        // Call detectDemographics() on component mount (Requirement 4.1, 4.2)
        const detected = DemographicService.detectDemographics(variables);
        setSuggestions(detected);
        
        // Auto-select high-confidence suggestions (> 0.8) (Requirement 4.5)
        const autoSelected = detected
          .filter(s => s.autoSelected) // autoSelected is already true when confidence > 0.8
          .map(s => ({
            ...s.variable,
            semanticName: DemographicService.generateSemanticName(s.variable.columnName),
            demographicType: s.type || 'categorical',
            isDemographic: true as const,
            confidence: s.confidence,
            reasons: s.reasons
          }));
        
        // Only set auto-selected if no initial demographics provided
        if (!initialDemographics || initialDemographics.length === 0) {
          setDemographics(autoSelected);
        }
        
        setIsDetecting(false);
      }, 500);
    } else {
      setIsDetecting(false);
    }
  }, [variables, initialDemographics]);

  // Notify parent of changes
  useEffect(() => {
    onDemographicsChange(demographics);
  }, [demographics, onDemographicsChange]);

  // Toggle demographic selection (Subtask 8.3)
  const toggleDemographic = (variable: AnalysisVariable) => {
    const exists = demographics.find(d => d.columnName === variable.columnName);
    
    if (exists) {
      // Remove from demographics list
      setDemographics(demographics.filter(d => d.columnName !== variable.columnName));
    } else {
      // Add to demographics list with smart defaults
      const suggestion = suggestions.find(s => s.variable.columnName === variable.columnName);
      
      const newDemographic: DemographicVariable = {
        ...variable,
        semanticName: DemographicService.generateSemanticName(variable.columnName),
        demographicType: suggestion?.type || DemographicService.detectDemographicType(variable),
        isDemographic: true as const,
        confidence: suggestion?.confidence,
        reasons: suggestion?.reasons
      };
      
      setDemographics([...demographics, newDemographic]);
    }
  };

  // Check if variable is selected as demographic
  const isDemographic = (columnName: string): boolean => {
    return demographics.some(d => d.columnName === columnName);
  };

  // Get suggestion for a variable
  const getSuggestion = (columnName: string): DemographicSuggestion | undefined => {
    return suggestions.find(s => s.variable.columnName === columnName);
  };

  // Update a demographic variable
  const updateDemographic = (columnName: string, updates: Partial<DemographicVariable>) => {
    setDemographics(demographics.map(d => 
      d.columnName === columnName ? { ...d, ...updates } : d
    ));
  };

  // Handle save (Task 12.3: Success/error feedback)
  const handleSave = async () => {
    try {
      // Save to database with retry logic
      await saveNow();
      
      // Call parent save handler
      onSave();
      
      // Show success message (Requirement 6.1)
      showSuccess(
        'Saved Successfully', 
        `${demographics.length} demographic variable${demographics.length !== 1 ? 's' : ''} saved to database`
      );
      clearUnsavedChanges();
    } catch (error) {
      // Show error message (Requirement 6.1, 7.4)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(
        'Save Failed', 
        `Failed to save after 3 retry attempts. Changes are stored locally and will be retried automatically. Error: ${errorMessage}`
      );
    }
  };

  // Show retry status toast (Task 12.3: Display retry status)
  useEffect(() => {
    if (retryStatus && retryStatus.isRetrying) {
      const { showWarning } = useToast();
      showWarning(
        'Retrying Save',
        `Attempt ${retryStatus.attempt} of ${retryStatus.maxAttempts}. Retrying in ${Math.pow(2, retryStatus.attempt - 1)} seconds...`
      );
    }
  }, [retryStatus]);

  // Show persistent error notification (Task 12.3)
  useEffect(() => {
    if (saveError && !isSaving) {
      showError(
        'Auto-save Failed',
        'Changes are stored locally and will be retried on next save attempt.'
      );
    }
  }, [saveError, isSaving, showError]);

  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return 'Saved just now';
    if (diffSecs < 120) return 'Saved 1 minute ago';
    if (diffSecs < 3600) return `Saved ${Math.floor(diffSecs / 60)} minutes ago`;
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Smart Detection Banner - Display detection results (Task 8.2) */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Sparkles className={`h-6 w-6 text-green-600 ${isDetecting ? 'animate-spin' : 'animate-pulse'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              {isDetecting ? 'Detecting Demographics...' : 'Smart Demographic Detection'}
              {!isDetecting && suggestions.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {suggestions.length} detected
                </span>
              )}
              {!isDetecting && demographics.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {demographics.filter(d => d.confidence && d.confidence > 0.8).length} auto-selected
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-700">
              {isDetecting ? (
                'Analyzing variables for demographic patterns...'
              ) : suggestions.length === 0 ? (
                'No demographic variables detected. You can manually select variables below.'
              ) : (
                <>
                  We automatically detected {suggestions.length} potential demographic variable{suggestions.length !== 1 ? 's' : ''} based on their names and data characteristics.
                  {demographics.length > 0 && (
                    <> Variables with high confidence (80%+) are pre-selected.</>
                  )} Review and adjust as needed.
                </>
              )}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Variable List with Checkboxes */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                Select Demographic Variables
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {demographics.length} of {variables.length} variables selected
              </p>
            </div>
            {demographics.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>{demographics.length} selected</span>
              </div>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
          {isDetecting ? (
            // Skeleton loading for variable rows
            <div className="space-y-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : variables.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No variables available</p>
            </div>
          ) : (
            variables.map(variable => {
              const isSelected = isDemographic(variable.columnName);
              const suggestion = getSuggestion(variable.columnName);
              const isAutoDetected = suggestion && suggestion.confidence > 0.8;

              return (
                <DemographicVariableRow
                  key={variable.id}
                  variable={variable}
                  isSelected={isSelected}
                  isAutoDetected={isAutoDetected}
                  suggestion={suggestion}
                  onToggle={() => toggleDemographic(variable)}
                  onConfigure={() => {
                    // Scroll to configuration section
                    const configSection = document.querySelector(`[data-config="${variable.columnName}"]`);
                    if (configSection) {
                      configSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Selected Demographics Configuration Section */}
      {demographics.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Configure Selected Demographics
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Set semantic names, types, and categories for each demographic variable
            </p>
          </div>

          <div className="p-4 space-y-4">
            {demographics.map(demo => (
              <div key={demo.columnName} data-config={demo.columnName}>
                <DemographicConfigCard
                  demographic={demo}
                  onUpdate={(updates) => updateDemographic(demo.columnName, updates)}
                  dataPreview={[]} // TODO: Pass actual data preview when available
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button with unsaved changes indicator (Task 11.3) */}
      {hasUnsavedChanges && demographics.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-shadow duration-200">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />
                  <span>Unsaved changes</span>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
                  {isSaving ? 'Saving...' : 'Save Demographics'}
                </button>
              </div>
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-gray-500 animate-in fade-in duration-200">
                  <Clock className="h-3 w-3" />
                  <span>{getLastSavedText()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
