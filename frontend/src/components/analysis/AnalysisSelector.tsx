'use client';

import { useState } from 'react';
import { AnalysisType } from '@/types/analysis';
import { 
  Check, 
  Info, 
  ChevronDown, 
  ChevronUp,
  BarChart3,
  TrendingUp,
  GitBranch,
  Network,
  Layers,
  Activity,
  Save
} from 'lucide-react';

interface AnalysisOption {
  type: AnalysisType;
  name: string;
  description: string;
  icon: React.ReactNode;
  prerequisites: string[];
  estimatedTime: string;
  configOptions?: {
    label: string;
    key: string;
    type: 'select' | 'number' | 'checkbox';
    options?: string[];
    default: any;
  }[];
}

const analysisOptions: AnalysisOption[] = [
  {
    type: 'descriptive',
    name: 'Descriptive Statistics',
    description: 'Calculate mean, SD, min, max, skewness, and kurtosis for all variables',
    icon: <BarChart3 className="w-5 h-5" />,
    prerequisites: [],
    estimatedTime: '5-10s',
    configOptions: [
      {
        label: 'Group by Demographics',
        key: 'groupByDemographics',
        type: 'checkbox',
        default: true,
      },
      {
        label: 'Confidence Level',
        key: 'confidenceLevel',
        type: 'select',
        options: ['90%', '95%', '99%'],
        default: '95%',
      },
    ],
  },
  {
    type: 'reliability',
    name: 'Reliability Analysis',
    description: "Calculate Cronbach's Alpha for each variable group to assess internal consistency",
    icon: <Activity className="w-5 h-5" />,
    prerequisites: ['At least one variable group with 2+ items'],
    estimatedTime: '5-10s',
    configOptions: [
      {
        label: 'Show Alpha if Deleted',
        key: 'showAlphaIfDeleted',
        type: 'checkbox',
        default: true,
      },
    ],
  },
  {
    type: 'efa',
    name: 'Exploratory Factor Analysis (EFA)',
    description: 'Discover underlying factor structure using principal component analysis',
    icon: <Layers className="w-5 h-5" />,
    prerequisites: ['At least 3 variables', 'Numeric variables only'],
    estimatedTime: '10-20s',
    configOptions: [
      {
        label: 'Rotation Method',
        key: 'rotation',
        type: 'select',
        options: ['varimax', 'promax', 'oblimin', 'none'],
        default: 'varimax',
      },
      {
        label: 'Number of Factors',
        key: 'nFactors',
        type: 'select',
        options: ['auto', '2', '3', '4', '5', '6'],
        default: 'auto',
      },
      {
        label: 'Loading Threshold',
        key: 'loadingThreshold',
        type: 'number',
        default: 0.4,
      },
    ],
  },
  {
    type: 'cfa',
    name: 'Confirmatory Factor Analysis (CFA)',
    description: 'Test predefined factor structure and calculate model fit indices',
    icon: <GitBranch className="w-5 h-5" />,
    prerequisites: ['Variable groups defined', 'At least 2 groups with 2+ items each'],
    estimatedTime: '15-30s',
    configOptions: [
      {
        label: 'Estimator',
        key: 'estimator',
        type: 'select',
        options: ['ML', 'MLR', 'WLSMV'],
        default: 'ML',
      },
    ],
  },
  {
    type: 'correlation',
    name: 'Correlation Analysis',
    description: 'Calculate correlation matrix between all numeric variables',
    icon: <Network className="w-5 h-5" />,
    prerequisites: ['At least 2 numeric variables'],
    estimatedTime: '5-10s',
    configOptions: [
      {
        label: 'Method',
        key: 'method',
        type: 'select',
        options: ['pearson', 'spearman', 'kendall'],
        default: 'pearson',
      },
      {
        label: 'Show Significance',
        key: 'showSignificance',
        type: 'checkbox',
        default: true,
      },
    ],
  },
  {
    type: 'anova',
    name: 'ANOVA (Group Comparison)',
    description: 'Compare means across demographic groups using one-way ANOVA',
    icon: <TrendingUp className="w-5 h-5" />,
    prerequisites: ['At least one demographic variable', 'At least one numeric variable'],
    estimatedTime: '10-15s',
    configOptions: [
      {
        label: 'Post-hoc Test',
        key: 'postHoc',
        type: 'select',
        options: ['tukey', 'bonferroni', 'scheffe', 'none'],
        default: 'tukey',
      },
    ],
  },
  {
    type: 'regression',
    name: 'Linear Regression',
    description: 'Predict dependent variable from independent variables',
    icon: <TrendingUp className="w-5 h-5" />,
    prerequisites: ['At least 2 numeric variables'],
    estimatedTime: '10-20s',
    configOptions: [
      {
        label: 'Include Diagnostics',
        key: 'includeDiagnostics',
        type: 'checkbox',
        default: true,
      },
    ],
  },
  {
    type: 'sem',
    name: 'Structural Equation Modeling (SEM)',
    description: 'Test complex relationships between latent variables',
    icon: <Network className="w-5 h-5" />,
    prerequisites: ['Variable groups defined', 'At least 3 groups'],
    estimatedTime: '30-60s',
    configOptions: [
      {
        label: 'Estimator',
        key: 'estimator',
        type: 'select',
        options: ['ML', 'MLR', 'WLSMV'],
        default: 'ML',
      },
    ],
  },
];

