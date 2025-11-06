import django_filters
from django.db.models import Q
from .models import BlogPost, BlogCategory, BlogTag


class BlogPostFilter(django_filters.FilterSet):
    """Filter for blog posts"""
    
    # Status filters
    status = django_filters.ChoiceFilter(choices=BlogPost.STATUS_CHOICES)
    
    # Author filters
    author = django_filters.CharFilter(field_name='author__username', lookup_expr='icontains')
    author_id = django_filters.NumberFilter(field_name='author__id')
    
    # Category filters
    category = django_filters.ModelChoiceFilter(
        field_name='categories',
        queryset=BlogCategory.objects.all(),
        to_field_name='slug'
    )
    category_id = django_filters.ModelChoiceFilter(
        field_name='categories',
        queryset=BlogCategory.objects.all()
    )
    
    # Tag filters
    tag = django_filters.ModelChoiceFilter(
        field_name='tags',
        queryset=BlogTag.objects.all(),
        to_field_name='slug'
    )
    tag_id = django_filters.ModelChoiceFilter(
        field_name='tags',
        queryset=BlogTag.objects.all()
    )
    
    # Date filters
    published_after = django_filters.DateTimeFilter(field_name='published_at', lookup_expr='gte')
    published_before = django_filters.DateTimeFilter(field_name='published_at', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    # SEO filters
    seo_score_min = django_filters.NumberFilter(field_name='seo_score', lookup_expr='gte')
    seo_score_max = django_filters.NumberFilter(field_name='seo_score', lookup_expr='lte')
    
    # Analytics filters
    view_count_min = django_filters.NumberFilter(field_name='view_count', lookup_expr='gte')
    view_count_max = django_filters.NumberFilter(field_name='view_count', lookup_expr='lte')
    
    # Content filters
    word_count_min = django_filters.NumberFilter(field_name='word_count', lookup_expr='gte')
    word_count_max = django_filters.NumberFilter(field_name='word_count', lookup_expr='lte')
    
    # Search filter
    search = django_filters.CharFilter(method='filter_search')
    
    # Featured filter
    has_featured_image = django_filters.BooleanFilter(field_name='featured_image', lookup_expr='isnull', exclude=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'status', 'author', 'author_id', 'category', 'category_id',
            'tag', 'tag_id', 'published_after', 'published_before',
            'created_after', 'created_before', 'seo_score_min', 'seo_score_max',
            'view_count_min', 'view_count_max', 'word_count_min', 'word_count_max',
            'search', 'has_featured_image'
        ]
    
    def filter_search(self, queryset, name, value):
        """Custom search filter"""
        if not value:
            return queryset
        
        return queryset.filter(
            Q(title__icontains=value) |
            Q(content__icontains=value) |
            Q(excerpt__icontains=value) |
            Q(meta_title__icontains=value) |
            Q(meta_description__icontains=value) |
            Q(tags__name__icontains=value) |
            Q(categories__name__icontains=value)
        ).distinct()


class BlogCategoryFilter(django_filters.FilterSet):
    """Filter for blog categories"""
    
    parent = django_filters.ModelChoiceFilter(
        queryset=BlogCategory.objects.all(),
        to_field_name='slug'
    )
    parent_id = django_filters.ModelChoiceFilter(
        queryset=BlogCategory.objects.all()
    )
    
    # Root categories (no parent)
    is_root = django_filters.BooleanFilter(field_name='parent', lookup_expr='isnull')
    
    # Post count filters
    post_count_min = django_filters.NumberFilter(field_name='post_count', lookup_expr='gte')
    post_count_max = django_filters.NumberFilter(field_name='post_count', lookup_expr='lte')
    
    class Meta:
        model = BlogCategory
        fields = ['parent', 'parent_id', 'is_root', 'post_count_min', 'post_count_max']


class BlogTagFilter(django_filters.FilterSet):
    """Filter for blog tags"""
    
    # Post count filters
    post_count_min = django_filters.NumberFilter(field_name='post_count', lookup_expr='gte')
    post_count_max = django_filters.NumberFilter(field_name='post_count', lookup_expr='lte')
    
    # Popular tags
    is_popular = django_filters.BooleanFilter(method='filter_popular')
    
    class Meta:
        model = BlogTag
        fields = ['post_count_min', 'post_count_max', 'is_popular']
    
    def filter_popular(self, queryset, name, value):
        """Filter popular tags (with posts)"""
        if value:
            return queryset.filter(post_count__gt=0)
        return queryset