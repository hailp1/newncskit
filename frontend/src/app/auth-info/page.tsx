import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OAuthInfo } from '@/components/auth/oauth-info'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function AuthInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600 mb-4 inline-block">
            NCSKIT
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Sign-Up Method
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the authentication method that works best for your research workflow. 
            We recommend using your academic accounts for the best experience.
          </p>
        </div>

        {/* OAuth Information */}
        <OAuthInfo />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg">
            <Link href="/register">
              Get Started Now
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">
              Already Have Account?
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}