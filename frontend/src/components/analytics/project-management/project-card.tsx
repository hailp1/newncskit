'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Users, 
  Calendar, 
  GitBranch, 
  Play, 
  Share2, 
  Archive, 
  Trash2,
  Edit,
  Copy,
  Download,
  Star,
  StarOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { analyticsService, AnalysisProject } from '@/services/analytics';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: AnalysisProject;
  onUpdate: (project: AnalysisProject) => void;
  onDelete: (projectId: string) => void;
  onSelect: (project: AnalysisProject) => void;
  isCollaboration?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onUpdate,
  onDelete,
  onSelect,
  isCollaboration = false
}) => {
  const [loading, setLoading] = useState(false);
  const [starred, setStarred] = useState(false); // This would come from user preferences

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🔄';
      case 'completed': return '✅';
      case 'archived': return '📦';
      default: return '📝';
    }
  };

  const handleArchive = async () => {
    try {
      setLoading(true);
      const updatedProject = await analyticsService.updateProject(project.id, {
        status: project.status === 'archived' ? 'draft' : 'archived'
      });
      onUpdate(updatedProject);
    } catch (error) {
      console.error('Failed to archive project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        setLoading(true);
        await analyticsService.deleteProject(project.id);
        onDelete(project.id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      setLoading(true);
      const newProject = await analyticsService.createProject({
        title: `${project.title} (Copy)`,
        description: project.description,
        theoreticalFramework: project.theoreticalFramework,
        researchQuestions: project.researchQuestions,
        hypotheses: project.hypotheses,
        dataSource: project.dataSource
      });
      onUpdate(newProject);
    } catch (error) {
      console.error('Failed to duplicate project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const blob = await analyticsService.exportReproducibilityPackage(project.id, false);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/\s+/g, '_')}_export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export project:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = () => {
    setStarred(!starred);
    // This would typically save to user preferences
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={() => onSelect(project)}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getStatusIcon(project.status)}</span>
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {project.title}
              </CardTitle>
              {isCollaboration && (
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Shared
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2 text-sm">
              {project.description}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleStar();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {starred ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onSelect(project)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} disabled={loading}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport} disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleArchive} disabled={loading}>
                  <Archive className="h-4 w-4 mr-2" />
                  {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
                {!isCollaboration && (
                  <DropdownMenuItem 
                    onClick={handleDelete} 
                    disabled={loading}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0" onClick={() => onSelect(project)}>
        <div className="space-y-3">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(project.status)}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <GitBranch className="h-3 w-3" />
              v{project.version}
            </div>
          </div>

          {/* Research Questions Preview */}
          {project.researchQuestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Research Questions:</p>
              <p className="text-xs text-gray-600 line-clamp-2">
                {project.researchQuestions[0]}
                {project.researchQuestions.length > 1 && ` (+${project.researchQuestions.length - 1} more)`}
              </p>
            </div>
          )}

          {/* Collaborators */}
          {project.collaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-gray-400" />
              <div className="flex -space-x-1">
                {project.collaborators.slice(0, 3).map((collaborator, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback className="text-xs">
                      {collaborator.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.collaborators.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">+{project.collaborators.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </div>
            
            {project.status === 'active' && (
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <Play className="h-3 w-3 mr-1" />
                Continue
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};