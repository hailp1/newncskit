import Link from 'next/link'
import { 
  BeakerIcon, 
  DocumentTextIcon, 
  BookOpenIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  SparklesIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const navigation = {
  features: [
    { name: 'Project Management', href: '/projects', icon: BeakerIcon },
    { name: 'Smart Editor', href: '/editor', icon: DocumentTextIcon },
    { name: 'Journal Finder', href: '/journals', icon: BookOpenIcon },
    { name: 'Topic Suggestions', href: '/topics', icon: AcademicCapIcon },
    { name: 'Statistical Analysis', href: '/analysis', icon: ChartBarIcon },
    { name: 'AI Assistant', href: '/ai-assistant', icon: SparklesIcon },
  ],
  resources: [
    { name: 'Research Blog', href: '/blog' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Help Center', href: '/help' },
    { name: 'API Reference', href: '/api-docs' },
    { name: 'Tutorials', href: '/tutorials' },
    { name: 'Community', href: '/community' },
  ],
  company: [
    { name: 'About NCSKIT', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press Kit', href: '/press' },
    { name: 'Partners', href: '/partners' },
    { name: 'Pricing', href: '/pricing' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Data Protection', href: '/data-protection' },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Security', href: '/security' },
  ],
  social: [
    {
      name: 'Facebook',
      href: 'https://facebook.com/ncskit',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/ncskit',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/ncskit',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/@ncskit',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <BeakerIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">NCSKIT</span>
            </div>
            <p className="text-sm leading-6 text-gray-300">
              Nền tảng quản lý nghiên cứu học thuật toàn diện, hỗ trợ các nhà nghiên cứu Việt Nam 
              từ khâu lập kế hoạch đến xuất bản với công nghệ AI tiên tiến.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
            
            {/* Newsletter Signup */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold leading-6 text-white">Stay Updated</h3>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Get the latest research insights and platform updates.
              </p>
              <form className="mt-4 sm:flex sm:max-w-md">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  className="w-full min-w-0 appearance-none rounded-md border-0 bg-white/5 px-3 py-1.5 text-base text-white placeholder-gray-500 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:w-64 sm:text-sm sm:leading-6 xl:w-full"
                  placeholder="Enter your email"
                />
                <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Features</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.features.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="flex items-center text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Resources</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Legal & Support</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Contact Information</h3>
              <ul role="list" className="mt-4 space-y-3">
                <li className="flex items-center text-sm leading-6 text-gray-300">
                  <EnvelopeIcon className="mr-3 h-4 w-4 text-gray-400" />
                  <a href="mailto:support@ncskit.org" className="hover:text-white transition-colors">
                    support@ncskit.org
                  </a>
                </li>
                <li className="flex items-center text-sm leading-6 text-gray-300">
                  <PhoneIcon className="mr-3 h-4 w-4 text-gray-400" />
                  <a href="tel:+84123456789" className="hover:text-white transition-colors">
                    +84 (0) 123 456 789
                  </a>
                </li>
                <li className="flex items-center text-sm leading-6 text-gray-300">
                  <MapPinIcon className="mr-3 h-4 w-4 text-gray-400" />
                  Ho Chi Minh City, Vietnam
                </li>
                <li className="flex items-center text-sm leading-6 text-gray-300">
                  <GlobeAltIcon className="mr-3 h-4 w-4 text-gray-400" />
                  <a href="https://ncskit.org" className="hover:text-white transition-colors">
                    www.ncskit.org
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Business Hours</h3>
              <ul role="list" className="mt-4 space-y-2 text-sm leading-6 text-gray-300">
                <li>Monday - Friday: 9:00 AM - 6:00 PM (ICT)</li>
                <li>Saturday: 9:00 AM - 12:00 PM (ICT)</li>
                <li>Sunday: Closed</li>
                <li className="text-blue-400">24/7 Online Support Available</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Platform Status</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm">
                  <div className="mr-2 h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-gray-300">All Systems Operational</span>
                </div>
                <div className="text-sm text-gray-300">
                  <Link href="/status" className="hover:text-white transition-colors">
                    View System Status →
                  </Link>
                </div>
                <div className="text-sm text-gray-300">
                  <Link href="/changelog" className="hover:text-white transition-colors">
                    Latest Updates →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <p className="text-xs leading-5 text-gray-400">
                &copy; 2024 NCSKIT. All rights reserved.
              </p>
              <p className="mt-2 text-xs leading-5 text-gray-400 sm:mt-0">
                Made with ❤️ for Vietnamese Researchers
              </p>
            </div>
            <div className="mt-4 flex flex-wrap justify-center space-x-6 sm:mt-0">
              <Link href="/privacy" className="text-xs leading-5 text-gray-400 hover:text-gray-300 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs leading-5 text-gray-400 hover:text-gray-300 transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="text-xs leading-5 text-gray-400 hover:text-gray-300 transition-colors">
                Cookies
              </Link>
              <Link href="/accessibility" className="text-xs leading-5 text-gray-400 hover:text-gray-300 transition-colors">
                Accessibility
              </Link>
              <Link href="/sitemap" className="text-xs leading-5 text-gray-400 hover:text-gray-300 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}