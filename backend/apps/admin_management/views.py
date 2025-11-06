from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django.core.cache import cache
from django.db import connection
from datetime import datetime, timedelta
import psutil
import os

from .models import (
    AdminActivity, SystemConfiguration, BrandConfiguration,
    UserRole, Permission, UserRoleAssignment, UserLoginHistory
)
from .serializers import (
    AdminActivitySerializer, AdminActivityCreateSerializer,
    SystemConfigurationSerializer, BrandConfigurationSerializer,
    UserRoleSerializer, PermissionSerializer, UserRoleAssignmentSerializer,
    UserLoginHistorySerializer, UserManagementSerializer,
    SystemHealthSerializer, SystemMetricsSerializer
)
from .services import UserManagementService, UserRoleService

User = get_user_model()


class AdminActivityViewSet(viewsets.ModelViewSet):
    """ViewSet for admin activity tracking"""
    
    queryset = AdminActivity.objects.all()
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdminActivityCreateSerializer
        return AdminActivitySerializer
    
    def get_queryset(self):
        queryset = AdminActivity.objects.select_related('admin_user').all()
        
        # Filter by admin user
        admin_user = self.request.query_params.get('admin_user')
        if admin_user:
            queryset = queryset.filter(admin_user_id=admin_user)
        
        # Filter by action type
        action_type = self.request.query_params.get('action_type')
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Search in description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(admin_user__first_name__icontains=search) |
                Q(admin_user__last_name__icontains=search) |
                Q(admin_user__email__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get admin activity statistics"""
        queryset = self.get_queryset()
        
        # Activity counts by type
        activity_counts = queryset.values('action_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Activity counts by admin user
        admin_counts = queryset.values(
            'admin_user__first_name', 'admin_user__last_name', 'admin_user__email'
        ).annotate(count=Count('id')).order_by('-count')
        
        # Daily activity trend (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        daily_activities = queryset.filter(
            created_at__gte=thirty_days_ago
        ).extra(
            select={'day': 'date(created_at)'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        return Response({
            'total_activities': queryset.count(),
            'activity_by_type': activity_counts,
            'activity_by_admin': admin_counts,
            'daily_trend': daily_activities
        })


class SystemConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for system configuration management"""
    
    queryset = SystemConfiguration.objects.all()
    serializer_class = SystemConfigurationSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = SystemConfiguration.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search in key or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(key__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get configurations grouped by category"""
        categories = SystemConfiguration.CONFIG_CATEGORIES
        result = {}
        
        for category_key, category_name in categories:
            configs = self.get_queryset().filter(category=category_key)
            result[category_key] = {
                'name': category_name,
                'configs': SystemConfigurationSerializer(configs, many=True).data
            }
        
        return Response(result)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update multiple configurations"""
        configs_data = request.data.get('configurations', [])
        updated_configs = []
        
        for config_data in configs_data:
            config_key = config_data.get('key')
            if not config_key:
                continue
            
            try:
                config = SystemConfiguration.objects.get(key=config_key)
                config.value = config_data.get('value', config.value)
                config.updated_by = request.user
                config.save()
                updated_configs.append(config)
            except SystemConfiguration.DoesNotExist:
                continue
        
        return Response({
            'message': f'Updated {len(updated_configs)} configurations',
            'updated_configs': SystemConfigurationSerializer(updated_configs, many=True).data
        })


class BrandConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for brand configuration management"""
    
    queryset = BrandConfiguration.objects.all()
    serializer_class = BrandConfigurationSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate this brand configuration"""
        brand_config = self.get_object()
        brand_config.activate()
        
        return Response({
            'message': 'Brand configuration activated successfully',
            'config': BrandConfigurationSerializer(brand_config).data
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the currently active brand configuration"""
        active_config = BrandConfiguration.get_active_config()
        if active_config:
            return Response(BrandConfigurationSerializer(active_config).data)
        else:
            return Response({'message': 'No active brand configuration found'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def preview(self, request, pk=None):
        """Generate preview of brand configuration"""
        brand_config = self.get_object()
        
        # Generate preview data (this would typically involve rendering templates)
        preview_data = {
            'title': brand_config.platform_title,
            'tagline': brand_config.platform_tagline,
            'colors': brand_config.color_scheme,
            'theme': brand_config.theme,
            'logos': {
                'header': brand_config.header_logo_url,
                'favicon': brand_config.favicon_url,
                'mobile': brand_config.mobile_icon_url,
            }
        }
        
        return Response({
            'preview_data': preview_data,
            'preview_url': f'/preview/{brand_config.id}/'  # Would be actual preview URL
        })


class UserRoleViewSet(viewsets.ModelViewSet):
    """ViewSet for user role management"""
    
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = UserRole.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search in name or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """Prevent deletion of system roles"""
        role = self.get_object()
        if role.is_system:
            return Response(
                {'error': 'System roles cannot be deleted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """Get users assigned to this role"""
        role = self.get_object()
        assignments = role.user_assignments.filter(is_active=True)
        return Response(UserRoleAssignmentSerializer(assignments, many=True).data)
    
    @action(detail=True, methods=['post'])
    def assign_users(self, request, pk=None):
        """Assign users to this role"""
        role = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        assignments = []
        for user_id in user_ids:
            try:
                user = User.objects.get(id=user_id)
                assignment, created = UserRoleAssignment.objects.get_or_create(
                    user=user,
                    role=role,
                    defaults={'assigned_by': request.user}
                )
                if created:
                    assignments.append(assignment)
            except User.DoesNotExist:
                continue
        
        return Response({
            'message': f'Assigned {len(assignments)} users to role {role.name}',
            'assignments': UserRoleAssignmentSerializer(assignments, many=True).data
        })
    
    @action(detail=False, methods=['get'])
    def usage_stats(self, request):
        """Get role usage statistics"""
        stats = UserRoleService.get_role_usage_stats()
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def bulk_assign(self, request, pk=None):
        """Assign role to multiple users"""
        role = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        if not user_ids:
            return Response(
                {'error': 'user_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = UserRoleService.assign_role_to_users(
            role_id=role.id,
            user_ids=user_ids,
            admin_user=request.user
        )
        
        return Response(results)


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for permission management (read-only)"""
    
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = Permission.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get permissions grouped by category"""
        categories = Permission.PERMISSION_CATEGORIES
        result = {}
        
        for category_key, category_name in categories:
            permissions = self.get_queryset().filter(category=category_key)
            result[category_key] = {
                'name': category_name,
                'permissions': PermissionSerializer(permissions, many=True).data
            }
        
        return Response(result)


class UserManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for advanced user management"""
    
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = User.objects.select_related('profile').prefetch_related(
            'role_assignments__role', 'activities', 'login_history'
        ).all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by subscription type
        subscription_type = self.request.query_params.get('subscription_type')
        if subscription_type:
            queryset = queryset.filter(subscription_type=subscription_type)
        
        # Search in name or email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(institution__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend user account"""
        user = self.get_object()
        user.is_active = False
        user.save()
        
        return Response({'message': f'User {user.email} has been suspended'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate user account"""
        user = self.get_object()
        user.is_active = True
        user.save()
        
        return Response({'message': f'User {user.email} has been activated'})
    
    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on users"""
        user_ids = request.data.get('user_ids', [])
        action = request.data.get('action')
        
        if not user_ids or not action:
            return Response(
                {'error': 'user_ids and action are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use service for bulk operations
        results = UserManagementService.bulk_user_operation(
            user_ids=user_ids,
            operation=action,
            admin_user=request.user,
            **request.data
        )
        
        return Response(results)
    
    @action(detail=True, methods=['post'])
    def impersonate(self, request, pk=None):
        """Impersonate user (for support purposes)"""
        target_user = self.get_object()
        
        # Log the impersonation
        AdminActivity.objects.create(
            admin_user=request.user,
            action_type='user_impersonated',
            description=f'Impersonated user {target_user.email}',
            details={
                'target_user_id': str(target_user.id),
                'target_user_email': target_user.email
            },
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # In a real implementation, you would generate a special token
        # or session for impersonation
        return Response({
            'message': f'Impersonation session created for {target_user.email}',
            'impersonation_token': 'dummy_token_here',  # Replace with real token
            'target_user': UserManagementSerializer(target_user).data
        })
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get user analytics"""
        user_id = request.query_params.get('user_id')
        days = int(request.query_params.get('days', 30))
        
        analytics = UserManagementService.get_user_analytics(user_id, days)
        return Response(analytics)
    
    @action(detail=True, methods=['get'])
    def security_info(self, request, pk=None):
        """Get security information for a user"""
        user = self.get_object()
        security_info = UserManagementService.get_user_security_info(user.id)
        return Response(security_info)
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export users to CSV"""
        filters = {
            'is_active': request.query_params.get('is_active'),
            'subscription_type': request.query_params.get('subscription_type'),
            'date_joined_after': request.query_params.get('date_joined_after'),
            'date_joined_before': request.query_params.get('date_joined_before'),
        }
        
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        csv_data = UserManagementService.export_users_csv(filters)
        
        response = Response(csv_data, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="users_export.csv"'
        return response


class SystemMonitoringViewSet(viewsets.ViewSet):
    """ViewSet for system monitoring and health checks"""
    
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def health(self, request):
        """Get system health status"""
        health_status = {
            'database': self._check_database_health(),
            'cache': self._check_cache_health(),
            'storage': self._check_storage_health(),
            'api': 'healthy',  # If we're responding, API is healthy
            'timestamp': timezone.now()
        }
        
        serializer = SystemHealthSerializer(data=health_status)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def metrics(self, request):
        """Get comprehensive system metrics"""
        metrics = {
            'user_count': User.objects.count(),
            'active_users_today': self._get_active_users_today(),
            'active_campaigns': self._get_active_campaigns(),
            'total_revenue': self._get_total_revenue(),
            'system_health': {
                'database': self._check_database_health(),
                'cache': self._check_cache_health(),
                'storage': self._check_storage_health(),
                'api': 'healthy',
                'timestamp': timezone.now()
            },
            'performance_metrics': self._get_performance_metrics()
        }
        
        serializer = SystemMetricsSerializer(data=metrics)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.data)
    
    def _check_database_health(self):
        """Check database connectivity and performance"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                return 'healthy'
        except Exception:
            return 'error'
    
    def _check_cache_health(self):
        """Check cache connectivity"""
        try:
            cache.set('health_check', 'ok', 10)
            if cache.get('health_check') == 'ok':
                return 'healthy'
            else:
                return 'warning'
        except Exception:
            return 'error'
    
    def _check_storage_health(self):
        """Check storage availability"""
        try:
            # Check if we can write to media directory
            from django.conf import settings
            media_root = getattr(settings, 'MEDIA_ROOT', '/tmp')
            test_file = os.path.join(media_root, 'health_check.txt')
            
            with open(test_file, 'w') as f:
                f.write('health check')
            
            os.remove(test_file)
            return 'healthy'
        except Exception:
            return 'error'
    
    def _get_active_users_today(self):
        """Get count of users active today"""
        today = timezone.now().date()
        return UserLoginHistory.objects.filter(
            login_at__date=today,
            is_successful=True
        ).values('user').distinct().count()
    
    def _get_active_campaigns(self):
        """Get count of active campaigns"""
        try:
            from apps.surveys.models import SurveyCampaign
            return SurveyCampaign.objects.filter(status='active').count()
        except ImportError:
            return 0
    
    def _get_total_revenue(self):
        """Get total revenue from campaigns"""
        try:
            from apps.surveys.models import SurveyCampaign
            return SurveyCampaign.objects.aggregate(
                total=Sum('admin_fee_collected')
            )['total'] or 0
        except ImportError:
            return 0
    
    def _get_performance_metrics(self):
        """Get system performance metrics"""
        try:
            return {
                'cpu_usage': psutil.cpu_percent(),
                'memory_usage': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent,
                'load_average': os.getloadavg()[0] if hasattr(os, 'getloadavg') else 0
            }
        except Exception:
            return {
                'cpu_usage': 0,
                'memory_usage': 0,
                'disk_usage': 0,
                'load_average': 0
            }