#!/usr/bin/env python3
"""
Security fix script for rate limiting
Implements rate limiting for Django REST Framework
"""

import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ncskit_backend.settings')

def update_settings():
    """Update Django settings with rate limiting configuration."""
    
    settings_file = os.path.join(backend_dir, 'ncskit_backend', 'settings.py')
    
    # Read current settings
    with open(settings_file, 'r') as f:
        content = f.read()
    
    # Rate limiting configuration
    rate_limiting_config = '''
# Rate Limiting Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',           # Anonymous users: 100 requests per hour
        'user': '1000/hour',          # Authenticated users: 1000 requests per hour
        'login': '5/15min',           # Login attempts: 5 per 15 minutes
        'register': '3/hour',         # Registration: 3 per hour
        'password_reset': '3/hour',   # Password reset: 3 per hour
        'api': '10000/day',          # API endpoints: 10000 per day
        'upload': '10/hour',         # File uploads: 10 per hour
        'export': '5/hour',          # Data exports: 5 per hour
    },
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FileUploadParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# Custom throttle classes for specific endpoints
CUSTOM_THROTTLE_RATES = {
    'auth_throttle': '5/15min',      # Authentication endpoints
    'sensitive_throttle': '10/hour',  # Sensitive operations
    'bulk_throttle': '100/day',      # Bulk operations
}
'''
    
    # Check if REST_FRAMEWORK already exists
    if 'REST_FRAMEWORK' in content:
        print("⚠️  REST_FRAMEWORK already exists in settings.py")
        print("   Please manually merge the rate limiting configuration")
        
        # Write to separate file
        config_file = os.path.join(backend_dir, 'rate_limiting_config.py')
        with open(config_file, 'w') as f:
            f.write(rate_limiting_config)
        print(f"✅ Rate limiting configuration written to {config_file}")
    else:
        # Add rate limiting config to settings
        content += rate_limiting_config
        
        # Write updated settings
        with open(settings_file, 'w') as f:
            f.write(content)
        print("✅ Rate limiting configuration added to settings.py")

def create_custom_throttles():
    """Create custom throttle classes."""
    
    throttles_dir = os.path.join(backend_dir, 'apps', 'authentication')
    throttles_file = os.path.join(throttles_dir, 'throttles.py')
    
    throttles_content = '''"""
Custom throttle classes for enhanced security
"""

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.core.cache import cache
from django.contrib.auth import get_user_model
import time

User = get_user_model()


class LoginRateThrottle(UserRateThrottle):
    """
    Rate limiting for login attempts
    5 attempts per 15 minutes per IP
    """
    scope = 'login'
    
    def get_cache_key(self, request, view):
        """Use IP address for cache key."""
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class RegisterRateThrottle(AnonRateThrottle):
    """
    Rate limiting for registration attempts
    3 attempts per hour per IP
    """
    scope = 'register'


class PasswordResetRateThrottle(AnonRateThrottle):
    """
    Rate limiting for password reset attempts
    3 attempts per hour per IP
    """
    scope = 'password_reset'


class SensitiveOperationThrottle(UserRateThrottle):
    """
    Rate limiting for sensitive operations
    10 attempts per hour per user
    """
    scope = 'sensitive_throttle'


class BulkOperationThrottle(UserRateThrottle):
    """
    Rate limiting for bulk operations
    100 attempts per day per user
    """
    scope = 'bulk_throttle'


class UploadRateThrottle(UserRateThrottle):
    """
    Rate limiting for file uploads
    10 uploads per hour per user
    """
    scope = 'upload'


class ExportRateThrottle(UserRateThrottle):
    """
    Rate limiting for data exports
    5 exports per hour per user
    """
    scope = 'export'


class IPBasedRateThrottle(AnonRateThrottle):
    """
    IP-based rate limiting for additional security
    """
    
    def __init__(self):
        super().__init__()
        self.rate = '1000/hour'  # Default rate
    
    def get_cache_key(self, request, view):
        """Always use IP address for cache key."""
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
    
    def throttle_failure(self):
        """
        Called when a request should be throttled.
        Log the attempt for security monitoring.
        """
        from django.utils import timezone
        import logging
        
        logger = logging.getLogger('security')
        logger.warning(f"Rate limit exceeded from IP: {self.get_ident(self.request)}")
        
        return super().throttle_failure()
'''
    
    # Create throttles file
    with open(throttles_file, 'w') as f:
        f.write(throttles_content)
    
    print(f"✅ Custom throttle classes created at {throttles_file}")

def update_auth_views():
    """Update authentication views to use rate limiting."""
    
    auth_views_file = os.path.join(backend_dir, 'apps', 'authentication', 'views.py')
    
    if not os.path.exists(auth_views_file):
        print("⚠️  Authentication views file not found")
        return
    
    # Read current views
    with open(auth_views_file, 'r') as f:
        content = f.read()
    
    # Add throttle imports
    throttle_imports = '''from .throttles import (
    LoginRateThrottle, 
    RegisterRateThrottle, 
    PasswordResetRateThrottle,
    SensitiveOperationThrottle
)
'''
    
    # Check if imports already exist
    if 'LoginRateThrottle' not in content:
        # Add imports after existing imports
        import_section = content.split('\\n\\n')[0]  # Get first paragraph (imports)
        rest_content = '\\n\\n'.join(content.split('\\n\\n')[1:])
        
        updated_content = import_section + '\\n' + throttle_imports + '\\n\\n' + rest_content
        
        # Write updated views
        with open(auth_views_file, 'w') as f:
            f.write(updated_content)
        
        print("✅ Rate limiting imports added to authentication views")
    else:
        print("⚠️  Rate limiting imports already exist in authentication views")

def main():
    """Main function to implement rate limiting."""
    print("🔧 Implementing Rate Limiting Security Fixes...")
    
    # Update Django settings
    update_settings()
    
    # Create custom throttle classes
    create_custom_throttles()
    
    # Update authentication views
    update_auth_views()
    
    print("\\n✅ Rate limiting implementation completed!")
    print("\\n📋 Manual steps required:")
    print("1. Add throttle_classes to your API views:")
    print("   throttle_classes = [LoginRateThrottle]")
    print("2. Install django-ratelimit if needed:")
    print("   pip install django-ratelimit")
    print("3. Configure Redis/Memcached for production caching")
    print("4. Test rate limiting with multiple requests")
    print("5. Monitor rate limiting logs")

if __name__ == "__main__":
    main()