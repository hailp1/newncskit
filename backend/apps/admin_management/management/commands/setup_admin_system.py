from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.admin_management.models import (
    Permission, UserRole, SystemConfiguration, BrandConfiguration
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Setup initial admin system data including permissions, roles, and configurations'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up admin system...'))
        
        # Create permissions
        self.create_permissions()
        
        # Create default roles
        self.create_default_roles()
        
        # Create system configurations
        self.create_system_configurations()
        
        # Create default brand configuration
        self.create_brand_configuration()
        
        self.stdout.write(self.style.SUCCESS('Admin system setup completed successfully!'))
    
    def create_permissions(self):
        """Create system permissions"""
        permissions_data = [
            # User Management
            ('users.view', 'View Users', 'View user accounts and profiles', 'users'),
            ('users.create', 'Create Users', 'Create new user accounts', 'users'),
            ('users.edit', 'Edit Users', 'Edit user profiles and settings', 'users'),
            ('users.delete', 'Delete Users', 'Delete user accounts', 'users'),
            ('users.suspend', 'Suspend Users', 'Suspend user accounts', 'users'),
            ('users.impersonate', 'Impersonate Users', 'Impersonate users for support', 'users'),
            ('users.roles', 'Manage User Roles', 'Assign and manage user roles', 'users'),
            
            # Campaign Management
            ('campaigns.view', 'View Campaigns', 'View survey campaigns', 'campaigns'),
            ('campaigns.create', 'Create Campaigns', 'Create new survey campaigns', 'campaigns'),
            ('campaigns.edit', 'Edit Campaigns', 'Edit campaign settings', 'campaigns'),
            ('campaigns.delete', 'Delete Campaigns', 'Delete campaigns', 'campaigns'),
            ('campaigns.approve', 'Approve Campaigns', 'Approve campaigns for launch', 'campaigns'),
            ('campaigns.manage', 'Manage Campaign Lifecycle', 'Launch, pause, complete campaigns', 'campaigns'),
            
            # Reward Management
            ('rewards.view', 'View Rewards', 'View reward transactions', 'rewards'),
            ('rewards.process', 'Process Rewards', 'Process reward payments', 'rewards'),
            ('rewards.approve', 'Approve Rewards', 'Approve reward payments', 'rewards'),
            ('rewards.reject', 'Reject Rewards', 'Reject reward payments', 'rewards'),
            ('rewards.bulk', 'Bulk Process Rewards', 'Process multiple rewards at once', 'rewards'),
            
            # Analytics & Reports
            ('analytics.view', 'View Analytics', 'View system analytics and reports', 'analytics'),
            ('analytics.export', 'Export Reports', 'Export analytics data', 'analytics'),
            ('analytics.advanced', 'Advanced Analytics', 'Access advanced analytics features', 'analytics'),
            
            # System Administration
            ('system.config', 'System Configuration', 'Manage system settings', 'system'),
            ('system.brand', 'Brand Management', 'Manage platform branding', 'system'),
            ('system.monitoring', 'System Monitoring', 'Monitor system health and performance', 'system'),
            ('system.maintenance', 'System Maintenance', 'Perform system maintenance tasks', 'system'),
            ('system.backup', 'System Backup', 'Create and manage system backups', 'system'),
            
            # Content Management
            ('content.view', 'View Content', 'View platform content', 'content'),
            ('content.edit', 'Edit Content', 'Edit platform content', 'content'),
            ('content.publish', 'Publish Content', 'Publish content to platform', 'content'),
            ('content.moderate', 'Moderate Content', 'Moderate user-generated content', 'content'),
            
            # Security Management
            ('security.view', 'View Security Logs', 'View security logs and alerts', 'security'),
            ('security.manage', 'Manage Security', 'Manage security settings', 'security'),
            ('security.audit', 'Security Audit', 'Perform security audits', 'security'),
        ]
        
        created_count = 0
        for codename, name, description, category in permissions_data:
            permission, created = Permission.objects.get_or_create(
                codename=codename,
                defaults={
                    'name': name,
                    'description': description,
                    'category': category,
                    'is_system': True,
                    'is_active': True
                }
            )
            if created:
                created_count += 1
        
        self.stdout.write(f'Created {created_count} permissions')
    
    def create_default_roles(self):
        """Create default user roles"""
        roles_data = [
            {
                'name': 'Super Admin',
                'description': 'Full system access with all permissions',
                'permissions': [p.codename for p in Permission.objects.all()],
                'is_system': True,
                'priority': 100
            },
            {
                'name': 'Admin',
                'description': 'Administrative access with most permissions',
                'permissions': [
                    'users.view', 'users.create', 'users.edit', 'users.suspend', 'users.roles',
                    'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.approve', 'campaigns.manage',
                    'rewards.view', 'rewards.process', 'rewards.approve', 'rewards.reject',
                    'analytics.view', 'analytics.export',
                    'system.config', 'system.brand', 'system.monitoring',
                    'content.view', 'content.edit', 'content.moderate',
                    'security.view'
                ],
                'is_system': True,
                'priority': 90
            },
            {
                'name': 'Campaign Manager',
                'description': 'Manage survey campaigns and rewards',
                'permissions': [
                    'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.manage',
                    'rewards.view', 'rewards.process',
                    'analytics.view',
                    'users.view'
                ],
                'is_system': True,
                'priority': 70
            },
            {
                'name': 'Support Agent',
                'description': 'User support and basic management',
                'permissions': [
                    'users.view', 'users.edit', 'users.impersonate',
                    'campaigns.view',
                    'rewards.view',
                    'content.view', 'content.moderate'
                ],
                'is_system': True,
                'priority': 50
            },
            {
                'name': 'Analyst',
                'description': 'Analytics and reporting access',
                'permissions': [
                    'analytics.view', 'analytics.export', 'analytics.advanced',
                    'campaigns.view',
                    'users.view',
                    'rewards.view'
                ],
                'is_system': True,
                'priority': 40
            },
            {
                'name': 'Researcher',
                'description': 'Standard researcher with basic access',
                'permissions': [
                    'campaigns.view', 'campaigns.create',
                    'analytics.view'
                ],
                'is_system': False,
                'priority': 10
            }
        ]
        
        created_count = 0
        for role_data in roles_data:
            role, created = UserRole.objects.get_or_create(
                name=role_data['name'],
                defaults=role_data
            )
            if created:
                created_count += 1
        
        self.stdout.write(f'Created {created_count} user roles')
    
    def create_system_configurations(self):
        """Create default system configurations"""
        configs_data = [
            # General Settings
            ('platform_name', 'NCSKIT', 'general', 'Platform name', 'string'),
            ('platform_description', 'Advanced Research Platform for Social Sciences', 'general', 'Platform description', 'string'),
            ('max_file_upload_size', 10485760, 'general', 'Maximum file upload size in bytes (10MB)', 'integer'),
            ('session_timeout', 3600, 'general', 'Session timeout in seconds', 'integer'),
            
            # Security Settings
            ('password_min_length', 8, 'security', 'Minimum password length', 'integer'),
            ('login_attempts_limit', 5, 'security', 'Maximum login attempts before lockout', 'integer'),
            ('lockout_duration', 900, 'security', 'Account lockout duration in seconds', 'integer'),
            ('two_factor_required', False, 'security', 'Require two-factor authentication', 'boolean'),
            
            # Email Settings
            ('email_notifications_enabled', True, 'email', 'Enable email notifications', 'boolean'),
            ('admin_email', 'admin@ncskit.com', 'email', 'Administrator email address', 'string'),
            ('support_email', 'support@ncskit.com', 'email', 'Support email address', 'string'),
            
            # Payment Settings
            ('admin_fee_percentage', 10.0, 'payment', 'Admin fee percentage for campaigns', 'float'),
            ('min_reward_amount', 1.0, 'payment', 'Minimum reward amount', 'float'),
            ('max_reward_amount', 1000.0, 'payment', 'Maximum reward amount', 'float'),
            
            # Feature Toggles
            ('campaigns_enabled', True, 'features', 'Enable survey campaigns', 'boolean'),
            ('rewards_enabled', True, 'features', 'Enable reward system', 'boolean'),
            ('analytics_enabled', True, 'features', 'Enable analytics features', 'boolean'),
            ('collaboration_enabled', True, 'features', 'Enable collaboration features', 'boolean'),
            
            # System Limits
            ('max_campaigns_per_user', 10, 'limits', 'Maximum campaigns per user', 'integer'),
            ('max_participants_per_campaign', 10000, 'limits', 'Maximum participants per campaign', 'integer'),
            ('api_rate_limit', 1000, 'limits', 'API requests per hour per user', 'integer'),
        ]
        
        created_count = 0
        for key, value, category, description, data_type in configs_data:
            config, created = SystemConfiguration.objects.get_or_create(
                key=key,
                defaults={
                    'value': value,
                    'category': category,
                    'description': description,
                    'data_type': data_type,
                    'is_active': True,
                    'is_system': True
                }
            )
            if created:
                created_count += 1
        
        self.stdout.write(f'Created {created_count} system configurations')
    
    def create_brand_configuration(self):
        """Create default brand configuration"""
        brand_config, created = BrandConfiguration.objects.get_or_create(
            platform_title='NCSKIT',
            defaults={
                'platform_tagline': 'Advanced Research Platform for Social Sciences',
                'meta_description': 'NCSKIT is a comprehensive platform for conducting social science research with advanced survey tools, analytics, and collaboration features.',
                'color_scheme': {
                    'primary': '#3B82F6',
                    'secondary': '#64748B',
                    'accent': '#F59E0B',
                    'background': '#FFFFFF',
                    'text': '#1F2937',
                    'success': '#10B981',
                    'warning': '#F59E0B',
                    'error': '#EF4444'
                },
                'theme': 'light',
                'is_active': True,
                'version': '1.0'
            }
        )
        
        if created:
            self.stdout.write('Created default brand configuration')
        else:
            self.stdout.write('Brand configuration already exists')