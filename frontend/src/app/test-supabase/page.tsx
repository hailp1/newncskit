import SupabaseTest from '@/components/dev/supabase-test'
import { ApiTest } from '@/components/dev/api-test'

export default function TestSupabasePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 System Connection Tests</h1>
        
        <div className="space-y-8">
          <SupabaseTest />
          <ApiTest />
        </div>
      </div>
    </div>
  )
}