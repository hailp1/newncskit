import re
import math
from typing import Dict, List, Any
from django.utils.html import strip_tags
from .models import BlogPost, SEOAnalysis, MediaFile


class SEOAnalysisService:
    """Service for SEO analysis and scoring"""
    
    @classmethod
    def analyze_post(cls, post: BlogPost, focus_keyword: str = None) -> SEOAnalysis:
        """Analyze SEO for a blog post"""
        focus_keyword = focus_keyword or post.focus_keyword or ''
        
        # Get or create SEO analysis
        analysis, created = SEOAnalysis.objects.get_or_create(
            post=post,
            defaults={'focus_keyword': focus_keyword}
        )
        
        # Perform analysis
        analysis_data = cls.analyze_content(
            post.content, post.title, post.meta_description, focus_keyword
        )
        
        # Update analysis object
        for key, value in analysis_data.items():
            setattr(analysis, key, value)
        
        analysis.focus_keyword = focus_keyword
        analysis.save()
        
        # Update post SEO score
        post.seo_score = analysis.overall_score
        post.readability_score = analysis.readability_score
        post.save(update_fields=['seo_score', 'readability_score'])
        
        return analysis
    
    @classmethod
    def analyze_content(cls, content: str, title: str = '', meta_description: str = '', focus_keyword: str = '') -> Dict[str, Any]:
        """Analyze content and return SEO metrics"""
        clean_content = strip_tags(content)
        
        # Basic metrics
        word_count = len(re.findall(r'\w+', clean_content))
        sentence_count = len(re.findall(r'[.!?]+', clean_content))
        paragraph_count = len([p for p in content.split('\n\n') if p.strip()])
        
        # Title analysis
        title_score = cls._analyze_title(title, focus_keyword)
        
        # Meta description analysis
        description_score = cls._analyze_meta_description(meta_description, focus_keyword)
        
        # Content analysis
        content_score = cls._analyze_content_quality(clean_content, word_count)
        
        # Keyword analysis
        keyword_score, keyword_density = cls._analyze_keywords(clean_content, focus_keyword)
        
        # Readability analysis
        readability_metrics = cls._analyze_readability(clean_content, word_count, sentence_count)
        
        # Technical SEO analysis
        technical_score, technical_metrics = cls._analyze_technical_seo(content)
        
        # Calculate overall score
        overall_score = cls._calculate_overall_score(
            title_score, description_score, content_score, keyword_score, 
            readability_metrics['flesch_kincaid_score'], technical_score
        )
        
        # Generate suggestions
        suggestions = cls._generate_suggestions(
            title_score, description_score, content_score, keyword_score,
            readability_metrics['flesch_kincaid_score'], technical_score,
            focus_keyword, word_count
        )
        
        return {
            'overall_score': overall_score,
            'title_score': title_score,
            'description_score': description_score,
            'content_score': content_score,
            'keyword_score': keyword_score,
            'readability_score': readability_metrics['flesch_kincaid_score'],
            'technical_score': technical_score,
            'keyword_density': keyword_density,
            'keyword_distribution': cls._analyze_keyword_distribution(content, focus_keyword),
            'related_keywords': cls._suggest_related_keywords(clean_content, focus_keyword),
            'flesch_kincaid_score': readability_metrics['flesch_kincaid_score'],
            'gunning_fog_score': readability_metrics['gunning_fog_score'],
            'coleman_liau_score': readability_metrics['coleman_liau_score'],
            'sentence_count': sentence_count,
            'paragraph_count': paragraph_count,
            'internal_links': technical_metrics['internal_links'],
            'external_links': technical_metrics['external_links'],
            'images_without_alt': technical_metrics['images_without_alt'],
            'heading_structure': technical_metrics['heading_structure'],
            'suggestions': suggestions
        }
    
    @classmethod
    def _analyze_title(cls, title: str, focus_keyword: str) -> int:
        """Analyze title for SEO"""
        score = 0
        
        if not title:
            return 0
        
        # Length check (50-60 characters is optimal)
        if 50 <= len(title) <= 60:
            score += 30
        elif 40 <= len(title) <= 70:
            score += 20
        elif len(title) < 40:
            score += 10
        
        # Focus keyword in title
        if focus_keyword and focus_keyword.lower() in title.lower():
            score += 25
            # Bonus if keyword is at the beginning
            if title.lower().startswith(focus_keyword.lower()):
                score += 10
        
        # Title appeal factors
        if re.search(r'\d+', title):  # Contains numbers
            score += 10
        
        # Power words
        power_words = ['ultimate', 'complete', 'guide', 'best', 'top', 'essential', 'proven']
        if any(word in title.lower() for word in power_words):
            score += 15
        
        return min(score, 100)
    
    @classmethod
    def _analyze_meta_description(cls, meta_description: str, focus_keyword: str) -> int:
        """Analyze meta description for SEO"""
        score = 0
        
        if not meta_description:
            return 0
        
        # Length check (150-160 characters is optimal)
        if 150 <= len(meta_description) <= 160:
            score += 40
        elif 120 <= len(meta_description) <= 170:
            score += 30
        elif len(meta_description) < 120:
            score += 15
        
        # Focus keyword in description
        if focus_keyword and focus_keyword.lower() in meta_description.lower():
            score += 30
        
        # Call-to-action words
        cta_words = ['learn', 'discover', 'find out', 'read more', 'get', 'download']
        if any(word in meta_description.lower() for word in cta_words):
            score += 15
        
        # Uniqueness (not just excerpt)
        if len(set(meta_description.split())) > 10:
            score += 15
        
        return min(score, 100)
    
    @classmethod
    def _analyze_content_quality(cls, content: str, word_count: int) -> int:
        """Analyze content quality"""
        score = 0
        
        # Word count (300+ words is good, 1000+ is excellent)
        if word_count >= 1000:
            score += 40
        elif word_count >= 600:
            score += 30
        elif word_count >= 300:
            score += 20
        elif word_count >= 150:
            score += 10
        
        # Content structure
        paragraphs = content.split('\n\n')
        avg_paragraph_length = word_count / len(paragraphs) if paragraphs else 0
        
        if 50 <= avg_paragraph_length <= 150:
            score += 20
        elif avg_paragraph_length < 200:
            score += 10
        
        # Sentence variety
        sentences = re.findall(r'[.!?]+', content)
        if len(sentences) > 0:
            avg_sentence_length = word_count / len(sentences)
            if 15 <= avg_sentence_length <= 25:
                score += 20
            elif avg_sentence_length < 30:
                score += 10
        
        # Content depth indicators
        if word_count > 500:
            # Look for lists, examples, etc.
            if re.search(r'(for example|such as|including|like)', content, re.IGNORECASE):
                score += 10
            if re.search(r'(\d+\.|•|\*)', content):  # Lists
                score += 10
        
        return min(score, 100)
    
    @classmethod
    def _analyze_keywords(cls, content: str, focus_keyword: str) -> tuple:
        """Analyze keyword usage"""
        if not focus_keyword:
            return 0, 0
        
        score = 0
        words = re.findall(r'\w+', content.lower())
        keyword_lower = focus_keyword.lower()
        
        # Count keyword occurrences
        keyword_count = content.lower().count(keyword_lower)
        keyword_density = (keyword_count / len(words)) * 100 if words else 0
        
        # Optimal density is 0.5-2.5%
        if 0.5 <= keyword_density <= 2.5:
            score += 40
        elif 0.3 <= keyword_density <= 3.0:
            score += 25
        elif keyword_density > 0:
            score += 10
        
        # Keyword in first paragraph
        first_paragraph = content[:200].lower()
        if keyword_lower in first_paragraph:
            score += 20
        
        # Keyword in last paragraph
        last_paragraph = content[-200:].lower()
        if keyword_lower in last_paragraph:
            score += 15
        
        # Keyword variations
        keyword_variations = cls._get_keyword_variations(focus_keyword)
        variation_count = sum(1 for var in keyword_variations if var in content.lower())
        if variation_count > 0:
            score += min(variation_count * 5, 25)
        
        return min(score, 100), keyword_density
    
    @classmethod
    def _analyze_readability(cls, content: str, word_count: int, sentence_count: int) -> Dict[str, float]:
        """Analyze readability using various metrics"""
        if sentence_count == 0 or word_count == 0:
            return {
                'flesch_kincaid_score': 0,
                'gunning_fog_score': 0,
                'coleman_liau_score': 0
            }
        
        # Count syllables (approximation)
        syllable_count = cls._count_syllables(content)
        
        # Flesch-Kincaid Reading Ease
        flesch_score = 206.835 - (1.015 * (word_count / sentence_count)) - (84.6 * (syllable_count / word_count))
        flesch_score = max(0, min(100, flesch_score))
        
        # Gunning Fog Index
        complex_words = len([word for word in re.findall(r'\w+', content) if cls._count_syllables(word) >= 3])
        gunning_fog = 0.4 * ((word_count / sentence_count) + 100 * (complex_words / word_count))
        
        # Coleman-Liau Index
        avg_sentence_length = word_count / sentence_count
        avg_letter_per_100_words = (len(re.findall(r'[a-zA-Z]', content)) / word_count) * 100
        coleman_liau = 0.0588 * avg_letter_per_100_words - 0.296 * (sentence_count / word_count * 100) - 15.8
        
        return {
            'flesch_kincaid_score': flesch_score,
            'gunning_fog_score': gunning_fog,
            'coleman_liau_score': coleman_liau
        }
    
    @classmethod
    def _analyze_technical_seo(cls, content: str) -> tuple:
        """Analyze technical SEO factors"""
        score = 0
        
        # Count links
        internal_links = len(re.findall(r'<a[^>]*href=["\'][^"\']*["\'][^>]*>', content))
        external_links = len(re.findall(r'<a[^>]*href=["\']https?://[^"\']*["\'][^>]*>', content))
        
        # Images without alt text
        images = re.findall(r'<img[^>]*>', content)
        images_without_alt = len([img for img in images if 'alt=' not in img])
        
        # Heading structure
        headings = {
            'h1': len(re.findall(r'<h1[^>]*>', content)),
            'h2': len(re.findall(r'<h2[^>]*>', content)),
            'h3': len(re.findall(r'<h3[^>]*>', content)),
            'h4': len(re.findall(r'<h4[^>]*>', content)),
            'h5': len(re.findall(r'<h5[^>]*>', content)),
            'h6': len(re.findall(r'<h6[^>]*>', content))
        }
        
        # Scoring
        if internal_links > 0:
            score += 20
        if external_links > 0:
            score += 15
        if images_without_alt == 0 and len(images) > 0:
            score += 25
        if headings['h2'] > 0:
            score += 20
        if sum(headings.values()) > 2:
            score += 20
        
        return min(score, 100), {
            'internal_links': internal_links,
            'external_links': external_links,
            'images_without_alt': images_without_alt,
            'heading_structure': headings
        }
    
    @classmethod
    def _calculate_overall_score(cls, title_score: int, description_score: int, 
                               content_score: int, keyword_score: int, 
                               readability_score: float, technical_score: int) -> int:
        """Calculate overall SEO score"""
        # Weighted average
        weights = {
            'title': 0.20,
            'description': 0.15,
            'content': 0.25,
            'keywords': 0.20,
            'readability': 0.10,
            'technical': 0.10
        }
        
        # Convert readability score to 0-100 scale
        readability_normalized = min(100, max(0, readability_score))
        
        overall = (
            title_score * weights['title'] +
            description_score * weights['description'] +
            content_score * weights['content'] +
            keyword_score * weights['keywords'] +
            readability_normalized * weights['readability'] +
            technical_score * weights['technical']
        )
        
        return round(overall)
    
    @classmethod
    def _generate_suggestions(cls, title_score: int, description_score: int,
                            content_score: int, keyword_score: int,
                            readability_score: float, technical_score: int,
                            focus_keyword: str, word_count: int) -> List[Dict[str, Any]]:
        """Generate SEO improvement suggestions"""
        suggestions = []
        
        if title_score < 70:
            suggestions.append({
                'type': 'title',
                'priority': 'high',
                'message': 'Optimize your title for better SEO',
                'action': 'Include focus keyword and keep length between 50-60 characters',
                'impact': 85
            })
        
        if description_score < 70:
            suggestions.append({
                'type': 'description',
                'priority': 'high',
                'message': 'Improve your meta description',
                'action': 'Write compelling description with focus keyword, 150-160 characters',
                'impact': 75
            })
        
        if content_score < 70:
            if word_count < 300:
                suggestions.append({
                    'type': 'content',
                    'priority': 'high',
                    'message': 'Content is too short',
                    'action': 'Expand content to at least 300 words for better SEO',
                    'impact': 80
                })
            else:
                suggestions.append({
                    'type': 'content',
                    'priority': 'medium',
                    'message': 'Improve content structure',
                    'action': 'Use shorter paragraphs and varied sentence lengths',
                    'impact': 60
                })
        
        if keyword_score < 70 and focus_keyword:
            suggestions.append({
                'type': 'keywords',
                'priority': 'high',
                'message': 'Optimize keyword usage',
                'action': f'Use "{focus_keyword}" more naturally throughout content',
                'impact': 70
            })
        
        if readability_score < 60:
            suggestions.append({
                'type': 'readability',
                'priority': 'medium',
                'message': 'Improve readability',
                'action': 'Use simpler words and shorter sentences',
                'impact': 55
            })
        
        if technical_score < 70:
            suggestions.append({
                'type': 'technical',
                'priority': 'medium',
                'message': 'Improve technical SEO',
                'action': 'Add internal links, headings, and alt text for images',
                'impact': 65
            })
        
        return suggestions
    
    @classmethod
    def _count_syllables(cls, word: str) -> int:
        """Count syllables in a word (approximation)"""
        word = word.lower()
        vowels = 'aeiouy'
        syllable_count = 0
        prev_was_vowel = False
        
        for char in word:
            if char in vowels:
                if not prev_was_vowel:
                    syllable_count += 1
                prev_was_vowel = True
            else:
                prev_was_vowel = False
        
        # Handle silent e
        if word.endswith('e'):
            syllable_count -= 1
        
        # Every word has at least one syllable
        return max(1, syllable_count)
    
    @classmethod
    def _get_keyword_variations(cls, keyword: str) -> List[str]:
        """Get keyword variations"""
        variations = []
        
        # Plural/singular
        if keyword.endswith('s'):
            variations.append(keyword[:-1])
        else:
            variations.append(keyword + 's')
        
        # Common variations
        words = keyword.split()
        if len(words) > 1:
            variations.append(' '.join(reversed(words)))
        
        return variations
    
    @classmethod
    def _analyze_keyword_distribution(cls, content: str, focus_keyword: str) -> Dict[str, int]:
        """Analyze keyword distribution throughout content"""
        if not focus_keyword:
            return {}
        
        sections = {
            'title': 0,
            'first_paragraph': 0,
            'middle_content': 0,
            'last_paragraph': 0,
            'headings': 0
        }
        
        keyword_lower = focus_keyword.lower()
        
        # Check headings
        headings = re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>', content, re.IGNORECASE)
        sections['headings'] = sum(1 for heading in headings if keyword_lower in heading.lower())
        
        # Split content into sections
        paragraphs = content.split('\n\n')
        if paragraphs:
            if keyword_lower in paragraphs[0].lower():
                sections['first_paragraph'] = 1
            if len(paragraphs) > 1 and keyword_lower in paragraphs[-1].lower():
                sections['last_paragraph'] = 1
            if len(paragraphs) > 2:
                middle_content = '\n\n'.join(paragraphs[1:-1])
                sections['middle_content'] = middle_content.lower().count(keyword_lower)
        
        return sections
    
    @classmethod
    def _suggest_related_keywords(cls, content: str, focus_keyword: str) -> List[str]:
        """Suggest related keywords based on content"""
        # This is a simplified version - in production, you'd use NLP libraries
        words = re.findall(r'\w+', content.lower())
        word_freq = {}
        
        # Count word frequency
        for word in words:
            if len(word) > 3 and word not in ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been']:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Get top words
        related = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
        return [word for word, freq in related if freq > 2]


