from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import UserLoginHistory, AdminActivity, UserRoleAssignment
import csv
import io

User = get_user_model()


class UserManagementService:
    """Service for advanced user management operations"""
    
    @staticmethod
    def get_user_analytics(user_id=None, days=30):
        """Get comprehensive user analytics"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        if user_id:
            # Analytics for specific user
            user = User.objects.get(id=user_id)
            
            # Login statistics
            login_stats = UserLoginHistory.objects.filter(
                user=user,
                login_at__gte=start_date,
                is_successful=True
            ).aggregate(
                total_logins=Count('id'),
                avg_session_duration=Avg('session_duration'),
                unique_ips=Count('ip_address', distinct=True)
            )
            
            # Activity statistics
            activity_stats = user.activities.filter(
                created_at__gte=start_date
            ).values('activity_type').annotate(
                count=Count('id')
            ).order_by('-count')
            
            return {
                'user_id': user_id,
                'period_days': days,
                'login_stats': login_stats,
                'activity_stats': list(activity_stats),
                'last_login': user.last_login,
                'account_age_days': (timezone.now() - user.date_joined).days,
                'subscription_type': user.subscription_type,
                'is_active': user.is_active
            }
        else:
            # Platform-wide analytics
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count()
            
            # New users in period
            new_users = User.objects.filter(
                date_joined__gte=start_date
            ).count()
            
            # Active users in period (users who logged in)
            period_active_users = UserLoginHistory.objects.filter(
                login_at__gte=start_date,
                is_successful=True
            ).values('user').distinct().count()
            
            # Subscription distribution
            subscription_stats = User.objects.values('subscription_type').annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Login trends (daily)
            daily_logins = UserLoginHistory.objects.filter(
                login_at__gte=start_date,
                is_successful=True
            ).extra(
                select={'day': 'date(login_at)'}
            ).values('day').annotate(
                logins=Count('id'),
                unique_users=Count('user', distinct=True)
            ).order_by('day')
            
            return {
                'period_days': days,
                'total_users': total_users,
                'active_users': active_users,
                'new_users_period': new_users,
                'active_users_period': period_active_users,
                'subscription_distribution': list(subscription_stats),
                'daily_login_trend': list(daily_logins),
                'user_retention_rate': (period_active_users / total_users * 100) if total_users > 0 else 0
            }
    
    @staticmethod
    def bulk_user_operation(user_ids, operation, admin_user, **kwargs):
        """Perform bulk operations on users"""
        users = User.objects.filter(id__in=user_ids)
        results = {
            'success_count': 0,
            'error_count': 0,
            'errors': [],
            'processed_users': []
        }
        
        for user in users:
            try:
                if operation == 'suspend':
                    user.is_active = False
                    user.save()
                    
                    # Log admin activity
                    AdminActivity.objects.create(
                        admin_user=admin_user,
                        action_type='user_suspended',
                        description=f'Suspended user {user.email}',
                        details={'user_id': str(user.id), 'user_email': user.email}
                    )
                
                elif operation == 'activate':
                    user.is_active = True
                    user.save()
                    
                    AdminActivity.objects.create(
                        admin_user=admin_user,
                        action_type='user_activated',
                        description=f'Activated user {user.email}',
                        details={'user_id': str(user.id), 'user_email': user.email}
                    )
                
                elif operation == 'delete':
                    # Soft delete by deactivating
                    user.is_active = False
                    user.save()
                    
                    AdminActivity.objects.create(
                        admin_user=admin_user,
                        action_type='user_deleted',
                        description=f'Deleted user {user.email}',
                        details={'user_id': str(user.id), 'user_email': user.email}
                    )
                
                elif operation == 'change_subscription':
                    subscription_type = kwargs.get('subscription_type')
                    if subscription_type:
                        old_subscription = user.subscription_type
                        user.subscription_type = subscription_type
                        user.save()
                        
                        AdminActivity.objects.create(
                            admin_user=admin_user,
                            action_type='user_updated',
                            description=f'Changed subscription for {user.email}',
                            details={
                                'user_id': str(user.id),
                                'user_email': user.email,
                                'old_subscription': old_subscription,
                                'new_subscription': subscription_type
                            }
                        )
                
                elif operation == 'assign_role':
                    role_id = kwargs.get('role_id')
                    if role_id:
                        from .models import UserRole
                        role = UserRole.objects.get(id=role_id)
                        
                        assignment, created = UserRoleAssignment.objects.get_or_create(
                            user=user,
                            role=role,
                            defaults={'assigned_by': admin_user}
                        )
                        
                        if created:
                            AdminActivity.objects.create(
                                admin_user=admin_user,
                                action_type='user_role_changed',
                                description=f'Assigned role {role.name} to {user.email}',
                                details={
                                    'user_id': str(user.id),
                                    'user_email': user.email,
                                    'role_id': str(role.id),
                                    'role_name': role.name
                                }
                            )
                
                results['success_count'] += 1
                results['processed_users'].append({
                    'user_id': str(user.id),
                    'email': user.email,
                    'status': 'success'
                })
                
            except Exception as e:
                results['error_count'] += 1
                results['errors'].append({
                    'user_id': str(user.id),
                    'email': user.email,
                    'error': str(e)
                })
        
        return results
    
    @staticmethod
    def export_users_csv(filters=None):
        """Export users to CSV format"""
        queryset = User.objects.all()
        
        # Apply filters
        if filters:
            if filters.get('is_active') is not None:
                queryset = queryset.filter(is_active=filters['is_active'])
            
            if filters.get('subscription_type'):
                queryset = queryset.filter(subscription_type=filters['subscription_type'])
            
            if filters.get('date_joined_after'):
                queryset = queryset.filter(date_joined__gte=filters['date_joined_after'])
            
            if filters.get('date_joined_before'):
                queryset = queryset.filter(date_joined__lte=filters['date_joined_before'])
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'ID', 'Email', 'First Name', 'Last Name', 'Institution',
            'Subscription Type', 'Is Active', 'Is Staff', 'Date Joined',
            'Last Login', 'Research Domains'
        ])
        
        # Write data
        for user in queryset:
            writer.writerow([
                str(user.id),
                user.email,
                user.first_name,
                user.last_name,
                user.institution or '',
                user.subscription_type,
                user.is_active,
                user.is_staff,
                user.date_joined.isoformat(),
                user.last_login.isoformat() if user.last_login else '',
                ', '.join(user.research_domains) if user.research_domains else ''
            ])
        
        return output.getvalue()
    
    @staticmethod
    def get_user_security_info(user_id):
        """Get security information for a user"""
        user = User.objects.get(id=user_id)
        
        # Recent login history
        recent_logins = UserLoginHistory.objects.filter(
            user=user
        ).order_by('-login_at')[:10]
        
        # Failed login attempts
        failed_logins = UserLoginHistory.objects.filter(
            user=user,
            is_successful=False
        ).order_by('-login_at')[:5]
        
        # Unique IP addresses
        unique_ips = UserLoginHistory.objects.filter(
            user=user,
            is_successful=True
        ).values_list('ip_address', flat=True).distinct()
        
        # Admin activities related to this user
        admin_activities = AdminActivity.objects.filter(
            details__user_id=str(user.id)
        ).order_by('-created_at')[:10]
        
        return {
            'user_id': user_id,
            'recent_logins': [
                {
                    'login_at': login.login_at,
                    'ip_address': login.ip_address,
                    'user_agent': login.user_agent,
                    'is_successful': login.is_successful,
                    'session_duration': login.session_duration
                }
                for login in recent_logins
            ],
            'failed_login_attempts': len(failed_logins),
            'unique_ip_addresses': list(unique_ips),
            'admin_actions_count': admin_activities.count(),
            'last_password_change': None,  # Would need to track this separately
            'two_factor_enabled': False,   # Would need to implement 2FA
            'account_locked': not user.is_active
        }


class UserRoleService:
    """Service for user role management"""
    
    @staticmethod
    def get_role_usage_stats():
        """Get statistics about role usage"""
        from .models import UserRole
        
        roles_with_counts = UserRole.objects.annotate(
            user_count=Count('user_assignments', filter=Q(user_assignments__is_active=True))
        ).order_by('-user_count')
        
        return [
            {
                'role_id': str(role.id),
                'role_name': role.name,
                'user_count': role.user_count,
                'is_system': role.is_system,
                'permissions_count': len(role.permissions) if role.permissions else 0
            }
            for role in roles_with_counts
        ]
    
    @staticmethod
    def assign_role_to_users(role_id, user_ids, admin_user):
        """Assign a role to multiple users"""
        from .models import UserRole
        
        role = UserRole.objects.get(id=role_id)
        users = User.objects.filter(id__in=user_ids)
        
        results = {
            'success_count': 0,
            'error_count': 0,
            'already_assigned': 0,
            'assignments': []
        }
        
        for user in users:
            try:
                assignment, created = UserRoleAssignment.objects.get_or_create(
                    user=user,
                    role=role,
                    defaults={'assigned_by': admin_user}
                )
                
                if created:
                    results['success_count'] += 1
                    results['assignments'].append({
                        'user_id': str(user.id),
                        'email': user.email,
                        'status': 'assigned'
                    })
                    
                    # Log admin activity
                    AdminActivity.objects.create(
                        admin_user=admin_user,
                        action_type='user_role_changed',
                        description=f'Assigned role {role.name} to {user.email}',
                        details={
                            'user_id': str(user.id),
                            'user_email': user.email,
                            'role_id': str(role.id),
                            'role_name': role.name
                        }
                    )
                else:
                    results['already_assigned'] += 1
                    results['assignments'].append({
                        'user_id': str(user.id),
                        'email': user.email,
                        'status': 'already_assigned'
                    })
                    
            except Exception as e:
                results['error_count'] += 1
                results['assignments'].append({
                    'user_id': str(user.id),
                    'email': user.email,
                    'status': 'error',
                    'error': str(e)
                })
        
        return results