from django.contrib import admin
from .models import (
    AdminActivity, SystemConfiguration, BrandConfiguration,
    UserRole, Permission, UserRoleAssignment, UserLoginHistory
)


@admin.register(AdminActivity)
class AdminActivityAdmin(admin.ModelAdmin):
    list_display = ['admin_user', 'action_type', 'description', 'ip_address', 'created_at']
    list_filter = ['action_type', 'created_at']
    search_fields = ['admin_user__email', 'description', 'ip_address']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False  # Activities are created automatically
    
    def has_change_permission(self, request, obj=None):
        return False  # Activities should not be modified
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # Only superusers can delete


@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    list_display = ['key', 'category', 'data_type', 'is_active', 'is_system', 'updated_at']
    list_filter = ['category', 'data_type', 'is_active', 'is_system']
    search_fields = ['key', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('key', 'value', 'category', 'description')
        }),
        ('Validation', {
            'fields': ('data_type', 'validation_rules')
        }),
        ('Status', {
            'fields': ('is_active', 'is_system', 'requires_restart')
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(BrandConfiguration)
class BrandConfigurationAdmin(admin.ModelAdmin):
    list_display = ['platform_title', 'version', 'theme', 'is_active', 'created_at']
    list_filter = ['theme', 'is_active', 'created_at']
    search_fields = ['platform_title', 'platform_tagline']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Branding', {
            'fields': ('platform_title', 'platform_tagline', 'meta_description')
        }),
        ('Visual Assets', {
            'fields': ('header_logo_url', 'favicon_url', 'mobile_icon_url', 'email_logo_url')
        }),
        ('Theme & Colors', {
            'fields': ('theme', 'color_scheme')
        }),
        ('Custom Styling', {
            'fields': ('custom_css', 'custom_js'),
            'classes': ('collapse',)
        }),
        ('Social & SEO', {
            'fields': ('social_image_url', 'twitter_handle', 'facebook_page'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'version')
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'user_count', 'is_system', 'is_active', 'priority', 'created_at']
    list_filter = ['is_system', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'user_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'permissions')
        }),
        ('Settings', {
            'fields': ('is_system', 'is_active', 'priority')
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'codename', 'category', 'is_system', 'is_active']
    list_filter = ['category', 'is_system', 'is_active']
    search_fields = ['name', 'codename', 'description']
    readonly_fields = ['id', 'created_at']
    
    def has_delete_permission(self, request, obj=None):
        if obj and obj.is_system:
            return False
        return super().has_delete_permission(request, obj)


@admin.register(UserRoleAssignment)
class UserRoleAssignmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'assigned_by', 'assigned_at', 'is_active']
    list_filter = ['role', 'is_active', 'assigned_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'role__name']
    readonly_fields = ['id', 'assigned_at']
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.assigned_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(UserLoginHistory)
class UserLoginHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'ip_address', 'login_at', 'logout_at', 'is_successful']
    list_filter = ['is_successful', 'login_at']
    search_fields = ['user__email', 'ip_address']
    readonly_fields = ['id', 'login_at', 'session_duration']
    date_hierarchy = 'login_at'
    
    def has_add_permission(self, request):
        return False  # Login history is created automatically
    
    def has_change_permission(self, request, obj=None):
        return False  # Login history should not be modified