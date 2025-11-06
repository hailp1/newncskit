from django.db import models
from django.conf import settings
import uuid


class Project(models.Model):
    """
    Research project model
    """
    PHASE_CHOICES = [
        ('planning', 'Planning'),
        ('execution', 'Execution'),
        ('writing', 'Writing'),
        ('submission', 'Submission'),
        ('management', 'Management'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    phase = models.CharField(max_length=20, choices=PHASE_CHOICES, default='planning')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    progress = models.IntegerField(default=0, help_text='Progress percentage (0-100)')
    
    # Ownership and collaboration
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_projects'
    )
    
    # Timeline
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    
    # Research Design
    research_design = models.JSONField(default=dict, blank=True, help_text='Research design configuration including theoretical models, variables, and hypotheses')
    
    # Data Collection
    data_collection = models.JSONField(default=dict, blank=True, help_text='Data collection configuration including survey settings and participant criteria')
    
    # Progress Tracking
    progress_tracking = models.JSONField(default=dict, blank=True, help_text='Detailed progress tracking with milestones and publication status')
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
    
    @property
    def collaborator_count(self):
        return self.collaborators.count()
    
    @property
    def document_count(self):
        return self.documents.count()
    
    @property
    def milestone_count(self):
        return self.milestones.count()
    
    @property
    def completed_milestones_count(self):
        return self.milestones.filter(completed=True).count()
    
    def calculate_progress(self):
        """Calculate progress based on completed milestones"""
        total_milestones = self.milestone_count
        if total_milestones == 0:
            return 0
        completed = self.completed_milestones_count
        return round((completed / total_milestones) * 100)
    
    def update_progress(self):
        """Update progress and save"""
        self.progress = self.calculate_progress()
        self.save(update_fields=['progress'])


class ProjectCollaborator(models.Model):
    """
    Project collaboration model
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='collaborators')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='project_collaborations'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    permissions = models.JSONField(default=list, blank=True)
    
    # Invitation tracking
    invited_at = models.DateTimeField(auto_now_add=True)
    joined_at = models.DateTimeField(blank=True, null=True)
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_invitations'
    )
    
    class Meta:
        db_table = 'project_collaborators'
        verbose_name = 'Project Collaborator'
        verbose_name_plural = 'Project Collaborators'
        unique_together = ['project', 'user']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.project.title} ({self.role})"


class Milestone(models.Model):
    """
    Project milestone model
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Status
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='completed_milestones'
    )
    
    # Assignment
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_milestones'
    )
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_milestones'
        verbose_name = 'Milestone'
        verbose_name_plural = 'Milestones'
        ordering = ['due_date', '-priority']
    
    def __str__(self):
        return f"{self.project.title} - {self.title}"
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        return not self.completed and self.due_date < timezone.now().date()
    
    def mark_completed(self, user=None):
        """Mark milestone as completed"""
        from django.utils import timezone
        self.completed = True
        self.completed_at = timezone.now()
        if user:
            self.completed_by = user
        self.save()
        
        # Update project progress
        self.project.update_progress()


class ProjectActivity(models.Model):
    """
    Project-specific activity tracking
    """
    ACTIVITY_TYPES = [
        ('created', 'Project Created'),
        ('updated', 'Project Updated'),
        ('collaborator_added', 'Collaborator Added'),
        ('collaborator_removed', 'Collaborator Removed'),
        ('milestone_created', 'Milestone Created'),
        ('milestone_completed', 'Milestone Completed'),
        ('document_added', 'Document Added'),
        ('phase_changed', 'Phase Changed'),
        ('status_changed', 'Status Changed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='project_activities'
    )
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_activities'
        verbose_name = 'Project Activity'
        verbose_name_plural = 'Project Activities'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.project.title} - {self.get_activity_type_display()}"


class ProjectTemplate(models.Model):
    """
    Project templates for different research types
    """
    TEMPLATE_TYPES = [
        ('experimental', 'Experimental Research'),
        ('theoretical', 'Theoretical Research'),
        ('review', 'Literature Review'),
        ('case_study', 'Case Study'),
        ('survey', 'Survey Research'),
        ('mixed_methods', 'Mixed Methods'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    template_type = models.CharField(max_length=50, choices=TEMPLATE_TYPES)
    
    # Template structure
    default_phases = models.JSONField(default=list)
    default_milestones = models.JSONField(default=list)
    suggested_timeline = models.JSONField(default=dict)
    
    # Metadata
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_templates'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_templates'
        verbose_name = 'Project Template'
        verbose_name_plural = 'Project Templates'
    
    def __str__(self):
        return self.name