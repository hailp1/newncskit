from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import uuid


class AdminActivity(models.Model):
    """
    Track all admin actions for audit and monitoring purposes
    """
    ACTION_TYPES = [
        # User Management
        ('user_created', 'User Created'),
        ('user_updated', 'User Updated'),
        ('user_suspended', 'User Suspended'),
        ('user_activated', 'User Activated'),
        ('user_deleted', 'User Deleted'),
        ('user_role_changed', 'User Role Changed'),
        ('user_impersonated', 'User Impersonated'),
        
        # System Configuration
        ('config_updated', 'Configuration Updated'),
        ('system_settings_changed', 'System Settings Changed'),
        ('brand_config_updated', 'Brand Configuration Updated'),
        ('fee_config_updated', 'Fee Configuration Updated'),
        
        # Campaign Management
        ('campaign_approved', 'Campaign Approved'),
        ('campaign_rejected', 'Campaign Rejected'),
        ('campaign_forced_complete', 'Campaign Force Completed'),
        ('campaign_cancelled', 'Campaign Cancelled'),
        
        # Reward Management
        ('reward_processed', 'Reward Processed'),
        ('reward_rejected', 'Reward Rejected'),
        ('bulk_rewards_processed', 'Bulk Rewards Processed'),
        
        # Security Actions
        ('security_alert_resolved', 'Security Alert Resolved'),
        ('access_granted', 'Access Granted'),
        ('access_revoked', 'Access Revoked'),
        ('audit_log_exported', 'Audit Log Exported'),
        
        # System Maintenance
        ('system_backup_created', 'System Backup Created'),
        ('system_restored', 'System Restored'),
        ('maintenance_mode_enabled', 'Maintenance Mode Enabled'),
        ('maintenance_mode_disabled', 'Maintenance Mode Disabled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='admin_activities'
    )
    action_type = models.CharField(max_length=100, choices=ACTION_TYPES)
    description = models.TextField()
    
    # Generic foreign key to link to any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=255, null=True, blank=True)
    target_object = GenericForeignKey('content_type', 'object_id')
    
    # Additional context data
    details = models.JSONField(default=dict, blank=True)
    
    # Request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'admin_activities'
        verbose_name = 'Admin Activity'
        verbose_name_plural = 'Admin Activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['admin_user', '-created_at']),
            models.Index(fields=['action_type', '-created_at']),
            models.Index(fields=['content_type', 'object_id']),
        ]
    
    def __str__(self):
        return f"{self.admin_user.full_name} - {self.get_action_type_display()}"


class SystemConfiguration(models.Model):
    """
    Dynamic system configuration settings
    """
    CONFIG_CATEGORIES = [
        ('general', 'General Settings'),
        ('security', 'Security Settings'),
        ('email', 'Email Settings'),
        ('payment', 'Payment Settings'),
        ('features', 'Feature Toggles'),
        ('limits', 'System Limits'),
        ('branding', 'Branding Settings'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=255, unique=True)
    value = models.JSONField()
    category = models.CharField(max_length=50, choices=CONFIG_CATEGORIES, default='general')
    description = models.TextField(blank=True)
    
    # Validation and constraints
    data_type = models.CharField(
        max_length=20,
        choices=[
            ('string', 'String'),
            ('integer', 'Integer'),
            ('float', 'Float'),
            ('boolean', 'Boolean'),
            ('json', 'JSON Object'),
            ('array', 'Array'),
        ],
        default='string'
    )
    validation_rules = models.JSONField(default=dict, blank=True)
    
    # Status and metadata
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(default=False)  # System configs cannot be deleted
    requires_restart = models.BooleanField(default=False)
    
    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_configs'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='updated_configs'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'system_configurations'
        verbose_name = 'System Configuration'
        verbose_name_plural = 'System Configurations'
        ordering = ['category', 'key']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['key']),
        ]
    
    def __str__(self):
        return f"{self.key} ({self.get_category_display()})"
    
    @classmethod
    def get_config(cls, key, default=None):
        """Get configuration value by key"""
        try:
            config = cls.objects.get(key=key, is_active=True)
            return config.value
        except cls.DoesNotExist:
            return default
    
    @classmethod
    def set_config(cls, key, value, user=None, **kwargs):
        """Set configuration value"""
        config, created = cls.objects.get_or_create(
            key=key,
            defaults={'value': value, 'created_by': user, **kwargs}
        )
        if not created:
            config.value = value
            config.updated_by = user
            config.save()
        return config


