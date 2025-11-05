from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class SurveyCampaign(models.Model):
    """Survey campaign model for managing community data collection"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_campaigns')
    
    # Campaign Configuration
    target_participants = models.PositiveIntegerField(default=100)
    reward_per_participant = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    duration_days = models.PositiveIntegerField(default=30)
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    participant_count = models.PositiveIntegerField(default=0)
    completed_responses = models.PositiveIntegerField(default=0)
    total_tokens_awarded = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    admin_fee_collected = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Survey Configuration (JSON field for flexibility)
    survey_config = models.JSONField(default=dict, blank=True)
    eligibility_criteria = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    launched_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['creator', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def completion_rate(self):
        if self.participant_count == 0:
            return 0
        return (self.completed_responses / self.participant_count) * 100


class CampaignParticipant(models.Model):
    """Track participants in survey campaigns"""
    
    PARTICIPATION_STATUS = [
        ('invited', 'Invited'),
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
        ('disqualified', 'Disqualified'),
    ]
    
    campaign = models.ForeignKey(SurveyCampaign, on_delete=models.CASCADE, related_name='participants')
    participant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaign_participations')
    
    # Participation tracking
    status = models.CharField(max_length=20, choices=PARTICIPATION_STATUS, default='invited')
    survey_responses = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['campaign', 'participant']
        indexes = [
            models.Index(fields=['campaign', 'status']),
            models.Index(fields=['participant', 'status']),
        ]
    
    def __str__(self):
        return f"{self.participant.email} - {self.campaign.title}"
    
    @property
    def is_completed(self):
        return self.status == 'completed'


class CampaignReward(models.Model):
    """Track reward processing for campaign participants"""
    
    REWARD_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    campaign = models.ForeignKey(SurveyCampaign, on_delete=models.CASCADE, related_name='rewards')
    participant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaign_rewards')
    
    # Reward details
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2)
    admin_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Processing status
    status = models.CharField(max_length=20, choices=REWARD_STATUS, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['campaign', 'participant']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['campaign', 'status']),
        ]
    
    def __str__(self):
        return f"Reward: {self.participant.email} - {self.reward_amount} tokens"


class AdminFeeConfiguration(models.Model):
    """Configuration for admin fees on survey campaigns"""
    
    fee_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=10.0,
        help_text="Percentage fee charged on survey campaigns (0-100%)"
    )
    
    # Configuration metadata
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Admin Fee: {self.fee_percentage}%"
    
    @classmethod
    def get_current_fee_percentage(cls):
        """Get the current active fee percentage"""
        config = cls.objects.filter(is_active=True).first()
        return config.fee_percentage if config else Decimal('10.0')