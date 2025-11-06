from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone
from .models import Project, ProjectCollaborator, Milestone, ProjectActivity, ProjectTemplate
from .serializers import (
    ProjectSerializer, ProjectDetailSerializer, ProjectCollaboratorSerializer,
    MilestoneSerializer, ProjectActivitySerializer, ProjectTemplateSerializer
)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing projects
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Return projects owned by user or where user is a collaborator
        return Project.objects.filter(
            models.Q(owner=user) | 
            models.Q(collaborators__user=user)
        ).distinct()
    
    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        
        # Create owner as collaborator
        ProjectCollaborator.objects.create(
            project=project,
            user=self.request.user,
            role='owner',
            joined_at=timezone.now()
        )
        
        # Log activity
        ProjectActivity.objects.create(
            project=project,
            user=self.request.user,
            activity_type='created',
            description=f'Created project: {project.title}'
        )
    
    @action(detail=True, methods=['get', 'put', 'patch'])
    def research_design(self, request, pk=None):
        """Get or update project research design"""
        project = self.get_object()
        
        if request.method == 'GET':
            return Response(project.research_design)
        
        elif request.method in ['PUT', 'PATCH']:
            if request.method == 'PUT':
                project.research_design = request.data
            else:  # PATCH
                project.research_design.update(request.data)
            
            project.save(update_fields=['research_design', 'updated_at'])
            
            # Log activity
            ProjectActivity.objects.create(
                project=project,
                user=request.user,
                activity_type='updated',
                description='Updated research design configuration'
            )
            
            return Response(project.research_design)
    
    @action(detail=True, methods=['get', 'put', 'patch'])
    def data_collection(self, request, pk=None):
        """Get or update project data collection configuration"""
        project = self.get_object()
        
        if request.method == 'GET':
            return Response(project.data_collection)
        
        elif request.method in ['PUT', 'PATCH']:
            if request.method == 'PUT':
                project.data_collection = request.data
            else:  # PATCH
                project.data_collection.update(request.data)
            
            project.save(update_fields=['data_collection', 'updated_at'])
            
            # Log activity
            ProjectActivity.objects.create(
                project=project,
                user=request.user,
                activity_type='updated',
                description='Updated data collection configuration'
            )
            
            return Response(project.data_collection)
    
    @action(detail=True, methods=['get', 'put', 'patch'])
    def progress_tracking(self, request, pk=None):
        """Get or update project progress tracking"""
        project = self.get_object()
        
        if request.method == 'GET':
            return Response(project.progress_tracking)
        
        elif request.method in ['PUT', 'PATCH']:
            if request.method == 'PUT':
                project.progress_tracking = request.data
            else:  # PATCH
                project.progress_tracking.update(request.data)
            
            project.save(update_fields=['progress_tracking', 'updated_at'])
            
            # Log activity
            ProjectActivity.objects.create(
                project=project,
                user=request.user,
                activity_type='updated',
                description='Updated progress tracking configuration'
            )
            
            return Response(project.progress_tracking)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get project analytics and reporting data"""
        project = self.get_object()
        
        # Calculate various analytics
        milestones = project.milestones.all()
        activities = project.activities.all()
        
        analytics = {
            'project_info': {
                'id': project.id,
                'title': project.title,
                'phase': project.phase,
                'status': project.status,
                'progress': project.progress,
                'created_at': project.created_at,
                'updated_at': project.updated_at,
            },
            'milestone_analytics': {
                'total_milestones': milestones.count(),
                'completed_milestones': milestones.filter(completed=True).count(),
                'overdue_milestones': sum(1 for m in milestones if m.is_overdue),
                'completion_rate': project.calculate_progress(),
                'milestones_by_priority': {
                    priority: milestones.filter(priority=priority).count()
                    for priority, _ in Milestone.PRIORITY_CHOICES
                },
            },
            'activity_analytics': {
                'total_activities': activities.count(),
                'activities_by_type': {
                    activity_type: activities.filter(activity_type=activity_type).count()
                    for activity_type, _ in ProjectActivity.ACTIVITY_TYPES
                },
                'recent_activity_count': activities.filter(
                    created_at__gte=timezone.now() - timezone.timedelta(days=7)
                ).count(),
            },
            'collaboration_analytics': {
                'total_collaborators': project.collaborator_count,
                'collaborators_by_role': {
                    role: project.collaborators.filter(role=role).count()
                    for role, _ in ProjectCollaborator.ROLE_CHOICES
                },
            },
            'timeline_analytics': {
                'project_duration_days': (
                    (project.end_date - project.start_date).days
                    if project.start_date and project.end_date else None
                ),
                'days_since_creation': (timezone.now().date() - project.created_at.date()).days,
                'estimated_completion': project.end_date,
            }
        }
        
        return Response(analytics)


class MilestoneViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing project milestones
    """
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return Milestone.objects.filter(project_id=project_id)
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id)
        
        milestone = serializer.save(project=project)
        
        # Log activity
        ProjectActivity.objects.create(
            project=project,
            user=self.request.user,
            activity_type='milestone_created',
            description=f'Created milestone: {milestone.title}'
        )
    
    @action(detail=True, methods=['post'])
    def complete(self, request, project_id=None, pk=None):
        """Mark milestone as completed"""
        milestone = self.get_object()
        milestone.mark_completed(user=request.user)
        
        # Log activity
        ProjectActivity.objects.create(
            project=milestone.project,
            user=request.user,
            activity_type='milestone_completed',
            description=f'Completed milestone: {milestone.title}'
        )
        
        return Response({'status': 'milestone completed'})


