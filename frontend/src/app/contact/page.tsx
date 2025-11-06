'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/layout/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  HelpCircle,
  Users
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <PageLayout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Contact Us
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Have questions about NCSKIT? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-blue-600" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="type">Inquiry Type</Label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="sales">Sales & Pricing</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                        <option value="bug">Bug Report</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Please provide details about your inquiry..."
                        rows={6}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-gray-600 text-sm">support@ncskit.org</div>
                      <div className="text-gray-600 text-sm">info@ncskit.org</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">Phone</div>
                      <div className="text-gray-600 text-sm">+1 (555) 123-4567</div>
                      <div className="text-gray-600 text-sm">Mon-Fri, 9AM-6PM EST</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">Address</div>
                      <div className="text-gray-600 text-sm">
                        123 Research Avenue<br />
                        Innovation District<br />
                        Tech City, TC 12345
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">Business Hours</div>
                      <div className="text-gray-600 text-sm">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-orange-600" />
                    Quick Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-1">Need immediate help?</div>
                    <div className="text-gray-600">
                      Check our <a href="/docs" className="text-blue-600 hover:underline">documentation</a> or 
                      browse our <a href="/help" className="text-blue-600 hover:underline">help center</a> for 
                      quick answers to common questions.
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-1">Technical Issues?</div>
                    <div className="text-gray-600">
                      For urgent technical support, please include your account email and 
                      a detailed description of the issue.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Response Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">General Inquiries</span>
                    <span className="font-medium text-gray-900">24-48 hours</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Technical Support</span>
                    <span className="font-medium text-gray-900">4-8 hours</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Sales Inquiries</span>
                    <span className="font-medium text-gray-900">2-4 hours</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Bug Reports</span>
                    <span className="font-medium text-gray-900">1-2 hours</span>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">
                Quick answers to common questions about NCSKIT
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I get started with NCSKIT?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Simply create a free account and you'll have access to our survey builder and basic analytics tools. 
                  Premium features are available with paid plans.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Yes, we use industry-standard encryption and security measures to protect your data. 
                  Read our Privacy Policy for detailed information.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I export my survey data?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Absolutely! You can export your data in multiple formats including CSV, Excel, and SPSS. 
                  Your data belongs to you.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you offer academic discounts?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Yes, we offer special pricing for students, researchers, and educational institutions. 
                  Contact us for more information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}