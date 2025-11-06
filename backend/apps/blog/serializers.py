from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    BlogPost, BlogCategory, BlogTag, MediaFile, MediaFolder, MediaTag,
    SEOAnalysis, BlogAnalytics, BlogComment, BlogPostVersion
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class MediaTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaTag
        fields = ['name', 'slug']


class MediaFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaFolder
        fields = ['id', 'name', 'slug', 'parent']


class MediaFileSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    folder = MediaFolderSerializer(read_only=True)
    tags = MediaTagSerializer(many=True, read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    is_image = serializers.ReadOnlyField()
    
    class Meta:
        model = MediaFile
        fields = [
            'id', 'filename', 'original_name', 'mime_type', 'file_size', 'file_size_mb',
            'storage_path', 'cdn_url', 'width', 'height', 'alt_text', 'caption',
            'description', 'ai_description', 'ai_tags', 'detected_objects',
            'folder', 'tags', 'usage_count', 'last_used', 'uploaded_by',
            'is_image', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'filename', 'file_size', 'width', 'height', 'ai_description',
            'ai_tags', 'detected_objects', 'usage_count', 'last_used', 'uploaded_by'
        ]


class BlogCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    hierarchy = serializers.ReadOnlyField(source='get_hierarchy')
    
    class Meta:
        model = BlogCategory
        fields = [
            'id', 'name', 'slug', 'description', 'parent', 'color', 'icon',
            'meta_title', 'meta_description', 'post_count', 'children', 'hierarchy',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['post_count']
    
    def get_children(self, obj):
        if obj.children.exists():
            return BlogCategorySerializer(obj.children.all(), many=True).data
        return []


class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = [
            'id', 'name', 'slug', 'description', 'color', 'post_count', 'created_at'
        ]
        read_only_fields = ['post_count']


class SEOAnalysisSerializer(serializers.ModelSerializer):
    grade = serializers.ReadOnlyField()
    
    class Meta:
        model = SEOAnalysis
        fields = [
            'overall_score', 'grade', 'title_score', 'description_score',
            'content_score', 'keyword_score', 'readability_score', 'technical_score',
            'focus_keyword', 'keyword_density', 'keyword_distribution', 'related_keywords',
            'flesch_kincaid_score', 'gunning_fog_score', 'coleman_liau_score',
            'sentence_count', 'paragraph_count', 'internal_links', 'external_links',
            'images_without_alt', 'heading_structure', 'suggestions', 'competitor_data',
            'analyzed_at'
        ]


class BlogAnalyticsSerializer(serializers.ModelSerializer):
    click_through_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = BlogAnalytics
        fields = [
            'page_views', 'unique_visitors', 'bounce_rate', 'avg_time_on_page',
            'likes', 'shares', 'comments', 'facebook_shares', 'twitter_shares',
            'linkedin_shares', 'organic_traffic', 'search_impressions',
            'search_clicks', 'avg_position', 'click_through_rate', 'date'
        ]


class BlogCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogComment
        fields = [
            'id', 'author', 'content', 'parent', 'replies', 'is_approved',
            'is_spam', 'created_at', 'updated_at'
        ]
        read_only_fields = ['is_approved', 'is_spam']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return BlogCommentSerializer(obj.replies.filter(is_approved=True), many=True).data
        return []


class BlogPostVersionSerializer(serializers.ModelSerializer):
    changed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = BlogPostVersion
        fields = [
            'id', 'version_number', 'title', 'content', 'excerpt',
            'changed_by', 'change_summary', 'created_at'
        ]


class BlogPostListSerializer(serializers.ModelSerializer):
    """Serializer for blog post list view (minimal data)"""
    author = UserSerializer(read_only=True)
    categories = BlogCategorySerializer(many=True, read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    featured_image = MediaFileSerializer(read_only=True)
    estimated_reading_time = serializers.ReadOnlyField()
    is_published = serializers.ReadOnlyField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'status', 'author', 'categories',
            'tags', 'featured_image', 'seo_score', 'word_count', 'reading_time',
            'estimated_reading_time', 'view_count', 'like_count', 'share_count',
            'comment_count', 'is_published', 'published_at', 'created_at', 'updated_at'
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Serializer for blog post detail view (full data)"""
    author = UserSerializer(read_only=True)
    collaborators = UserSerializer(many=True, read_only=True)
    categories = BlogCategorySerializer(many=True, read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    featured_image = MediaFileSerializer(read_only=True)
    og_image = MediaFileSerializer(read_only=True)
    twitter_image = MediaFileSerializer(read_only=True)
    seo_analysis = SEOAnalysisSerializer(read_only=True)
    comments = BlogCommentSerializer(many=True, read_only=True)
    versions = BlogPostVersionSerializer(many=True, read_only=True)
    estimated_reading_time = serializers.ReadOnlyField()
    is_published = serializers.ReadOnlyField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'status', 'author',
            'collaborators', 'meta_title', 'meta_description', 'focus_keyword',
            'canonical_url', 'og_title', 'og_description', 'og_image',
            'twitter_title', 'twitter_description', 'twitter_image',
            'word_count', 'reading_time', 'estimated_reading_time', 'seo_score',
            'readability_score', 'published_at', 'scheduled_at', 'categories',
            'tags', 'featured_image', 'view_count', 'like_count', 'share_count',
            'comment_count', 'is_published', 'seo_analysis', 'comments', 'versions',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'word_count', 'reading_time', 'seo_score', 'readability_score',
            'view_count', 'like_count', 'share_count', 'comment_count'
        ]


class BlogPostCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating blog posts"""
    
    class Meta:
        model = BlogPost
        fields = [
            'title', 'slug', 'content', 'excerpt', 'status', 'meta_title',
            'meta_description', 'focus_keyword', 'canonical_url', 'og_title',
            'og_description', 'og_image', 'twitter_title', 'twitter_description',
            'twitter_image', 'published_at', 'scheduled_at', 'categories',
            'tags', 'featured_image', 'collaborators'
        ]
    
    def validate_slug(self, value):
        """Ensure slug is unique"""
        instance = getattr(self, 'instance', None)
        if instance and instance.slug == value:
            return value
        
        if BlogPost.objects.filter(slug=value).exists():
            raise serializers.ValidationError("A post with this slug already exists.")
        return value
    
    def validate_meta_title(self, value):
        """Validate meta title length"""
        if value and len(value) > 60:
            raise serializers.ValidationError("Meta title should not exceed 60 characters.")
        return value
    
    def validate_meta_description(self, value):
        """Validate meta description length"""
        if value and len(value) > 160:
            raise serializers.ValidationError("Meta description should not exceed 160 characters.")
        return value


class SEOAnalysisCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating SEO analysis"""
    
    class Meta:
        model = SEOAnalysis
        fields = [
            'post', 'focus_keyword', 'overall_score', 'title_score',
            'description_score', 'content_score', 'keyword_score',
            'readability_score', 'technical_score', 'keyword_density',
            'keyword_distribution', 'related_keywords', 'flesch_kincaid_score',
            'gunning_fog_score', 'coleman_liau_score', 'sentence_count',
            'paragraph_count', 'internal_links', 'external_links',
            'images_without_alt', 'heading_structure', 'suggestions',
            'competitor_data'
        ]


class MediaFileUploadSerializer(serializers.ModelSerializer):
    """Serializer for media file upload"""
    file = serializers.FileField(write_only=True)
    
    class Meta:
        model = MediaFile
        fields = [
            'file', 'original_name', 'alt_text', 'caption', 'description', 'folder'
        ]
    
    def create(self, validated_data):
        file = validated_data.pop('file')
        validated_data['filename'] = file.name
        validated_data['mime_type'] = file.content_type
        validated_data['file_size'] = file.size
        
        # Handle image dimensions
        if file.content_type.startswith('image/'):
            try:
                from PIL import Image
                image = Image.open(file)
                validated_data['width'] = image.width
                validated_data['height'] = image.height
            except Exception:
                pass
        
        return super().create(validated_data)


class BlogPostSearchSerializer(serializers.ModelSerializer):
    """Serializer for blog post search results"""
    author = UserSerializer(read_only=True)
    categories = BlogCategorySerializer(many=True, read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    featured_image = MediaFileSerializer(read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author', 'categories', 'tags',
            'featured_image', 'seo_score', 'view_count', 'published_at'
        ]