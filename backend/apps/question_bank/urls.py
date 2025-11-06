from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TheoreticalModelViewSet,
    ResearchVariableViewSet,
    QuestionTemplateViewSet,
    QuestionBankViewSet,
    QuestionUsageLogViewSet
)

router = DefaultRouter()
router.register(r'theoretical-models', TheoreticalModelViewSet, basename='theoreticalmodel')
router.register(r'research-variables', ResearchVariableViewSet, basename='researchvariable')
router.register(r'question-templates', QuestionTemplateViewSet, basename='questiontemplate')
router.register(r'question-banks', QuestionBankViewSet, basename='questionbank')
router.register(r'usage-logs', QuestionUsageLogViewSet, basename='questionusagelog')

urlpatterns = [
    path('api/question-bank/', include(router.urls)),
]