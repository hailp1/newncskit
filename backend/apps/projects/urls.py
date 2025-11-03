from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'projects'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'', views.ProjectViewSet, basename='project')
router.register(r'(?P<project_id>[^/.]+)/milestones', views.MilestoneViewSet, basename='milestone')

urlpatterns = [
    # ViewSet routes
    path('', include(router.urls)),
    
    # Additional project endpoints
    path('<uuid:project_id>/collaborators/', views.ProjectCollaboratorListView.as_view(), name='collaborators'),
    path('<uuid:project_id>/collaborators/<uuid:user_id>/', views.ProjectCollaboratorDetailView.as_view(), name='collaborator-detail'),
    path('<uuid:project_id>/activities/', views.ProjectActivityListView.as_view(), name='activities'),
    path('templates/', views.ProjectTemplateListView.as_view(), name='templates'),
    path('dashboard-stats/', views.project_dashboard_stats, name='dashboard-stats'),
]