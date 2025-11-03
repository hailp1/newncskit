from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    institution = models.CharField(max_length=255, blank=True, null=True)
    orcid_id = models.CharField(max_length=50, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Research-specific fields
    research_domains = models.JSONField(default=list, blank=True)
    
    # Subscription and preferences
    subscription_type = models.CharField(
        max_length=20,
        choices=[
            ('free', 'Free'),
            ('premium', 'Premium'),
            ('institutional', 'Institutional'),
        ],
        default='free'
    )
    preferences = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_subscription_features(self):
        """Return features available for user's subscription type"""
        features_map = {
            'free': ['basic_projects', 'reference_manager', 'smart_editor'],
            'premium': ['all_features', 'ai_assistance', 'collaboration', 'analytics'],
            'institutional': [
                'all_features', 'ai_assistance', 'collaboration', 
                'analytics', 'team_management', 'advanced_security'
            ]
        }
        return features_map.get(self.subscription_type, features_map['free'])


class UserProfile(models.Model):
    """
    Extended user profile information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # Academic information
    academic_title = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=200, blank=True)
    
    # Social links
    google_scholar_url = models.URLField(blank=True)
    researchgate_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    
    # Privacy settings
    profile_visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', 'Public'),
            ('institution', 'Institution Only'),
            ('private', 'Private'),
        ],
        default='public'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile of {self.user.full_name}"


class UserActivity(models.Model):
    """
    Track user activities for analytics and dashboard
    """
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('project_created', 'Project Created'),
        ('project_updated', 'Project Updated'),
        ('document_created', 'Document Created'),
        ('document_updated', 'Document Updated'),
        ('reference_added', 'Reference Added'),
        ('collaboration_invited', 'Collaboration Invited'),
        ('milestone_completed', 'Milestone Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    
    # Optional foreign key to related objects
    project_id = models.UUIDField(blank=True, null=True)
    document_id = models.UUIDField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activities'
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.get_activity_type_display()}"