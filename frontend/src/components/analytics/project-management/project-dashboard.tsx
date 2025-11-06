'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  GitBranch, 
  Calendar, 
  BarChart3, 
  FileText, 
  Share2,
  Settings,
  Archive,
  Star,
  Clock,
  User
} from 'lucide-react';
import { analyticsService, AnalysisProject } from '@/services/analytics';
import { ProjectCard } from './project-card';
import { CreateProjectDialog } from './create-project-dialog';
import { CollaborationPanel } from './collaboration-panel';
import { VersionControlPanel } from './version-control-panel';

interface ProjectDashboardProps {
  userId: string;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ userId }) => {
  const [projects, setProjects] = useState<AnalysisProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<AnalysisProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<AnalysisProject | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, statusFilter, sortBy]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const userProjects = await analyticsService.getUserProjects(true);
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleProjectCreated = (newProject: AnalysisProject) => {
    setProjects(prev => [newProject, ...prev]);
    setShowCreateDialog(false);
  };

  const handleProjectUpdated = (updatedProject: AnalysisProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const myProjects = filteredProjects.filter(p => p.createdBy === userId);
  const collaborativeProjects = filteredProjects.filter(p => 
    p.createdBy !== userId && p.collaborators.some(c => c.userId === userId)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis Projects</h1>
          <p className="text-gray-600 mt-1">Manage your research analysis projects and collaborations</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collaborations</p>
                <p className="text-2xl font-bold text-gray-900">{collaborativeProjects.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Tabs */}
      <Tabs defaultValue="my-projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-projects" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            My Projects ({myProjects.length})
          </TabsTrigger>
          <TabsTrigger value="collaborations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaborations ({collaborativeProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-projects" className="space-y-4">
          {myProjects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first analysis project to get started</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdate={handleProjectUpdated}
                  onDelete={handleProjectDeleted}
                  onSelect={setSelectedProject}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collaborations" className="space-y-4">
          {collaborativeProjects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No collaborations yet</h3>
                <p className="text-gray-600">You'll see projects shared with you here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborativeProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdate={handleProjectUpdated}
                  onDelete={handleProjectDeleted}
                  onSelect={setSelectedProject}
                  isCollaboration={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={handleProjectCreated}
      />

      {/* Project Details Dialog */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedProject.title}
                <Badge className={getStatusColor(selectedProject.status)}>
                  {selectedProject.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedProject.description}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                <TabsTrigger value="versions">Version Control</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Research Questions</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedProject.researchQuestions.map((question, index) => (
                        <li key={index}>• {question}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Hypotheses</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedProject.hypotheses.map((hypothesis, index) => (
                        <li key={index}>• {hypothesis}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="collaboration">
                <CollaborationPanel project={selectedProject} onUpdate={handleProjectUpdated} />
              </TabsContent>
              
              <TabsContent value="versions">
                <VersionControlPanel project={selectedProject} onUpdate={handleProjectUpdated} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};