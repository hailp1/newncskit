'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ApiTest() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDjangoAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/demo/create-users/')
      const data = await response.json()
      setResults({ django: data, status: 'success' })
    } catch (error) {
      setResults({ django: { error: error instanceof Error ? error.message : 'Unknown error' }, status: 'error' })
    }
    setLoading(false)
  }

  const testRService = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8001/health')
      const data = await response.json()
      setResults({ r_service: data, status: 'success' })
    } catch (error) {
      setResults({ r_service: { error: error instanceof Error ? error.message : 'Unknown error' }, status: 'error' })
    }
    setLoading(false)
  }

  const testSupabase = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        }
      })
      const data = await response.json()
      setResults({ supabase: data, status: 'success' })
    } catch (error) {
      setResults({ supabase: { error: error instanceof Error ? error.message : 'Unknown error' }, status: 'error' })
    }
    setLoading(false)
  }

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Card className="fixed bottom-20 right-4 w-80 z-40">
      <CardHeader>
        <CardTitle className="text-sm">API Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Button size="sm" onClick={testDjangoAPI} disabled={loading}>
            Django
          </Button>
          <Button size="sm" onClick={testRService} disabled={loading}>
            R Service
          </Button>
          <Button size="sm" onClick={testSupabase} disabled={loading}>
            Supabase
          </Button>
        </div>
        
        {results && (
          <div className="mt-3 p-2 bg-gray-100 rounded text-xs max-h-32 overflow-y-auto">
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}