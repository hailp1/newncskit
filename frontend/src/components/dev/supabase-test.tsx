'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(5)
      
      if (error) {
        setResult({ 
          error: error.message, 
          status: 'error',
          message: 'Tables not created yet. Please setup database first.',
          setupInstructions: 'Go to Supabase Dashboard → SQL Editor → Run create-basic-tables.sql'
        })
      } else {
        setResult({ 
          message: 'Supabase connection and tables working!', 
          data,
          userCount: data?.length || 0,
          status: 'success' 
        })
      }
    } catch (err) {
      setResult({ 
        error: err instanceof Error ? err.message : 'Unknown error',
        status: 'error' 
      })
    }
    setLoading(false)
  }

  const testAuth = async () => {
    setLoading(true)
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setResult({ error: error.message, status: 'error' })
      } else {
        setResult({ 
          message: 'Auth check successful!', 
          session: session ? 'User logged in' : 'No active session',
          status: 'success' 
        })
      }
    } catch (err) {
      setResult({ 
        error: err instanceof Error ? err.message : 'Unknown error',
        status: 'error' 
      })
    }
    setLoading(false)
  }

  const testProjects = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(5)
      
      if (error) {
        setResult({ error: error.message, status: 'error' })
      } else {
        setResult({ 
          message: 'Projects table working!', 
          data,
          projectCount: data?.length || 0,
          status: 'success' 
        })
      }
    } catch (err) {
      setResult({ 
        error: err instanceof Error ? err.message : 'Unknown error',
        status: 'error' 
      })
    }
    setLoading(false)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">🔗 Supabase Connection Test</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Users Table'}
          </button>
          
          <button
            onClick={testProjects}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Projects Table'}
          </button>
          
          <button
            onClick={testAuth}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Auth Service'}
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.status === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className="font-semibold mb-2">
              {result.status === 'success' ? '✅ Success' : '❌ Error'}
            </h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}