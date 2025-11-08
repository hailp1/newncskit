'use client';

import { useState, useEffect } from 'react';
import { 
  AnalysisVariable, 
  VariableGroup, 
  VariableGroupSuggestion 
} from '@/types/analysis';
import { 
  FolderPlus, 
  Check, 
  X, 
  Search, 
  Trash2, 
  Edit2, 
  Save,
  Sparkles,
  GripVertical
} from 'lucide-react';

interface VariableGroupEditorProps {
  projectId: string;
  variables: AnalysisVariable[];
  existingGroups?: VariableGroup[];
  suggestions?: VariableGroupSuggestion[];
  onSave: (groups: VariableGroup[]) => void;
  onCancel?: () => void;
}

export default function VariableGroupEditor({
  projectId,
  variables,
  existingGroups = [],
  suggestions = [],
  onSave,
  onCancel,
}: VariableGroupEditorProps) {
  // Debug logging
  console.log('[VariableGroupEditor] Initialized with:', {
    projectId,
    variablesCount: variables?.length || 0,
    existingGroupsCount: existingGroups?.length || 0,
    suggestionsCount: suggestions?.length || 0,
  });

  // Validation
  if (!projectId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Error: No project ID provided</p>
        <p className="text-sm text-red-600 mt-2">Please go back and upload a file first.</p>
      </div>
    );
  }

  if (!variables || variables.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-medium">Warning: No variables found</p>
        <p className="text-sm text-yellow-600 mt-2">
          The data health check may not have completed successfully. Please go back and try again.
        </p>
      </div>
    );
  }

  const [groups, setGroups] = useState<VariableGroup[]>(existingGroups);
  const [ungroupedVariables, setUngroupedVariables] = useState<AnalysisVariable[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Initialize ungrouped variables
  useEffect(() => {
    const groupedVariableNames = new Set(
      groups.flatMap(g => g.variables?.map(v => v.columnName) || [])
    );
    const ungrouped = variables.filter(v => !groupedVariableNames.has(v.columnName));
    setUngroupedVariables(ungrouped);
  }, [variables, groups]);

  // Accept a suggestion
  const acceptSuggestion = (suggestion: VariableGroupSuggestion) => {
    const newGroup: VariableGroup = {
      id: `temp-${Date.now()}`,
      projectId,
      name: suggestion.suggestedName,
      description: suggestion.reason,
      groupType: 'construct',
      displayOrder: groups.length,
      createdAt: new Date().toISOString(),
      variables: variables.filter(v => suggestion.variables.includes(v.columnName)),
    };

    setGroups([...groups, newGroup]);
  };

  // Reject a suggestion
  const rejectSuggestion = (index: number) => {
    // Just hide it from UI
    setShowSuggestions(false);
  };

  // Create a new empty group
  const createNewGroup = () => {
    const newGroup: VariableGroup = {
      id: `temp-${Date.now()}`,
      projectId,
      name: 'New Group',
      groupType: 'construct',
      displayOrder: groups.length,
      createdAt: new Date().toISOString(),
      variables: [],
    };

    setGroups([...groups, newGroup]);
    setEditingGroupId(newGroup.id);
    setEditingGroupName(newGroup.name);
  };

  // Delete a group
  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  // Start editing group name
  const startEditingGroup = (group: VariableGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  // Save group name
  const saveGroupName = (groupId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, name: editingGroupName } : g
    ));
    setEditingGroupId(null);
  };

  // Add variable to group
  const addVariableToGroup = (variable: AnalysisVariable, groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        const existingVars = g.variables || [];
        if (!existingVars.find(v => v.id === variable.id)) {
          return { ...g, variables: [...existingVars, variable] };
        }
      }
      return g;
    }));
  };

  // Remove variable from group
  const removeVariableFromGroup = (variableId: string, groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return { ...g, variables: g.variables?.filter(v => v.id !== variableId) };
      }
      return g;
    }));
  };

  // Filter variables by search term
  const filteredUngrouped = ungroupedVariables.filter(v =>
    v.columnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle save
  const handleSave = () => {
    onSave(groups);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Variable Grouping</h2>
          <p className="text-sm text-gray-600 mt-1">
            Organize your variables into meaningful groups
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
            Save Groups
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
            <span className="text-sm text-gray-600">
              ({suggestions.length} groups suggested)
            </span>
          </div>

          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 border border-purple-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {suggestion.suggestedName}
                      </h4>
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {suggestion.reason}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
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
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => acceptSuggestion(suggestion)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Accept suggestion"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => rejectSuggestion(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Reject suggestion"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Suggestions Message */}
      {showSuggestions && suggestions.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">No Automatic Suggestions</h3>
              <p className="text-sm text-gray-700">
                We couldn't find obvious grouping patterns in your variable names. 
                You can still create groups manually below by dragging variables into groups.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Tip:</strong> Variables with common prefixes (e.g., Q1_, Q2_) or sequential numbering (Item1, Item2) 
                are easier to group automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ungrouped Variables */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Ungrouped Variables ({filteredUngrouped.length})
            </h3>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search variables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Variable List */}
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredUngrouped.map((variable) => (
                <div
                  key={variable.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('variableId', variable.id);
                    e.dataTransfer.setData('variable', JSON.stringify(variable));
                  }}
                  className="p-2 bg-gray-50 rounded border border-gray-200 cursor-move hover:bg-gray-100 hover:border-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {variable.columnName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {variable.dataType}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUngrouped.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  {searchTerm ? 'No variables found' : 'All variables are grouped'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Groups */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {/* Create New Group Button */}
            <button
              onClick={createNewGroup}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <FolderPlus className="w-5 h-5" />
              Create New Group
            </button>

            {/* Group Cards */}
            {groups.map((group) => (
              <div
                key={group.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const variableData = e.dataTransfer.getData('variable');
                  if (variableData) {
                    const variable = JSON.parse(variableData);
                    addVariableToGroup(variable, group.id);
                  }
                }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between mb-3">
                  {editingGroupId === group.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingGroupName}
                        onChange={(e) => setEditingGroupName(e.target.value)}
                        className="flex-1 px-3 py-1 border border-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveGroupName(group.id);
                          if (e.key === 'Escape') setEditingGroupId(null);
                        }}
                      />
                      <button
                        onClick={() => saveGroupName(group.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <h4 className="font-semibold text-gray-900">{group.name}</h4>
                      <span className="text-xs text-gray-500">
                        ({group.variables?.length || 0} variables)
                      </span>
                    </div>
                  )}

                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditingGroup(group)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      title="Edit name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Group Description */}
                {group.description && (
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                )}

                {/* Variables in Group */}
                <div className="space-y-1">
                  {group.variables && group.variables.length > 0 ? (
                    group.variables.map((variable) => (
                      <div
                        key={variable.id}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {variable.columnName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {variable.dataType}
                          </p>
                        </div>
                        <button
                          onClick={() => removeVariableFromGroup(variable.id, group.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded ml-2"
                          title="Remove from group"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded">
                      Drag variables here to add them to this group
                    </div>
                  )}
                </div>
              </div>
            ))}

            {groups.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FolderPlus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No groups created yet</p>
                <p className="text-sm">Create a group or accept AI suggestions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
