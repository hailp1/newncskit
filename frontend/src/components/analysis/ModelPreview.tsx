/**
 * ModelPreview Component
 * 
 * Displays analysis model preview with validation status and Mermaid diagram
 * Requirements: 14.1, 11.4
 * 
 * Performance Optimizations (Task 16):
 * - Memoized diagram generation (Requirement 7.4)
 * - React.memo to prevent unnecessary re-renders
 */

'use client';

import { useMemo, memo } from 'react';
import { VariableRoleTag, VariableGroup, AnalysisModelValidation, VariableRole } from '@/types/analysis';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ModelPreviewProps {
  roleTags: VariableRoleTag[];
  groups: VariableGroup[];
  validationResult: AnalysisModelValidation;
}

// Task 16: React.memo to prevent unnecessary re-renders
const ModelPreview = memo(function ModelPreview({ 
  roleTags, 
  groups, 
  validationResult 
}: ModelPreviewProps) {
  // Check if any roles are assigned (not 'none')
  const assignedRoles = useMemo(() => {
    return roleTags.filter(t => t.role !== 'none');
  }, [roleTags]);

  // Early return if no roles assigned
  if (roleTags.length === 0 || assignedRoles.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Analysis Model Preview</h3>
        <p className="text-sm text-gray-600">
          Assign roles to variables above to preview your analysis model
        </p>
      </div>
    );
  }

  // Task 16: Memoize model preview diagram (Requirement 7.4)
  const mermaidDiagram = useMemo(() => {
    return generateMermaidDiagram(roleTags, groups);
  }, [roleTags, groups]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Analysis Model Preview</h3>

      {/* Validation Status */}
      <div className="mb-4">
        {validationResult.isValid ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              Ready for: {validationResult.analysisTypes.join(', ')}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">
              {assignedRoles.length > 0 
                ? 'Configure more roles to enable analysis' 
                : 'Assign roles to variables to begin'}
            </span>
          </div>
        )}
      </div>

      {/* Errors */}
      {validationResult.errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="font-medium text-red-800 mb-2">Errors:</p>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {validationResult.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="font-medium text-yellow-800 mb-2">Warnings:</p>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            {validationResult.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {validationResult.suggestions.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="font-medium text-blue-800 mb-2">Suggestions:</p>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            {validationResult.suggestions.map((sug, i) => (
              <li key={i}>{sug}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mermaid Diagram */}
      {mermaidDiagram && (
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Model Diagram:</p>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
            <code>{mermaidDiagram}</code>
          </pre>
        </div>
      )}

      {/* Variable Summary */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <RoleSummary roleTags={roleTags} role="independent" label="Independent Variables" />
        <RoleSummary roleTags={roleTags} role="dependent" label="Dependent Variables" />
        <RoleSummary roleTags={roleTags} role="mediator" label="Mediators" />
        <RoleSummary roleTags={roleTags} role="moderator" label="Moderators" />
        <RoleSummary roleTags={roleTags} role="control" label="Control Variables" />
        <RoleSummary roleTags={roleTags} role="latent" label="Latent Variables" />
      </div>
    </div>
  );
});

// Add display name for debugging
ModelPreview.displayName = 'ModelPreview';

export default ModelPreview;

/**
 * RoleSummary Component
 * Requirements: 13.1-13.6
 * Task 16: Memoized to prevent unnecessary re-renders
 */
interface RoleSummaryProps {
  roleTags: VariableRoleTag[];
  role: VariableRole;
  label: string;
}

const RoleSummary = memo(function RoleSummary({ roleTags, role, label }: RoleSummaryProps) {
  const variables = roleTags.filter(t => t.role === role);
  
  if (variables.length === 0) return null;

  return (
    <div className="p-3 bg-white border border-gray-200 rounded">
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{variables.length}</p>
      <p className="text-xs text-gray-500 mt-1 truncate" title={variables.map(v => v.columnName).join(', ')}>
        {variables.map(v => v.columnName).join(', ')}
      </p>
    </div>
  );
});

/**
 * Generate Mermaid diagram from role tags
 * Requirements: 14.2, 14.3, 14.4, 14.5
 */
function generateMermaidDiagram(
  roleTags: VariableRoleTag[], 
  groups: VariableGroup[]
): string {
  const ivs = roleTags.filter(t => t.role === 'independent');
  const dvs = roleTags.filter(t => t.role === 'dependent');
  const mediators = roleTags.filter(t => t.role === 'mediator');
  const moderators = roleTags.filter(t => t.role === 'moderator');
  const controls = roleTags.filter(t => t.role === 'control');
  const latents = roleTags.filter(t => t.role === 'latent');

  // Don't generate diagram if no roles assigned
  if (ivs.length === 0 && dvs.length === 0 && mediators.length === 0 && latents.length === 0) {
    return '';
  }

  let diagram = 'graph LR\n';

  // Add nodes for IVs
  ivs.forEach(iv => {
    diagram += `  ${sanitize(iv.columnName)}[${iv.columnName}]\n`;
  });

  // Add nodes for DVs
  dvs.forEach(dv => {
    diagram += `  ${sanitize(dv.columnName)}[${dv.columnName}]\n`;
  });

  // Add nodes for Mediators
  mediators.forEach(m => {
    diagram += `  ${sanitize(m.columnName)}[${m.columnName}]\n`;
  });

  // Add nodes for Moderators
  moderators.forEach(mod => {
    diagram += `  ${sanitize(mod.columnName)}[${mod.columnName}]\n`;
  });

  // Add nodes for Controls
  controls.forEach(ctrl => {
    diagram += `  ${sanitize(ctrl.columnName)}[${ctrl.columnName}]\n`;
  });

  // Add relationships
  if (mediators.length > 0) {
    // Mediation model: IV → M → DV
    ivs.forEach(iv => {
      mediators.forEach(m => {
        diagram += `  ${sanitize(iv.columnName)} --> ${sanitize(m.columnName)}\n`;
      });
    });
    mediators.forEach(m => {
      dvs.forEach(dv => {
        diagram += `  ${sanitize(m.columnName)} --> ${sanitize(dv.columnName)}\n`;
      });
    });
    // Also add direct paths IV → DV
    ivs.forEach(iv => {
      dvs.forEach(dv => {
        diagram += `  ${sanitize(iv.columnName)} -.-> ${sanitize(dv.columnName)}\n`;
      });
    });
  } else {
    // Direct model: IV → DV
    ivs.forEach(iv => {
      dvs.forEach(dv => {
        diagram += `  ${sanitize(iv.columnName)} --> ${sanitize(dv.columnName)}\n`;
      });
    });
  }

  // Add control variables (dotted lines to DV)
  controls.forEach(ctrl => {
    dvs.forEach(dv => {
      diagram += `  ${sanitize(ctrl.columnName)} -.-> ${sanitize(dv.columnName)}\n`;
    });
  });

  // Add moderator interactions (if present)
  if (moderators.length > 0) {
    moderators.forEach(mod => {
      dvs.forEach(dv => {
        diagram += `  ${sanitize(mod.columnName)} -.-> ${sanitize(dv.columnName)}\n`;
      });
    });
  }

  return diagram;
}

/**
 * Sanitize variable names for Mermaid syntax
 */
function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}
