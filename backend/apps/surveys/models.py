from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
import uuid


class CampaignTemplate(models.Model):
    """Template for creating survey campaigns"""
    
    TEMPLATE_CATEGORIES = [
        ('academic', 'Academic Research'),
        ('market', 'Market Research'),
        ('social', 'Social Studies'),
        ('health', 'Health & Wellness'),
        ('technology', 'Technology'),
        ('education', 'Education'),
        ('general', 'General Survey'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=TEMPLATE_CATEGORIES, default='general')
    
    # Template configuration
    survey_config = models.JSONField(default=dict)
    default_settings = models.JSONField(default=dict, blank=True)
    eligibility_criteria = models.JSONField(default=dict, blank=True)
    
    # Metadata
    is_public = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    usage_count = models.PositiveIntegerField(default=0)
    
    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_campaign_templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'campaign_templates'
        ordering = ['-usage_count', '-created_at']
        indexes = [
            models.Index(fields=['category', 'is_public']),
            models.Index(fields=['is_featured', '-usage_count']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"
    
    def increment_usage(self):
        """Increment usage count when template is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])


class SurveyCampaign(models.Model):
    """Survey campaign model for managing community data collection"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    title = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_campaigns')
    
    # Template reference
    template = models.ForeignKey(CampaignTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='campaigns')
    
    # Campaign Configuration
    target_participants = models.PositiveIntegerField(default=100)
    reward_per_participant = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    duration_days = models.PositiveIntegerField(default=30)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    
    # Advanced settings
    auto_approve_participants = models.BooleanField(default=True)
    allow_multiple_responses = models.BooleanField(default=False)
    require_approval = models.BooleanField(default=False)
    max_responses_per_user = models.PositiveIntegerField(default=1)
    
    # Scheduling
    scheduled_start = models.DateTimeField(null=True, blank=True)
    scheduled_end = models.DateTimeField(null=True, blank=True)
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    participant_count = models.PositiveIntegerField(default=0)
    completed_responses = models.PositiveIntegerField(default=0)
    total_tokens_awarded = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    admin_fee_collected = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Quality metrics
    average_completion_time = models.DurationField(null=True, blank=True)
    response_quality_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Survey Configuration (JSON field for flexibility)
    survey_config = models.JSONField(default=dict, blank=True)
    eligibility_criteria = models.JSONField(default=dict, blank=True)
    
    # Admin fields
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='reviewed_campaigns'
    )
    review_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    launched_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
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
    
    @property
    def days_remaining(self):
        """Calculate days remaining in campaign"""
        if not self.launched_at or self.status not in ['active', 'paused']:
            return None
        
        end_date = self.launched_at + timezone.timedelta(days=self.duration_days)
        remaining = end_date - timezone.now()
        return max(0, remaining.days)
    
    @property
    def is_overdue(self):
        """Check if campaign is overdue"""
        if not self.launched_at or self.status != 'active':
            return False
        
        end_date = self.launched_at + timezone.timedelta(days=self.duration_days)
        return timezone.now() > end_date
    
    @property
    def estimated_cost(self):
        """Calculate estimated total cost including admin fees"""
        from apps.admin_management.models import SystemConfiguration
        
        fee_percentage = SystemConfiguration.get_config('admin_fee_percentage', 10.0)
        total_rewards = self.target_participants * self.reward_per_participant
        admin_fee = total_rewards * (fee_percentage / 100)
        return total_rewards + admin_fee
    
    def can_launch(self):
        """Check if campaign can be launched"""
        if self.status != 'draft':
            return False, "Campaign must be in draft status"
        
        if not self.survey_config:
            return False, "Survey configuration is required"
        
        if self.target_participants <= 0:
            return False, "Target participants must be greater than 0"
        
        if self.reward_per_participant <= 0:
            return False, "Reward per participant must be greater than 0"
        
        return True, "Campaign is ready to launch"
    
    def launch(self, admin_user=None):
        """Launch the campaign"""
        can_launch, message = self.can_launch()
        if not can_launch:
            raise ValueError(message)
        
        self.status = 'active'
        self.launched_at = timezone.now()
        
        if self.template:
            self.template.increment_usage()
        
        self.save()
        
        # Log admin activity if launched by admin
        if admin_user and admin_user.is_staff:
            from apps.admin_management.models import AdminActivity
            AdminActivity.objects.create(
                admin_user=admin_user,
                action_type='campaign_approved',
                description=f'Launched campaign: {self.title}',
                details={
                    'campaign_id': str(self.id),
                    'campaign_title': self.title,
                    'target_participants': self.target_participants,
                    'reward_per_participant': str(self.reward_per_participant)
                }
            )


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
    participant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='campaign_participations')
    
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
    participant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='campaign_rewards')
    
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
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
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