class BrandConfiguration(models.Model):
    """
    Platform branding and interface customization settings
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic branding
    platform_title = models.CharField(max_length=255, default='NCSKIT')
    platform_tagline = models.TextField(blank=True)
    meta_description = models.TextField(blank=True)
    
    # Logo and icons
    header_logo_url = models.URLField(blank=True)
    favicon_url = models.URLField(blank=True)
    mobile_icon_url = models.URLField(blank=True)
    email_logo_url = models.URLField(blank=True)
    
    # Color scheme and theme
    color_scheme = models.JSONField(default=dict, blank=True)
    theme = models.CharField(
        max_length=50,
        choices=[
            ('light', 'Light Theme'),
            ('dark', 'Dark Theme'),
            ('auto', 'Auto (System Preference)'),
        ],
        default='light'
    )
    
    # Custom styling
    custom_css = models.TextField(blank=True)
    custom_js = models.TextField(blank=True)
    
    # SEO and social
    social_image_url = models.URLField(blank=True)
    twitter_handle = models.CharField(max_length=50, blank=True)
    facebook_page = models.URLField(blank=True)
    
    # Status and versioning
    is_active = models.BooleanField(default=False)
    version = models.CharField(max_length=20, default='1.0')
    
    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='created_brand_configs'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'brand_configurations'
        verbose_name = 'Brand Configuration'
        verbose_name_plural = 'Brand Configurations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.platform_title} v{self.version}"
    
    @classmethod
    def get_active_config(cls):
        """Get the currently active brand configuration"""
        return cls.objects.filter(is_active=True).first()
    
    def activate(self):
        """Activate this brand configuration"""
        # Deactivate all other configs
        self.__class__.objects.update(is_active=False)
        # Activate this one
        self.is_active = True
        self.save()


class UserRole(models.Model):
    """
    Custom user roles with granular permissions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # Permissions as JSON array
    permissions = models.JSONField(default=list, blank=True)
    
    # Role metadata
    is_system = models.BooleanField(default=False)  # System roles cannot be deleted
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0)  # Higher priority roles override lower ones
    
    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='created_roles'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_roles'
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'
        ordering = ['-priority', 'name']
        indexes = [
            models.Index(fields=['is_active', '-priority']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def user_count(self):
        """Get number of users with this role"""
        return self.user_assignments.count()


class Permission(models.Model):
    """
    System permissions for granular access control
    """
    PERMISSION_CATEGORIES = [
        ('users', 'User Management'),
        ('campaigns', 'Campaign Management'),
        ('rewards', 'Reward Management'),
        ('analytics', 'Analytics & Reports'),
        ('system', 'System Administration'),
        ('content', 'Content Management'),
        ('security', 'Security Management'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=PERMISSION_CATEGORIES)
    
    # Permission metadata
    is_system = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'permissions'
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['codename']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class UserRoleAssignment(models.Model):
    """
    Many-to-many relationship between users and roles
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='role_assignments'
    )
    role = models.ForeignKey(
        UserRole, 
        on_delete=models.CASCADE,
        related_name='user_assignments'
    )
    
    # Assignment metadata
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='assigned_roles'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_role_assignments'
        verbose_name = 'User Role Assignment'
        verbose_name_plural = 'User Role Assignments'
        unique_together = ['user', 'role']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['role', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} - {self.role.name}"


class UserLoginHistory(models.Model):
    """
    Track user login history for security and analytics
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='login_history'
    )
    
    # Login details
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_info = models.JSONField(default=dict, blank=True)
    location_info = models.JSONField(default=dict, blank=True)
    
    # Session tracking
    session_key = models.CharField(max_length=255, blank=True)
    login_at = models.DateTimeField(auto_now_add=True)
    logout_at = models.DateTimeField(null=True, blank=True)
    session_duration = models.DurationField(null=True, blank=True)
    
    # Status
    is_successful = models.BooleanField(default=True)
    failure_reason = models.CharField(max_length=255, blank=True)
    
    class Meta:
        db_table = 'user_login_history'
        verbose_name = 'User Login History'
        verbose_name_plural = 'User Login History'
        ordering = ['-login_at']
        indexes = [
            models.Index(fields=['user', '-login_at']),
            models.Index(fields=['ip_address', '-login_at']),
            models.Index(fields=['is_successful', '-login_at']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} - {self.login_at}"