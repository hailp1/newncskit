"""
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
