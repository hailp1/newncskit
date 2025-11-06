from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminActivityViewSet, SystemConfigurationViewSet, BrandConfigurationViewSet,
    UserRoleViewSet, PermissionViewSet, UserManagementViewSet, SystemMonitoringViewSet
)

router = DefaultRouter()
router.register(r'activities', AdminActivityViewSet, basename='admin-activities')
router.register(r'config', SystemConfigurationViewSet, basename='system-config')
router.register(r'brand', BrandConfigurationViewSet, basename='brand-config')
router.register(r'roles', UserRoleViewSet, basename='user-roles')
router.register(r'permissions', PermissionViewSet, basename='permissions')
router.register(r'users', UserManagementViewSet, basename='user-management')
router.register(r'monitoring', SystemMonitoringViewSet, basename='system-monitoring')

urlpatterns = [
    path('', include(router.urls)),
]