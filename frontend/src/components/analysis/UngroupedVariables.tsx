'use client';

import { useState } from 'react';
import { AnalysisVariable, VariableGroup } from '@/types/analysis';
import { Search, GripVertical, Check } from 'lucide-react';

interface UngroupedVariablesProps {
  variables: AnalysisVariable[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddToGroup: (varName: string, groupId: string) => void;
  groups: VariableGroup[];
}

/**
 * UngroupedVariables Component
 * 
 * Lists all variables that haven't been assigned to a group.
 * Provides search functionality and allows adding variables to groups.
 * Supports drag-to-group interaction (visual indicator).
 * 
 * Requirements: 5.3
 */
export default function UngroupedVariables({
  variables,
  searchTerm,
  onSearchChange,
  onAddToGroup,
  groups
}: UngroupedVariablesProps) {
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);

  // Show success message when all variables are grouped
  if (variables.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800">
          <Check className="h-5 w-5" />
          <span className="font-medium">All variables are grouped!</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Every variable has been assigned to a group.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <h3 className="font-semibold text-gray-900 mb-3">
        Ungrouped Variables ({variables.length})
      </h3>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search variables..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full pl-10 pr-4 py-2 
            border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          "
        />
      </div>

      {/* Variable List */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {variables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No variables match your search</p>
          </div>
        ) : (
          variables.map((variable) => (
            <VariableRow
              key={variable.id}
              variable={variable}
              groups={groups}
              isSelected={selectedVariable === variable.columnName}
              onSelect={() => setSelectedVariable(
                selectedVariable === variable.columnName ? null : variable.columnName
              )}
              onAddToGroup={(groupId) => {
                onAddToGroup(variable.columnName, groupId);
                setSelectedVariable(null);
              }}
            />
          ))
        )}
      </div>

      {/* Helper Text */}
      {variables.length > 0 && groups.length === 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Create a group first to organize these variables
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * VariableRow Component
 * 
 * Individual row for an ungrouped variable with drag handle and add-to-group action
 */
interface VariableRowProps {
  variable: AnalysisVariable;
  groups: VariableGroup[];
  isSelected: boolean;
  onSelect: () => void;
  onAddToGroup: (groupId: string) => void;
}

function VariableRow({
  variable,
  groups,
  isSelected,
  onSelect,
  onAddToGroup
}: VariableRowProps) {
  return (
    <div
      className="
        flex items-center justify-between p-2 
        bg-gray-50 rounded border border-gray-200 
        hover:bg-gray-100 hover:border-gray-300
        transition-all duration-200
        cursor-move
      "
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('variableName', variable.columnName);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {/* Variable Info */}
      <div className="flex items-center gap-2 flex-1">
        <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {variable.columnName}
          </p>
          <p className="text-xs text-gray-500">
            {variable.dataType}
            {variable.uniqueCount && (
              <span className="ml-2">
                {variable.uniqueCount} unique values
              </span>
            )}
          </p>
        </div>
      </div>
      
      {/* Add to Group Button */}
      {groups.length > 0 && (
        <div className="relative">
          <button
            onClick={onSelect}
            className="
              px-3 py-1 text-sm 
              bg-white border border-gray-300 rounded 
              hover:bg-gray-50 hover:border-gray-400
              transition-colors
              whitespace-nowrap
            "
          >
            Add to group
          </button>
          
          {/* Group Selection Dropdown */}
          {isSelected && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={onSelect}
              />
              
              {/* Dropdown Menu */}
              <div className="
                absolute right-0 mt-1 w-48 
                bg-white border border-gray-200 rounded-lg shadow-lg 
                z-20
              ">
                <div className="p-2 max-h-48 overflow-y-auto">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => onAddToGroup(group.id)}
                      className="
                        w-full text-left px-3 py-2 text-sm rounded 
                        hover:bg-blue-50 hover:text-blue-700
                        transition-colors
                      "
                    >
                      <div className="font-medium">{group.name}</div>
                      <div className="text-xs text-gray-500">
                        {group.variables?.length || 0} variables
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
