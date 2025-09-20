"use client"
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Users, TrendingUp, Shield, Clock, FileText, BarChart3, Settings, 
  ArrowRight, Menu, X, Star, ChevronDown, Play, Zap, Globe, Database, 
  Smartphone, Award, Target, DollarSign, ChevronRight, Eye, Download,
  MessageSquare, Calendar, Lock, Cpu, ChevronUp
} from 'lucide-react';
import Link from 'next/link';

export default function ProcurementProductPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [stats, setStats] = useState({
    savings: 0,
    efficiency: 0,
    customers: 0,
    uptime: 0
  });

  // Animate statistics on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        savings: 25,
        efficiency: 45,
        customers: 500,
        uptime: 99.9
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-emerald-600" />,
      title: "Smart Purchase Orders",
      description: "Automated PO generation with AI-powered approval workflows, duplicate detection, and intelligent routing based on business rules.",
      benefits: ["90% faster processing", "Zero duplicate orders", "Smart routing"]
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: "Vendor Management",
      description: "Complete vendor lifecycle management with performance tracking, contract management, and automated vendor onboarding.",
      benefits: ["Vendor scorecards", "Contract alerts", "Automated onboarding"]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-emerald-600" />,
      title: "Advanced Analytics",
      description: "Real-time dashboards and predictive analytics to optimize spending patterns and identify cost-saving opportunities.",
      benefits: ["Predictive insights", "Custom dashboards", "Spend optimization"]
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-600" />,
      title: "Compliance & Risk",
      description: "Built-in compliance monitoring with automated risk assessments and regulatory reporting capabilities.",
      benefits: ["Automated compliance", "Risk scoring", "Audit trails"]
    },
    {
      icon: <Zap className="w-8 h-8 text-emerald-600" />,
      title: "Workflow Automation",
      description: "No-code workflow builder with customizable automation rules to eliminate manual tasks and reduce errors.",
      benefits: ["No-code builder", "Custom rules", "Error reduction"]
    },
    {
      icon: <Globe className="w-8 h-8 text-emerald-600" />,
      title: "Global Operations",
      description: "Multi-currency support, localization features, and global supplier network management for international operations.",
      benefits: ["Multi-currency", "Global suppliers", "Localization"]
    }
  ];

  const benefits = [
    { icon: <DollarSign className="w-6 h-6" />, text: "Reduce procurement costs by up to 25%" },
    { icon: <Clock className="w-6 h-6" />, text: "Improve process efficiency by 45%" },
    { icon: <Shield className="w-6 h-6" />, text: "Ensure 100% compliance tracking" },
    { icon: <Eye className="w-6 h-6" />, text: "Real-time visibility across all operations" },
    { icon: <Database className="w-6 h-6" />, text: "Seamless integration with existing systems" },
    { icon: <MessageSquare className="w-6 h-6" />, text: "24/7 dedicated support" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Chief Procurement Officer",
      company: "TechCorp Industries",
      content: "ProcureMax transformed our entire procurement process. We've achieved 30% cost savings and dramatically improved vendor relationships. The AI-powered insights are game-changing.",
      rating: 5,
      image: "SJ",
      metrics: { savings: "$2.4M", efficiency: "40%" }
    },
    {
      name: "Michael Chen",
      role: "Supply Chain Director",
      company: "Global Manufacturing Ltd",
      content: "The analytics capabilities are outstanding. We now have complete visibility into our spend patterns and can make data-driven decisions that directly impact our bottom line.",
      rating: 5,
      image: "MC",
      metrics: { visibility: "100%", decisions: "Real-time" }
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Manager",
      company: "Healthcare Solutions Inc",
      content: "Implementation was seamless, and the ROI was evident within the first quarter. The compliance features alone have saved us countless hours and potential regulatory issues.",
      rating: 5,
      image: "ER",
      metrics: { roi: "Q1", compliance: "100%" }
    }
  ];

  const integrations = [
    { name: "SAP", logo: "S", color: "bg-blue-500" },
    { name: "Oracle", logo: "O", color: "bg-red-500" },
    { name: "Microsoft", logo: "M", color: "bg-blue-600" },
    { name: "Salesforce", logo: "SF", color: "bg-blue-400" },
    { name: "NetSuite", logo: "N", color: "bg-orange-500" },
    { name: "QuickBooks", logo: "Q", color: "bg-green-500" }
  ];

  const faqs = [
    {
      question: "How quickly can we see ROI after implementation?",
      answer: "Most customers see measurable ROI within the first quarter. Our average customer achieves 25% cost savings and 45% efficiency improvements within 6 months of implementation."
    },
    {
      question: "What's included in the implementation process?",
      answer: "Full implementation includes data migration, system configuration, user training, workflow setup, integration with existing systems, and 90 days of dedicated support to ensure smooth adoption."
    },
    {
      question: "How does ProcureMax handle data security?",
      answer: "We use enterprise-grade security with AES-256 encryption, SOC 2 Type II compliance, regular security audits, and maintain 99.9% uptime with redundant data centers and automated backups."
    },
    {
      question: "Can ProcureMax integrate with our existing ERP system?",
      answer: "Yes, we offer pre-built integrations with major ERP systems including SAP, Oracle, Microsoft Dynamics, and others. Our API-first approach allows custom integrations with any system."
    }
  ];

  const pricingPlans = [
    {
      name: "Professional",
      price: "$149",
      period: "/user/month",
      description: "Perfect for growing businesses",
      features: [
        "Unlimited purchase orders",
        "Advanced analytics",
        "Vendor management",
        "Mobile app access",
        "Email support",
        "Basic integrations"
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "/user/month",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Advanced workflow automation",
        "Custom integrations",
        "Dedicated support",
        "Advanced security",
        "Custom reporting"
      ],
      popular: true,
      cta: "Schedule Demo"
    },
    {
      name: "Custom",
      price: "Contact us",
      period: "",
      description: "Tailored for your needs",
      features: [
        "Custom development",
        "On-premise deployment",
        "White-label options",
        "24/7 dedicated support",
        "Custom SLA",
        "Training programs"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
    
      {/* Hero Section */}
     <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-16 text-center">
  <h1 className="text-4xl md:text-5xl font-bold mb-4">Procurement Management System</h1>
  <p className="text-lg md:text-xl mb-6">Streamline your procurement process with ease and efficiency.</p>
 <Link href="/auth/login">
        <button className="bg-white hover:bg-teal-700 text-teal-900 hover:text-white font-semibold py-3 px-16 rounded-lg transition duration-300">
          Get Started
        </button>
      </Link>

</div>

      {/* Trust Indicators */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-600 font-medium mb-8">Trusted by industry leaders and integrated with your favorite tools</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {integrations.map((integration, index) => (
                <div key={index} className="flex items-center space-x-3 hover:opacity-100 transition-opacity">
                  <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                    {integration.logo}
                  </div>
                  <span className="text-gray-700 font-medium">{integration.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-2 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features Built for{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Modern Procurement
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline procurement operations, reduce costs, and drive business growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 group hover:-translate-y-2">
                <div className="mb-6 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Us
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of companies that have transformed their procurement operations and achieved measurable results within the first quarter.
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <div className="text-emerald-600">
                        {benefit.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-900 text-lg font-medium">{benefit.text}</span>
                    </div>
                  </div>
                ))}
              </div>
             
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-2xl text-white shadow-xl">
                    <DollarSign className="w-12 h-12 text-white mb-4 opacity-80" />
                    <div className="text-3xl font-bold mb-2">25%</div>
                    <div className="text-emerald-100">Average Cost Reduction</div>
                  </div>
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <Users className="w-12 h-12 text-emerald-600 mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
                    <div className="text-gray-600">Happy Clients</div>
                  </div>
                </div>
                <div className="space-y-6 pt-12">
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <Clock className="w-12 h-12 text-emerald-600 mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">45%</div>
                    <div className="text-gray-600">Time Saved</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-2xl text-white shadow-xl">
                    <Shield className="w-12 h-12 text-white mb-4 opacity-80" />
                    <div className="text-3xl font-bold mb-2">99.9%</div>
                    <div className="text-blue-100">System Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Procurement Professionals
              </span>
            </h2>
            <p className="text-xl text-gray-600">See how companies are transforming their operations with ProcureMax</p>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2">
                  <div className="flex mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8 font-medium italic">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-xl">
                          {testimonials[currentTestimonial].image}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{testimonials[currentTestimonial].name}</div>
                        <div className="text-gray-600">{testimonials[currentTestimonial].role}</div>
                        <div className="text-emerald-600 font-medium">{testimonials[currentTestimonial].company}</div>
                      </div>
                    </div>
                    <div className="hidden md:flex space-x-2">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTestimonial(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentTestimonial ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                    <h4 className="font-semibold mb-4">Results Achieved</h4>
                    <div className="space-y-4">
                      {Object.entries(testimonials[currentTestimonial].metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-emerald-100 capitalize">{key}:</span>
                          <span className="font-bold text-xl">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Procurement?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations already transforming their procurement processes
          </p>
          
          <Link href="/auth/login">
        <button className="bg-white hover:bg-teal-700 text-teal-900 hover:text-white font-semibold py-3 px-16 rounded-lg transition duration-300">
          Get Started
        </button>
      </Link>

        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-white rounded-full"></div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
               
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