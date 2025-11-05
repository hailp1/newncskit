from rest_framework import serializers
from django.contrib.auth.models import User
from .models import SurveyCampaign, CampaignParticipant, CampaignReward, AdminFeeConfiguration


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for campaign-related endpoints"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


class SurveyCampaignSerializer(serializers.ModelSerializer):
    """Serializer for survey campaigns"""
    creator = UserBasicSerializer(read_only=True)
    completion_rate = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = SurveyCampaign
        fields = [
            'id', 'title', 'description', 'creator', 'target_participants',
            'reward_per_participant', 'duration_days', 'status', 'participant_count',
            'completed_responses', 'total_tokens_awarded', 'admin_fee_collected',
            'survey_config', 'eligibility_criteria', 'created_at', 'updated_at',
            'launched_at', 'completed_at', 'completion_rate', 'is_active'
        ]
        read_only_fields = [
            'participant_count', 'completed_responses', 'total_tokens_awarded',
            'admin_fee_collected', 'created_at', 'updated_at', 'launched_at', 'completed_at'
        ]
    
    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class SurveyCampaignCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating survey campaigns"""
    
    class Meta:
        model = SurveyCampaign
        fields = [
            'title', 'description', 'target_participants', 'reward_per_participant',
            'duration_days', 'survey_config', 'eligibility_criteria'
        ]
    
    def validate_reward_per_participant(self, value):
        if value <= 0:
            raise serializers.ValidationError("Reward per participant must be greater than 0")
        return value
    
    def validate_target_participants(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target participants must be greater than 0")
        return value


class CampaignParticipantSerializer(serializers.ModelSerializer):
    """Serializer for campaign participants"""
    participant = UserBasicSerializer(read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    is_completed = serializers.ReadOnlyField()
    
    class Meta:
        model = CampaignParticipant
        fields = [
            'id', 'campaign', 'campaign_title', 'participant', 'status',
            'survey_responses', 'joined_at', 'started_at', 'completed_at', 'is_completed'
        ]
        read_only_fields = ['joined_at', 'started_at', 'completed_at']


class CampaignParticipantCreateSerializer(serializers.ModelSerializer):
    """Serializer for joining a campaign"""
    
    class Meta:
        model = CampaignParticipant
        fields = ['campaign']
    
    def create(self, validated_data):
        validated_data['participant'] = self.context['request'].user
        return super().create(validated_data)


class SurveyResponseSerializer(serializers.Serializer):
    """Serializer for submitting survey responses"""
    responses = serializers.JSONField()
    
    def validate_responses(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Responses must be a dictionary")
        return value


class CampaignRewardSerializer(serializers.ModelSerializer):
    """Serializer for campaign rewards"""
    participant = UserBasicSerializer(read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    
    class Meta:
        model = CampaignReward
        fields = [
            'id', 'campaign', 'campaign_title', 'participant', 'reward_amount',
            'admin_fee', 'net_amount', 'status', 'transaction_id', 'error_message',
            'created_at', 'processed_at'
        ]
        read_only_fields = ['created_at', 'processed_at']


class AdminFeeConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for admin fee configuration"""
    created_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = AdminFeeConfiguration
        fields = [
            'id', 'fee_percentage', 'is_active', 'created_by', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class CampaignStatsSerializer(serializers.Serializer):
    """Serializer for campaign statistics"""
    total_campaigns = serializers.IntegerField()
    active_campaigns = serializers.IntegerField()
    total_participants = serializers.IntegerField()
    total_rewards_distributed = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_admin_fees = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_completion_rate = serializers.FloatField()


class RevenueCalculationSerializer(serializers.Serializer):
    """Serializer for revenue calculations"""
    total_reward_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    admin_fee_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    admin_fee_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_reward_amount = serializers.DecimalField(max_digits=12, decimal_places=2)