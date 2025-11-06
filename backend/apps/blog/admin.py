from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    BlogPost, BlogCategory, BlogTag, MediaFile, MediaFolder, MediaTag,
    SEOAnalysis, BlogAnalytics, BlogComment, BlogPostVersion
)


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'post_count', 'color_display', 'created_at']
    list_filter = ['parent', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 2px 8px; border-radius: 3px; color: white;">{}</span>',
            obj.color,
            obj.color
        )
    color_display.short_description = 'Color'


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'post_count', 'color_display', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 2px 8px; border-radius: 3px; color: white;">{}</span>',
            obj.color,
            obj.color
        )
    color_display.short_description = 'Color'


@admin.register(MediaFolder)
class MediaFolderAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'created_at']
    list_filter = ['parent', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(MediaTag)
class MediaTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ['original_name', 'mime_type', 'file_size_display', 'uploaded_by', 'usage_count', 'created_at']
    list_filter = ['mime_type', 'folder', 'uploaded_by', 'created_at']
    search_fields = ['original_name', 'alt_text', 'description']
    readonly_fields = ['filename', 'file_size', 'width', 'height', 'usage_count', 'ai_description', 'ai_tags', 'detected_objects']
    
    def file_size_display(self, obj):
        return f"{obj.file_size_mb} MB"
    file_size_display.short_description = 'File Size'


class SEOAnalysisInline(admin.StackedInline):
    model = SEOAnalysis
    extra = 0
    readonly_fields = ['analyzed_at']


class BlogAnalyticsInline(admin.TabularInline):
    model = BlogAnalytics
    extra = 0
    readonly_fields = ['click_through_rate']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'seo_score_display', 'view_count', 'published_at', 'created_at']
    list_filter = ['status', 'author', 'categories', 'tags', 'created_at', 'published_at']
    search_fields = ['title', 'content', 'meta_title', 'meta_description']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['categories', 'tags', 'collaborators']
    readonly_fields = ['word_count', 'reading_time', 'view_count', 'like_count', 'share_count', 'comment_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'author', 'status', 'content', 'excerpt')
        }),
        ('SEO Settings', {
            'fields': ('meta_title', 'meta_description', 'focus_keyword', 'canonical_url'),
            'classes': ('collapse',)
        }),
        ('Social Media', {
            'fields': ('og_title', 'og_description', 'og_image', 'twitter_title', 'twitter_description', 'twitter_image'),
            'classes': ('collapse',)
        }),
        ('Organization', {
            'fields': ('categories', 'tags', 'featured_image')
        }),
        ('Publishing', {
            'fields': ('published_at', 'scheduled_at')
        }),
        ('Collaboration', {
            'fields': ('collaborators',),
            'classes': ('collapse',)
        }),
        ('Analytics', {
            'fields': ('word_count', 'reading_time', 'seo_score', 'readability_score', 'view_count', 'like_count', 'share_count', 'comment_count'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [SEOAnalysisInline, BlogAnalyticsInline]
    
    def seo_score_display(self, obj):
        if obj.seo_score >= 80:
            color = 'green'
        elif obj.seo_score >= 60:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}/100</span>',
            color,
            obj.seo_score
        )
    seo_score_display.short_description = 'SEO Score'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author', 'featured_image').prefetch_related('categories', 'tags')


@admin.register(SEOAnalysis)
class SEOAnalysisAdmin(admin.ModelAdmin):
    list_display = ['post', 'overall_score', 'grade', 'title_score', 'content_score', 'analyzed_at']
    list_filter = ['overall_score', 'analyzed_at']
    search_fields = ['post__title', 'focus_keyword']
    readonly_fields = ['analyzed_at', 'grade']
    
    fieldsets = (
        ('Post Information', {
            'fields': ('post', 'focus_keyword')
        }),
        ('SEO Scores', {
            'fields': ('overall_score', 'grade', 'title_score', 'description_score', 'content_score', 'keyword_score', 'technical_score')
        }),
        ('Readability', {
            'fields': ('readability_score', 'flesch_kincaid_score', 'gunning_fog_score', 'coleman_liau_score', 'sentence_count', 'paragraph_count'),
            'classes': ('collapse',)
        }),
        ('Technical Analysis', {
            'fields': ('internal_links', 'external_links', 'images_without_alt', 'heading_structure'),
            'classes': ('collapse',)
        }),
        ('Keywords & Competition', {
            'fields': ('keyword_density', 'keyword_distribution', 'related_keywords', 'competitor_data'),
            'classes': ('collapse',)
        }),
        ('Suggestions', {
            'fields': ('suggestions',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('analyzed_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(BlogAnalytics)
class BlogAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['post', 'date', 'page_views', 'unique_visitors', 'bounce_rate', 'click_through_rate']
    list_filter = ['date', 'post__author']
    search_fields = ['post__title']
    readonly_fields = ['click_through_rate']
    date_hierarchy = 'date'


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['post', 'author', 'content_preview', 'is_approved', 'is_spam', 'created_at']
    list_filter = ['is_approved', 'is_spam', 'created_at']
    search_fields = ['content', 'author__username', 'post__title']
    actions = ['approve_comments', 'mark_as_spam']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'
    
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True, is_spam=False)
    approve_comments.short_description = "Approve selected comments"
    
    def mark_as_spam(self, request, queryset):
        queryset.update(is_spam=True, is_approved=False)
    mark_as_spam.short_description = "Mark selected comments as spam"


@admin.register(BlogPostVersion)
class BlogPostVersionAdmin(admin.ModelAdmin):
    list_display = ['post', 'version_number', 'changed_by', 'change_summary', 'created_at']
    list_filter = ['changed_by', 'created_at']
    search_fields = ['post__title', 'change_summary']
    readonly_fields = ['version_number', 'created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('post', 'changed_by')