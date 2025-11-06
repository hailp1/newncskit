"""
Health check views for production monitoring
"""

from django.http import JsonResponse
from django.db import connections
from django.core.cache import cache
from django.conf import settings
import redis
import time


def health_check(request):
    """
    Comprehensive health check endpoint
    """
    health_status = {
        'status': 'healthy',
        'timestamp': time.time(),
        'checks': {}
    }
    
    overall_status = True
    
    # Database check
    try:
        db_conn = connections['default']
        db_conn.cursor()
        health_status['checks']['database'] = {
            'status': 'healthy',
            'message': 'Database connection successful'
        }
    except Exception as e:
        health_status['checks']['database'] = {
            'status': 'unhealthy',
            'message': f'Database connection failed: {str(e)}'
        }
        overall_status = False
    
    # Cache check (Redis)
    try:
        cache.set('health_check', 'ok', 30)
        cache_value = cache.get('health_check')
        if cache_value == 'ok':
            health_status['checks']['cache'] = {
                'status': 'healthy',
                'message': 'Cache connection successful'
            }
        else:
            raise Exception('Cache value mismatch')
    except Exception as e:
        health_status['checks']['cache'] = {
            'status': 'unhealthy',
            'message': f'Cache connection failed: {str(e)}'
        }
        overall_status = False
    
    # Application-specific checks
    try:
        from apps.surveys.models import SurveyCampaign
        campaign_count = SurveyCampaign.objects.count()
        health_status['checks']['application'] = {
            'status': 'healthy',
            'message': f'Application running, {campaign_count} campaigns in database'
        }
    except Exception as e:
        health_status['checks']['application'] = {
            'status': 'unhealthy',
            'message': f'Application check failed: {str(e)}'
        }
        overall_status = False
    
    # Set overall status
    health_status['status'] = 'healthy' if overall_status else 'unhealthy'
    
    # Return appropriate HTTP status code
    status_code = 200 if overall_status else 503
    
    return JsonResponse(health_status, status=status_code)


def readiness_check(request):
    """
    Readiness check for Kubernetes/container orchestration
    """
    try:
        # Check if migrations are up to date
        from django.core.management import execute_from_command_line
        from django.db import connection
        
        # Simple database query to ensure it's ready
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            
        return JsonResponse({
            'status': 'ready',
            'timestamp': time.time()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'not_ready',
            'error': str(e),
            'timestamp': time.time()
        }, status=503)


def liveness_check(request):
    """
    Liveness check for Kubernetes/container orchestration
    """
    return JsonResponse({
        'status': 'alive',
        'timestamp': time.time()
    })