import json
from django.utils.deprecation import MiddlewareMixin
from django.contrib.contenttypes.models import ContentType
from .models import AdminActivity


class AdminActivityMiddleware(MiddlewareMixin):
    """
    Middleware to automatically track admin activities
    """
    
    # Actions that should be tracked
    TRACKED_ACTIONS = {
        'POST': ['create', 'add'],
        'PUT': ['update', 'edit', 'change'],
        'PATCH': ['update', 'edit', 'change'],
        'DELETE': ['delete', 'remove'],
    }
    
    # Admin-only paths that should be tracked
    ADMIN_PATHS = [
        '/api/admin/',
        '/api/users/',
        '/api/system/',
        '/api/config/',
        '/api/brand/',
        '/api/campaigns/',
        '/api/rewards/',
    ]
    
    def process_response(self, request, response):
        """Process response and log admin activities"""
        
        # Only track for authenticated admin users
        if not (hasattr(request, 'user') and 
                request.user.is_authenticated and 
                (request.user.is_staff or request.user.is_superuser)):
            return response
        
        # Only track certain HTTP methods
        if request.method not in self.TRACKED_ACTIONS:
            return response
        
        # Only track admin paths
        if not any(request.path.startswith(path) for path in self.ADMIN_PATHS):
            return response
        
        # Only track successful responses
        if not (200 <= response.status_code < 300):
            return response
        
        try:
            self._log_admin_activity(request, response)
        except Exception as e:
            # Don't break the request if logging fails
            print(f"Failed to log admin activity: {e}")
        
        return response
    
    def _log_admin_activity(self, request, response):
        """Log the admin activity"""
        
        # Determine action type based on method and path
        action_type = self._determine_action_type(request)
        if not action_type:
            return
        
        # Get request metadata
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Parse request/response data
        details = self._extract_activity_details(request, response)
        
        # Create description
        description = self._create_description(request, action_type, details)
        
        # Get target object info if available
        content_type, object_id = self._extract_target_object(request, details)
        
        # Create admin activity record
        AdminActivity.objects.create(
            admin_user=request.user,
            action_type=action_type,
            description=description,
            content_type=content_type,
            object_id=object_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    def _determine_action_type(self, request):
        """Determine the action type based on request"""
        method = request.method
        path = request.path.lower()
        
        # User management actions
        if '/users/' in path:
            if method == 'POST':
                return 'user_created'
            elif method in ['PUT', 'PATCH']:
                if 'suspend' in path:
                    return 'user_suspended'
                elif 'activate' in path:
                    return 'user_activated'
                elif 'role' in path:
                    return 'user_role_changed'
                else:
                    return 'user_updated'
            elif method == 'DELETE':
                return 'user_deleted'
        
        # System configuration actions
        elif '/config/' in path or '/system/' in path:
            if method == 'POST':
                return 'config_updated'
            elif method in ['PUT', 'PATCH']:
                return 'system_settings_changed'
        
        # Brand configuration actions
        elif '/brand/' in path:
            return 'brand_config_updated'
        
        # Campaign management actions
        elif '/campaigns/' in path:
            if 'approve' in path:
                return 'campaign_approved'
            elif 'reject' in path:
                return 'campaign_rejected'
            elif 'complete' in path:
                return 'campaign_forced_complete'
            elif 'cancel' in path:
                return 'campaign_cancelled'
        
        # Reward management actions
        elif '/rewards/' in path:
            if 'process' in path:
                return 'reward_processed'
            elif 'reject' in path:
                return 'reward_rejected'
            elif 'bulk' in path:
                return 'bulk_rewards_processed'
        
        return None
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _extract_activity_details(self, request, response):
        """Extract relevant details from request and response"""
        details = {
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
        }
        
        # Add request data for POST/PUT/PATCH
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                if hasattr(request, 'data'):
                    # DRF request
                    details['request_data'] = dict(request.data)
                elif request.content_type == 'application/json':
                    # JSON request
                    details['request_data'] = json.loads(request.body)
            except (json.JSONDecodeError, AttributeError):
                pass
        
        # Add response data for successful operations
        if 200 <= response.status_code < 300:
            try:
                if hasattr(response, 'data'):
                    # DRF response
                    details['response_data'] = response.data
            except AttributeError:
                pass
        
        return details
    
    def _create_description(self, request, action_type, details):
        """Create human-readable description"""
        user = request.user
        path_parts = request.path.strip('/').split('/')
        
        # Extract resource name from path
        resource = 'resource'
        if len(path_parts) >= 2:
            resource = path_parts[1].replace('_', ' ').title()
        
        action_map = {
            'user_created': f'Created new user',
            'user_updated': f'Updated user information',
            'user_suspended': f'Suspended user account',
            'user_activated': f'Activated user account',
            'user_deleted': f'Deleted user account',
            'user_role_changed': f'Changed user role',
            'config_updated': f'Updated system configuration',
            'system_settings_changed': f'Changed system settings',
            'brand_config_updated': f'Updated brand configuration',
            'campaign_approved': f'Approved campaign',
            'campaign_rejected': f'Rejected campaign',
            'campaign_forced_complete': f'Force completed campaign',
            'campaign_cancelled': f'Cancelled campaign',
            'reward_processed': f'Processed reward',
            'reward_rejected': f'Rejected reward',
            'bulk_rewards_processed': f'Processed bulk rewards',
        }
        
        base_description = action_map.get(action_type, f'Performed {action_type}')
        
        # Add target information if available
        if 'request_data' in details:
            data = details['request_data']
            if isinstance(data, dict):
                if 'email' in data:
                    base_description += f" for {data['email']}"
                elif 'name' in data:
                    base_description += f" '{data['name']}'"
                elif 'title' in data:
                    base_description += f" '{data['title']}'"
        
        return base_description
    
    def _extract_target_object(self, request, details):
        """Extract target object information"""
        path_parts = request.path.strip('/').split('/')
        
        # Try to get object ID from URL
        object_id = None
        for part in reversed(path_parts):
            if part.isdigit() or self._is_uuid(part):
                object_id = part
                break
        
        # Try to determine content type from path
        content_type = None
        if '/users/' in request.path:
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                content_type = ContentType.objects.get_for_model(User)
            except:
                pass
        elif '/campaigns/' in request.path:
            try:
                from apps.surveys.models import SurveyCampaign
                content_type = ContentType.objects.get_for_model(SurveyCampaign)
            except:
                pass
        
        return content_type, object_id
    
    def _is_uuid(self, value):
        """Check if value is a UUID"""
        try:
            import uuid
            uuid.UUID(value)
            return True
        except ValueError:
            return False