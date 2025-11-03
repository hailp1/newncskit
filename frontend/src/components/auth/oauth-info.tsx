import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'

const oauthProviders = [
  {
    name: 'ORCID',
    description: 'The preferred choice for researchers',
    benefits: [
      'Automatic profile import from ORCID',
      'Seamless publication tracking',
      'Verified academic identity',
      'Connect with global research network',
    ],
    icon: '🎓',
    recommended: true,
  },
  {
    name: 'Google',
    description: 'Quick and secure access',
    benefits: [
      'Fast one-click registration',
      'Sync with Google Scholar',
      'Access Google Drive integration',
      'Familiar and trusted platform',
    ],
    icon: '🔍',
    recommended: false,
  },
  {
    name: 'LinkedIn',
    description: 'Professional networking integration',
    benefits: [
      'Import professional profile',
      'Connect with research collaborators',
      'Share research achievements',
      'Professional network access',
    ],
    icon: '💼',
    recommended: false,
  },
]

export function OAuthInfo() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Why Sign Up with Academic Accounts?
        </h3>
        <p className="text-gray-600">
          Connect with your existing academic identity for a seamless research experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {oauthProviders.map((provider) => (
          <Card key={provider.name} className={`relative ${provider.recommended ? 'ring-2 ring-blue-500' : ''}`}>
            {provider.recommended && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Recommended
              </Badge>
            )}
            <CardHeader className="text-center pb-3">
              <div className="text-3xl mb-2">{provider.icon}</div>
              <CardTitle className="text-lg">{provider.name}</CardTitle>
              <p className="text-sm text-gray-600">{provider.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {provider.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Secure & Private</h4>
            <p className="text-sm text-blue-800">
              We use industry-standard OAuth 2.0 protocols. We never store your passwords 
              and only access basic profile information with your permission.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start">
          <AcademicCapIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Academic Integration</h4>
            <p className="text-sm text-gray-600">
              Automatically sync your publications, citations, and research interests
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <UserGroupIcon className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Collaboration Ready</h4>
            <p className="text-sm text-gray-600">
              Find and connect with researchers in your field instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}