from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.conf import settings
from .serializers import UserSerializer
import logging
import re
import json
from typing import Dict, Any, Optional

User = get_user_model()
logger = logging.getLogger(__name__)

# OAuth error codes
class OAuthErrorCodes:
    INVALID_EMAIL = 'invalid_email'
    MISSING_REQUIRED_FIELD = 'missing_required_field'
    ACCOUNT_DEACTIVATED = 'account_deactivated'
    ACCOUNT_CREATION_FAILED = 'account_creation_failed'
    ACCOUNT_UPDATE_FAILED = 'account_update_failed'
    PROVIDER_NOT_SUPPORTED = 'provider_not_supported'
    DUPLICATE_OAUTH_ACCOUNT = 'duplicate_oauth_account'
    USER_NOT_FOUND = 'user_not_found'
    MISSING_PASSWORD = 'missing_password'
    DATABASE_ERROR = 'database_error'
    VALIDATION_ERROR = 'validation_error'
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'

def create_error_response(
    error_code: str, 
    message: str, 
    details: Optional[str] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST
) -> Response:
    """Create standardized error response"""
    error_data = {
        'error': error_code,
        'message': message,
        'timestamp': timezone.now().isoformat(),
    }
    
    if details:
        error_data['details'] = details
    
    # Log error for debugging
    logger.error(f"OAuth Error: {error_code} - {message}", extra={
        'error_code': error_code,
        'details': details,
        'status_code': status_code
    })
    
    return Response(error_data, status=status_code)

def validate_oauth_data(data: Dict[str, Any]) -> Dict[str, str]:
    """Validate OAuth callback data"""
    errors = {}
    
    # Validate email
    email = data.get('email', '').strip()
    if not email:
        errors['email'] = 'Email is required'
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors['email'] = 'Invalid email format'
    
    # Validate provider
    provider = data.get('provider', '').strip().lower()
    supported_providers = ['google', 'linkedin', 'orcid']
    if not provider:
        errors['provider'] = 'Provider is required'
    elif provider not in supported_providers:
        errors['provider'] = f'Provider must be one of: {", ".join(supported_providers)}'
    
    # Validate provider_id
    provider_id = data.get('provider_id', '').strip()
    if not provider_id:
        errors['provider_id'] = 'Provider ID is required'
    
    # Validate name (optional but should be reasonable if provided)
    name = data.get('name', '').strip()
    if name and len(name) > 255:
        errors['name'] = 'Name is too long (maximum 255 characters)'
    
    return errors

