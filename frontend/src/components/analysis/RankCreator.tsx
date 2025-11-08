'use client';

import { useState, useEffect } from 'react';
import { RankDefinition, RankPreview } from '@/types/analysis';
import { DemographicService } from '@/services/demographic.service';
import { Plus, Trash2, Save, X, BarChart3 } from 'lucide-react';

interface RankCreatorProps {
  variableName: string;
  dataPreview: number[]; // Sample of actual values
  existingRanks?: RankDefinition[];
  onSave: (ranks: RankDefinition[]) => void;
  onCancel: () => void;
}

export default function RankCreator({
  variableName,
  dataPreview,
  existingRanks = [],
  onSave,
  onCancel,
}: RankCreatorProps) {
  const [ranks, setRanks] = useState<RankDefinition[]>(
    existingRanks.length > 0 
      ? existingRanks 
      : DemographicService.suggestRanks(dataPreview, 5)
  );
  const [preview, setPreview] = useState<RankPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Update preview whenever ranks change
  useEffect(() => {
    const newPreview = DemographicService.previewRankDistribution(dataPreview, ranks);
    setPreview(newPreview);

    // Validate ranks
    const validation = DemographicService.validateRanks(ranks);
    setErrors(validation.errors);
  }, [ranks, dataPreview]);

  const addRank = () => {
    const newRank: RankDefinition = {
      label: `Rank ${ranks.length + 1}`,
      minValue: 0,
      maxValue: 10,
      isOpenEndedMin: false,
      isOpenEndedMax: false,
    };
    setRanks([...ranks, newRank]);
  };

  const updateRank = (index: number, updates: Partial<RankDefinition>) => {
    const newRanks = [...ranks];
    newRanks[index] = { ...newRanks[index], ...updates };
    setRanks(newRanks);
  };

  const deleteRank = (index: number) => {
    setRanks(ranks.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validation = DemographicService.validateRanks(ranks);
    if (validation.valid) {
      onSave(ranks);
    }
  };

  const dataMin = Math.min(...dataPreview.filter(v => !isNaN(v)));
  const dataMax = Math.max(...dataPreview.filter(v => !isNaN(v)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Create Ranks for {variableName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Define custom ranges to categorize continuous data
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Data range: {dataMin.toFixed(2)} - {dataMax.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={errors.length > 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Ranks
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2">Validation Errors:</h4>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-800">{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rank Definitions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Rank Definitions</h4>
            <button
              onClick={addRank}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Rank
            </button>
          </div>

          <div className="space-y-3">
            {ranks.map((rank, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                {/* Rank Label */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={rank.label}
                    onChange={(e) => updateRank(index, { label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Low Income"
                  />
                </div>

                {/* Min Value */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Value
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rank.isOpenEndedMin || false}
                        onChange={(e) => updateRank(index, { 
                          isOpenEndedMin: e.target.checked,
                          minValue: e.target.checked ? undefined : 0
                        })}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-600">Open-ended (&lt;)</span>
                    </div>
                    {!rank.isOpenEndedMin && (
                      <input
                        type="number"
                        value={rank.minValue || 0}
                        onChange={(e) => updateRank(index, { 
                          minValue: parseFloat(e.target.value) 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                        step="0.01"
                      />
                    )}
                  </div>

                  {/* Max Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Value
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rank.isOpenEndedMax || false}
                        onChange={(e) => updateRank(index, { 
                          isOpenEndedMax: e.target.checked,
                          maxValue: e.target.checked ? undefined : 10
                        })}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-600">Open-ended (&gt;)</span>
                    </div>
                    {!rank.isOpenEndedMax && (
                      <input
                        type="number"
                        value={rank.maxValue || 10}
                        onChange={(e) => updateRank(index, { 
                          maxValue: parseFloat(e.target.value) 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                        step="0.01"
                      />
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteRank(index)}
                  className="w-full px-3 py-2 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Rank
                </button>
              </div>
            ))}

            {ranks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No ranks defined</p>
                <p className="text-sm">Click "Add Rank" to create one</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Distribution Preview</h4>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {preview.map((item, index) => {
                const maxCount = Math.max(...preview.map(p => p.count));
                const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {item.rank.label}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.count} ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300 flex items-center justify-center"
                        style={{ width: `${barWidth}%` }}
                      >
                        {item.count > 0 && (
                          <span className="text-xs text-white font-medium px-2">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {DemographicService.formatRankLabel(item.rank)}
                    </div>
                  </div>
                );
              })}

              {preview.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No preview available</p>
                  <p className="text-sm">Define ranks to see distribution</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2">Summary</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-800">Total Ranks:</span>
                <span className="font-medium text-blue-900">{ranks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Total Values:</span>
                <span className="font-medium text-blue-900">{dataPreview.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Categorized:</span>
                <span className="font-medium text-blue-900">
                  {preview.reduce((sum, p) => sum + p.count, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Uncategorized:</span>
                <span className="font-medium text-blue-900">
                  {dataPreview.length - preview.reduce((sum, p) => sum + p.count, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
