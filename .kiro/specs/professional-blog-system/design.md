# Professional Blog System Design

## Overview

Hệ thống blog chuyên nghiệp được thiết kế với kiến trúc microservices, tích hợp AI-powered SEO tools, và real-time collaboration features. System sử dụng modern tech stack với React/Next.js frontend, Django REST backend, và PostgreSQL database với full-text search capabilities.

## Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        EDITOR[Rich Text Editor]
        SEO[SEO Analyzer]
        MEDIA[Media Manager]
        DASHBOARD[Analytics Dashboard]
        MOBILE[Mobile Editor]
    end
    
    subgraph "API Gateway"
        GATEWAY[API Gateway]
        AUTH[Authentication]
        RATE[Rate Limiting]
    end
    
    subgraph "Backend Services"
        BLOG_API[Blog Service]
        SEO_SERVICE[SEO Service]
        MEDIA_SERVICE[Media Service]
        ANALYTICS[Analytics Service]
        SOCIAL[Social Media Service]
    end
    
    subgraph "AI Services"
        SEO_AI[SEO AI Engine]
        CONTENT_AI[Content AI]
        IMAGE_AI[Image AI]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis Cache)]
        ELASTICSEARCH[(Elasticsearch)]
        S3[(Object Storage)]
    end
    
    subgraph "External Services"
        SOCIAL_APIS[Social Media APIs]
        SEARCH_CONSOLE[Google Search Console]
        ANALYTICS_API[Google Analytics]
    end
    
    EDITOR --> GATEWAY
    SEO --> GATEWAY
    MEDIA --> GATEWAY
    DASHBOARD --> GATEWAY
    MOBILE --> GATEWAY
    
    GATEWAY --> BLOG_API
    GATEWAY --> SEO_SERVICE
    GATEWAY --> MEDIA_SERVICE
    GATEWAY --> ANALYTICS
    GATEWAY --> SOCIAL
    
    BLOG_API --> POSTGRES
    BLOG_API --> REDIS
    BLOG_API --> ELASTICSEARCH
    
    SEO_SERVICE --> SEO_AI
    MEDIA_SERVICE --> IMAGE_AI
    BLOG_API --> CONTENT_AI
    
    MEDIA_SERVICE --> S3
    SOCIAL --> SOCIAL_APIS
    ANALYTICS --> SEARCH_CONSOLE
    ANALYTICS --> ANALYTICS_API
```

## Components and Interfaces

### 1. Rich Text Editor Component

```typescript
interface BlogEditorProps {
  initialContent?: string
  onSave: (content: string) => void
  onAutoSave: (content: string) => void
  seoAnalysis?: SEOAnalysis
  mediaLibrary: MediaFile[]
  collaborators?: User[]
}

interface EditorFeatures {
  richText: {
    formatting: string[]
    customBlocks: string[]
    shortcuts: KeyboardShortcut[]
  }
  markdown: {
    enabled: boolean
    livePreview: boolean
    shortcuts: string[]
  }
  collaboration: {
    realTime: boolean
    comments: boolean
    suggestions: boolean
  }
  autoSave: {
    interval: number
    conflictResolution: 'merge' | 'overwrite' | 'prompt'
  }
}
```

### 2. SEO Analyzer Component

```typescript
interface SEOAnalyzerProps {
  content: string
  metadata: BlogMetadata
  focusKeyword?: string
  onAnalysisUpdate: (analysis: SEOAnalysis) => void
}

interface SEOAnalysis {
  overallScore: number
  scores: {
    title: number
    description: number
    content: number
    keywords: number
    readability: number
    technical: number
  }
  suggestions: SEOSuggestion[]
  competitorAnalysis?: CompetitorData
  keywordOpportunities: KeywordSuggestion[]
}

interface SEOSuggestion {
  type: 'title' | 'description' | 'content' | 'keywords' | 'technical'
  priority: 'high' | 'medium' | 'low'
  message: string
  action: string
  impact: number
}
```

### 3. Media Management System

```typescript
interface MediaManagerProps {
  onSelect: (media: MediaFile) => void
  allowMultiple?: boolean
  acceptedTypes?: string[]
  maxFileSize?: number
}

interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  fileSize: number
  dimensions?: { width: number; height: number }
  urls: {
    original: string
    thumbnail: string
    webp?: string
    avif?: string
  }
  metadata: {
    altText: string
    caption?: string
    description?: string
    tags: string[]
    aiGenerated: {
      description: string
      tags: string[]
      objects: string[]
    }
  }
  usage: {
    posts: string[]
    lastUsed: Date
  }
}
```

### 4. Analytics Dashboard

```typescript
interface AnalyticsDashboardProps {
  timeRange: DateRange
  posts?: string[]
  metrics: AnalyticsMetric[]
}

interface AnalyticsData {
  traffic: {
    pageViews: number
    uniqueVisitors: number
    bounceRate: number
    avgTimeOnPage: number
    sources: TrafficSource[]
  }
  seo: {
    organicTraffic: number
    keywords: KeywordPerformance[]
    rankings: RankingData[]
    clickThroughRate: number
  }
  engagement: {
    socialShares: number
    comments: number
    likes: number
    readingCompletion: number
  }
  performance: {
    coreWebVitals: CoreWebVitals
    loadTimes: number[]
    mobileScore: number
  }
}
```

## Data Models

### Blog Post Model

```python
class BlogPost(models.Model):
    # Basic fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    
    # Status and workflow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    collaborators = models.ManyToManyField(User, related_name='collaborated_posts', blank=True)
    
    # SEO fields
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    focus_keyword = models.CharField(max_length=100, blank=True)
    canonical_url = models.URLField(blank=True)
    
    # Social media
    og_title = models.CharField(max_length=60, blank=True)
    og_description = models.CharField(max_length=160, blank=True)
    og_image = models.ForeignKey('MediaFile', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Content analysis
    word_count = models.IntegerField(default=0)
    reading_time = models.IntegerField(default=0)  # in minutes
    seo_score = models.IntegerField(default=0)
    readability_score = models.FloatField(default=0)
    
    # Publishing
    published_at = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    
    # Relationships
    categories = models.ManyToManyField('BlogCategory', blank=True)
    tags = models.ManyToManyField('BlogTag', blank=True)
    featured_image = models.ForeignKey('MediaFile', on_delete=models.SET_NULL, null=True, blank=True, related_name='featured_posts')
    
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
        ]
```

### SEO Analysis Model

```python
class SEOAnalysis(models.Model):
    post = models.OneToOneField(BlogPost, on_delete=models.CASCADE)
    
    # Overall scores
    overall_score = models.IntegerField()
    title_score = models.IntegerField()
    description_score = models.IntegerField()
    content_score = models.IntegerField()
    keyword_score = models.IntegerField()
    readability_score = models.FloatField()
    technical_score = models.IntegerField()
    
    # Keyword analysis
    focus_keyword = models.CharField(max_length=100, blank=True)
    keyword_density = models.FloatField(default=0)
    keyword_distribution = models.JSONField(default=dict)
    related_keywords = models.JSONField(default=list)
    
    # Content analysis
    flesch_kincaid_score = models.FloatField(default=0)
    gunning_fog_score = models.FloatField(default=0)
    sentence_count = models.IntegerField(default=0)
    paragraph_count = models.IntegerField(default=0)
    
    # Technical SEO
    internal_links = models.IntegerField(default=0)
    external_links = models.IntegerField(default=0)
    images_without_alt = models.IntegerField(default=0)
    heading_structure = models.JSONField(default=dict)
    
    # Suggestions
    suggestions = models.JSONField(default=list)
    
    # Competitor analysis
    competitor_data = models.JSONField(default=dict)
    
    analyzed_at = models.DateTimeField(auto_now=True)
```

### Media File Model

```python
class MediaFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
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
    folder = models.ForeignKey('MediaFolder', on_delete=models.CASCADE, null=True, blank=True)
    tags = models.ManyToManyField('MediaTag', blank=True)
    
    # Usage tracking
    usage_count = models.IntegerField(default=0)
    last_used = models.DateTimeField(null=True, blank=True)
    
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## Error Handling

### API Error Responses

