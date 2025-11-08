'use client';

import { DataHealthReport } from '@/types/analysis';
import { DataHealthService } from '@/services/data-health.service';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  Database,
  AlertCircle,
  BarChart3,
  FileText
} from 'lucide-react';

interface DataHealthDashboardProps {
  healthReport: DataHealthReport;
  onContinue: () => void;
}

export default function DataHealthDashboard({ healthReport, onContinue }: DataHealthDashboardProps) {
  const scoreColor = DataHealthService.getScoreColor(healthReport.overallScore);
  const scoreLabel = DataHealthService.getScoreLabel(healthReport.overallScore);

  const getScoreIcon = () => {
    if (healthReport.overallScore >= 80) return <CheckCircle className="w-16 h-16 text-green-500" />;
    if (healthReport.overallScore >= 60) return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
    return <XCircle className="w-16 h-16 text-red-500" />;
  };

  const getScoreBgColor = () => {
    if (healthReport.overallScore >= 80) return 'bg-green-50 border-green-200';
    if (healthReport.overallScore >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreTextColor = () => {
    if (healthReport.overallScore >= 80) return 'text-green-900';
    if (healthReport.overallScore >= 60) return 'text-yellow-900';
    return 'text-red-900';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Overall Score Card */}
      <div className={`rounded-lg border-2 p-8 ${getScoreBgColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {getScoreIcon()}
            <div>
              <h2 className={`text-3xl font-bold ${getScoreTextColor()}`}>
                Data Quality: {scoreLabel}
              </h2>
              <p className="text-lg text-gray-600 mt-1">
                Overall Score: {healthReport.overallScore}/100
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Analysis completed in</div>
            <div className="text-2xl font-semibold text-gray-700">
              {(healthReport.analysisTime / 1000).toFixed(2)}s
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Rows</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {healthReport.totalRows.toLocaleString()}
              </p>
            </div>
            <Database className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Columns</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {healthReport.totalColumns}
              </p>
            </div>
            <BarChart3 className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Missing Values</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {healthReport.missingData.percentageMissing.toFixed(1)}%
              </p>
            </div>
            <AlertCircle className={`w-10 h-10 ${
              healthReport.missingData.percentageMissing > 10 ? 'text-red-500' : 'text-green-500'
            }`} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Outliers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {healthReport.outliers.totalOutliers}
              </p>
            </div>
            <TrendingUp className={`w-10 h-10 ${
              healthReport.outliers.totalOutliers > 0 ? 'text-orange-500' : 'text-green-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Data Type Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {healthReport.dataTypes.numeric}
            </div>
            <div className="text-sm text-gray-600 mt-1">Numeric</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {healthReport.dataTypes.categorical}
            </div>
            <div className="text-sm text-gray-600 mt-1">Categorical</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {healthReport.dataTypes.text}
            </div>
            <div className="text-sm text-gray-600 mt-1">Text</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">
              {healthReport.dataTypes.date}
            </div>
            <div className="text-sm text-gray-600 mt-1">Date</div>
          </div>
        </div>
      </div>

      {/* Missing Data Details */}
      {healthReport.missingData.variablesWithMissing.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Variables with Missing Data
          </h3>
          <div className="space-y-3">
            {healthReport.missingData.variablesWithMissing.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.variable}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.missingPercentage > 30 ? 'bg-red-500' :
                        item.missingPercentage > 10 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.missingPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-sm font-semibold text-gray-700">
                  {item.missingPercentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          {healthReport.missingData.variablesWithMissing.length > 5 && (
            <p className="text-sm text-gray-500 mt-3">
              ... and {healthReport.missingData.variablesWithMissing.length - 5} more variables
            </p>
          )}
        </div>
      )}

      {/* Outliers Details */}
      {healthReport.outliers.variablesWithOutliers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Variables with Outliers
          </h3>
          <div className="space-y-3">
            {healthReport.outliers.variablesWithOutliers.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.variable}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.outlierCount} outliers detected
                  </div>
                </div>
                <div className="ml-4 text-sm font-semibold text-orange-600">
                  {item.outlierPercentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          {healthReport.outliers.variablesWithOutliers.length > 5 && (
            <p className="text-sm text-gray-500 mt-3">
              ... and {healthReport.outliers.variablesWithOutliers.length - 5} more variables
            </p>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start space-x-3">
          <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Recommendations
            </h3>
            <ul className="space-y-2">
              {healthReport.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-blue-800 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Continue to Variable Grouping
        </button>
      </div>
    </div>
  );
}
