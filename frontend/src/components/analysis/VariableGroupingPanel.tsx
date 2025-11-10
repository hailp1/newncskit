'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  AnalysisVariable, 
  VariableGroup, 
  VariableGroupSuggestion,
  VariableRoleTag,
  RoleSuggestion,
  AnalysisModelValidation,
  VariableRole
} from '@/types/analysis';
import { VariableGroupingService } from '@/services/variable-grouping.service';
import { RoleSuggestionService } from '@/services/role-suggestion.service';
import { RoleValidationService } from '@/services/role-validation.service';
import { useVariableGroupingAutoSave } from '@/hooks/useVariableGroupingAutoSave';
import { useToast } from '@/components/ui/toast';
import SuggestionCard from './SuggestionCard';
import VariableChip from './VariableChip';
import UngroupedVariables from './UngroupedVariables';
import RoleTagSelector from './RoleTagSelector';
import ModelPreview from './ModelPreview';
import { 
  Sparkles, 
  Save, 
  FolderPlus,
  Check,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  Clock
} from 'lucide-react';

interface VariableGroupingPanelProps {
  variables: AnalysisVariable[];
  initialGroups?: VariableGroup[];
  onGroupsChange: (groups: VariableGroup[]) => void;
  onVariablesChange?: (variables: AnalysisVariable[]) => void;
  onSave: () => void;
  externalSuggestions?: VariableGroupSuggestion[]; // Task 12: Pass suggestions from parent
  showSuggestions?: boolean; // Task 12: Control whether to show suggestions
}

