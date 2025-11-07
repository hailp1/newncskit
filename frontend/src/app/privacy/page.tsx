import { Metadata } from 'next';
import PageLayout from '@/components/layout/page-layout';
import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertTriangle, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | NCSKit',
  description: 'Learn how NCSKit protects your privacy and handles your personal data in compliance with GDPR and other privacy regulations.',
  keywords: 'privacy policy, data protection, GDPR, personal data, NCSKit privacy',
  openGraph: {
    title: 'Privacy Policy | NCSKit',
    description: 'Learn how NCSKit protects your privacy and handles your personal data.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "November 6, 2025";

  return (
    <PageLayout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Page Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8">
                At NCSKit, we are committed to protecting your privacy and ensuring the security of your personal information.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-600" />
                  Information We Collect
                </h2>
                <p className="text-gray-700 mb-4">
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-blue-600" />
                  How We Use Your Information
                </h2>
                <p className="text-gray-700 mb-4">
                  We use the information we collect to provide, maintain, and improve our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  Your Rights
                </h2>
                <p className="text-gray-700 mb-4">
                  You have the right to access, update, or delete your personal information at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="h-6 w-6 text-blue-600" />
                  Contact Us
                </h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy, please contact us at privacy@ncskit.org
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}