from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from .models import (
    AdminActivity, SystemConfiguration, BrandConfiguration,
    UserRole, Permission, UserRoleAssignment, UserLoginHistory
)
from .validators import (
    ConfigurationValidator, BrandConfigurationValidator, validate_system_config
)

User = get_user_model()


class AdminActivitySerializer(serializers.ModelSerializer):
    """Serializer for admin activity tracking"""
    admin_user_name = serializers.CharField(source='admin_user.full_name', read_only=True)
    admin_user_email = serializers.CharField(source='admin_user.email', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    target_object_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminActivity
        fields = [
            'id', 'admin_user', 'admin_user_name', 'admin_user_email',
            'action_type', 'action_type_display', 'description',
            'target_object_name', 'details', 'ip_address', 'user_agent',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_target_object_name(self, obj):
        """Get string representation of target object"""
        if obj.target_object:
            return str(obj.target_object)
        return None


class AdminActivityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating admin activities"""
    
    class Meta:
        model = AdminActivity
        fields = [
            'action_type', 'description', 'content_type', 'object_id',
            'details', 'ip_address', 'user_agent'
        ]
    
    def create(self, validated_data):
        # Set admin_user from request context
        validated_data['admin_user'] = self.context['request'].user
        return super().create(validated_data)


class SystemConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for system configuration"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    data_type_display = serializers.CharField(source='get_data_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True)
    
    class Meta:
        model = SystemConfiguration
        fields = [
            'id', 'key', 'value', 'category', 'category_display',
            'description', 'data_type', 'data_type_display',
            'validation_rules', 'is_active', 'is_system',
            'requires_restart', 'created_by', 'created_by_name',
            'updated_by', 'updated_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_value(self, value):
        """Validate value based on data_type and validation rules"""
        data_type = self.initial_data.get('data_type', 'string')
        validation_rules = self.initial_data.get('validation_rules', {})
        
        try:
            ConfigurationValidator.validate_config_value(data_type, value, validation_rules)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        return value
    
    def validate(self, attrs):
        """Validate the entire configuration"""
        key = attrs.get('key')
        value = attrs.get('value')
        data_type = attrs.get('data_type', 'string')
        validation_rules = attrs.get('validation_rules', {})
        
        if key and value is not None:
            try:
                validate_system_config(key, value, data_type, validation_rules)
            except Exception as e:
                raise serializers.ValidationError({'value': str(e)})
        
        return attrs


class BrandConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for brand configuration"""
    theme_display = serializers.CharField(source='get_theme_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = BrandConfiguration
        fields = [
            'id', 'platform_title', 'platform_tagline', 'meta_description',
            'header_logo_url', 'favicon_url', 'mobile_icon_url', 'email_logo_url',
            'color_scheme', 'theme', 'theme_display', 'custom_css', 'custom_js',
            'social_image_url', 'twitter_handle', 'facebook_page',
            'is_active', 'version', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_color_scheme(self, value):
        """Validate color scheme structure"""
        try:
            BrandConfigurationValidator.validate_color_scheme(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        return value
    
    def validate_header_logo_url(self, value):
        """Validate header logo URL"""
        try:
            BrandConfigurationValidator.validate_logo_url(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        return value
    
    def validate_custom_css(self, value):
        """Validate custom CSS"""
        try:
            BrandConfigurationValidator.validate_custom_css(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        return value


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for permissions"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Permission
        fields = [
            'id', 'name', 'codename', 'description', 'category',
            'category_display', 'is_system', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserRoleSerializer(serializers.ModelSerializer):
    """Serializer for user roles"""
    user_count = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    permission_details = serializers.SerializerMethodField()
    
    class Meta:
        model = UserRole
        fields = [
            'id', 'name', 'description', 'permissions', 'permission_details',
            'is_system', 'is_active', 'priority', 'user_count',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_permission_details(self, obj):
        """Get detailed permission information"""
        if not obj.permissions:
            return []
        
        permissions = Permission.objects.filter(
            codename__in=obj.permissions,
            is_active=True
        )
        return PermissionSerializer(permissions, many=True).data
    
    def validate_permissions(self, value):
        """Validate that all permissions exist"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Permissions must be a list")
        
        existing_permissions = Permission.objects.filter(
            codename__in=value,
            is_active=True
        ).values_list('codename', flat=True)
        
        invalid_permissions = set(value) - set(existing_permissions)
        if invalid_permissions:
            raise serializers.ValidationError(
                f"Invalid permissions: {', '.join(invalid_permissions)}"
            )
        
        return value


class UserRoleAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for user role assignments"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.full_name', read_only=True)
    
    class Meta:
        model = UserRoleAssignment
        fields = [
            'id', 'user', 'user_name', 'user_email', 'role', 'role_name',
            'assigned_by', 'assigned_by_name', 'assigned_at', 'expires_at',
            'is_active'
        ]
        read_only_fields = ['id', 'assigned_at']


class UserLoginHistorySerializer(serializers.ModelSerializer):
    """Serializer for user login history"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserLoginHistory
        fields = [
            'id', 'user', 'user_name', 'user_email', 'ip_address',
            'user_agent', 'device_info', 'location_info', 'session_key',
            'login_at', 'logout_at', 'session_duration', 'is_successful',
            'failure_reason'
        ]
        read_only_fields = ['id', 'login_at']


class UserManagementSerializer(serializers.ModelSerializer):
    """Extended user serializer for admin management"""
    full_name = serializers.ReadOnlyField()
    subscription_features = serializers.ReadOnlyField(source='get_subscription_features')
    role_assignments = UserRoleAssignmentSerializer(many=True, read_only=True)
    recent_activities = serializers.SerializerMethodField()
    login_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'institution', 'orcid_id', 'avatar', 'research_domains',
            'subscription_type', 'subscription_features', 'preferences',
            'is_active', 'is_staff', 'is_superuser', 'date_joined',
            'last_login', 'created_at', 'updated_at', 'role_assignments',
            'recent_activities', 'login_stats'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']
    
    def get_recent_activities(self, obj):
        """Get recent user activities"""
        activities = obj.activities.all()[:5]
        return [{
            'activity_type': activity.activity_type,
            'description': activity.description,
            'created_at': activity.created_at
        } for activity in activities]
    
    def get_login_stats(self, obj):
        """Get user login statistics"""
        login_history = obj.login_history.filter(is_successful=True)
        return {
            'total_logins': login_history.count(),
            'last_login': obj.last_login,
            'recent_ips': list(
                login_history.values_list('ip_address', flat=True)
                .distinct()[:5]
            )
        }


class SystemHealthSerializer(serializers.Serializer):
    """Serializer for system health status"""
    database = serializers.CharField()
    cache = serializers.CharField()
    storage = serializers.CharField()
    api = serializers.CharField()
    timestamp = serializers.DateTimeField()


class SystemMetricsSerializer(serializers.Serializer):
    """Serializer for system metrics"""
    user_count = serializers.IntegerField()
    active_users_today = serializers.IntegerField()
    active_campaigns = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    system_health = SystemHealthSerializer()
    performance_metrics = serializers.DictField()