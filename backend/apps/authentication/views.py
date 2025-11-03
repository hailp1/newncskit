from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from .models import User, UserActivity
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserProfileDetailSerializer, UserActivitySerializer, PasswordChangeSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Log registration activity
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            description=f'User registered and logged in',
            metadata={'registration': True}
        )
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """
    User login endpoint
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Log login activity
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            description=f'User logged in',
            metadata={'ip_address': request.META.get('REMOTE_ADDR')}
        )
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class UserLogoutView(APIView):
    """
    User logout endpoint
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Log logout activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='logout',
                description=f'User logged out'
            )
            
            return Response({'message': 'Successfully logged out'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update user profile
    """
    serializer_class = UserProfileDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        
        # Log profile update activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='project_updated',  # Using existing type for now
            description=f'User updated profile'
        )
        
        return response


class UserActivitiesView(generics.ListAPIView):
    """
    Get user activities for dashboard
    """
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserActivity.objects.filter(user=self.request.user)[:20]


class PasswordChangeView(APIView):
    """
    Change user password
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Log password change activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='project_updated',  # Using existing type for now
            description=f'User changed password'
        )
        
        return Response({'message': 'Password changed successfully'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard_stats(request):
    """
    Get user dashboard statistics
    """
    user = request.user
    
    # Get recent activities
    recent_activities = UserActivity.objects.filter(user=user)[:10]
    
    # Calculate basic stats (will be enhanced with actual project data later)
    stats = {
        'total_activities': UserActivity.objects.filter(user=user).count(),
        'recent_activities': UserActivitySerializer(recent_activities, many=True).data,
        'subscription_type': user.subscription_type,
        'subscription_features': user.get_subscription_features(),
        'profile_completion': calculate_profile_completion(user),
    }
    
    return Response(stats)


def calculate_profile_completion(user):
    """
    Calculate profile completion percentage
    """
    fields_to_check = [
        'first_name', 'last_name', 'institution', 'research_domains'
    ]
    
    completed_fields = 0
    total_fields = len(fields_to_check)
    
    for field in fields_to_check:
        value = getattr(user, field, None)
        if value:
            if isinstance(value, list) and len(value) > 0:
                completed_fields += 1
            elif isinstance(value, str) and value.strip():
                completed_fields += 1
    
    # Check profile fields
    try:
        profile = user.profile
        profile_fields = ['bio', 'academic_title', 'department']
        for field in profile_fields:
            if getattr(profile, field, None):
                completed_fields += 1
        total_fields += len(profile_fields)
    except:
        pass
    
    return round((completed_fields / total_fields) * 100, 1)