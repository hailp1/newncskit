import Link from 'next/link'
import { BeakerIcon } from '@heroicons/react/24/outline'

const navigation = {
  product: [
    { name: 'Data Analysis', href: '/analysis' },
    { name: 'Survey Campaigns', href: '/campaigns' },
    { name: 'Projects', href: '/projects' },
    { name: 'Documentation', href: 'https://docs.ncskit.org', external: true },
    { name: 'Blog', href: '/blog' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Pricing', href: '/pricing' },
  ],
  legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ],
  social: [
    {
      name: 'Facebook',
      href: 'https://facebook.com/ncskit',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
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
          <path fillRule="evenodd" d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" clipRule="evenodd" />
        </svg>
      ),
    },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 border-t-2 border-gray-800 relative overflow-hidden" aria-labelledby="footer-heading">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:40px_40px]"></div>
      </div>
      
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Brand & Newsletter Section */}
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl">
                <BeakerIcon className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">NCSKIT</span>
            </div>
            <p className="text-base text-gray-300 mb-8 leading-relaxed font-light">
              Nền tảng nghiên cứu thông minh cho mọi người. Từ khảo sát đến phân tích, tất cả trong một nơi.
            </p>
            
            {/* Newsletter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-3">Stay Updated</h3>
              <p className="text-xs text-gray-400 mb-3">
                Get the latest research insights and platform updates.
              </p>
              <form className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {navigation.social.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800/50 backdrop-blur-sm text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300 hover:scale-110"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => {
                if (item.external) {
                  return (
                    <li key={item.name}>
                      <a 
                        href={item.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {item.name}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3 mb-6">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold text-white mb-4">Contact Information</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <a href="mailto:support@ncskit.org" className="text-sm text-gray-400 hover:text-white transition-colors flex items-start">
                  <span className="mr-2">📧</span>
                  <span>support@ncskit.org</span>
                </a>
              </li>
              <li>
                <a href="tel:+84123456789" className="text-sm text-gray-400 hover:text-white transition-colors flex items-start">
                  <span className="mr-2">📞</span>
                  <span>+84 (0) 123 456 789</span>
                </a>
              </li>
              <li className="text-sm text-gray-400 flex items-start">
                <span className="mr-2">📍</span>
                <span>Ho Chi Minh City, Vietnam</span>
              </li>
              <li>
                <a href="https://www.ncskit.org" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors flex items-start">
                  <span className="mr-2">🌐</span>
                  <span>www.ncskit.org</span>
                </a>
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-white mb-4">Business Hours</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Monday - Friday: 9:00 AM - 6:00 PM (ICT)</li>
              <li>Saturday: 9:00 AM - 12:00 PM (ICT)</li>
              <li>Sunday: Closed</li>
              <li className="text-blue-400 font-medium mt-2">24/7 Online Support Available</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} NCSKIT. Made with ❤️ for Vietnamese Researchers
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-gray-400">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}