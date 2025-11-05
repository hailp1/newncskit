from django.contrib import admin
from .models import SurveyCampaign, CampaignParticipant, CampaignReward


@admin.register(SurveyCampaign)
class SurveyCampaignAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'status', 'participant_count', 'reward_per_participant', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CampaignParticipant)
class CampaignParticipantAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'participant', 'status', 'joined_at', 'completed_at']
    list_filter = ['status', 'joined_at']
    search_fields = ['campaign__title', 'participant__email']


@admin.register(CampaignReward)
class CampaignRewardAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'participant', 'reward_amount', 'status', 'processed_at']
    list_filter = ['status', 'processed_at']
    search_fields = ['campaign__title', 'participant__email']