class CampaignNotification(models.Model):
    """Notifications related to campaign events"""
    
    NOTIFICATION_TYPES = [
        ('campaign_launched', 'Campaign Launched'),
        ('campaign_completed', 'Campaign Completed'),
        ('participant_joined', 'Participant Joined'),
        ('response_submitted', 'Response Submitted'),
        ('reward_processed', 'Reward Processed'),
        ('campaign_paused', 'Campaign Paused'),
        ('campaign_cancelled', 'Campaign Cancelled'),
        ('milestone_reached', 'Milestone Reached'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(SurveyCampaign, on_delete=models.CASCADE, related_name='notifications')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='campaign_notifications')
    
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'campaign_notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['campaign', 'notification_type']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.email}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.save(update_fields=['is_read'])


class CampaignAnalytics(models.Model):
    """Analytics data for campaigns"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.OneToOneField(SurveyCampaign, on_delete=models.CASCADE, related_name='analytics')
    
    # Participation metrics
    total_views = models.PositiveIntegerField(default=0)
    total_clicks = models.PositiveIntegerField(default=0)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Response quality metrics
    average_response_time = models.DurationField(null=True, blank=True)
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    dropout_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Demographic data
    participant_demographics = models.JSONField(default=dict, blank=True)
    geographic_distribution = models.JSONField(default=dict, blank=True)
    
    # Engagement metrics
    peak_participation_hours = models.JSONField(default=list, blank=True)
    daily_participation_trend = models.JSONField(default=dict, blank=True)
    
    # Quality scores
    response_quality_distribution = models.JSONField(default=dict, blank=True)
    satisfaction_score = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    # Financial metrics
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cost_per_response = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    roi_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'campaign_analytics'
    
    def __str__(self):
        return f"Analytics for {self.campaign.title}"
    
    def update_metrics(self):
        """Update analytics metrics based on current campaign data"""
        campaign = self.campaign
        
        # Update basic metrics
        self.completion_rate = campaign.completion_rate
        self.total_cost = campaign.total_tokens_awarded + campaign.admin_fee_collected
        
        if campaign.completed_responses > 0:
            self.cost_per_response = self.total_cost / campaign.completed_responses
        
        # Calculate dropout rate
        if campaign.participant_count > 0:
            self.dropout_rate = ((campaign.participant_count - campaign.completed_responses) / campaign.participant_count) * 100
        
        self.save()


class CampaignMilestone(models.Model):
    """Track campaign milestones and achievements"""
    
    MILESTONE_TYPES = [
        ('participants_25', '25% Participants Reached'),
        ('participants_50', '50% Participants Reached'),
        ('participants_75', '75% Participants Reached'),
        ('participants_100', '100% Participants Reached'),
        ('responses_25', '25% Responses Completed'),
        ('responses_50', '50% Responses Completed'),
        ('responses_75', '75% Responses Completed'),
        ('responses_100', '100% Responses Completed'),
        ('duration_25', '25% Duration Elapsed'),
        ('duration_50', '50% Duration Elapsed'),
        ('duration_75', '75% Duration Elapsed'),
        ('duration_100', '100% Duration Elapsed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(SurveyCampaign, on_delete=models.CASCADE, related_name='milestones')
    milestone_type = models.CharField(max_length=50, choices=MILESTONE_TYPES)
    
    # Milestone data
    target_value = models.PositiveIntegerField()
    current_value = models.PositiveIntegerField()
    is_achieved = models.BooleanField(default=False)
    
    achieved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'campaign_milestones'
        unique_together = ['campaign', 'milestone_type']
        indexes = [
            models.Index(fields=['campaign', 'is_achieved']),
        ]
    
    def __str__(self):
        return f"{self.campaign.title} - {self.get_milestone_type_display()}"
    
    def check_achievement(self):
        """Check if milestone is achieved and update status"""
        if not self.is_achieved and self.current_value >= self.target_value:
            self.is_achieved = True
            self.achieved_at = timezone.now()
            self.save()
            
            # Create notification
            CampaignNotification.objects.create(
                campaign=self.campaign,
                recipient=self.campaign.creator,
                notification_type='milestone_reached',
                title=f'Milestone Reached: {self.get_milestone_type_display()}',
                message=f'Your campaign "{self.campaign.title}" has reached a milestone: {self.get_milestone_type_display()}',
                data={
                    'milestone_type': self.milestone_type,
                    'target_value': self.target_value,
                    'current_value': self.current_value
                }
            )