class MediaProcessingService:
    """Service for media processing and optimization"""
    
    @classmethod
    def process_media_file(cls, media_file: MediaFile):
        """Process uploaded media file"""
        if media_file.is_image:
            cls._process_image(media_file)
        
        # Generate AI metadata
        cls._generate_ai_metadata(media_file)
    
    @classmethod
    def _process_image(cls, media_file: MediaFile):
        """Process image file - resize, optimize, generate formats"""
        # This would integrate with image processing libraries like Pillow
        # For now, we'll just update the CDN URL
        media_file.cdn_url = f"https://cdn.example.com/{media_file.filename}"
        media_file.save()
    
    @classmethod
    def _generate_ai_metadata(cls, media_file: MediaFile):
        """Generate AI metadata for media file"""
        if media_file.is_image:
            # This would integrate with AI services like OpenAI Vision
            media_file.ai_description = f"Image: {media_file.original_name}"
            media_file.ai_tags = ["image", "content"]
            media_file.detected_objects = ["object"]
            media_file.save()
    
    @classmethod
    def generate_alt_text(cls, media_file: MediaFile) -> str:
        """Generate alt text for image using AI"""
        # This would integrate with AI vision services
        return f"Alt text for {media_file.original_name}"
    
    @classmethod
    def optimize_image(cls, media_file: MediaFile, formats: List[str] = None):
        """Optimize image and generate multiple formats"""
        if formats is None:
            formats = ['webp', 'avif']
        
        # This would use image processing libraries
        # to generate optimized versions
        pass