```python
class BlogAPIException(Exception):
    def __init__(self, message, code=None, details=None):
        self.message = message
        self.code = code or 'BLOG_ERROR'
        self.details = details or {}

class SEOAnalysisError(BlogAPIException):
    pass

class MediaProcessingError(BlogAPIException):
    pass

# Error handler
def handle_blog_error(error):
    if isinstance(error, SEOAnalysisError):
        return {
            'error': 'SEO_ANALYSIS_FAILED',
            'message': 'Unable to analyze SEO for this content',
            'details': error.details,
            'suggestions': ['Check content length', 'Verify focus keyword']
        }
    elif isinstance(error, MediaProcessingError):
        return {
            'error': 'MEDIA_PROCESSING_FAILED',
            'message': 'Unable to process uploaded media',
            'details': error.details,
            'suggestions': ['Check file format', 'Reduce file size']
        }
```

### Frontend Error Boundaries

```typescript
class BlogEditorErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    this.logError(error, errorInfo)
    
    // Show user-friendly message
    this.showErrorNotification(error)
  }
  
  render() {
    if (this.state.hasError) {
      return <BlogEditorFallback onRetry={this.handleRetry} />
    }
    
    return this.props.children
  }
}
```

## Testing Strategy

### Unit Testing

```python
# Backend unit tests
class BlogPostModelTest(TestCase):
    def test_slug_generation(self):
        post = BlogPost.objects.create(
            title="Test Blog Post",
            content="Test content",
            author=self.user
        )
        self.assertEqual(post.slug, "test-blog-post")
    
    def test_seo_score_calculation(self):
        post = BlogPost.objects.create(
            title="SEO Optimized Title",
            content="Content with good SEO practices...",
            meta_description="Well written meta description",
            author=self.user
        )
        analysis = SEOAnalyzer().analyze_post(post)
        self.assertGreater(analysis.overall_score, 70)

# Frontend unit tests
describe('BlogEditor', () => {
  test('auto-saves content every 30 seconds', async () => {
    const mockSave = jest.fn()
    render(<BlogEditor onAutoSave={mockSave} />)
    
    const editor = screen.getByRole('textbox')
    fireEvent.change(editor, { target: { value: 'Test content' } })
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith('Test content')
    }, { timeout: 31000 })
  })
  
  test('shows SEO suggestions in real-time', async () => {
    render(<BlogEditor />)
    
    const editor = screen.getByRole('textbox')
    fireEvent.change(editor, { target: { value: 'Short content' } })
    
    await waitFor(() => {
      expect(screen.getByText(/content too short/i)).toBeInTheDocument()
    })
  })
})
```

### Integration Testing

```python
class BlogAPIIntegrationTest(APITestCase):
    def test_complete_blog_workflow(self):
        # Create draft
        response = self.client.post('/api/blog/posts/', {
            'title': 'Integration Test Post',
            'content': 'Test content for integration testing...',
            'status': 'draft'
        })
        self.assertEqual(response.status_code, 201)
        post_id = response.data['id']
        
        # Analyze SEO
        response = self.client.post(f'/api/blog/posts/{post_id}/analyze-seo/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('overall_score', response.data)
        
        # Upload media
        with open('test_image.jpg', 'rb') as img:
            response = self.client.post('/api/blog/media/', {
                'file': img,
                'alt_text': 'Test image'
            })
        self.assertEqual(response.status_code, 201)
        
        # Publish post
        response = self.client.patch(f'/api/blog/posts/{post_id}/', {
            'status': 'published'
        })
        self.assertEqual(response.status_code, 200)
```

### Performance Testing

```typescript
// Frontend performance tests
describe('Blog Editor Performance', () => {
  test('handles large content without lag', async () => {
    const largeContent = 'x'.repeat(100000)
    const startTime = performance.now()
    
    render(<BlogEditor initialContent={largeContent} />)
    
    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(1000) // Should render in < 1s
  })
  
  test('SEO analysis completes within 2 seconds', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue({ overall_score: 85 })
    
    render(<SEOAnalyzer onAnalyze={mockAnalyze} />)
    
    const startTime = performance.now()
    fireEvent.change(screen.getByRole('textbox'), { 
      target: { value: 'Test content for SEO analysis' } 
    })
    
    await waitFor(() => {
      expect(mockAnalyze).toHaveBeenCalled()
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(2000)
    })
  })
})
```