export default function VariableGroupingPanel({
  variables,
  initialGroups = [],
  onGroupsChange,
  onVariablesChange,
  onSave,
  externalSuggestions,
  showSuggestions = true
}: VariableGroupingPanelProps) {
  const [localVariables, setLocalVariables] = useState<AnalysisVariable[]>(variables);
  // Toast notifications
  const { showError, showSuccess, showWarning } = useToast();
  
  // State management
  const [groups, setGroups] = useState<VariableGroup[]>(initialGroups);
  const [suggestions, setSuggestions] = useState<VariableGroupSuggestion[]>([]);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  
  // Role tagging state (Task 6.1: Requirements 10.1, 10.2, 10.3)
  const [roleTags, setRoleTags] = useState<VariableRoleTag[]>([]);
  const [roleSuggestions, setRoleSuggestions] = useState<RoleSuggestion[]>([]);
  const [validationResult, setValidationResult] = useState<AnalysisModelValidation>({
    isValid: false,
    analysisTypes: [],
    errors: [],
    warnings: [],
    suggestions: []
  });

  // Auto-save hook (Task 11: Auto-save functionality with roleTags and validationResult)
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
    groups,
    demographics: [], // No demographics in this panel
    roleTags, // Task 11.1: Save roleTags to localStorage
    validationResult, // Task 11.1: Save validationResult to localStorage
    interval: 30000, // 30 seconds (Task 11.1: Debounced save every 30s)
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

  // Auto-generate suggestions on mount (Subtask 5.2)
  // Task 12: Use external suggestions if provided, respect showSuggestions flag
  useEffect(() => {
    // If external suggestions are provided, use them
    if (externalSuggestions && externalSuggestions.length > 0) {
      setSuggestions(externalSuggestions);
      setIsDetecting(false);
      return;
    }
    
    // If showSuggestions is false, don't generate suggestions (Task 12: Requirement 5.2)
    if (!showSuggestions) {
      setSuggestions([]);
      setIsDetecting(false);
      return;
    }
    
    // Only run detection if we have variables
    if (variables && variables.length > 0) {
      setIsDetecting(true);
      
      // Simulate async detection with slight delay for better UX
      setTimeout(() => {
        const suggested = VariableGroupingService.suggestGroupsCaseInsensitive(variables);
        setSuggestions(suggested);
        setIsDetecting(false);
      }, 500);
    } else {
      setIsDetecting(false);
    }
  }, [variables, externalSuggestions, showSuggestions]); // Detection triggers on variables change or component mount

  // Task 16: Debounce timer ref for validation (Requirement 7.5)
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate role suggestions on mount (Task 6.2: Requirements 12.1, 12.2, 12.3, 12.4)
  // Task 16: Cache role suggestions in localStorage (Requirement 7.5)
  useEffect(() => {
    if (variables.length > 0) {
      const projectId = variables[0]?.projectId;
      const cacheKey = `role-suggestions-${projectId}`;
      
      // Try to load from cache first
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedSuggestions = JSON.parse(cached);
          setRoleSuggestions(cachedSuggestions);
        } catch (e) {
          // Invalid cache, regenerate
        }
      }
      
      // Generate fresh suggestions
      const suggestions = RoleSuggestionService.suggestRoles(variables);
      setRoleSuggestions(suggestions);
      
      // Cache suggestions
      localStorage.setItem(cacheKey, JSON.stringify(suggestions));
      
      // Initialize role tags with 'none' for all variables
      const initialTags: VariableRoleTag[] = variables.map(v => ({
        variableId: v.id,
        columnName: v.columnName,
        role: 'none',
        isUserAssigned: false
      }));
      setRoleTags(initialTags);
    }
  }, [variables]);

  // Task 16: Debounce validation by 300ms (Requirement 7.5)
  // Validate roles whenever they change (Task 6.3: Requirements 11.1, 11.2, 11.3, 11.4, 11.5)
  useEffect(() => {
    if (roleTags.length > 0) {
      // Clear existing timer
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
      
      // Set new timer for debounced validation
      validationTimerRef.current = setTimeout(() => {
        const validation = RoleValidationService.validateAll(roleTags, groups);
        setValidationResult(validation);
      }, 300);
      
      // Cleanup on unmount
      return () => {
        if (validationTimerRef.current) {
          clearTimeout(validationTimerRef.current);
        }
      };
    }
  }, [roleTags, groups]);

  // Restore from localStorage on mount if available (Task 11.2: Requirements 8.2, 8.4, 8.5)
  useEffect(() => {
    const projectId = variables[0]?.projectId;
    if (!projectId) return;
    
    const { restoreFromLocalStorage } = require('@/hooks/useVariableGroupingAutoSave');
    const restored = restoreFromLocalStorage(projectId);
    
    if (restored && restored.groups && restored.groups.length > 0) {
      // Ask user if they want to restore
      const shouldRestore = confirm(
        `Found ${restored.groups.length} groups from a previous session. Would you like to restore them?`
      );
      if (shouldRestore) {
        setGroups(restored.groups);
        
        // Restore roleTags if available (Task 11.2: Load roleTags from localStorage)
        if (restored.roleTags && restored.roleTags.length > 0) {
          setRoleTags(restored.roleTags);
        }
        
        // Restore validationResult if available (Task 11.2: Load cached validation)
        if (restored.validationResult) {
          setValidationResult(restored.validationResult);
        }
        
        showSuccess('Restored', 'Groups and role assignments restored from previous session');
      }
    }
  }, [variables, showSuccess]);

  // Sync variables from props
  useEffect(() => {
    setLocalVariables(variables);
  }, [variables]);

  // Notify parent of changes
  useEffect(() => {
    onGroupsChange(groups);
  }, [groups, onGroupsChange]);

  // Notify parent of variable changes
  useEffect(() => {
    if (onVariablesChange) {
      onVariablesChange(localVariables);
    }
  }, [localVariables, onVariablesChange]);

  // Toggle demographic status
  const toggleDemographic = (columnName: string) => {
    setLocalVariables(prev => prev.map(v => 
      v.columnName === columnName 
        ? { ...v, isDemographic: !v.isDemographic }
        : v
    ));
    showSuccess('Updated', `Demographic status toggled for ${columnName}`);
  };

  // Task 16: Memoize ungrouped variables calculation (Requirement 7.3)
  const ungroupedVariables = useMemo(() => {
    const groupedVariableNames = new Set(
      groups.flatMap(g => g.variables || [])
    );
    return variables.filter(v => !groupedVariableNames.has(v.columnName));
  }, [variables, groups]);

  // Task 16: Memoize filtered ungrouped variables
  const filteredUngrouped = useMemo(() => {
    return ungroupedVariables.filter(v =>
      v.columnName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ungroupedVariables, searchTerm]);

  // Accept a suggestion
  const acceptSuggestion = (suggestion: VariableGroupSuggestion) => {
    const newGroup: VariableGroup = {
      id: `temp-${Date.now()}`,
      name: suggestion.suggestedName,
      variables: suggestion.variables,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: false,
    };

    setGroups([...groups, newGroup]);
    
    // Remove accepted suggestion from list
    setSuggestions(suggestions.filter(s => s.suggestedName !== suggestion.suggestedName));
  };

  // Reject a suggestion
  const rejectSuggestion = (suggestion: VariableGroupSuggestion) => {
    setSuggestions(suggestions.filter(s => s.suggestedName !== suggestion.suggestedName));
  };

  // Accept all suggestions at once
  const acceptAllSuggestions = () => {
    const newGroups = suggestions.map((suggestion, idx) => ({
      id: `temp-${Date.now()}-${idx}`,
      name: suggestion.suggestedName,
      variables: suggestion.variables,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: false,
    }));

    setGroups([...groups, ...newGroups]);
    setSuggestions([]);
    showSuccess('All Accepted', `${newGroups.length} groups created from suggestions`);
  };

  // Create new group
  const createNewGroup = () => {
    const newGroup: VariableGroup = {
      id: `temp-${Date.now()}`,
      name: 'New Group',
      variables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true,
    };

    setGroups([...groups, newGroup]);
    setEditingGroupId(newGroup.id);
    setEditingGroupName(newGroup.name);
  };

  // Start editing group name
  const startEditingGroup = (group: VariableGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
    setValidationError(null);
  };

  // Save group name with validation
  const saveGroupName = (groupId: string, description?: string) => {
    const existingNames = groups
      .filter(g => g.id !== groupId)
      .map(g => g.name);
    
    const validation = VariableGroupingService.validateGroupName(
      editingGroupName,
      existingNames
    );

    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid group name');
      showError('Invalid Group Name', validation.error || 'Invalid group name');
      return;
    }

    setGroups(groups.map(g => 
      g.id === groupId 
        ? { ...g, name: editingGroupName, description, updatedAt: new Date(), isCustom: true } 
        : g
    ));
    setEditingGroupId(null);
    setValidationError(null);
    showSuccess('Group Updated', `Group renamed to "${editingGroupName}"`);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingGroupId(null);
    setValidationError(null);
  };

  // Delete group
  const deleteGroup = (groupId: string, groupName: string) => {
    if (confirm(`Are you sure you want to delete the group "${groupName}"? All variables will be ungrouped.`)) {
      setGroups(groups.filter(g => g.id !== groupId));
      showSuccess('Group Deleted', `Group "${groupName}" has been deleted. Variables are now ungrouped.`);
    }
  };

  // Add variable to group
  const addVariableToGroup = (variableName: string, groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        const existingVars = g.variables || [];
        if (!existingVars.includes(variableName)) {
          return { 
            ...g, 
            variables: [...existingVars, variableName],
            updatedAt: new Date(),
            isCustom: true
          };
        }
      }
      return g;
    }));
  };

  // Remove variable from group
  const removeVariableFromGroup = (variableName: string, groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        const newVariables = (g.variables || []).filter(v => v !== variableName);
        
        // Show warning if group will have less than 2 variables
        if (newVariables.length < 2 && newVariables.length > 0) {
          showWarning('Small Group', `Group "${g.name}" now has only ${newVariables.length} variable. Consider adding more variables or deleting the group.`);
        }
        
        return { 
          ...g, 
          variables: newVariables,
          updatedAt: new Date(),
          isCustom: true
        };
      }
      return g;
    }));
  };

  // Task 16: Memoize callbacks to prevent unnecessary re-renders
  // Handle role change for individual variable (Task 6.4: Requirements 10.2, 10.3)
  const handleRoleChange = useCallback((variableId: string, newRole: VariableRole) => {
    setRoleTags(prev => prev.map(tag => 
      tag.variableId === variableId
        ? { ...tag, role: newRole, isUserAssigned: true }
        : tag
    ));
  }, []);

  // Handle group role change (applies to all variables in group) (Task 6.4: Requirements 10.2, 10.3)
  const handleGroupRoleChange = useCallback((groupId: string, newRole: VariableRole) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !group.variables) return;

    setRoleTags(prev => prev.map(tag => 
      group.variables.includes(tag.columnName)
        ? { ...tag, role: newRole, isUserAssigned: true }
        : tag
    ));
  }, [groups]);

  // Handle save (Task 12.3: Success/error feedback)
  const handleSave = async () => {
    try {
      // Save to database with retry logic
      await saveNow();
      
      // Call parent save handler
      onSave();
      
      // Show success message (Requirement 6.1)
      showSuccess('Saved Successfully', `${groups.length} group${groups.length !== 1 ? 's' : ''} saved to database`);
      clearUnsavedChanges();
      
      // Task 11.2: Clear cache after successful database save (Requirement 8.5)
      const { clearLocalStorageBackup } = require('@/hooks/useVariableGroupingAutoSave');
      clearLocalStorageBackup();
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
      showWarning(
        'Retrying Save',
        `Attempt ${retryStatus.attempt} of ${retryStatus.maxAttempts}. Retrying in ${Math.pow(2, retryStatus.attempt - 1)} seconds...`
      );
    }
  }, [retryStatus, showWarning]);

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
      {/* Suggestions Section (Subtask 5.1) */}
      {isDetecting ? (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 animate-in fade-in duration-300">
          <h3 className="flex items-center gap-2 font-semibold mb-3 text-gray-900">
            <Sparkles className="h-5 w-5 text-blue-600 animate-spin" />
            Detecting Grouping Patterns...
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Analyzing your variables for common patterns...
          </p>
          
          {/* Skeleton loading */}
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-blue-100 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex gap-1">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
              Suggested Groups ({suggestions.length})
            </h3>
            {suggestions.length > 1 && (
              <button
                onClick={acceptAllSuggestions}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Check className="h-4 w-4" />
                Accept All
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            We found these grouping patterns in your variables. Accept or reject each suggestion.
          </p>
          
          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <SuggestionCard
                key={idx}
                suggestion={suggestion}
                onAccept={() => acceptSuggestion(suggestion)}
                onReject={() => rejectSuggestion(suggestion)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Current Groups Section (Subtask 5.1) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Variable Groups ({groups.length})
          </h3>
          <button
            onClick={createNewGroup}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <FolderPlus className="h-4 w-4" />
            New Group
          </button>
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FolderPlus className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium">No groups created yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Accept suggestions above or create a new group
            </p>
          </div>
        )}

        {groups.map((group, idx) => (
          <div
            key={group.id}
            className="animate-in fade-in slide-in-from-left-4 duration-300"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <GroupCard
              group={group}
              isEditing={editingGroupId === group.id}
              editingName={editingGroupName}
              validationError={validationError}
              onStartEdit={() => startEditingGroup(group)}
              onEndEdit={(description) => saveGroupName(group.id, description)}
              onCancelEdit={cancelEditing}
              onNameChange={setEditingGroupName}
              onAddVariable={(varName) => addVariableToGroup(varName, group.id)}
              onRemoveVariable={(varName) => removeVariableFromGroup(varName, group.id)}
              onDelete={() => deleteGroup(group.id, group.name)}
              onToggleDemographic={toggleDemographic}
              ungroupedVariables={ungroupedVariables}
              allVariables={localVariables}
            />
          </div>
        ))}
      </div>

      {/* Ungrouped Variables Section (Subtask 5.1) */}
      <UngroupedVariables
        variables={filteredUngrouped}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddToGroup={addVariableToGroup}
        groups={groups}
      />

      {/* Role Tagging Section (Task 6.5: Requirements 10.1, 13.1-13.6) */}
      {variables.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Variable Roles</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Assign roles to variables for advanced analyses (Regression, SEM, Mediation)
            </p>

            {/* Groups with role selectors */}
            {groups.length > 0 && (
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-700">Grouped Variables</h4>
                <div className="space-y-4">
                {groups.map(group => {
                  const groupRoleTag = roleTags.find(t => 
                    group.variables && group.variables.includes(t.columnName)
                  );
                  const groupSuggestion = roleSuggestions.find(s => 
                    group.variables && group.variables.includes(s.columnName)
                  );

                  return (
                    <div key={group.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{group.name}</h4>
                        <RoleTagSelector
                          entityId={group.id}
                          entityName={group.name}
                          currentRole={groupRoleTag?.role || 'none'}
                          suggestion={groupSuggestion}
                          onRoleChange={(role) => handleGroupRoleChange(group.id, role)}
                        />
                      </div>
                      
                      {/* Individual variables in group */}
                      <div className="ml-4 space-y-2">
                        {group.variables?.map(varName => {
                          const variable = variables.find(v => v.columnName === varName);
                          if (!variable) return null;
                          
                          const roleTag = roleTags.find(t => t.variableId === variable.id);
                          const suggestion = roleSuggestions.find(s => s.variableId === variable.id);
                          
                          return (
                            <div key={variable.id} className="py-2 space-y-2">
                              <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 font-mono w-24 flex-shrink-0">{varName}</span>
                                    <input
                                      type="text"
                                      value={variable.displayName || ''}
                                      onChange={(e) => {
                                        const newDisplayName = e.target.value;
                                        setLocalVariables(prev => prev.map(v => 
                                          v.id === variable.id 
                                            ? { ...v, displayName: newDisplayName }
                                            : v
                                        ));
                                      }}
                                      placeholder="Display name (optional)"
                                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <textarea
                                    value={variable.semanticName || ''}
                                    onChange={(e) => {
                                      const newDescription = e.target.value;
                                      setLocalVariables(prev => prev.map(v => 
                                        v.id === variable.id 
                                          ? { ...v, semanticName: newDescription }
                                          : v
                                      ));
                                    }}
                                    placeholder="Description (optional)"
                                    rows={1}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                  />
                                </div>
                                <RoleTagSelector
                                  entityId={variable.id}
                                  entityName={variable.displayName || varName}
                                  currentRole={roleTag?.role || 'none'}
                                  suggestion={suggestion}
                                  onRoleChange={(role) => handleRoleChange(variable.id, role)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* Ungrouped Variables with role selectors */}
            {ungroupedVariables.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Ungrouped Variables</h4>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="space-y-2">
                    {ungroupedVariables.map(variable => {
                      const roleTag = roleTags.find(t => t.variableId === variable.id);
                      const suggestion = roleSuggestions.find(s => s.variableId === variable.id);
                      
                      return (
                        <div key={variable.id} className="py-2 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-mono w-24 flex-shrink-0">{variable.columnName}</span>
                                <input
                                  type="text"
                                  value={variable.displayName || ''}
                                  onChange={(e) => {
                                    const newDisplayName = e.target.value;
                                    setLocalVariables(prev => prev.map(v => 
                                      v.id === variable.id 
                                        ? { ...v, displayName: newDisplayName }
                                        : v
                                    ));
                                  }}
                                  placeholder="Display name (optional)"
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <textarea
                                value={variable.semanticName || ''}
                                onChange={(e) => {
                                  const newDescription = e.target.value;
                                  setLocalVariables(prev => prev.map(v => 
                                    v.id === variable.id 
                                      ? { ...v, semanticName: newDescription }
                                      : v
                                  ));
                                }}
                                placeholder="Description (optional)"
                                rows={1}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              />
                            </div>
                            <RoleTagSelector
                              entityId={variable.id}
                              entityName={variable.displayName || variable.columnName}
                              currentRole={roleTag?.role || 'none'}
                              suggestion={suggestion}
                              onRoleChange={(role) => handleRoleChange(variable.id, role)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Model Preview (Task 6.6: Requirements 14.1-14.5) */}
            <div className="mt-6">
              <ModelPreview
                roleTags={roleTags}
                groups={groups}
                validationResult={validationResult}
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Button with unsaved changes indicator and validation (Task 6.7: Requirements 11.4, 11.5) */}
      {hasUnsavedChanges && (
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
                  className={`
                    px-4 py-2 rounded-lg flex items-center gap-2 font-medium 
                    transition-all duration-200 hover:scale-105 active:scale-95
                    bg-blue-600 text-white hover:bg-blue-700
                    ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
                  {isSaving 
                    ? 'Saving...' 
                    : validationResult.isValid 
                      ? `Save & Continue (${validationResult.analysisTypes.join(', ')})` 
                      : 'Save & Continue'
                  }
                </button>
              </div>
              {validationResult.errors.length > 0 && (
                <div className="text-xs text-amber-600 mt-1">
                  Note: {validationResult.errors[0]}
                </div>
              )}
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

// SuggestionCard, VariableChip, and UngroupedVariables are now imported from separate files

// GroupCard Component
interface GroupCardProps {
  group: VariableGroup;
  isEditing: boolean;
  editingName: string;
  validationError: string | null;
  onStartEdit: () => void;
  onEndEdit: (description?: string) => void;
  onCancelEdit: () => void;
  onNameChange: (name: string) => void;
  onAddVariable: (varName: string) => void;
  onRemoveVariable: (varName: string) => void;
  onDelete: () => void;
  onToggleDemographic: (columnName: string) => void;
  ungroupedVariables: AnalysisVariable[];
  allVariables: AnalysisVariable[];
}

function GroupCard({
  group,
  isEditing,
  editingName,
  validationError,
  onStartEdit,
  onEndEdit,
  onCancelEdit,
  onNameChange,
  onAddVariable,
  onRemoveVariable,
  onDelete,
  onToggleDemographic,
  ungroupedVariables,
  allVariables
}: GroupCardProps) {
  const [showAddVariables, setShowAddVariables] = useState(false);
  const [editingDescription, setEditingDescription] = useState(group.description || '');

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
      {/* Group Header */}
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <div className="flex-1 mr-2 animate-in slide-in-from-left-2 duration-200 space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Group Name</label>
              <input
                type="text"
                value={editingName}
                onChange={(e) => onNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onEndEdit();
                  if (e.key === 'Escape') onCancelEdit();
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  validationError ? 'border-red-500 animate-shake' : 'border-gray-300'
                }`}
                placeholder="Enter group name"
                autoFocus
              />
              {validationError && (
                <p className="text-xs text-red-600 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{validationError}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Customer satisfaction items"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <h4
              className="font-semibold text-lg cursor-pointer hover:text-blue-600 flex items-center gap-2 group transition-colors duration-200"
              onClick={onStartEdit}
            >
              {group.name}
              <Edit2 className="inline h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </h4>
            {group.description && (
              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {group.variables?.length || 0} variables
          </span>
          {isEditing ? (
            <>
              <button
                onClick={() => onEndEdit(editingDescription)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Save"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAddVariables(!showAddVariables)}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                + Add
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-all duration-200 hover:scale-110 active:scale-95"
                title="Delete group"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Variables List with Demographic Toggle */}
      <div className="space-y-2 mb-3">
        {group.variables && group.variables.length > 0 ? (
          <div className="space-y-1">
            {group.variables.map(varName => {
              const variable = allVariables.find(v => v.columnName === varName);
              if (!variable) return null;
              
              return (
                <div key={varName} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <VariableChip
                    name={varName}
                    onRemove={() => onRemoveVariable(varName)}
                  />
                  <div className="flex-1"></div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={variable.isDemographic}
                      onChange={() => onToggleDemographic(varName)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium">Demographic</span>
                  </label>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full text-center py-4 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded">
            No variables in this group yet
          </div>
        )}
      </div>

      {/* Add Variables Dropdown */}
      {showAddVariables && ungroupedVariables.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Add variables to this group:
          </p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {ungroupedVariables.map(variable => (
              <button
                key={variable.id}
                onClick={() => {
                  onAddVariable(variable.columnName);
                  if (ungroupedVariables.length === 1) {
                    setShowAddVariables(false);
                  }
                }}
                className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300"
              >
                {variable.columnName}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddVariables(false)}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}




