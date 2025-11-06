"""
Analysis Project Management Service for Advanced Data Analysis System

This service handles analysis project lifecycle, collaboration,
version control, and template management.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils import timezone

from ..models import (
    AnalysisProject, AnalysisCollaboration, AnalysisTemplate,
    AnalysisResult, AnalysisComment
)
from .data_pipeline import DataPipelineService

User = get_user_model()
logger = logging.getLogger(__name__)


@dataclass
class ProjectConfiguration:
    """Configuration for creating analysis project"""
    title: str
    description: str
    research_project_id: Optional[str] = None
    theoretical_framework: Dict[str, Any] = None
    research_questions: List[str] = None
    hypotheses: List[str] = None
    data_source: str = 'external_file'
    collaborators: List[str] = None
    template_id: Optional[str] = None


@dataclass
class CollaborationInvitation:
    """Collaboration invitation details"""
    project_id: str
    user_email: str
    role: str
    permissions: Dict[str, bool]
    message: str = ""


class VersionControlService:
    """Service for managing project versions"""
    
    def create_checkpoint(self, project: AnalysisProject, description: str) -> AnalysisProject:
        """Create a version checkpoint"""
        
        # Create new version
        new_version = AnalysisProject.objects.create(
            title=f"{project.title} (v{project.version + 1})",
            description=project.description,
            research_project=project.research_project,
            theoretical_framework=project.theoretical_framework,
            research_questions=project.research_questions,
            hypotheses=project.hypotheses,
            data_source=project.data_source,
            data_configuration=project.data_configuration,
            analysis_pipeline=project.analysis_pipeline,
            statistical_methods=project.statistical_methods,
            version=project.version + 1,
            parent_version=project,
            created_by=project.created_by,
            status='draft'
        )
        
        logger.info(f"Created version {new_version.version} for project {project.id}")
        return new_version
    
    def get_version_history(self, project: AnalysisProject) -> List[Dict[str, Any]]:
        """Get version history for project"""
        
        # Get all versions in the chain
        versions = []
        current = project
        
        while current:
            versions.append({
                'id': str(current.id),
                'version': current.version,
                'created_at': current.created_at,
                'created_by': current.created_by.get_full_name(),
                'status': current.status,
                'results_count': current.results.count(),
                'is_current': current.id == project.id
            })
            current = current.parent_version
        
        return sorted(versions, key=lambda x: x['version'], reverse=True)
    
    def rollback_to_version(self, project: AnalysisProject, target_version: int) -> AnalysisProject:
        """Rollback to specific version"""
        
        # Find target version
        current = project
        while current and current.version != target_version:
            current = current.parent_version
        
        if not current:
            raise ValueError(f"Version {target_version} not found")
        
        # Create new version based on target
        rollback_version = AnalysisProject.objects.create(
            title=f"{current.title} (rollback to v{target_version})",
            description=current.description,
            research_project=current.research_project,
            theoretical_framework=current.theoretical_framework,
            research_questions=current.research_questions,
            hypotheses=current.hypotheses,
            data_source=current.data_source,
            data_configuration=current.data_configuration,
            analysis_pipeline=current.analysis_pipeline,
            statistical_methods=current.statistical_methods,
            version=project.version + 1,
            parent_version=project,
            created_by=project.created_by,
            status='draft'
        )
        
        logger.info(f"Rolled back project {project.id} to version {target_version}")
        return rollback_version
    
    def compare_versions(self, version1: AnalysisProject, version2: AnalysisProject) -> Dict[str, Any]:
        """Compare two project versions"""
        
        comparison = {
            'version1': {
                'id': str(version1.id),
                'version': version1.version,
                'created_at': version1.created_at
            },
            'version2': {
                'id': str(version2.id),
                'version': version2.version,
                'created_at': version2.created_at
            },
            'differences': {}
        }
        
        # Compare key fields
        fields_to_compare = [
            'title', 'description', 'theoretical_framework',
            'research_questions', 'hypotheses', 'data_configuration',
            'analysis_pipeline', 'statistical_methods'
        ]
        
        for field in fields_to_compare:
            val1 = getattr(version1, field)
            val2 = getattr(version2, field)
            
            if val1 != val2:
                comparison['differences'][field] = {
                    'version1': val1,
                    'version2': val2
                }
        
        return comparison


class CollaborationService:
    """Service for managing project collaboration"""
    
    def invite_collaborator(
        self, 
        project: AnalysisProject, 
        invitation: CollaborationInvitation,
        invited_by: User
    ) -> AnalysisCollaboration:
        """Invite user to collaborate on project"""
        
        try:
            # Find user by email
            user = User.objects.get(email=invitation.user_email)
        except User.DoesNotExist:
            raise ValueError(f"User with email {invitation.user_email} not found")
        
        # Check if already collaborating
        existing = AnalysisCollaboration.objects.filter(
            project=project, user=user
        ).first()
        
        if existing:
            if existing.status == 'active':
                raise ValueError("User is already a collaborator")
            elif existing.status == 'pending':
                raise ValueError("Invitation already pending")
            else:
                # Reactivate previous collaboration
                existing.status = 'pending'
                existing.role = invitation.role
                existing.permissions = invitation.permissions
                existing.invited_by = invited_by
                existing.invited_at = timezone.now()
                existing.save()
                return existing
        
        # Create new collaboration
        collaboration = AnalysisCollaboration.objects.create(
            project=project,
            user=user,
            role=invitation.role,
            permissions=invitation.permissions,
            invited_by=invited_by,
            status='pending'
        )
        
        logger.info(f"Invited {user.email} to collaborate on project {project.id}")
        return collaboration
    
    def accept_invitation(self, collaboration_id: str, user: User) -> AnalysisCollaboration:
        """Accept collaboration invitation"""
        
        try:
            collaboration = AnalysisCollaboration.objects.get(
                id=collaboration_id, user=user, status='pending'
            )
        except AnalysisCollaboration.DoesNotExist:
            raise ValueError("Invitation not found or already processed")
        
        collaboration.accept_invitation()
        logger.info(f"User {user.email} accepted collaboration on project {collaboration.project.id}")
        return collaboration
    
    def decline_invitation(self, collaboration_id: str, user: User) -> AnalysisCollaboration:
        """Decline collaboration invitation"""
        
        try:
            collaboration = AnalysisCollaboration.objects.get(
                id=collaboration_id, user=user, status='pending'
            )
        except AnalysisCollaboration.DoesNotExist:
            raise ValueError("Invitation not found or already processed")
        
        collaboration.decline_invitation()
        logger.info(f"User {user.email} declined collaboration on project {collaboration.project.id}")
        return collaboration
    
    def update_collaborator_role(
        self, 
        project: AnalysisProject, 
        user: User, 
        new_role: str,
        new_permissions: Dict[str, bool],
        updated_by: User
    ) -> AnalysisCollaboration:
        """Update collaborator role and permissions"""
        
        try:
            collaboration = AnalysisCollaboration.objects.get(
                project=project, user=user, status='active'
            )
        except AnalysisCollaboration.DoesNotExist:
            raise ValueError("Active collaboration not found")
        
        collaboration.role = new_role
        collaboration.permissions = new_permissions
        collaboration.save()
        
        logger.info(f"Updated {user.email} role to {new_role} on project {project.id}")
        return collaboration
    
    def remove_collaborator(
        self, 
        project: AnalysisProject, 
        user: User,
        removed_by: User
    ) -> None:
        """Remove collaborator from project"""
        
        try:
            collaboration = AnalysisCollaboration.objects.get(
                project=project, user=user, status='active'
            )
        except AnalysisCollaboration.DoesNotExist:
            raise ValueError("Active collaboration not found")
        
        collaboration.status = 'removed'
        collaboration.save()
        
        logger.info(f"Removed {user.email} from project {project.id}")
    
    def get_project_collaborators(self, project: AnalysisProject) -> List[Dict[str, Any]]:
        """Get all project collaborators"""
        
        collaborations = AnalysisCollaboration.objects.filter(
            project=project, status='active'
        ).select_related('user')
        
        collaborators = []
        for collab in collaborations:
            collaborators.append({
                'id': str(collab.id),
                'user': {
                    'id': str(collab.user.id),
                    'email': collab.user.email,
                    'full_name': collab.user.get_full_name(),
                },
                'role': collab.role,
                'permissions': collab.permissions,
                'joined_at': collab.accepted_at,
                'last_accessed': collab.last_accessed,
                'contribution_count': collab.contribution_count
            })
        
        return collaborators
    
    def check_user_permission(
        self, 
        project: AnalysisProject, 
        user: User, 
        permission: str
    ) -> bool:
        """Check if user has specific permission on project"""
        
        # Project owner has all permissions
        if project.created_by == user:
            return True
        
        try:
            collaboration = AnalysisCollaboration.objects.get(
                project=project, user=user, status='active'
            )
            return collaboration.permissions.get(permission, False)
        except AnalysisCollaboration.DoesNotExist:
            return False


class TemplateService:
    """Service for managing analysis templates"""
    
    def create_template(
        self, 
        name: str,
        description: str,
        template_type: str,
        analysis_pipeline: List[Dict[str, Any]],
        statistical_methods: List[str],
        required_variables: Dict[str, Any],
        optional_variables: Dict[str, Any],
        created_by: User,
        is_public: bool = False
    ) -> AnalysisTemplate:
        """Create new analysis template"""
        
        template = AnalysisTemplate.objects.create(
            name=name,
            description=description,
            template_type=template_type,
            analysis_pipeline=analysis_pipeline,
            statistical_methods=statistical_methods,
            required_variables=required_variables,
            optional_variables=optional_variables,
            created_by=created_by,
            is_public=is_public
        )
        
        logger.info(f"Created template {name} by {created_by.email}")
        return template
    
    def get_available_templates(self, user: User) -> List[Dict[str, Any]]:
        """Get templates available to user"""
        
        # Get public templates and user's own templates
        templates = AnalysisTemplate.objects.filter(
            models.Q(is_public=True) | models.Q(created_by=user)
        ).order_by('-usage_count', 'name')
        
        template_list = []
        for template in templates:
            template_list.append({
                'id': str(template.id),
                'name': template.name,
                'description': template.description,
                'template_type': template.template_type,
                'usage_count': template.usage_count,
                'created_by': template.created_by.get_full_name(),
                'is_public': template.is_public,
                'created_at': template.created_at
            })
        
        return template_list
    
    def apply_template(self, project: AnalysisProject, template_id: str) -> AnalysisProject:
        """Apply template to project"""
        
        try:
            template = AnalysisTemplate.objects.get(id=template_id)
        except AnalysisTemplate.DoesNotExist:
            raise ValueError("Template not found")
        
        # Apply template configuration
        project.analysis_pipeline = template.analysis_pipeline
        project.statistical_methods = template.statistical_methods
        project.save()
        
        # Increment template usage
        template.increment_usage()
        
        logger.info(f"Applied template {template.name} to project {project.id}")
        return project


class AnalysisProjectService:
    """Main service for analysis project management"""
    
    def __init__(self):
        self.version_control = VersionControlService()
        self.collaboration = CollaborationService()
        self.template_service = TemplateService()
        self.data_pipeline = DataPipelineService()
    
    @transaction.atomic
    def create_analysis_project(
        self, 
        user: User,
        config: ProjectConfiguration
    ) -> AnalysisProject:
        """Create new analysis project"""
        
        # Create base project
        project = AnalysisProject.objects.create(
            title=config.title,
            description=config.description,
            research_project_id=config.research_project_id,
            theoretical_framework=config.theoretical_framework or {},
            research_questions=config.research_questions or [],
            hypotheses=config.hypotheses or [],
            data_source=config.data_source,
            created_by=user,
            status='draft'
        )
        
        # Apply template if specified
        if config.template_id:
            try:
                self.template_service.apply_template(project, config.template_id)
            except ValueError as e:
                logger.warning(f"Failed to apply template: {e}")
        
        # Invite collaborators if specified
        if config.collaborators:
            for collaborator_email in config.collaborators:
                try:
                    invitation = CollaborationInvitation(
                        project_id=str(project.id),
                        user_email=collaborator_email,
                        role='analyst',
                        permissions={
                            'view_results': True,
                            'run_analysis': True,
                            'edit_project': False,
                            'manage_collaborators': False
                        }
                    )
                    self.collaboration.invite_collaborator(project, invitation, user)
                except ValueError as e:
                    logger.warning(f"Failed to invite {collaborator_email}: {e}")
        
        logger.info(f"Created analysis project {project.title} by {user.email}")
        return project
    
    def get_user_projects(
        self, 
        user: User, 
        include_collaborations: bool = True
    ) -> List[Dict[str, Any]]:
        """Get projects accessible to user"""
        
        # Get owned projects
        owned_projects = AnalysisProject.objects.filter(created_by=user)
        
        # Get collaborative projects
        collaborative_projects = []
        if include_collaborations:
            collaborations = AnalysisCollaboration.objects.filter(
                user=user, status='active'
            ).select_related('project')
            collaborative_projects = [c.project for c in collaborations]
        
        # Combine and format
        all_projects = list(owned_projects) + collaborative_projects
        
        project_list = []
        for project in all_projects:
            project_list.append({
                'id': str(project.id),
                'title': project.title,
                'description': project.description,
                'status': project.status,
                'version': project.version,
                'data_source': project.data_source,
                'results_count': project.results.count(),
                'collaborators_count': project.collaborators.count(),
                'is_owner': project.created_by == user,
                'created_at': project.created_at,
                'updated_at': project.updated_at
            })
        
        return sorted(project_list, key=lambda x: x['updated_at'], reverse=True)
    
    def update_project(
        self, 
        project: AnalysisProject, 
        updates: Dict[str, Any],
        user: User
    ) -> AnalysisProject:
        """Update project configuration"""
        
        # Check permissions
        if not self.collaboration.check_user_permission(project, user, 'edit_project'):
            raise PermissionError("User does not have edit permissions")
        
        # Update allowed fields
        allowed_fields = [
            'title', 'description', 'theoretical_framework',
            'research_questions', 'hypotheses', 'analysis_pipeline',
            'statistical_methods'
        ]
        
        for field, value in updates.items():
            if field in allowed_fields:
                setattr(project, field, value)
        
        project.save()
        logger.info(f"Updated project {project.id} by {user.email}")
        return project
    
    def delete_project(self, project: AnalysisProject, user: User) -> None:
        """Delete analysis project"""
        
        # Only owner can delete
        if project.created_by != user:
            raise PermissionError("Only project owner can delete project")
        
        project_id = project.id
        project.delete()
        logger.info(f"Deleted project {project_id} by {user.email}")
    
    def archive_project(self, project: AnalysisProject, user: User) -> AnalysisProject:
        """Archive analysis project"""
        
        if not self.collaboration.check_user_permission(project, user, 'edit_project'):
            raise PermissionError("User does not have edit permissions")
        
        project.status = 'archived'
        project.save()
        logger.info(f"Archived project {project.id} by {user.email}")
        return project
    
    def duplicate_project(
        self, 
        project: AnalysisProject, 
        user: User,
        new_title: str = None
    ) -> AnalysisProject:
        """Create duplicate of existing project"""
        
        # Check view permissions
        if not self.collaboration.check_user_permission(project, user, 'view_results'):
            raise PermissionError("User does not have view permissions")
        
        # Create duplicate
        duplicate = AnalysisProject.objects.create(
            title=new_title or f"{project.title} (Copy)",
            description=project.description,
            research_project=project.research_project,
            theoretical_framework=project.theoretical_framework,
            research_questions=project.research_questions,
            hypotheses=project.hypotheses,
            data_source=project.data_source,
            data_configuration=project.data_configuration,
            analysis_pipeline=project.analysis_pipeline,
            statistical_methods=project.statistical_methods,
            created_by=user,
            status='draft'
        )
        
        logger.info(f"Duplicated project {project.id} as {duplicate.id} by {user.email}")
        return duplicate
    
    def export_project(
        self, 
        project: AnalysisProject, 
        user: User,
        include_results: bool = True
    ) -> Dict[str, Any]:
        """Export project configuration and results"""
        
        if not self.collaboration.check_user_permission(project, user, 'view_results'):
            raise PermissionError("User does not have view permissions")
        
        export_data = {
            'project': {
                'title': project.title,
                'description': project.description,
                'theoretical_framework': project.theoretical_framework,
                'research_questions': project.research_questions,
                'hypotheses': project.hypotheses,
                'data_source': project.data_source,
                'data_configuration': project.data_configuration,
                'analysis_pipeline': project.analysis_pipeline,
                'statistical_methods': project.statistical_methods,
                'version': project.version,
                'created_at': project.created_at.isoformat(),
                'updated_at': project.updated_at.isoformat()
            },
            'collaborators': self.collaboration.get_project_collaborators(project),
            'version_history': self.version_control.get_version_history(project)
        }
        
        if include_results:
            results = []
            for result in project.results.all():
                results.append({
                    'analysis_type': result.analysis_type,
                    'analysis_name': result.analysis_name,
                    'statistical_output': result.statistical_output,
                    'interpretation': result.statistical_interpretation,
                    'r_code': result.r_code,
                    'executed_at': result.executed_at.isoformat()
                })
            export_data['results'] = results
        
        logger.info(f"Exported project {project.id} by {user.email}")
        return export_data
    
    def import_project(
        self, 
        user: User,
        import_data: Dict[str, Any]
    ) -> AnalysisProject:
        """Import project from exported data"""
        
        project_data = import_data['project']
        
        # Create project
        project = AnalysisProject.objects.create(
            title=f"{project_data['title']} (Imported)",
            description=project_data['description'],
            theoretical_framework=project_data['theoretical_framework'],
            research_questions=project_data['research_questions'],
            hypotheses=project_data['hypotheses'],
            data_source=project_data['data_source'],
            data_configuration=project_data['data_configuration'],
            analysis_pipeline=project_data['analysis_pipeline'],
            statistical_methods=project_data['statistical_methods'],
            created_by=user,
            status='draft'
        )
        
        logger.info(f"Imported project {project.id} by {user.email}")
        return project
    
    def get_project_statistics(self, project: AnalysisProject) -> Dict[str, Any]:
        """Get project statistics and metrics"""
        
        stats = {
            'basic_info': {
                'version': project.version,
                'status': project.status,
                'created_at': project.created_at,
                'updated_at': project.updated_at,
                'days_active': (timezone.now() - project.created_at).days
            },
            'collaboration': {
                'collaborators_count': project.collaborators.count(),
                'active_collaborators': AnalysisCollaboration.objects.filter(
                    project=project, status='active'
                ).count(),
                'pending_invitations': AnalysisCollaboration.objects.filter(
                    project=project, status='pending'
                ).count()
            },
            'analysis': {
                'results_count': project.results.count(),
                'completed_analyses': project.results.filter(status='completed').count(),
                'failed_analyses': project.results.filter(status='failed').count(),
                'analysis_types': list(project.results.values_list('analysis_type', flat=True).distinct())
            },
            'data': {
                'data_source': project.data_source,
                'has_data_configuration': bool(project.data_configuration),
                'pipeline_steps': len(project.analysis_pipeline)
            }
        }
        
        return stats