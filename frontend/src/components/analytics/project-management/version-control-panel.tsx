'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  GitBranch, 
  GitCommit, 
  History, 
  RotateCcw, 
  Tag, 
  Plus,
  Clock,
  User,
  FileText,
  Download,
  Eye,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { analyticsService, AnalysisProject } from '@/services/analytics';
import { formatDistanceToNow, format } from 'date-fns';

interface VersionControlPanelProps {
  project: AnalysisProject;
  onUpdate: (project: AnalysisProject) => void;
}

interface ProjectVersion {
  id: string;
  version: number;
  description: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  changes: {
    type: 'created' | 'updated' | 'analysis_added' | 'data_updated' | 'settings_changed';
    description: string;
    details?: any;
  }[];
  isCurrent: boolean;
  analysisCount: number;
  dataSize?: number;
}

interface VersionComparison {
  version1: ProjectVersion;
  version2: ProjectVersion;
  differences: {
    field: string;
    oldValue: any;
    newValue: any;
    type: 'added' | 'removed' | 'modified';
  }[];
}

export const VersionControlPanel: React.FC<VersionControlPanelProps> = ({
  project,
  onUpdate
}) => {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  
  // Create version form state
  const [versionDescription, setVersionDescription] = useState('');

  useEffect(() => {
    loadVersionHistory();
  }, [project.id]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      const versionHistory = await analyticsService.getVersionHistory(project.id);
      setVersions(versionHistory);
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!versionDescription.trim()) return;

    try {
      setLoading(true);
      const newVersion = await analyticsService.createProjectVersion(project.id, versionDescription);
      onUpdate(newVersion);
      await loadVersionHistory();
      setVersionDescription('');
      setShowCreateVersion(false);
    } catch (error) {
      console.error('Failed to create version:', error);
      alert('Failed to create version. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (targetVersion: number) => {
    const confirmMessage = `Are you sure you want to rollback to version ${targetVersion}? This will create a new version with the previous state.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const rolledBackProject = await analyticsService.rollbackToVersion(project.id, targetVersion);
      onUpdate(rolledBackProject);
      await loadVersionHistory();
    } catch (error) {
      console.error('Failed to rollback:', error);
      alert('Failed to rollback to version. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompareVersions = async () => {
    if (selectedVersions.length !== 2) return;

    try {
      setLoading(true);
      // This would be implemented in the analytics service
      // const comparisonData = await analyticsService.compareVersions(project.id, selectedVersions[0], selectedVersions[1]);
      // setComparison(comparisonData);
      setShowComparison(true);
    } catch (error) {
      console.error('Failed to compare versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId];
      }
    });
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created': return <Plus className="h-4 w-4 text-green-600" />;
      case 'updated': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'analysis_added': return <GitCommit className="h-4 w-4 text-purple-600" />;
      case 'data_updated': return <Download className="h-4 w-4 text-orange-600" />;
      case 'settings_changed': return <GitBranch className="h-4 w-4 text-gray-600" />;
      default: return <GitCommit className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'created': return 'bg-green-100 text-green-800 border-green-200';
      case 'updated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'analysis_added': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'data_updated': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'settings_changed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Version Control</h3>
          <p className="text-sm text-gray-600">
            Track changes and manage project versions
          </p>
        </div>
        <div className="flex gap-2">
          {selectedVersions.length === 2 && (
            <Button 
              variant="outline"
              onClick={handleCompareVersions}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Compare
            </Button>
          )}
          <Button 
            onClick={() => setShowCreateVersion(true)}
            className="flex items-center gap-2"
          >
            <Tag className="h-4 w-4" />
            Create Version
          </Button>
        </div>
      </div>

      {/* Current Version Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-blue-900">Current Version: v{project.version}</div>
                <div className="text-sm text-blue-700">
                  Last updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                </div>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Version Selection Info */}
      {selectedVersions.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {selectedVersions.length === 1 
                  ? '1 version selected for comparison'
                  : `${selectedVersions.length} versions selected - ready to compare`
                }
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedVersions([])}
                className="text-yellow-800 hover:text-yellow-900"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Version History ({versions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No version history</h3>
              <p className="text-gray-600">Create your first version to start tracking changes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div 
                  key={version.id} 
                  className={`border rounded-lg p-4 transition-all ${
                    selectedVersions.includes(version.id) 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedVersions.includes(version.id)}
                        onChange={() => handleVersionSelection(version.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={version.isCurrent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            v{version.version}
                          </Badge>
                          {version.isCurrent && (
                            <Badge variant="outline" className="text-xs">Current</Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {format(new Date(version.createdAt), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        
                        <h4 className="font-medium mb-1">{version.description}</h4>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.createdBy.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <GitCommit className="h-3 w-3" />
                            {version.analysisCount} analyses
                          </div>
                          {version.dataSize && (
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {(version.dataSize / 1024 / 1024).toFixed(1)} MB
                            </div>
                          )}
                        </div>
                        
                        {/* Changes */}
                        {version.changes.length > 0 && (
                          <div className="space-y-2">
                            {version.changes.map((change, changeIndex) => (
                              <div key={changeIndex} className="flex items-center gap-2">
                                {getChangeIcon(change.type)}
                                <span className="text-sm">{change.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!version.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRollback(version.version)}
                          className="flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Timeline connector */}
                  {index < versions.length - 1 && (
                    <div className="ml-6 mt-4 h-4 border-l-2 border-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Version Dialog */}
      <Dialog open={showCreateVersion} onOpenChange={setShowCreateVersion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a snapshot of the current project state
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="version-description">Version Description</Label>
              <Textarea
                id="version-description"
                value={versionDescription}
                onChange={(e) => setVersionDescription(e.target.value)}
                placeholder="Describe the changes in this version..."
                rows={3}
                className="mt-1"
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Current State Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Project version: v{project.version}</div>
                <div>• Research questions: {project.researchQuestions.length}</div>
                <div>• Hypotheses: {project.hypotheses.length}</div>
                <div>• Data source: {project.dataSource}</div>
                <div>• Statistical methods: {project.statisticalMethods.length}</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateVersion(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateVersion}
              disabled={!versionDescription.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create Version'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version Comparison</DialogTitle>
            <DialogDescription>
              Compare changes between selected versions
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="text-center text-gray-600">
              Version comparison feature coming soon...
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};