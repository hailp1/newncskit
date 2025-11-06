from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, F
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import (
    BlogPost, BlogCategory, BlogTag, MediaFile, MediaFolder, MediaTag,
    SEOAnalysis, BlogAnalytics, BlogComment
)
from .serializers import (
    BlogPostListSerializer, BlogPostDetailSerializer, BlogPostCreateUpdateSerializer,
    BlogCategorySerializer, BlogTagSerializer, MediaFileSerializer, MediaFileUploadSerializer,
    SEOAnalysisSerializer, SEOAnalysisCreateSerializer, BlogAnalyticsSerializer,
    BlogCommentSerializer, BlogPostSearchSerializer
)
from .services import SEOAnalysisService, MediaProcessingService
from .filters import BlogPostFilter
from .permissions import BlogPostPermission


class BlogCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for blog categories"""
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'post_count', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            # Only return top-level categories for list view
            parent = self.request.query_params.get('parent')
            if parent == 'null' or parent is None:
                queryset = queryset.filter(parent__isnull=True)
            elif parent:
                queryset = queryset.filter(parent_id=parent)
        return queryset
    
    @action(detail=False, methods=['get'])
    def hierarchy(self, request):
        """Get category hierarchy"""
        categories = self.get_queryset().filter(parent__isnull=True)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Get posts in this category"""
        category = self.get_object()
        posts = BlogPost.objects.filter(categories=category, status='published')
        serializer = BlogPostListSerializer(posts, many=True)
        return Response(serializer.data)


class BlogTagViewSet(viewsets.ModelViewSet):
    """ViewSet for blog tags"""
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'post_count', 'created_at']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular tags"""
        tags = self.get_queryset().filter(post_count__gt=0).order_by('-post_count')[:20]
        serializer = self.get_serializer(tags, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Get posts with this tag"""
        tag = self.get_object()
        posts = BlogPost.objects.filter(tags=tag, status='published')
        serializer = BlogPostListSerializer(posts, many=True)
        return Response(serializer.data)


