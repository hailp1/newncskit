from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from . import oauth_views

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Demo endpoints (for development) - TODO: Create demo_views.py
    
    # User profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/activities/', views.UserActivitiesView.as_view(), name='activities'),
    path('profile/dashboard-stats/', views.user_dashboard_stats, name='dashboard_stats'),
    
    # Password management
    path('password/change/', views.PasswordChangeView.as_view(), name='password_change'),
    
    # OAuth endpoints
    path('oauth/callback/', oauth_views.oauth_callback, name='oauth_callback'),
    path('oauth/link/', oauth_views.link_oauth_account, name='link_oauth'),
    path('oauth/unlink/', oauth_views.unlink_oauth_account, name='unlink_oauth'),
]