from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BlogPostViewSet, BlogCategoryViewSet, BlogTagViewSet,
    MediaFileViewSet, SEOAnalysisViewSet, BlogCommentViewSet
)

# Create router for API endpoints
router = DefaultRouter()
router.register(r'posts', BlogPostViewSet, basename='blogpost')
router.register(r'categories', BlogCategoryViewSet, basename='blogcategory')
router.register(r'tags', BlogTagViewSet, basename='blogtag')
router.register(r'media', MediaFileViewSet, basename='mediafile')
router.register(r'seo-analysis', SEOAnalysisViewSet, basename='seoanalysis')
router.register(r'comments', BlogCommentViewSet, basename='blogcomment')

app_name = 'blog'

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    
    # Public endpoints (no authentication required for reading)
    path('api/public/posts/', BlogPostViewSet.as_view({'get': 'published'}), name='public-posts'),
    path('api/public/posts/<str:pk>/', BlogPostViewSet.as_view({'get': 'retrieve'}), name='public-post-detail'),
    path('api/public/categories/', BlogCategoryViewSet.as_view({'get': 'list'}), name='public-categories'),
    path('api/public/tags/', BlogTagViewSet.as_view({'get': 'list'}), name='public-tags'),
    
    # Search endpoints
    path('api/search/posts/', BlogPostViewSet.as_view({'get': 'search'}), name='search-posts'),
]