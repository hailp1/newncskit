'use client';

import React from 'react';
import PageLayout from '@/components/layout/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Scale, 
  Shield, 
  AlertTriangle, 
  Users, 
  Gavel,
  Calendar,
  Mail
} from 'lucide-react';

export default function TermsOfServicePage() {
  const lastUpdated = "November 6, 2025";

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-4 rounded-2xl">
                <Scale className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Please read these Terms of Service carefully before using NCSKIT platform and services.
            </p>
            <div className="flex justify-center mt-6">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Calendar className="h-4 w-4 mr-2" />
                Last updated: {lastUpdated}
              </Badge>
            </div>
          </div>

          {/* Terms Content */}
          <div className="space-y-8">
            
            {/* Acceptance of Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  By accessing and using NCSKIT ("the Service"), you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms of Service apply to all users of the Service, including without limitation users who are 
                  browsers, vendors, customers, merchants, and/or contributors of content.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  2. Service Description
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  NCSKIT is a research platform that provides survey creation, data collection, and analysis tools 
                  for academic and market research purposes. Our services include:
                </p>
                <ul>
                  <li>Survey builder with AI-powered features</li>
                  <li>Data collection and campaign management</li>
                  <li>Statistical analysis and reporting tools</li>
                  <li>Collaboration and project management features</li>
                  <li>API access for developers</li>
                </ul>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  3. User Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul>
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  4. Acceptable Use Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>You agree not to use the Service to:</p>
                <ul>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful, offensive, or inappropriate content</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Use the Service for any commercial purpose without authorization</li>
                  <li>Collect personal information without consent</li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy and Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  5. Privacy and Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect 
                  your information when you use our Service. By using our Service, you agree to the collection 
                  and use of information in accordance with our Privacy Policy.
                </p>
                <p>
                  For research data collected through our platform, you are responsible for ensuring compliance 
                  with applicable data protection laws and obtaining necessary consents from participants.
                </p>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-red-600" />
                  6. Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  The Service and its original content, features, and functionality are and will remain the 
                  exclusive property of NCSKIT and its licensors. The Service is protected by copyright, 
                  trademark, and other laws.
                </p>
                <p>
                  You retain ownership of any content you create using our Service, but you grant us a 
                  license to use, store, and process such content as necessary to provide the Service.
                </p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  7. Termination
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  We may terminate or suspend your account and bar access to the Service immediately, 
                  without prior notice or liability, under our sole discretion, for any reason whatsoever 
                  and without limitation, including but not limited to a breach of the Terms.
                </p>
                <p>
                  You may terminate your account at any time by contacting us. Upon termination, your 
                  right to use the Service will cease immediately.
                </p>
              </CardContent>
            </Card>

            {/* Disclaimers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  8. Disclaimers
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  The Service is provided on an "AS IS" and "AS AVAILABLE" basis. NCSKIT makes no 
                  representations or warranties of any kind, express or implied, as to the operation 
                  of the Service or the information, content, materials, or products included on the Service.
                </p>
                <p>
                  We do not warrant that the Service will be uninterrupted or error-free, and we will 
                  not be liable for any interruptions or errors.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  9. Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@ncskit.org</p>
                  <p><strong>Address:</strong> NCSKIT Legal Department</p>
                  <p><strong>Website:</strong> https://ncskit.org/contact</p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-gray-600 text-sm">
              <p>© 2025 NCSKIT.org. All rights reserved.</p>
              <p className="mt-2">
                These Terms of Service are effective as of {lastUpdated} and were last updated on {lastUpdated}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}