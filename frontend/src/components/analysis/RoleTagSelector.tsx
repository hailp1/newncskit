/**
 * RoleTagSelector Component
 * 
 * Allows users to assign statistical roles to variables or groups
 * Supports smart suggestions with confidence scores
 * Requirements: 10.1, 10.2, 12.4, 13.1-13.6
 * 
 * Performance Optimizations (Task 16):
 * - React.memo to prevent unnecessary re-renders (Requirement 7.2)
 * - Memoized role color calculation
 */

import { memo, useCallback } from 'react';
import { VariableRole, RoleSuggestion } from '@/types/analysis';

interface RoleTagSelectorProps {
  entityId: string;  // Variable or Group ID
  entityName: string;
  currentRole: VariableRole;
  suggestion?: RoleSuggestion;
  onRoleChange: (role: VariableRole) => void;
  disabled?: boolean;
}

interface RoleOption {
  value: VariableRole;
  label: string;
  color: string;
  icon: string;
}

const roleOptions: RoleOption[] = [
  { value: 'none', label: 'None', color: 'gray', icon: '○' },
  { value: 'independent', label: 'IV (Independent)', color: 'blue', icon: '→' },
  { value: 'dependent', label: 'DV (Dependent)', color: 'green', icon: '◉' },
  { value: 'mediator', label: 'Mediator', color: 'purple', icon: '⟿' },
  { value: 'moderator', label: 'Moderator', color: 'orange', icon: '⊗' },
  { value: 'control', label: 'Control', color: 'gray', icon: '⊙' },
  { value: 'latent', label: 'Latent', color: 'yellow', icon: '◈' },
];

// Task 16: React.memo to prevent unnecessary re-renders (Requirement 7.2)
const RoleTagSelector = memo(function RoleTagSelector({
  entityId,
  entityName,
  currentRole,
  suggestion,
  onRoleChange,
  disabled = false
}: RoleTagSelectorProps) {
  // Task 16: Memoize callbacks to prevent child re-renders
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onRoleChange(e.target.value as VariableRole);
  }, [onRoleChange]);

  const handleAcceptSuggestion = useCallback(() => {
    if (suggestion) {
      onRoleChange(suggestion.suggestedRole);
    }
  }, [suggestion, onRoleChange]);

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentRole}
        onChange={handleChange}
        disabled={disabled}
        className={`
          px-3 py-1 rounded-md border text-sm font-medium
          transition-colors duration-150
          ${getRoleColor(currentRole)}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
        `}
        aria-label={`Role selector for ${entityName}`}
      >
        {roleOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>

      {suggestion && suggestion.suggestedRole !== currentRole && suggestion.confidence > 0 && (
        <button
          onClick={handleAcceptSuggestion}
          disabled={disabled}
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          title={suggestion.reasons.join(', ')}
          aria-label={`Accept suggestion: ${suggestion.suggestedRole}`}
        >
          Suggested: {getRoleLabel(suggestion.suggestedRole)} ({Math.round(suggestion.confidence * 100)}%)
        </button>
      )}
    </div>
  );
});

// Add display name for debugging
RoleTagSelector.displayName = 'RoleTagSelector';

export default RoleTagSelector;

/**
 * Get Tailwind color classes for each role type
 * Requirements: 13.1-13.6
 */
function getRoleColor(role: VariableRole): string {
  const colors: Record<VariableRole, string> = {
    none: 'bg-gray-100 border-gray-300 text-gray-700',
    independent: 'bg-blue-100 border-blue-300 text-blue-700',
    dependent: 'bg-green-100 border-green-300 text-green-700',
    mediator: 'bg-purple-100 border-purple-300 text-purple-700',
    moderator: 'bg-orange-100 border-orange-300 text-orange-700',
    control: 'bg-gray-100 border-gray-300 text-gray-600',
    latent: 'bg-yellow-100 border-yellow-300 text-yellow-700',
  };
  return colors[role];
}

/**
 * Get human-readable label for role
 */
function getRoleLabel(role: VariableRole): string {
  const option = roleOptions.find(opt => opt.value === role);
  return option ? option.label : role;
}
