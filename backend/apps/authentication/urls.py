from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views, demo_views

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Demo endpoints (for development)
    path('demo/login/', demo_views.demo_login, name='demo_login'),
    path('demo/create-users/', demo_views.create_demo_users, name='create_demo_users'),
    
    # User profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/activities/', views.UserActivitiesView.as_view(), name='activities'),
    path('profile/dashboard-stats/', views.user_dashboard_stats, name='dashboard_stats'),
    
    # Password management
    path('password/change/', views.PasswordChangeView.as_view(), name='password_change'),
]