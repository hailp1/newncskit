from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import UserProfileSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def demo_login(request):
    """
    Demo login endpoint that creates a test user if it doesn't exist
    """
    try:
        email = request.data.get('email', 'demo@ncskit.com')
        password = request.data.get('password', 'demo123')
        
        # Try to get existing demo user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create demo user
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name='Demo',
                last_name='User',
                institution='Demo University',
                research_domains=['Computer Science', 'Artificial Intelligence'],
                subscription_type='premium'
            )
        
        # Check password
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def create_demo_users(request):
    """
    Create multiple demo users for testing
    """
    demo_users = [
        {
            'email': 'demo@ncskit.com',
            'password': 'demo123',
            'first_name': 'Demo',
            'last_name': 'User',
            'institution': 'Demo University',
            'research_domains': ['Computer Science', 'AI'],
            'subscription_type': 'premium'
        },
        {
            'email': 'researcher@ncskit.com',
            'password': 'researcher123',
            'first_name': 'Research',
            'last_name': 'Scientist',
            'institution': 'Research Institute',
            'research_domains': ['Medicine', 'Biotechnology'],
            'subscription_type': 'institutional'
        },
        {
            'email': 'student@ncskit.com',
            'password': 'student123',
            'first_name': 'Graduate',
            'last_name': 'Student',
            'institution': 'University College',
            'research_domains': ['Physics', 'Engineering'],
            'subscription_type': 'free'
        }
    ]
    
    created_users = []
    
    for user_data in demo_users:
        email = user_data['email']
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            created_users.append(f"User {email} already exists")
            continue
        
        # Create user
        user = User.objects.create_user(
            username=email,
            **user_data
        )
        created_users.append(f"Created user: {email}")
    
    return Response({
        'message': 'Demo users creation completed',
        'results': created_users,
        'login_instructions': {
            'demo_user': 'demo@ncskit.com / demo123',
            'researcher': 'researcher@ncskit.com / researcher123',
            'student': 'student@ncskit.com / student123'
        }
    })