class ProjectCollaboratorListView(generics.ListCreateAPIView):
    """
    List and create project collaborators
    """
    serializer_class = ProjectCollaboratorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ProjectCollaborator.objects.filter(project_id=project_id)
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id)
        
        collaborator = serializer.save(
            project=project,
            invited_by=self.request.user
        )
        
        # Log activity
        ProjectActivity.objects.create(
            project=project,
            user=self.request.user,
            activity_type='collaborator_added',
            description=f'Added collaborator: {collaborator.user.full_name}'
        )


class ProjectCollaboratorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a project collaborator
    """
    serializer_class = ProjectCollaboratorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        project_id = self.kwargs.get('project_id')
        user_id = self.kwargs.get('user_id')
        return get_object_or_404(
            ProjectCollaborator,
            project_id=project_id,
            user_id=user_id
        )


class ProjectActivityListView(generics.ListAPIView):
    """
    List project activities
    """
    serializer_class = ProjectActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ProjectActivity.objects.filter(project_id=project_id)[:20]


class ProjectTemplateListView(generics.ListAPIView):
    """
    List available project templates
    """
    serializer_class = ProjectTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ProjectTemplate.objects.filter(is_public=True)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def project_dashboard_stats(request):
    """
    Get project dashboard statistics for user
    """
    user = request.user
    
    # Get user's projects
    projects = Project.objects.filter(
        models.Q(owner=user) | 
        models.Q(collaborators__user=user)
    ).distinct()
    
    # Calculate stats
    stats = {
        'total_projects': projects.count(),
        'active_projects': projects.filter(status='active').count(),
        'completed_projects': projects.filter(status='completed').count(),
        'projects_by_phase': {
            'planning': projects.filter(phase='planning').count(),
            'execution': projects.filter(phase='execution').count(),
            'writing': projects.filter(phase='writing').count(),
            'submission': projects.filter(phase='submission').count(),
            'management': projects.filter(phase='management').count(),
        },
        'recent_projects': ProjectSerializer(
            projects.order_by('-updated_at')[:5], 
            many=True
        ).data,
        'upcoming_milestones': MilestoneSerializer(
            Milestone.objects.filter(
                project__in=projects,
                completed=False
            ).order_by('due_date')[:5],
            many=True
        ).data,
    }
    
    return Response(stats)