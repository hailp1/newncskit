
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
