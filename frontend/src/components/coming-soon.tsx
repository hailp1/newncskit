import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeftIcon, 
  WrenchScrewdriverIcon,
  HomeIcon 
} from '@heroicons/react/24/outline'

interface ComingSoonProps {
  title?: string
  description?: string
}

export function ComingSoon({ 
  title = "Coming Soon", 
  description = "This feature is currently under development. We're working hard to bring you something amazing!" 
}: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
            <WrenchScrewdriverIcon className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {description}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            What's Coming?
          </h2>
          <ul className="text-left space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Intuitive user interface</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Powerful features for researchers</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Seamless integration with existing tools</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Community-driven development</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="shadow-lg">
            <Link href="/">
              <HomeIcon className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">
              Get Notified
            </Link>
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Want to stay updated? Follow our progress or contact us for more information.
        </p>
      </div>
    </div>
  )
}
