"use client"
import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, Phone, Mail, MessageCircle, HelpCircle, User, Settings, Shield, CreditCard, Zap, Database, Users, BookOpen } from 'lucide-react';


export default function ProcurementFAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  const categories = [
    { id: 'all', name: 'All Categories', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'general', name: 'General', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'account', name: 'Account & Users', icon: <User className="w-5 h-5" /> },
    { id: 'features', name: 'Features', icon: <Zap className="w-5 h-5" /> },
    { id: 'integration', name: 'Integrations', icon: <Database className="w-5 h-5" /> },
    { id: 'security', name: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'billing', name: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'support', name: 'Support', icon: <MessageCircle className="w-5 h-5" /> }
  ];

  const faqs = [
    // General
    {
      category: 'general',
      question: 'What is ProcureMax and how does it work?',
      answer: 'ProcureMax is a comprehensive procurement management platform that streamlines your entire purchasing process. It automates purchase orders, manages vendor relationships, tracks spending, and provides real-time analytics. The system works by centralizing all procurement activities in one platform, allowing you to create requisitions, approve purchases, manage vendors, and track deliveries all in one place.'
    },
    {
      category: 'general',
      question: 'How long does implementation typically take?',
      answer: 'Implementation time varies based on your organization size and complexity. For small to medium businesses, setup typically takes 2-4 weeks. Enterprise implementations usually take 6-12 weeks. Our implementation team provides dedicated support throughout the process, including data migration, user training, and system configuration to ensure a smooth transition.'
    },
    {
      category: 'general',
      question: 'Do you offer a free trial?',
      answer: 'Yes! We offer a 30-day free trial with full access to all Professional plan features. No credit card required to start. During the trial, you\'ll have access to our support team to help you get set up and answer any questions. You can invite up to 10 users during the trial period.'
    },
    {
      category: 'general',
      question: 'What industries do you serve?',
      answer: 'ProcureMax serves businesses across all industries including manufacturing, healthcare, retail, construction, technology, government, education, and professional services. Our flexible platform adapts to industry-specific procurement needs and compliance requirements.'
    },

    // Account & Users
    {
      category: 'account',
      question: 'How do I add and manage users?',
      answer: 'Administrators can add users through the User Management section in settings. You can assign different roles (Admin, Manager, User, Viewer) with specific permissions. Each user receives an email invitation to set up their account. You can manage user permissions, deactivate accounts, and track user activity through the admin dashboard.'
    },
    {
      category: 'account',
      question: 'What user roles are available?',
      answer: 'We offer four main user roles: Admin (full system access), Manager (department-level oversight), User (create and manage own requisitions), and Viewer (read-only access). Each role has specific permissions for purchasing limits, approval workflows, reporting access, and administrative functions.'
    },
    {
      category: 'account',
      question: 'Can I customize approval workflows?',
      answer: 'Yes, approval workflows are fully customizable. You can set up multi-level approvals based on purchase amount, department, vendor, or product category. Configure automatic routing rules, set spending limits by user or department, and create custom approval chains that match your organization\'s hierarchy.'
    },
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link within a few minutes. For security, reset links expire after 24 hours. If you continue having issues, contact our support team for assistance.'
    },

    // Features
    {
      category: 'features',
      question: 'What procurement features are included?',
      answer: 'ProcureMax includes purchase order management, vendor management, spend analytics, approval workflows, inventory tracking, contract management, budget controls, automated notifications, mobile access, custom reporting, and real-time dashboards. All features are included in every plan with no additional costs.'
    },
    {
      category: 'features',
      question: 'Can I track purchase orders in real-time?',
      answer: 'Yes, our real-time tracking shows the complete lifecycle of every purchase order from creation to delivery. Track approval status, vendor acknowledgment, shipping updates, and delivery confirmation. Automated notifications keep all stakeholders informed of status changes.'
    },
    {
      category: 'features',
      question: 'How does vendor management work?',
      answer: 'Our vendor management system maintains comprehensive vendor profiles including contact information, performance metrics, contracts, certifications, and payment terms. Track vendor performance, manage contracts and renewals, store important documents, and maintain preferred vendor lists for streamlined purchasing.'
    },
    {
      category: 'features',
      question: 'What reporting and analytics are available?',
      answer: 'Generate detailed reports on spending patterns, vendor performance, budget utilization, approval times, and cost savings. Create custom dashboards, schedule automated reports, export data to Excel/PDF, and access real-time analytics with drill-down capabilities for deeper insights.'
    },

    // Integrations
    {
      category: 'integration',
      question: 'Which ERP systems do you integrate with?',
      answer: 'We integrate with major ERP systems including SAP, Oracle NetSuite, Microsoft Dynamics, Sage, QuickBooks, and many others. Our API-first approach allows for custom integrations with virtually any system. Pre-built connectors are available for popular platforms.'
    },
    {
      category: 'integration',
      question: 'How does data sync work with existing systems?',
      answer: 'Data synchronization can be configured for real-time or scheduled updates. We support two-way sync for purchase orders, vendor data, and financial information. Our integration team helps map data fields and configure sync rules to maintain data consistency across systems.'
    },
    {
      category: 'integration',
      question: 'Do you have an API for custom integrations?',
      answer: 'Yes, we provide a comprehensive REST API with detailed documentation. The API allows full access to all system functions including purchase orders, vendors, users, and reporting data. We also offer webhooks for real-time event notifications and SDKs for popular programming languages.'
    },
    {
      category: 'integration',
      question: 'Can you integrate with our existing approval system?',
      answer: 'Absolutely. We can integrate with existing approval systems, directory services (Active Directory, LDAP), and workflow platforms. Our team will work with your IT department to ensure seamless integration while maintaining your current approval processes and security protocols.'
    },

    // Security
    {
      category: 'security',
      question: 'How secure is my data?',
      answer: 'Security is our top priority. We use bank-level encryption (AES-256) for data at rest and in transit, maintain SOC 2 Type II compliance, and undergo regular security audits. All data is stored in secure, geographically distributed data centers with 24/7 monitoring and automated backups.'
    },
    {
      category: 'security',
      question: 'Do you support single sign-on (SSO)?',
      answer: 'Yes, we support SSO integration with major identity providers including Microsoft Azure AD, Okta, Google Workspace, and SAML 2.0 compatible systems. SSO is available on Professional and Enterprise plans, making user management seamless while maintaining security standards.'
    },
    {
      category: 'security',
      question: 'What compliance certifications do you have?',
      answer: 'We maintain SOC 2 Type II, ISO 27001, and GDPR compliance certifications. Our platform also meets industry-specific requirements for healthcare (HIPAA), government (FedRAMP), and financial services. Regular third-party audits ensure ongoing compliance with security and privacy standards.'
    },
    {
      category: 'security',
      question: 'Where is my data stored?',
      answer: 'Data is stored in enterprise-grade cloud infrastructure with multiple redundant locations. We offer data residency options in the US, EU, and other regions to meet local compliance requirements. All data centers feature 99.9% uptime guarantees, automated backups, and disaster recovery capabilities.'
    },

    // Billing
    {
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), ACH bank transfers, and wire transfers. Enterprise customers can also pay by check or purchase order. All payments are processed securely through our PCI-compliant payment system.'
    },
    {
      category: 'billing',
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the next billing cycle. Our support team can help you choose the right plan based on your usage and requirements.'
    },
    {
      category: 'billing',
      question: 'Do you offer annual billing discounts?',
      answer: 'Yes, annual billing provides a 20% discount compared to monthly billing. Enterprise customers may be eligible for additional volume discounts. Annual plans include priority support and additional features like advanced analytics and custom integrations.'
    },
    {
      category: 'billing',
      question: 'What happens if I cancel my subscription?',
      answer: 'You can cancel anytime without penalties. Your account remains active until the end of your billing period, after which you\'ll have 30 days to export your data. We provide data export tools and can assist with migration to ensure you don\'t lose important procurement information.'
    },

    // Support
    {
      category: 'support',
      question: 'What support options are available?',
      answer: 'We offer 24/7 email support for all plans, with phone support available for Professional and Enterprise customers. Enterprise plans include a dedicated customer success manager. Our support team provides technical assistance, training, and best practices guidance.'
    },
    {
      category: 'support',
      question: 'Do you provide training for new users?',
      answer: 'Yes, we provide comprehensive training including live webinars, recorded video tutorials, step-by-step guides, and best practices documentation. Enterprise customers receive personalized training sessions and ongoing user adoption support to maximize platform value.'
    },
    {
      category: 'support',
      question: 'How do I contact support?',
      answer: 'Contact support through the help center in your account, email support@procuremax.com, or call our support hotline. Enterprise customers have direct access to their dedicated support representative. We also offer live chat during business hours for immediate assistance.'
    },
    {
      category: 'support',
      question: 'What is your average response time?',
      answer: 'Email support responses average 2-4 hours during business hours. Critical issues receive immediate attention with 30-minute response times for Enterprise customers. Phone support is available with immediate connection during business hours. We maintain 24/7 monitoring for system issues.'
    }
  ];

  const filteredFaqs = useMemo(() => {
    let filtered = faqs;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchTerm, selectedCategory]);

  const toggleFaq = (index:any) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCategoryChange = (categoryId:any) => {
    setSelectedCategory(categoryId);
    setOpenFaq(null); // Close any open FAQ when changing category
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              Find answers to common questions about our Procurement Management System
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search FAQs
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className={selectedCategory === category.id ? 'text-emerald-600' : 'text-gray-400'}>
                        {category.icon}
                      </span>
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-8 p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-semibold text-emerald-800 mb-2">Need More Help?</h4>
                <p className="text-sm text-emerald-700 mb-3">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'all' 
                  ? 'All Questions' 
                  : categories.find(cat => cat.id === selectedCategory)?.name
                }
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'} found
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>

            {/* FAQ Items */}
            {filteredFaqs.length > 0 ? (
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      onClick={() => toggleFaq(index)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      <div className="flex-shrink-0">
                        {openFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {openFaq === index && (
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-4">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or browse a different category.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Show All Questions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
            <p className="text-xl text-gray-600">
              Our support team is available 24/7 to help you get the most out of ProcureMax
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div className="bg-emerald-50 p-8 rounded-xl text-center">
    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <Mail className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h3>
    <p className="text-gray-600 mb-4">Reach us anytime via email for quick assistance.</p>
    <p className="text-emerald-600 font-medium">support@procuremax.com</p>
    <p className="text-sm text-gray-500 mt-2">Replies within 2–4 business hours</p>
  </div>

  <div className="bg-emerald-50 p-8 rounded-xl text-center">
    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <Phone className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone Support</h3>
    <p className="text-gray-600 mb-4">Speak directly with our support team for faster help.</p>
    <p className="text-emerald-600 font-medium">1-800-PROCURE</p>
    <p className="text-sm text-gray-500 mt-2">Available Mon–Fri, 9 AM – 6 PM EST</p>
  </div>

  <div className="bg-emerald-50 p-8 rounded-xl text-center">
    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <MessageCircle className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Help Center</h3>
    <p className="text-gray-600 mb-4">Browse FAQs and step-by-step guides to resolve issues quickly.</p>
    <p className="text-emerald-600 font-medium">help.procure.com</p>
    <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
  </div>
</div>

        </div>
      </div>

      {/* Footer */}
      {/* <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">Procurement Management System</span>
              </div>
              <p className="text-gray-400">
                Transforming procurement processes for businesses worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400">Features</a></li>
                <li><a href="#" className="hover:text-emerald-400">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-400">Integrations</a></li>
                <li><a href="#" className="hover:text-emerald-400">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-400">Training</a></li>
                <li><a href="#" className="hover:text-emerald-400">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400">About</a></li>
                <li><a href="#" className="hover:text-emerald-400">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Procure. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}