interface AnalysisSelectorProps {
  onSave: (selectedAnalyses: { type: AnalysisType; config: any }[]) => void;
  onCancel?: () => void;
}

export default function AnalysisSelector({ onSave, onCancel }: AnalysisSelectorProps) {
  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<AnalysisType>>(
    new Set(['descriptive', 'reliability'])
  );
  const [expandedAnalysis, setExpandedAnalysis] = useState<AnalysisType | null>(null);
  const [configurations, setConfigurations] = useState<Partial<Record<AnalysisType, any>>>({
    descriptive: { groupByDemographics: true, confidenceLevel: '95%' },
    reliability: { showAlphaIfDeleted: true },
    efa: { rotation: 'varimax', nFactors: 'auto', loadingThreshold: 0.4 },
    cfa: { estimator: 'ML' },
    correlation: { method: 'pearson', showSignificance: true },
    ttest: {},
    anova: { postHoc: 'tukey' },
    regression: { includeDiagnostics: true },
    sem: { estimator: 'ML' },
  });

  const toggleAnalysis = (type: AnalysisType) => {
    const newSelected = new Set(selectedAnalyses);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedAnalyses(newSelected);
  };

  const toggleExpand = (type: AnalysisType) => {
    setExpandedAnalysis(expandedAnalysis === type ? null : type);
  };

  const updateConfig = (type: AnalysisType, key: string, value: any) => {
    setConfigurations({
      ...configurations,
      [type]: {
        ...configurations[type],
        [key]: value,
      },
    });
  };

  const handleSave = () => {
    const selected = Array.from(selectedAnalyses).map(type => ({
      type,
      config: configurations[type] || {},
    }));
    onSave(selected);
  };

  const totalEstimatedTime = Array.from(selectedAnalyses).reduce((total, type) => {
    const option = analysisOptions.find(o => o.type === type);
    if (!option) return total;
    
    const timeStr = option.estimatedTime;
    const maxTime = parseInt(timeStr.split('-')[1] || timeStr);
    return total + maxTime;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Analyses</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose which statistical analyses to perform on your data
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
            disabled={selectedAnalyses.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Run {selectedAnalyses.size} {selectedAnalyses.size === 1 ? 'Analysis' : 'Analyses'}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">
              {selectedAnalyses.size} {selectedAnalyses.size === 1 ? 'analysis' : 'analyses'} selected
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Estimated total time: ~{totalEstimatedTime}s
            </p>
          </div>
          {selectedAnalyses.size === 0 && (
            <p className="text-sm text-blue-700">
              Select at least one analysis to continue
            </p>
          )}
        </div>
      </div>

      {/* Analysis Options */}
      <div className="space-y-3">
        {analysisOptions.map((option) => {
          const isSelected = selectedAnalyses.has(option.type);
          const isExpanded = expandedAnalysis === option.type;
          const hasConfig = option.configOptions && option.configOptions.length > 0;

          return (
            <div
              key={option.type}
              className={`
                bg-white rounded-lg border-2 transition-all
                ${isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-200'}
              `}
            >
              {/* Main Card */}
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div
                    onClick={() => toggleAnalysis(option.type)}
                    className="cursor-pointer"
                  >
                    <div
                      className={`
                        w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
                        ${isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 hover:border-blue-400'
                        }
                      `}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                          {option.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{option.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        ~{option.estimatedTime}
                      </span>
                    </div>

                    {/* Prerequisites */}
                    {option.prerequisites.length > 0 && (
                      <div className="mt-3 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Prerequisites:</span>{' '}
                          {option.prerequisites.join(', ')}
                        </div>
                      </div>
                    )}

                    {/* Config Toggle */}
                    {hasConfig && isSelected && (
                      <button
                        onClick={() => toggleExpand(option.type)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Options
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show Options
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Configuration Panel */}
              {hasConfig && isSelected && isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Configuration Options
                  </h4>
                  <div className="space-y-3">
                    {option.configOptions?.map((configOption) => (
                      <div key={configOption.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {configOption.label}
                        </label>

                        {configOption.type === 'select' && (
                          <select
                            value={configurations[option.type]?.[configOption.key] || configOption.default}
                            onChange={(e) => updateConfig(option.type, configOption.key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {configOption.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {configOption.type === 'number' && (
                          <input
                            type="number"
                            value={configurations[option.type]?.[configOption.key] || configOption.default}
                            onChange={(e) => updateConfig(option.type, configOption.key, parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="0.1"
                            min="0"
                            max="1"
                          />
                        )}

                        {configOption.type === 'checkbox' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={configurations[option.type]?.[configOption.key] ?? configOption.default}
                              onChange={(e) => updateConfig(option.type, configOption.key, e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-600">
                              {configOption.label}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
