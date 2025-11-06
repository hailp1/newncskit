"""
URL configuration for analytics app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.AnalysisProjectViewSet, basename='analysis-project')
router.register(r'results', views.AnalysisResultViewSet, basename='analysis-result')

urlpatterns = [
    path('', include(router.urls)),
    
    # Project management endpoints
    path('projects/<uuid:project_id>/execute/', views.ExecuteAnalysisView.as_view(), name='execute-analysis'),
    path('projects/<uuid:project_id>/results/', views.ProjectResultsView.as_view(), name='project-results'),
    path('projects/<uuid:project_id>/collaborators/', views.ProjectCollaboratorsView.as_view(), name='project-collaborators'),
    path('projects/<uuid:project_id>/versions/', views.ProjectVersionsView.as_view(), name='project-versions'),
    path('projects/<uuid:project_id>/export/', views.ExportProjectView.as_view(), name='export-project'),
    
    # Survey integration endpoints
    path('survey-pipeline/<uuid:campaign_id>/', views.ProcessSurveyDataView.as_view(), name='process-survey-data'),
    path('construct-mapping/', views.ConstructMappingView.as_view(), name='construct-mapping'),
    path('data-quality/<uuid:project_id>/', views.DataQualityView.as_view(), name='data-quality'),
    
    # Analysis execution endpoints
    path('execute/reliability/', views.ReliabilityAnalysisView.as_view(), name='reliability-analysis'),
    path('execute/factor-analysis/', views.FactorAnalysisView.as_view(), name='factor-analysis'),
    path('execute/sem/', views.SEMAnalysisView.as_view(), name='sem-analysis'),
    
    # Report generation endpoints
    path('reports/generate/', views.GenerateReportView.as_view(), name='generate-report'),
    path('reports/<uuid:report_id>/download/', views.DownloadReportView.as_view(), name='download-report'),
    
    # Visualization endpoints
    path('visualizations/<uuid:result_id>/', views.VisualizationView.as_view(), name='visualizations'),
    path('charts/export/', views.ExportChartView.as_view(), name='export-chart'),
    
    # Templates and recommendations
    path('templates/', views.AnalysisTemplatesView.as_view(), name='analysis-templates'),
    path('recommendations/<uuid:project_id>/', views.AnalysisRecommendationsView.as_view(), name='analysis-recommendations'),
]