## Security Considerations

### Content Security

```python
# Content sanitization
from bleach import clean
from django.utils.html import escape

class ContentSanitizer:
    ALLOWED_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre'
    ]
    
    ALLOWED_ATTRIBUTES = {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'width', 'height'],
        'code': ['class']
    }
    
    def sanitize_content(self, content: str) -> str:
        return clean(
            content,
            tags=self.ALLOWED_TAGS,
            attributes=self.ALLOWED_ATTRIBUTES,
            strip=True
        )

# File upload security
class SecureFileUpload:
    ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    def validate_file(self, file):
        # Check file extension
        if not any(file.name.lower().endswith(ext) for ext in self.ALLOWED_EXTENSIONS):
            raise ValidationError('File type not allowed')
        
        # Check file size
        if file.size > self.MAX_FILE_SIZE:
            raise ValidationError('File too large')
        
        # Check file content
        if not self.is_valid_image(file):
            raise ValidationError('Invalid image file')
```

### API Security

```python
# Rate limiting
from django_ratelimit.decorators import ratelimit

@ratelimit(key='user', rate='100/h', method='POST')
def create_blog_post(request):
    # Blog post creation logic
    pass

@ratelimit(key='user', rate='1000/h', method='GET')
def analyze_seo(request):
    # SEO analysis logic
    pass

# Permission checks
class BlogPostPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return obj.status == 'published' or obj.author == request.user
        
        return obj.author == request.user or request.user in obj.collaborators.all()
```

## Performance Optimization

### Caching Strategy

```python
# Redis caching
from django.core.cache import cache
from django.views.decorators.cache import cache_page

class BlogCacheManager:
    def get_post(self, slug: str):
        cache_key = f'blog_post:{slug}'
        post = cache.get(cache_key)
        
        if not post:
            post = BlogPost.objects.select_related('author').prefetch_related(
                'categories', 'tags', 'featured_image'
            ).get(slug=slug)
            cache.set(cache_key, post, 3600)  # Cache for 1 hour
        
        return post
    
    def invalidate_post(self, slug: str):
        cache_keys = [
            f'blog_post:{slug}',
            f'blog_seo:{slug}',
            f'blog_analytics:{slug}'
        ]
        cache.delete_many(cache_keys)

# Database optimization
class OptimizedBlogQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status='published', published_at__lte=timezone.now())
    
    def with_seo_data(self):
        return self.select_related('seoanalysis')
    
    def with_media(self):
        return self.prefetch_related('featured_image', 'mediafile_set')
```

### Frontend Optimization

```typescript
// Code splitting
const BlogEditor = lazy(() => import('./components/BlogEditor'))
const SEOAnalyzer = lazy(() => import('./components/SEOAnalyzer'))
const MediaManager = lazy(() => import('./components/MediaManager'))

// Image optimization
const OptimizedImage: React.FC<ImageProps> = ({ src, alt, ...props }) => {
  const [imageSrc, setImageSrc] = useState(src)
  
  useEffect(() => {
    // Load WebP if supported, fallback to original
    const img = new Image()
    img.onload = () => setImageSrc(img.src)
    img.src = src.replace(/\.(jpg|jpeg|png)$/, '.webp')
  }, [src])
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      {...props}
    />
  )
}

// Virtual scrolling for large lists
const VirtualizedPostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={posts.length}
      itemSize={120}
      itemData={posts}
    >
      {PostItem}
    </FixedSizeList>
  )
}
```

## Deployment Architecture

```yaml
# Docker Compose for development
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/blog
      - REDIS_URL=redis://redis:6379
      - AWS_S3_BUCKET=blog-media
    depends_on:
      - postgres
      - redis
      - elasticsearch
  
  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=blog
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  elasticsearch:
    image: elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
```

---

*Design document này cung cấp foundation cho việc implement hệ thống blog chuyên nghiệp với đầy đủ tính năng SEO và performance optimization.*