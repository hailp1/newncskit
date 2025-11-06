from rest_framework import serializers
from .models import Project, ProjectCollaborator, Milestone, ProjectActivity, ProjectTemplate


class ProjectSerializer(serializers.ModelSerializer):
    """
    Basic project serializer
    """
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    collaborator_count = serializers.ReadOnlyField()
    document_count = serializers.ReadOnlyField()
    milestone_count = serializers.ReadOnlyField()
    completed_milestones_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'phase', 'status', 'progress',
            'owner', 'owner_name', 'start_date', 'end_date', 'tags',
            'research_design', 'data_collection', 'progress_tracking',
            'collaborator_count', 'document_count', 'milestone_count',
            'completed_milestones_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Owner will be set in the view
        return super().create(validated_data)


class ProjectDetailSerializer(ProjectSerializer):
    """
    Detailed project serializer with related data
    """
    collaborators = serializers.SerializerMethodField()
    recent_activities = serializers.SerializerMethodField()
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['collaborators', 'recent_activities', 'metadata']
    
    def get_collaborators(self, obj):
        collaborators = obj.collaborators.select_related('user')[:10]
        return ProjectCollaboratorSerializer(collaborators, many=True).data
    
    def get_recent_activities(self, obj):
        activities = obj.activities.select_related('user')[:5]
        return ProjectActivitySerializer(activities, many=True).data


class ProjectCollaboratorSerializer(serializers.ModelSerializer):
    """
    Project collaborator serializer
    """
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.full_name', read_only=True)
    
    class Meta:
        model = ProjectCollaborator
        fields = [
            'id', 'project', 'user', 'user_name', 'user_email', 'role',
            'permissions', 'invited_at', 'joined_at', 'invited_by', 'invited_by_name'
        ]
        read_only_fields = ['id', 'invited_at', 'invited_by']


class MilestoneSerializer(serializers.ModelSerializer):
    """
    Milestone serializer
    """
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Milestone
        fields = [
            'id', 'project', 'title', 'description', 'due_date', 'priority',
            'completed', 'completed_at', 'completed_by', 'completed_by_name',
            'assigned_to', 'assigned_to_name', 'is_overdue', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'completed_at', 'completed_by', 'created_at', 'updated_at']


class ProjectActivitySerializer(serializers.ModelSerializer):
    """
    Project activity serializer
    """
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    activity_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = ProjectActivity
        fields = [
            'id', 'project', 'user', 'user_name', 'activity_type',
            'activity_display', 'description', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProjectTemplateSerializer(serializers.ModelSerializer):
    """
    Project template serializer
    """
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = ProjectTemplate
        fields = [
            'id', 'name', 'description', 'template_type', 'default_phases',
            'default_milestones', 'suggested_timeline', 'is_public',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']