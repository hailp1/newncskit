from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SurveyCampaignViewSet,
    CampaignParticipantViewSet,
    CampaignRewardViewSet,
    AdminFeeConfigurationViewSet,
    SurveyCampaignStatsViewSet
)

router = DefaultRouter()
router.register(r'campaigns', SurveyCampaignViewSet, basename='surveycampaign')
router.register(r'participants', CampaignParticipantViewSet, basename='campaignparticipant')
router.register(r'rewards', CampaignRewardViewSet, basename='campaignreward')
router.register(r'fee-config', AdminFeeConfigurationViewSet, basename='adminfeeconfig')
router.register(r'stats', SurveyCampaignStatsViewSet, basename='campaignstats')

urlpatterns = [
    path('', include(router.urls)),
]