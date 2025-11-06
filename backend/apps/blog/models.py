from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.urls import reverse
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from django.core.validators import MinLengthValidator, MaxLengthValidator
import uuid
from datetime import datetime

User = get_user_model()


class BlogCategory(models.Model):
    """Blog category model with hierarchy support"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    icon = models.CharField(max_length=50, blank=True)
    
    # SEO fields
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    
    # Stats
    post_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Blog Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('blog:category', kwargs={'slug': self.slug})
    
    def get_hierarchy(self):
        """Get full category hierarchy"""
        hierarchy = []
        current = self
        while current:
            hierarchy.insert(0, current)
            current = current.parent
        return hierarchy


class BlogTag(models.Model):
    """Blog tag model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#10B981')
    
    # Stats
    post_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('blog:tag', kwargs={'slug': self.slug})


class MediaFolder(models.Model):
    """Media folder for organization"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['name', 'parent']
        ordering = ['name']
    
    def __str__(self):
        return self.name


class MediaTag(models.Model):
    """Media tag for organization"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class MediaFile(models.Model):
    """Media file model with AI metadata support"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    filename = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    file_size = models.BigIntegerField()
    
    # Storage
    storage_path = models.CharField(max_length=500)
    cdn_url = models.URLField(blank=True)
    
    # Image specific
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    
    # Metadata
    alt_text = models.TextField(blank=True)
    caption = models.TextField(blank=True)
    description = models.TextField(blank=True)
    
    # AI generated metadata
    ai_description = models.TextField(blank=True)
    ai_tags = models.JSONField(default=list)
    detected_objects = models.JSONField(default=list)
    
    # Organization
    folder = models.ForeignKey(MediaFolder, on_delete=models.CASCADE, null=True, blank=True)
    tags = models.ManyToManyField(MediaTag, blank=True)
    
    # Usage tracking
    usage_count = models.IntegerField(default=0)
    last_used = models.DateTimeField(null=True, blank=True)
    
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.original_name
    
    @property
    def is_image(self):
        return self.mime_type.startswith('image/')
    
    @property
    def file_size_mb(self):
        return round(self.file_size / (1024 * 1024), 2)


class BlogPost(models.Model):
    """Blog post model with full SEO support"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('scheduled', 'Scheduled'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    # Basic fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, validators=[MinLengthValidator(10)])
    slug = models.SlugField(unique=True, max_length=255)
    content = models.TextField()
    excerpt = models.TextField(blank=True, max_length=300)
    
    # Status and workflow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    collaborators = models.ManyToManyField(User, related_name='collaborated_posts', blank=True)
    
    # SEO fields
    meta_title = models.CharField(max_length=60, blank=True, validators=[MaxLengthValidator(60)])
    meta_description = models.CharField(max_length=160, blank=True, validators=[MaxLengthValidator(160)])
    focus_keyword = models.CharField(max_length=100, blank=True)
    canonical_url = models.URLField(blank=True)
    
    # Social media
    og_title = models.CharField(max_length=60, blank=True)
    og_description = models.CharField(max_length=160, blank=True)
    og_image = models.ForeignKey(MediaFile, on_delete=models.SET_NULL, null=True, blank=True, related_name='og_posts')
    twitter_title = models.CharField(max_length=60, blank=True)
    twitter_description = models.CharField(max_length=160, blank=True)
    twitter_image = models.ForeignKey(MediaFile, on_delete=models.SET_NULL, null=True, blank=True, related_name='twitter_posts')
    
    # Content analysis
    word_count = models.IntegerField(default=0)
    reading_time = models.IntegerField(default=0)  # in minutes
    seo_score = models.IntegerField(default=0)
    readability_score = models.FloatField(default=0)
    
    # Publishing
    published_at = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    
    # Relationships
    categories = models.ManyToManyField(BlogCategory, blank=True, related_name='posts')
    tags = models.ManyToManyField(BlogTag, blank=True, related_name='posts')
    featured_image = models.ForeignKey(MediaFile, on_delete=models.SET_NULL, null=True, blank=True, related_name='featured_posts')
    
    # Analytics
    view_count = models.IntegerField(default=0)
    like_count = models.IntegerField(default=0)
    share_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    
    # Search
    search_vector = SearchVectorField(null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            GinIndex(fields=['search_vector']),
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['author', 'created_at']),
            models.Index(fields=['slug']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Auto-generate excerpt if not provided
        if not self.excerpt and self.content:
            # Remove HTML tags and get first 200 characters
            import re
            clean_content = re.sub('<[^<]+?>', '', self.content)
            self.excerpt = clean_content[:200] + '...' if len(clean_content) > 200 else clean_content
        
        # Calculate word count and reading time
        if self.content:
            import re
            words = len(re.findall(r'\w+', self.content))
            self.word_count = words
            self.reading_time = max(1, round(words / 200))  # Average reading speed: 200 words/minute
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('blog:post_detail', kwargs={'slug': self.slug})
    
    @property
    def is_published(self):
        return self.status == 'published' and self.published_at
    
    @property
    def estimated_reading_time(self):
        return f"{self.reading_time} min read"


class SEOAnalysis(models.Model):
    """SEO analysis model for comprehensive SEO tracking"""
    post = models.OneToOneField(BlogPost, on_delete=models.CASCADE, related_name='seo_analysis')
    
    # Overall scores (0-100)
    overall_score = models.IntegerField(default=0)
    title_score = models.IntegerField(default=0)
    description_score = models.IntegerField(default=0)
    content_score = models.IntegerField(default=0)
    keyword_score = models.IntegerField(default=0)
    readability_score = models.FloatField(default=0)
    technical_score = models.IntegerField(default=0)
    
    # Keyword analysis
    focus_keyword = models.CharField(max_length=100, blank=True)
    keyword_density = models.FloatField(default=0)
    keyword_distribution = models.JSONField(default=dict)
    related_keywords = models.JSONField(default=list)
    
    # Content analysis
    flesch_kincaid_score = models.FloatField(default=0)
    gunning_fog_score = models.FloatField(default=0)
    coleman_liau_score = models.FloatField(default=0)
    sentence_count = models.IntegerField(default=0)
    paragraph_count = models.IntegerField(default=0)
    
    # Technical SEO
    internal_links = models.IntegerField(default=0)
    external_links = models.IntegerField(default=0)
    images_without_alt = models.IntegerField(default=0)
    heading_structure = models.JSONField(default=dict)
    
    # Suggestions and recommendations
    suggestions = models.JSONField(default=list)
    
    # Competitor analysis
    competitor_data = models.JSONField(default=dict)
    
    # Timestamps
    analyzed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "SEO Analysis"
        verbose_name_plural = "SEO Analyses"
    
    def __str__(self):
        return f"SEO Analysis for {self.post.title}"
    
    @property
    def grade(self):
        """Return letter grade based on overall score"""
        if self.overall_score >= 90:
            return 'A+'
        elif self.overall_score >= 80:
            return 'A'
        elif self.overall_score >= 70:
            return 'B'
        elif self.overall_score >= 60:
            return 'C'
        elif self.overall_score >= 50:
            return 'D'
        else:
            return 'F'


class BlogAnalytics(models.Model):
    """Blog analytics model for tracking performance"""
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='analytics')
    
    # Traffic metrics
    page_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    bounce_rate = models.FloatField(default=0)
    avg_time_on_page = models.IntegerField(default=0)  # seconds
    
    # Engagement metrics
    likes = models.IntegerField(default=0)
    shares = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)
    
    # Social media metrics
    facebook_shares = models.IntegerField(default=0)
    twitter_shares = models.IntegerField(default=0)
    linkedin_shares = models.IntegerField(default=0)
    
    # SEO metrics
    organic_traffic = models.IntegerField(default=0)
    search_impressions = models.IntegerField(default=0)
    search_clicks = models.IntegerField(default=0)
    avg_position = models.FloatField(default=0)
    
    # Date tracking
    date = models.DateField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['post', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"Analytics for {self.post.title} - {self.date}"
    
    @property
    def click_through_rate(self):
        """Calculate CTR from search results"""
        if self.search_impressions > 0:
            return round((self.search_clicks / self.search_impressions) * 100, 2)
        return 0


class BlogComment(models.Model):
    """Blog comment model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    # Moderation
    is_approved = models.BooleanField(default=True)
    is_spam = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"


class BlogPostVersion(models.Model):
    """Blog post version history"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    
    # Snapshot of post data
    title = models.CharField(max_length=255)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    
    # Change tracking
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    change_summary = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['post', 'version_number']
        ordering = ['-version_number']
    
    def __str__(self):
        return f"{self.post.title} - Version {self.version_number}"