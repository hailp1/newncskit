'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalysisProject, DataColumn } from '@/app/(dashboard)/analysis/page';

interface VariableMappingProps {
  project: AnalysisProject;
  onUpdate: (project: AnalysisProject) => void;
}

export default function VariableMapping({ project, onUpdate }: VariableMappingProps) {
  const [columns, setColumns] = useState<DataColumn[]>(project.columns);

  const updateColumnRole = (index: number, role: DataColumn['role']) => {
    const updatedColumns = [...columns];
    updatedColumns[index].role = role;
    setColumns(updatedColumns);
    
    const updatedProject = { ...project, columns: updatedColumns };
    onUpdate(updatedProject);
  };

  const updateColumnGroup = (index: number, group: string) => {
    const updatedColumns = [...columns];
    updatedColumns[index].group = group;
    setColumns(updatedColumns);
    
    const updatedProject = { ...project, columns: updatedColumns };
    onUpdate(updatedProject);
  };

  const roleColors = {
    independent: 'bg-blue-100 text-blue-800',
    dependent: 'bg-green-100 text-green-800',
    demographic: 'bg-purple-100 text-purple-800',
    control: 'bg-orange-100 text-orange-800',
    none: 'bg-gray-100 text-gray-800'
  };

  const typeColors = {
    numeric: 'bg-blue-50 border-blue-200',
    categorical: 'bg-green-50 border-green-200',
    ordinal: 'bg-purple-50 border-purple-200',
    text: 'bg-gray-50 border-gray-200'
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Variable Classification</h3>
        <p className="text-gray-600 mb-6">
          Classify your variables by their role in the analysis and group related variables together.
        </p>

        <div className="space-y-4">
          {columns.map((column, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${typeColors[column.type]}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{column.name}</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    column.type === 'numeric' ? 'bg-blue-100 text-blue-800' :
                    column.type === 'categorical' ? 'bg-green-100 text-green-800' :
                    column.type === 'ordinal' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {column.type}
                  </span>
                </div>
                
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[column.role]}`}>
                  {column.role}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Variable Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variable Role
                  </label>
                  <select
                    value={column.role}
                    onChange={(e) => updateColumnRole(index, e.target.value as DataColumn['role'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">Not specified</option>
                    <option value="independent">Independent Variable</option>
                    <option value="dependent">Dependent Variable</option>
                    <option value="demographic">Demographic Variable</option>
                    <option value="control">Control Variable</option>
                  </select>
                </div>

                {/* Variable Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variable Group (Optional)
                  </label>
                  <input
                    type="text"
                    value={column.group || ''}
                    onChange={(e) => updateColumnGroup(index, e.target.value)}
                    placeholder="e.g., Customer Satisfaction, Demographics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Variable Statistics */}
              {column.stats && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    {column.stats.mean !== undefined && (
                      <div>
                        <span className="font-medium">Mean:</span> {column.stats.mean}
                      </div>
                    )}
                    {column.stats.std !== undefined && (
                      <div>
                        <span className="font-medium">SD:</span> {column.stats.std}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Unique:</span> {column.stats.unique}
                    </div>
                    {column.missing > 0 && (
                      <div className="text-red-600">
                        <span className="font-medium">Missing:</span> {column.missing}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Variable Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(roleColors).map(([role, colorClass]) => {
            const count = columns.filter(col => col.role === role).length;
            return (
              <div key={role} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className={`text-sm px-2 py-1 rounded-full ${colorClass} inline-block mt-1`}>
                  {role.replace('_', ' ')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Groups Summary */}
        {columns.some(col => col.group) && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Variable Groups:</h4>
            <div className="flex flex-wrap gap-2">
              {[...new Set(columns.filter(col => col.group).map(col => col.group))].map((group, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {group} ({columns.filter(col => col.group === group).length})
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong>Independent Variables:</strong> These are your predictors or factors that you believe influence the outcome.
            </p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong>Dependent Variables:</strong> These are your outcomes or variables you want to predict or explain.
            </p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong>Demographic Variables:</strong> Background characteristics like age, gender, education level.
            </p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong>Control Variables:</strong> Variables you want to control for in your analysis.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}