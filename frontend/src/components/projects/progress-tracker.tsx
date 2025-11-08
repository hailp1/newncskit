'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  Milestone, 
  MilestoneStatus, 
  MilestoneType, 
  TimelineEvent, 
  ProgressReport,
  ProjectStage 
} from '@/types/workflow';
import { progressTrackingService } from '@/services/progress-tracking';

interface ProgressTrackerProps {
  projectId: string;
  milestones: Milestone[];
  timeline: TimelineEvent[];
  onMilestoneUpdate: (milestone: Milestone) => void;
  onMilestoneCreate: (milestone: Omit<Milestone, 'id' | 'projectId'>) => void;
  onMilestoneDelete: (milestoneId: string) => void;
  readOnly?: boolean;
}

export function ProgressTracker({
  projectId,
  milestones,
  timeline,
  onMilestoneUpdate,
  onMilestoneCreate,
  onMilestoneDelete,
  readOnly = false
}: ProgressTrackerProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [progressReport, setProgressReport] = useState<ProgressReport | null>(null);

  // Load progress report
  useEffect(() => {
    const loadProgressReport = async () => {
      try {
        const report = await progressTrackingService.generateProgressReport(projectId);
        setProgressReport(report);
      } catch (error) {
        console.error('Error loading progress report:', error);
      }
    };

    loadProgressReport();
  }, [projectId, milestones]);

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case MilestoneStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case MilestoneStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case MilestoneStatus.BLOCKED:
        return 'bg-red-100 text-red-800 border-red-200';
      case MilestoneStatus.SKIPPED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case MilestoneStatus.COMPLETED:
        return <CheckCircleIcon className="h-4 w-4" />;
      case MilestoneStatus.IN_PROGRESS:
        return <PlayIcon className="h-4 w-4" />;
      case MilestoneStatus.BLOCKED:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: MilestoneType) => {
    const colors = {
      [MilestoneType.RESEARCH_PLANNING]: 'bg-purple-100 text-purple-800',
      [MilestoneType.THEORETICAL_FRAMEWORK]: 'bg-indigo-100 text-indigo-800',
      [MilestoneType.SURVEY_DESIGN]: 'bg-blue-100 text-blue-800',
      [MilestoneType.DATA_COLLECTION]: 'bg-green-100 text-green-800',
      [MilestoneType.DATA_ANALYSIS]: 'bg-yellow-100 text-yellow-800',
      [MilestoneType.WRITING]: 'bg-orange-100 text-orange-800',
      [MilestoneType.REVIEW]: 'bg-pink-100 text-pink-800',
      [MilestoneType.SUBMISSION]: 'bg-red-100 text-red-800',
      [MilestoneType.PUBLICATION]: 'bg-emerald-100 text-emerald-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusChange = async (milestoneId: string, newStatus: MilestoneStatus) => {
    try {
      const milestone = milestones.find(m => m.id === milestoneId);
      if (!milestone) return;

      let updatedMilestone: Milestone;

      switch (newStatus) {
        case MilestoneStatus.IN_PROGRESS:
          updatedMilestone = await progressTrackingService.startMilestone(milestoneId);
          break;
        case MilestoneStatus.COMPLETED:
          updatedMilestone = await progressTrackingService.completeMilestone(milestoneId);
          break;
        case MilestoneStatus.BLOCKED:
          const reason = prompt('Please provide a reason for blocking this milestone:');
          if (reason) {
            updatedMilestone = await progressTrackingService.blockMilestone(milestoneId, reason);
          } else {
            return;
          }
          break;
        default:
          updatedMilestone = await progressTrackingService.updateMilestone(milestoneId, { status: newStatus });
      }

      onMilestoneUpdate(updatedMilestone);
    } catch (error) {
      console.error('Error updating milestone status:', error);
    }
  };

  const handleProgressUpdate = async (milestoneId: string, progress: number) => {
    try {
      const updatedMilestone = await progressTrackingService.updateProgress(milestoneId, progress);
      onMilestoneUpdate(updatedMilestone);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.orderIndex - b.orderIndex);
  const overallProgress = progressTrackingService.calculateProjectProgress(milestones);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Progress Overview</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {overallProgress}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={overallProgress} className="h-3" />
          
          {progressReport && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progressReport.completedMilestones}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {progressReport.totalMilestones - progressReport.completedMilestones}
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {progressReport.upcomingMilestones.length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {progressReport.blockedMilestones.length}
                </div>
                <div className="text-sm text-gray-600">Blocked</div>
              </div>
            </div>
          )}

          {progressReport?.estimatedCompletion && (
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600">Estimated Completion</div>
              <div className="font-medium text-blue-800">
                {new Date(progressReport.estimatedCompletion).toLocaleDateString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Milestones</span>
            {!readOnly && (
              <Button onClick={() => setShowCreateForm(true)} size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedMilestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedMilestone === milestone.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">
                          {index + 1}.
                        </span>
                        <h4 className="font-medium">{milestone.name}</h4>
                      </div>
                      
                      <Badge className={getTypeColor(milestone.type)}>
                        {milestone.type.replace('_', ' ')}
                      </Badge>
                      
                      <Badge className={getStatusColor(milestone.status)}>
                        {getStatusIcon(milestone.status)}
                        <span className="ml-1">{milestone.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>

                    {milestone.description && (
                      <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs text-gray-500">{milestone.progressPercentage}%</span>
                      </div>
                      <Progress value={milestone.progressPercentage} className="h-2" />
                    </div>

                    {/* Timeline Info */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      {milestone.plannedStartDate && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          <span>Start: {new Date(milestone.plannedStartDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {milestone.plannedCompletionDate && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          <span>Due: {new Date(milestone.plannedCompletionDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {milestone.estimatedHours && (
                        <div>Est. Hours: {milestone.estimatedHours}</div>
                      )}
                      {milestone.actualHours && (
                        <div>Actual Hours: {milestone.actualHours}</div>
                      )}
                    </div>

                    {milestone.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {milestone.notes}
                      </div>
                    )}
                  </div>

                  {!readOnly && (
                    <div className="flex items-center space-x-2 ml-4">
                      {milestone.status === MilestoneStatus.NOT_STARTED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(milestone.id, MilestoneStatus.IN_PROGRESS)}
                        >
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {milestone.status === MilestoneStatus.IN_PROGRESS && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(milestone.id, MilestoneStatus.COMPLETED)}
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingMilestone(milestone.id)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onMilestoneDelete(milestone.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Progress Update */}
                {milestone.status === MilestoneStatus.IN_PROGRESS && !readOnly && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium">Update Progress:</label>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={milestone.progressPercentage}
                        onChange={(e) => handleProgressUpdate(milestone.id, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm w-12">{milestone.progressPercentage}%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {sortedMilestones.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No milestones defined yet</p>
                {!readOnly && (
                  <Button onClick={() => setShowCreateForm(true)} className="mt-2">
                    Create First Milestone
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeline.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">{event.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Milestone Form Modal */}
      {showCreateForm && (
        <CreateMilestoneForm
          onSubmit={(milestone) => {
            onMilestoneCreate(milestone);
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}

// Create Milestone Form Component
interface CreateMilestoneFormProps {
  onSubmit: (milestone: Omit<Milestone, 'id' | 'projectId'>) => void;
  onCancel: () => void;
}

function CreateMilestoneForm({ onSubmit, onCancel }: CreateMilestoneFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: MilestoneType.RESEARCH_PLANNING,
    estimatedHours: 0,
    plannedStartDate: '',
    plannedCompletionDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const milestone: Omit<Milestone, 'id' | 'projectId'> = {
      title: formData.name,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      status: MilestoneStatus.NOT_STARTED,
      dueDate: formData.plannedCompletionDate ? new Date(formData.plannedCompletionDate) : new Date(),
      progressPercentage: 0,
      estimatedHours: formData.estimatedHours || undefined,
      plannedStartDate: formData.plannedStartDate ? new Date(formData.plannedStartDate) : undefined,
      plannedCompletionDate: formData.plannedCompletionDate ? new Date(formData.plannedCompletionDate) : undefined,
      orderIndex: 0, // Will be set by parent
      dependsOn: [],
      attachments: [],
      data: {}
    };

    onSubmit(milestone);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Milestone</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MilestoneType })}
                className="w-full px-3 py-2 border rounded-md"
              >
                {Object.values(MilestoneType).map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                <Input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Planned Start</label>
                <Input
                  type="date"
                  value={formData.plannedStartDate}
                  onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Planned Completion</label>
                <Input
                  type="date"
                  value={formData.plannedCompletionDate}
                  onChange={(e) => setFormData({ ...formData, plannedCompletionDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Create Milestone
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}