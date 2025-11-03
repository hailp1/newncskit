'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DocumentTextIcon,
  SparklesIcon,
  BookmarkIcon,
  ShareIcon,
  PrinterIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'

export default function EditorPage() {
  const [content, setContent] = useState(`# Machine Learning Applications in Healthcare

## Abstract

This paper presents a comprehensive analysis of machine learning applications in modern healthcare systems. We examine the current state of AI-driven diagnostic tools, predictive analytics, and personalized treatment recommendations.

## 1. Introduction

The integration of artificial intelligence and machine learning technologies in healthcare has revolutionized the way medical professionals approach diagnosis, treatment, and patient care. Recent advances in deep learning algorithms have enabled unprecedented accuracy in medical image analysis, while natural language processing has improved clinical documentation and decision support systems.

### 1.1 Background

Healthcare systems worldwide are facing increasing pressure to improve patient outcomes while reducing costs. Machine learning offers promising solutions to these challenges by:

- Enhancing diagnostic accuracy
- Reducing medical errors
- Optimizing treatment protocols
- Improving patient monitoring

## 2. Methodology

Our research methodology combines systematic literature review with empirical analysis of existing ML implementations in healthcare settings.

### 2.1 Data Collection

We collected data from multiple sources including:
1. PubMed database (2019-2024)
2. IEEE Xplore digital library
3. Clinical trial registries
4. Healthcare technology reports

## 3. Results

The analysis reveals significant improvements in diagnostic accuracy across multiple medical specialties...`)

  const [wordCount, setWordCount] = useState(content.split(' ').length)
  const [suggestions] = useState([
    {
      id: '1',
      type: 'style',
      message: 'Consider using more active voice in this sentence',
      severity: 'medium' as const,
    },
    {
      id: '2',
      type: 'grammar',
      message: 'Missing comma after introductory phrase',
      severity: 'low' as const,
    },
    {
      id: '3',
      type: 'content',
      message: 'This section could benefit from more recent citations',
      severity: 'high' as const,
    },
  ])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setWordCount(newContent.split(' ').filter(word => word.length > 0).length)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Editor</h1>
          <p className="text-gray-600">AI-powered academic writing assistant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BookmarkIcon className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline" size="sm">
            <ShareIcon className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <PrinterIcon className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <CloudArrowUpIcon className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-4">
          {/* Editor Toolbar */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {wordCount.toLocaleString()} words
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Auto-saved</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    AI Assist
                  </Button>
                  <Button variant="outline" size="sm">
                    Format
                  </Button>
                  <Button variant="outline" size="sm">
                    Citations
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editor Content */}
          <Card className="min-h-[600px]">
            <CardContent className="pt-6">
              <textarea
                value={content}
                onChange={handleContentChange}
                className="w-full h-[550px] p-4 border-0 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                placeholder="Start writing your research paper..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Writing Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant={suggestion.severity === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {suggestion.type}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        suggestion.severity === 'high' 
                          ? 'text-red-600' 
                          : suggestion.severity === 'medium'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {suggestion.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{suggestion.message}</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      Apply
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs">
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Document Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Words</span>
                <span className="text-sm font-medium">{wordCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Characters</span>
                <span className="text-sm font-medium">{content.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Paragraphs</span>
                <span className="text-sm font-medium">
                  {content.split('\n\n').filter(p => p.trim().length > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reading time</span>
                <span className="text-sm font-medium">
                  {Math.ceil(wordCount / 200)} min
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Check Grammar
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BookmarkIcon className="w-4 h-4 mr-2" />
                Add Citation
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Format APA
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ShareIcon className="w-4 h-4 mr-2" />
                Plagiarism Check
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}