def sanitize_user_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize and normalize user data"""
    sanitized = {}
    
    # Email - normalize to lowercase
    if 'email' in data:
        sanitized['email'] = data['email'].strip().lower()
    
    # Name - clean up whitespace
    if 'name' in data:
        name = data['name'].strip()
        # Remove extra whitespace and limit length
        name = re.sub(r'\s+', ' ', name)[:255]
        sanitized['name'] = name
    
    # Provider - normalize to lowercase
    if 'provider' in data:
        sanitized['provider'] = data['provider'].strip().lower()
    
    # Provider ID - clean up
    if 'provider_id' in data:
        sanitized['provider_id'] = str(data['provider_id']).strip()
    
    # Image URL - validate basic URL format
    if 'image' in data and data['image']:
        image_url = data['image'].strip()
        if image_url.startswith(('http://', 'https://')):
            sanitized['image'] = image_url[:500]  # Limit URL length
    
    # ORCID - validate format if provided
    if 'orcid' in data and data['orcid']:
        orcid = str(data['orcid']).strip()
        # Basic ORCID format validation
        if re.match(r'^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$', orcid):
            sanitized['orcid'] = orcid
    
    return sanitized


@api_view(['POST'])
@permission_classes([AllowAny])
def oauth_callback(request):
    """
    Enhanced OAuth callback handler with comprehensive error handling
    Create or update user based on OAuth data
    """
    # Log the incoming request for debugging
    logger.info(f"OAuth callback received from IP: {request.META.get('REMOTE_ADDR')}")
    
    try:
        # Validate request data
        if not request.data:
            return create_error_response(
                OAuthErrorCodes.MISSING_REQUIRED_FIELD,
                'No data provided in request'
            )
        
        # Sanitize input data
        raw_data = request.data
        sanitized_data = sanitize_user_data(raw_data)
        
        # Validate required fields
        validation_errors = validate_oauth_data(sanitized_data)
        if validation_errors:
            return create_error_response(
                OAuthErrorCodes.VALIDATION_ERROR,
                'Validation failed',
                details=json.dumps(validation_errors)
            )
        
        # Extract validated data
        email = sanitized_data['email']
        name = sanitized_data.get('name', '')
        provider = sanitized_data['provider']
        provider_id = sanitized_data['provider_id']
        image = sanitized_data.get('image')
        orcid = sanitized_data.get('orcid')
        
        # Split name into first and last name
        name_parts = name.split(' ', 1) if name else ['', '']
        first_name = name_parts[0] if len(name_parts) > 0 else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Use database transaction for data consistency
        with transaction.atomic():
            try:
                # Check if user exists
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': email,
                        'first_name': first_name,
                        'last_name': last_name,
                        'oauth_provider': provider,
                        'oauth_id': provider_id,
                        'profile_image': image,
                        'email_verified': True,
                        'is_active': True,
                        'orcid_id': orcid if provider == 'orcid' else None,
                        'last_login': timezone.now(),
                    }
                )
                
                if not created:
                    # Check if account is active
                    if not user.is_active:
                        logger.warning(f"Inactive user attempted OAuth login: {email} via {provider}")
                        return create_error_response(
                            OAuthErrorCodes.ACCOUNT_DEACTIVATED,
                            'Your account has been deactivated. Please contact support.',
                            status_code=status.HTTP_403_FORBIDDEN
                        )
                    
                    # Update existing user
                    update_fields = []
                    
                    if first_name and first_name != user.first_name:
                        user.first_name = first_name
                        update_fields.append('first_name')
                    
                    if last_name and last_name != user.last_name:
                        user.last_name = last_name
                        update_fields.append('last_name')
                    
                    if provider != user.oauth_provider:
                        user.oauth_provider = provider
                        update_fields.append('oauth_provider')
                    
                    if provider_id != user.oauth_id:
                        user.oauth_id = provider_id
                        update_fields.append('oauth_id')
                    
                    if image and image != user.profile_image:
                        user.profile_image = image
                        update_fields.append('profile_image')
                    
                    # Always update last login
                    user.last_login = timezone.now()
                    update_fields.append('last_login')
                    
                    # Handle ORCID
                    if provider == 'orcid' and orcid and orcid != user.orcid_id:
                        user.orcid_id = orcid
                        update_fields.append('orcid_id')
                    
                    if update_fields:
                        user.save(update_fields=update_fields)
                
                # Log successful authentication
                logger.info(f"OAuth authentication successful: {email} via {provider} (created: {created})")
                
                # Return user data
                serializer = UserSerializer(user)
                return Response({
                    'user': serializer.data,
                    'created': created,
                    'message': 'User authenticated successfully',
                    'provider': provider,
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_200_OK)
                
            except IntegrityError as e:
                logger.error(f"Database integrity error during OAuth callback: {str(e)}")
                return create_error_response(
                    OAuthErrorCodes.ACCOUNT_CREATION_FAILED,
                    'Failed to create or update user account',
                    details=str(e),
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    
    except ValidationError as e:
        return create_error_response(
            OAuthErrorCodes.VALIDATION_ERROR,
            'Data validation failed',
            details=str(e)
        )
    
    except Exception as e:
        # Log unexpected errors with full context
        logger.error(f"Unexpected OAuth callback error: {str(e)}", exc_info=True, extra={
            'request_data': request.data,
            'user_agent': request.META.get('HTTP_USER_AGENT'),
            'ip_address': request.META.get('REMOTE_ADDR'),
        })
        
        return create_error_response(
            OAuthErrorCodes.DATABASE_ERROR,
            'An unexpected error occurred during authentication',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def link_oauth_account(request):
    """
    Enhanced OAuth account linking with comprehensive validation
    """
    logger.info(f"OAuth account linking request from IP: {request.META.get('REMOTE_ADDR')}")
    
    try:
        # Validate request data
        if not request.data:
            return create_error_response(
                OAuthErrorCodes.MISSING_REQUIRED_FIELD,
                'No data provided in request'
            )
        
        data = request.data
        user_id = data.get('user_id')
        provider = data.get('provider', '').strip().lower()
        provider_id = data.get('provider_id', '').strip()
        
        # Validate required fields
        missing_fields = []
        if not user_id:
            missing_fields.append('user_id')
        if not provider:
            missing_fields.append('provider')
        if not provider_id:
            missing_fields.append('provider_id')
        
        if missing_fields:
            return create_error_response(
                OAuthErrorCodes.MISSING_REQUIRED_FIELD,
                f'Missing required fields: {", ".join(missing_fields)}'
            )
        
        # Validate provider
        supported_providers = ['google', 'linkedin', 'orcid']
        if provider not in supported_providers:
            return create_error_response(
                OAuthErrorCodes.PROVIDER_NOT_SUPPORTED,
                f'Provider must be one of: {", ".join(supported_providers)}'
            )
        
        # Get user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return create_error_response(
                OAuthErrorCodes.USER_NOT_FOUND,
                'User not found',
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user account is active
        if not user.is_active:
            return create_error_response(
                OAuthErrorCodes.ACCOUNT_DEACTIVATED,
                'Cannot link OAuth account to deactivated user',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # Check if OAuth account is already linked to another user
        existing_user = User.objects.filter(
            oauth_provider=provider,
            oauth_id=provider_id
        ).exclude(id=user_id).first()
        
        if existing_user:
            logger.warning(f"Attempt to link already linked {provider} account {provider_id} to user {user_id}")
            return create_error_response(
                OAuthErrorCodes.DUPLICATE_OAUTH_ACCOUNT,
                f'{provider.title()} account is already linked to another user'
            )
        
        # Use transaction for data consistency
        with transaction.atomic():
            # Link OAuth account
            update_fields = ['oauth_provider', 'oauth_id']
            user.oauth_provider = provider
            user.oauth_id = provider_id
            
            # Add ORCID if applicable
            if provider == 'orcid':
                orcid = data.get('orcid', '').strip()
                if orcid and re.match(r'^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$', orcid):
                    user.orcid_id = orcid
                    update_fields.append('orcid_id')
            
            user.save(update_fields=update_fields)
        
        logger.info(f"OAuth account linked successfully: {provider} account {provider_id} to user {user_id}")
        
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'message': f'{provider.title()} account linked successfully',
            'provider': provider,
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Link OAuth account error: {str(e)}", exc_info=True, extra={
            'request_data': request.data,
            'user_agent': request.META.get('HTTP_USER_AGENT'),
            'ip_address': request.META.get('REMOTE_ADDR'),
        })
        
        return create_error_response(
            OAuthErrorCodes.DATABASE_ERROR,
            'Failed to link OAuth account',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def unlink_oauth_account(request):
    """
    Enhanced OAuth account unlinking with comprehensive validation
    """
    logger.info(f"OAuth account unlinking request from IP: {request.META.get('REMOTE_ADDR')}")
    
    try:
        # Validate request data
        if not request.data:
            return create_error_response(
                OAuthErrorCodes.MISSING_REQUIRED_FIELD,
                'No data provided in request'
            )
        
        data = request.data
        user_id = data.get('user_id')
        
        if not user_id:
            return create_error_response(
                OAuthErrorCodes.MISSING_REQUIRED_FIELD,
                'User ID is required'
            )
        
        # Get user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return create_error_response(
                OAuthErrorCodes.USER_NOT_FOUND,
                'User not found',
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user account is active
        if not user.is_active:
            return create_error_response(
                OAuthErrorCodes.ACCOUNT_DEACTIVATED,
                'Cannot unlink OAuth account from deactivated user',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # Check if user has OAuth account linked
        if not user.oauth_provider:
            return create_error_response(
                OAuthErrorCodes.VALIDATION_ERROR,
                'No OAuth account is currently linked to this user'
            )
        
        # Check if user has a password (can't unlink if no password)
        if not user.password:
            return create_error_response(
                OAuthErrorCodes.MISSING_PASSWORD,
                'Cannot unlink OAuth account without setting a password first. Please set a password before unlinking your OAuth account.'
            )
        
        # Use transaction for data consistency
        with transaction.atomic():
            # Store provider name for response
            provider = user.oauth_provider
            
            # Unlink OAuth account
            update_fields = ['oauth_provider', 'oauth_id']
            user.oauth_provider = None
            user.oauth_id = None
            
            # Remove profile image if it came from OAuth
            if user.profile_image and user.profile_image.startswith(('http://', 'https://')):
                user.profile_image = None
                update_fields.append('profile_image')
            
            # Handle ORCID - only remove if it was from OAuth
            if provider == 'orcid' and user.orcid_id:
                user.orcid_id = None
                update_fields.append('orcid_id')
            
            user.save(update_fields=update_fields)
        
        logger.info(f"OAuth account unlinked successfully: {provider} from user {user_id}")
        
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'message': f'{provider.title() if provider else "OAuth"} account unlinked successfully',
            'unlinked_provider': provider,
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Unlink OAuth account error: {str(e)}", exc_info=True, extra={
            'request_data': request.data,
            'user_agent': request.META.get('HTTP_USER_AGENT'),
            'ip_address': request.META.get('REMOTE_ADDR'),
        })
        
        return create_error_response(
            OAuthErrorCodes.DATABASE_ERROR,
            'Failed to unlink OAuth account',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )