'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { geminiService } from '@/services/gemini'

export default function TestGeminiPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const isConnected = await geminiService.testConnection()
      setResult({ type: 'connection', success: isConnected })
    } catch (err) {
      setError('Connection test failed: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const testOutlineGeneration = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const outline = await geminiService.generateResearchOutline({
        projectTitle: 'Nghiên cứu ảnh hưởng của chất lượng dịch vụ đến sự hài lòng khách hàng',
        projectDescription: 'Nghiên cứu này nhằm tìm hiểu mối quan hệ giữa các yếu tố chất lượng dịch vụ và mức độ hài lòng của khách hàng trong ngành khách sạn.',
        businessDomain: 'Du lịch & Khách sạn',
        selectedModels: [
          {
            id: 3,
            name: 'SERVQUAL Model',
            description: 'Mô hình đo lường chất lượng dịch vụ qua 5 thành phần',
            category: 'service_quality'
          },
          {
            id: 4,
            name: 'Customer Satisfaction Model',
            description: 'Mô hình sự hài lòng khách hàng và ý định tái mua',
            category: 'customer_satisfaction'
          }
        ]
      })
      
      setResult({ type: 'outline', data: outline })
    } catch (err) {
      setError('Outline generation failed: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const testSurveyGeneration = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const questions = await geminiService.generateSurveyQuestions([
        {
          name: 'Perceived Service Quality',
          type: 'independent',
          description: 'Chất lượng dịch vụ cảm nhận của khách hàng'
        },
        {
          name: 'Customer Satisfaction',
          type: 'dependent',
          description: 'Mức độ hài lòng của khách hàng'
        }
      ])
      
      setResult({ type: 'survey', data: questions })
    } catch (err) {
      setError('Survey generation failed: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Test Gemini AI Integration</h1>
        <p className="text-gray-600">Test các chức năng AI để tạo đề cương và câu hỏi khảo sát</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={testConnection}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Button>
        
        <Button 
          onClick={testOutlineGeneration}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Test Outline Generation'}
        </Button>
        
        <Button 
          onClick={testSurveyGeneration}
          disabled={isLoading}
          variant="secondary"
        >
          {isLoading ? 'Generating...' : 'Test Survey Generation'}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <h3 className="font-medium">Error:</h3>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.type === 'connection' && 'Connection Test Result'}
              {result.type === 'outline' && 'Generated Research Outline'}
              {result.type === 'survey' && 'Generated Survey Questions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.type === 'connection' && (
              <div className={`p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {result.success ? '✅ Connection successful!' : '❌ Connection failed!'}
              </div>
            )}
            
            {result.type === 'outline' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Title:</h4>
                  <p className="text-sm">{result.data.title}</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Abstract:</h4>
                  <p className="text-sm">{result.data.abstract?.substring(0, 300)}...</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Hypotheses ({result.data.hypotheses?.length || 0}):</h4>
                  <ul className="text-sm list-disc list-inside">
                    {result.data.hypotheses?.slice(0, 3).map((h: string, i: number) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Suggested Variables ({result.data.suggestedVariables?.length || 0}):</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {result.data.suggestedVariables?.slice(0, 4).map((v: any, i: number) => (
                      <div key={i} className="p-2 bg-gray-50 rounded">
                        <strong>{v.name}</strong> ({v.type})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {result.type === 'survey' && (
              <div className="space-y-4">
                {result.data?.map((item: any, i: number) => (
                  <div key={i}>
                    <h4 className="font-medium">{item.variable}:</h4>
                    <ul className="text-sm list-disc list-inside ml-4">
                      {item.questions?.slice(0, 3).map((q: any, j: number) => (
                        <li key={j}>{q.text}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600">View Raw Data</summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  )
}