class MediaFileViewSet(viewsets.ModelViewSet):
    """ViewSet for media files"""
    queryset = MediaFile.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['original_name', 'alt_text', 'description', 'ai_description']
    ordering_fields = ['original_name', 'file_size', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MediaFileUploadSerializer
        return MediaFileSerializer
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
        
        # Process media file asynchronously
        media_file = serializer.instance
        MediaProcessingService.process_media_file(media_file)
    
    @action(detail=False, methods=['get'])
    def images(self, request):
        """Get only image files"""
        images = self.get_queryset().filter(mime_type__startswith='image/')
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def generate_alt_text(self, request, pk=None):
        """Generate AI alt text for image"""
        media_file = self.get_object()
        if not media_file.is_image:
            return Response(
                {'error': 'Alt text can only be generated for images'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        alt_text = MediaProcessingService.generate_alt_text(media_file)
        media_file.ai_description = alt_text
        media_file.save()
        
        return Response({'alt_text': alt_text})


class BlogPostViewSet(viewsets.ModelViewSet):
    """ViewSet for blog posts"""
    queryset = BlogPost.objects.all()
    permission_classes = [BlogPostPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BlogPostFilter
    search_fields = ['title', 'content', 'excerpt', 'meta_title', 'meta_description']
    ordering_fields = ['title', 'created_at', 'published_at', 'view_count', 'seo_score']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BlogPostCreateUpdateSerializer
        return BlogPostDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status for non-authors
        if not self.request.user.is_staff:
            if self.action == 'list':
                queryset = queryset.filter(
                    Q(status='published') | Q(author=self.request.user)
                )
            elif self.action == 'retrieve':
                queryset = queryset.filter(
                    Q(status='published') | 
                    Q(author=self.request.user) |
                    Q(collaborators=self.request.user)
                )
        
        return queryset.select_related('author', 'featured_image').prefetch_related(
            'categories', 'tags', 'collaborators'
        )
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=False, methods=['get'])
    def published(self, request):
        """Get published posts"""
        posts = self.get_queryset().filter(
            status='published',
            published_at__lte=timezone.now()
        )
        serializer = BlogPostListSerializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def drafts(self, request):
        """Get user's draft posts"""
        drafts = self.get_queryset().filter(
            author=request.user,
            status='draft'
        )
        serializer = BlogPostListSerializer(drafts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a post"""
        post = self.get_object()
        
        if post.status != 'draft':
            return Response(
                {'error': 'Only draft posts can be published'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        post.status = 'published'
        post.published_at = timezone.now()
        post.save()
        
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def schedule(self, request, pk=None):
        """Schedule a post for publishing"""
        post = self.get_object()
        scheduled_at = request.data.get('scheduled_at')
        
        if not scheduled_at:
            return Response(
                {'error': 'scheduled_at is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        post.status = 'scheduled'
        post.scheduled_at = scheduled_at
        post.save()
        
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def analyze_seo(self, request, pk=None):
        """Analyze SEO for a post"""
        post = self.get_object()
        focus_keyword = request.data.get('focus_keyword', post.focus_keyword)
        
        analysis = SEOAnalysisService.analyze_post(post, focus_keyword)
        serializer = SEOAnalysisSerializer(analysis)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get analytics for a post"""
        post = self.get_object()
        analytics = BlogAnalytics.objects.filter(post=post).order_by('-date')[:30]
        serializer = BlogAnalyticsSerializer(analytics, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Increment view count"""
        post = self.get_object()
        post.view_count = F('view_count') + 1
        post.save(update_fields=['view_count'])
        return Response({'view_count': post.view_count})
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like/unlike a post"""
        post = self.get_object()
        action_type = request.data.get('action', 'like')
        
        if action_type == 'like':
            post.like_count = F('like_count') + 1
        else:
            post.like_count = F('like_count') - 1
        
        post.save(update_fields=['like_count'])
        return Response({'like_count': post.like_count})
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search for posts"""
        query = request.query_params.get('q', '')
        
        if not query:
            return Response([])
        
        posts = self.get_queryset().filter(
            Q(title__icontains=query) |
            Q(content__icontains=query) |
            Q(excerpt__icontains=query) |
            Q(tags__name__icontains=query) |
            Q(categories__name__icontains=query)
        ).distinct()
        
        serializer = BlogPostSearchSerializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """Get related posts"""
        post = self.get_object()
        
        # Find posts with similar tags or categories
        related_posts = BlogPost.objects.filter(
            Q(tags__in=post.tags.all()) | Q(categories__in=post.categories.all()),
            status='published'
        ).exclude(id=post.id).distinct()[:5]
        
        serializer = BlogPostListSerializer(related_posts, many=True)
        return Response(serializer.data)


class SEOAnalysisViewSet(viewsets.ModelViewSet):
    """ViewSet for SEO analysis"""
    queryset = SEOAnalysis.objects.all()
    serializer_class = SEOAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SEOAnalysisCreateSerializer
        return SEOAnalysisSerializer
    
    @action(detail=False, methods=['post'])
    def analyze_content(self, request):
        """Analyze content for SEO without saving"""
        content = request.data.get('content', '')
        title = request.data.get('title', '')
        meta_description = request.data.get('meta_description', '')
        focus_keyword = request.data.get('focus_keyword', '')
        
        analysis = SEOAnalysisService.analyze_content(
            content, title, meta_description, focus_keyword
        )
        
        return Response(analysis)


class BlogCommentViewSet(viewsets.ModelViewSet):
    """ViewSet for blog comments"""
    queryset = BlogComment.objects.filter(is_approved=True)
    serializer_class = BlogCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        post_id = self.request.query_params.get('post')
        if post_id:
            return super().get_queryset().filter(post_id=post_id, parent__isnull=True)
        return super().get_queryset()
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Reply to a comment"""
        parent_comment = self.get_object()
        content = request.data.get('content')
        
        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reply = BlogComment.objects.create(
            post=parent_comment.post,
            author=request.user,
            content=content,
            parent=parent_comment
        )
        
        serializer = self.get_serializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)