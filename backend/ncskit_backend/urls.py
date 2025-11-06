"""
URL configuration for ncskit_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .health import health_check, readiness_check, liveness_check

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.authentication.urls")),
    path("api/projects/", include("apps.projects.urls")),
    path("api/surveys/", include("apps.surveys.urls")),
    path("api/question-bank/", include("apps.question_bank.urls")),
    path("api/admin/", include("apps.admin_management.urls")),
    path("api/blog/", include("apps.blog.urls")),
    
    # Health check endpoints
    path('health/', health_check, name='health_check'),
    path('ready/', readiness_check, name='readiness_check'),
    path('alive/', liveness_check, name='liveness_check'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
