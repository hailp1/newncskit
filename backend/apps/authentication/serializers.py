from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile, UserActivity


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'institution', 'research_domains'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            username=validated_data['email'],  # Use email as username
            **validated_data
        )
        user.set_password(password)
        user.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile
    """
    full_name = serializers.ReadOnlyField()
    subscription_features = serializers.ReadOnlyField(source='get_subscription_features')
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'institution', 'orcid_id', 'avatar', 'research_domains',
            'subscription_type', 'subscription_features', 'preferences',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'updated_at']


class UserProfileDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for user profile including extended profile
    """
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'institution',
            'orcid_id', 'avatar', 'research_domains', 'subscription_type',
            'preferences', 'profile', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'updated_at']
    
    def get_profile(self, obj):
        try:
            profile = obj.profile
            return {
                'bio': profile.bio,
                'website': profile.website,
                'location': profile.location,
                'phone': profile.phone,
                'academic_title': profile.academic_title,
                'department': profile.department,
                'google_scholar_url': profile.google_scholar_url,
                'researchgate_url': profile.researchgate_url,
                'linkedin_url': profile.linkedin_url,
                'profile_visibility': profile.profile_visibility,
            }
        except UserProfile.DoesNotExist:
            return None


class UserActivitySerializer(serializers.ModelSerializer):
    """
    Serializer for user activities
    """
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    activity_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'user_name', 'activity_type', 'activity_display',
            'description', 'metadata', 'project_id', 'document_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user