'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Lightbulb,
  BarChart3,
  Globe,
  Hash,
  Eye
} from 'lucide-react';

interface SEOAnalyzerProps {
  content: string;
  title: string;
  metaDescription: string;
  focusKeyword: string;
  onUpdateSEO: (seoData: {
    meta_title?: string;
    meta_description?: string;
    focus_keyword?: string;
  }) => void;
}

export const SEOAnalyzer: React.FC<SEOAnalyzerProps> = ({
  content,
  title,
  metaDescription,
  focusKeyword,
  onUpdateSEO
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState({
    score: 0,
    issues: [] as Array<{type: string, message: string, suggestion?: string}>,
    keywords: { density: 0 },
    readability: { score: 0, level: 'Dễ đọc', avgWordsPerSentence: 0 }
  });
  const [keywordSuggestions] = useState([
    'nghiên cứu thị trường',
    'phân tích dữ liệu',
    'khảo sát khách hàng',
    'insight tiêu dùng',
    'hành vi khách hàng',
    'xu hướng thị trường',
    'chiến lược marketing',
    'phân khúc khách hàng'
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Analyze SEO when content changes
  React.useEffect(() => {
    if (content && title) {
      analyzeSEO();
    }
  }, [content, title, metaDescription, focusKeyword]);

  const analyzeSEO = () => {
    setIsAnalyzing(true);
    
    // Calculate basic SEO metrics
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
    
    // Calculate keyword density
    const keywordCount = focusKeyword ? 
      content.toLowerCase().split(focusKeyword.toLowerCase()).length - 1 : 0;
    const keywordDensity = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
    
    // Calculate readability score (simplified Flesch Reading Ease)
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * 1.5) // Simplified syllable count
    ));
    
    // Generate issues and suggestions
    const issues = [];
    let score = 0;
    
    // Title analysis
    if (title.length < 30) {
      issues.push({
        type: 'warning',
        message: 'Tiêu đề quá ngắn',
        suggestion: 'Tiêu đề nên có ít nhất 30 ký tự để tối ưu SEO'
      });
    } else if (title.length > 60) {
      issues.push({
        type: 'warning',
        message: 'Tiêu đề quá dài',
        suggestion: 'Tiêu đề nên không quá 60 ký tự để hiển thị đầy đủ trên Google'
      });
    } else {
      score += 20;
      issues.push({
        type: 'success',
        message: 'Độ dài tiêu đề phù hợp'
      });
    }
    
    // Focus keyword analysis
    if (!focusKeyword) {
      issues.push({
        type: 'error',
        message: 'Chưa có từ khóa chính',
        suggestion: 'Hãy nhập từ khóa chính mà bạn muốn bài viết xếp hạng'
      });
    } else {
      if (title.toLowerCase().includes(focusKeyword.toLowerCase())) {
        score += 15;
        issues.push({
          type: 'success',
          message: 'Từ khóa chính có trong tiêu đề'
        });
      } else {
        issues.push({
          type: 'warning',
          message: 'Từ khóa chính không có trong tiêu đề',
          suggestion: 'Thêm từ khóa chính vào tiêu đề để tăng độ liên quan'
        });
      }
      
      if (keywordDensity >= 1 && keywordDensity <= 3) {
        score += 15;
        issues.push({
          type: 'success',
          message: `Mật độ từ khóa phù hợp (${keywordDensity.toFixed(1)}%)`
        });
      } else if (keywordDensity > 3) {
        issues.push({
          type: 'warning',
          message: 'Mật độ từ khóa quá cao',
          suggestion: 'Giảm số lần sử dụng từ khóa để tránh bị coi là spam'
        });
      } else {
        issues.push({
          type: 'warning',
          message: 'Mật độ từ khóa quá thấp',
          suggestion: 'Tăng số lần sử dụng từ khóa một cách tự nhiên trong nội dung'
        });
      }
    }
    
    // Meta description analysis
    if (!metaDescription) {
      issues.push({
        type: 'error',
        message: 'Chưa có meta description',
        suggestion: 'Thêm meta description để mô tả nội dung bài viết trên Google'
      });
    } else if (metaDescription.length < 120) {
      issues.push({
        type: 'warning',
        message: 'Meta description quá ngắn',
        suggestion: 'Meta description nên có ít nhất 120 ký tự'
      });
    } else if (metaDescription.length > 160) {
      issues.push({
        type: 'warning',
        message: 'Meta description quá dài',
        suggestion: 'Meta description nên không quá 160 ký tự'
      });
    } else {
      score += 15;
      issues.push({
        type: 'success',
        message: 'Độ dài meta description phù hợp'
      });
    }
    
    // Content length analysis
    if (wordCount < 300) {
      issues.push({
        type: 'error',
        message: 'Nội dung quá ngắn',
        suggestion: 'Bài viết nên có ít nhất 300 từ để tối ưu SEO'
      });
    } else if (wordCount >= 1000) {
      score += 20;
      issues.push({
        type: 'success',
        message: 'Độ dài nội dung tốt cho SEO'
      });
    } else {
      score += 10;
      issues.push({
        type: 'success',
        message: 'Độ dài nội dung chấp nhận được'
      });
    }
    
    // Readability analysis
    if (readabilityScore >= 70) {
      score += 15;
      issues.push({
        type: 'success',
        message: 'Nội dung dễ đọc'
      });
    } else if (readabilityScore >= 50) {
      issues.push({
        type: 'warning',
        message: 'Nội dung hơi khó đọc',
        suggestion: 'Sử dụng câu ngắn hơn và từ đơn giản hơn'
      });
    } else {
      issues.push({
        type: 'error',
        message: 'Nội dung khó đọc',
        suggestion: 'Viết lại với câu ngắn gọn và từ ngữ đơn giản hơn'
      });
    }
    
    setSeoAnalysis({
      score: Math.min(100, score),
      issues,
      keywords: { density: keywordDensity },
      readability: { 
        score: readabilityScore, 
        level: readabilityScore >= 70 ? 'Dễ đọc' : readabilityScore >= 50 ? 'Trung bình' : 'Khó đọc',
        avgWordsPerSentence 
      }
    });
    
    setIsAnalyzing(false);
  };

  const handleKeywordSelect = (keyword: string) => {
    onUpdateSEO({ focus_keyword: keyword });
  };

  return (
    <div className="space-y-6">
      {/* SEO Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            SEO Overview
          </CardTitle>
          <CardDescription>
            Tối ưu hóa bài viết cho công cụ tìm kiếm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>SEO Score</Label>
              <span className={`text-2xl font-bold ${getScoreColor(seoAnalysis.score)}`}>
                {seoAnalysis.score}/100
              </span>
            </div>
            <Progress 
              value={seoAnalysis.score} 
              className="h-2"
            />
            <p className="text-xs text-gray-600 mt-1">
              {seoAnalysis.score >= 80 && 'Tuyệt vời! Bài viết đã được tối ưu SEO tốt.'}
              {seoAnalysis.score >= 60 && seoAnalysis.score < 80 && 'Khá tốt, nhưng vẫn có thể cải thiện thêm.'}
              {seoAnalysis.score < 60 && 'Cần cải thiện nhiều để tối ưu SEO.'}
            </p>
          </div>

          {/* Focus Keyword */}
          <div>
            <Label htmlFor="focus-keyword">Từ khóa chính *</Label>
            <Input
              id="focus-keyword"
              value={focusKeyword}
              onChange={(e) => onUpdateSEO({ focus_keyword: e.target.value })}
              placeholder="Nhập từ khóa chính..."
              className="mt-1"
            />
            <p className="text-xs text-gray-600 mt-1">
              Từ khóa chính mà bạn muốn bài viết xếp hạng cao trên Google
            </p>
          </div>

          {/* Keyword Suggestions */}
          <div>
            <Label>Gợi ý từ khóa</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {keywordSuggestions.map((keyword, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleKeywordSelect(keyword)}
                  className="text-xs"
                >
                  {keyword}
                </Button>
              ))}
            </div>
          </div>

          {/* SEO Title */}
          <div>
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input
              id="seo-title"
              value={title}
              onChange={(e) => onUpdateSEO({ meta_title: e.target.value })}
              placeholder="Tiêu đề hiển thị trên Google..."
              className="mt-1"
            />
            <p className="text-xs text-gray-600 mt-1">
              {title.length}/60 ký tự - Tiêu đề này sẽ hiển thị trên kết quả tìm kiếm
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <Label htmlFor="meta-description">Meta Description</Label>
            <textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => onUpdateSEO({ meta_description: e.target.value })}
              placeholder="Mô tả ngắn gọn về nội dung bài viết..."
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              {metaDescription.length}/160 ký tự - Mô tả này sẽ hiển thị dưới tiêu đề trên Google
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO Analysis Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Phân tích SEO
            {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seoAnalysis.issues.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có phân tích</h3>
                <p className="text-gray-600">Nhập từ khóa chính và nội dung để bắt đầu phân tích SEO</p>
              </div>
            ) : (
              seoAnalysis.issues.map((issue: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  {issue.type === 'error' && (
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  {issue.type === 'warning' && (
                    <Info className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  )}
                  {issue.type === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1">
                    <p className="font-medium text-sm">{issue.message}</p>
                    {issue.suggestion && (
                      <p className="text-xs text-gray-600 mt-1">{issue.suggestion}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Keyword Analysis */}
      {focusKeyword && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Phân tích từ khóa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mật độ từ khóa</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={seoAnalysis.keywords.density} className="flex-1" />
                  <span className="text-sm font-medium">
                    {seoAnalysis.keywords.density.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Lý tưởng: 1-3%
                </p>
              </div>
              
              <div>
                <Label>Từ khóa trong tiêu đề</Label>
                <div className="mt-1">
                  {title.toLowerCase().includes(focusKeyword.toLowerCase()) ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Có
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Không
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Từ khóa trong Meta Description</Label>
                <div className="mt-1">
                  {metaDescription.toLowerCase().includes(focusKeyword.toLowerCase()) ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Có
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Không
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Từ khóa trong nội dung</Label>
                <div className="mt-1">
                  {content.toLowerCase().includes(focusKeyword.toLowerCase()) ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Có
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Không
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Readability Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Phân tích khả năng đọc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Điểm khả năng đọc</Label>
              <span className={`text-lg font-bold ${getScoreColor(seoAnalysis.readability.score)}`}>
                {Math.round(seoAnalysis.readability.score)}/100
              </span>
            </div>
            <Progress value={seoAnalysis.readability.score} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">
              Mức độ: {seoAnalysis.readability.level}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label>Độ dài câu trung bình</Label>
              <p className="font-medium">{Math.round(seoAnalysis.readability.avgWordsPerSentence)} từ</p>
              <p className="text-xs text-gray-600">Lý tưởng: 15-20 từ</p>
            </div>
            
            <div>
              <Label>Số câu</Label>
              <p className="font-medium">
                {content.split(/[.!?]+/).length - 1}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Mẹo SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p>Sử dụng từ khóa chính trong 100 từ đầu tiên của bài viết</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p>Thêm từ khóa liên quan (LSI keywords) để tăng độ phong phú</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p>Sử dụng heading tags (H1, H2, H3) để cấu trúc nội dung</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p>Thêm internal links đến các bài viết liên quan</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p>Tối ưu hóa hình ảnh với alt text chứa từ khóa</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};