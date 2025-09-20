"use client"
import React from 'react';
import { Building2, Users, FileText, ShoppingCart, CheckCircle, TrendingUp, Shield, Clock } from 'lucide-react';

const AboutUs: React.FC = () => {
  const features = [
    {
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      title: "Vendor Management",
      description: "Comprehensive vendor registration system with detailed company profiles, certifications, and product catalogs for transparent vendor selection."
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "Smart RFP System",
      description: "Create and distribute Request for Proposals with technical and financial sections, reaching the right vendors instantly."
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-purple-600" />,
      title: "Automated Procurement",
      description: "Streamlined procurement process from quote comparison to purchase order generation, reducing manual work and errors."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
      title: "Quote Management",
      description: "Standardized quote submission format with BOQ, specifications, and document uploads for easy comparison and evaluation."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "Performance Analytics",
      description: "Track vendor performance, delivery timelines, and feedback to make data-driven procurement decisions."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Audit Trail",
      description: "Complete transparency and audit trail for all procurement activities, ensuring compliance and accountability."
    }
  ];

  const roles = [
    {
      title: "System Admin",
      description: "Complete backend and frontend management with full system control"
    },
    {
      title: "Procurement Manager",
      description: "Review submissions, shortlist vendors, and make final procurement decisions"
    },
    {
      title: "Procurement Lead",
      description: "Create RFPs and manage vendor communications throughout the process"
    },
    {
      title: "Admin Team",
      description: "Handle goods receipt confirmation and inventory management"
    },
    {
      title: "Finance Team",
      description: "Generate purchase orders and manage payment processing"
    }
  ];

  const process = [
    "Vendor Registration & Verification",
    "RFP Creation & Distribution",
    "Quote Submission & Evaluation",
    "Vendor Selection & Approval",
    "Purchase Order Generation",
    "Delivery & Invoice Management",
    "Payment Processing & Feedback"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-16 text-center">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            About Our Procurement Management System
          </h1>
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
            Revolutionizing organizational procurement through transparency, efficiency, 
            and intelligent vendor management solutions.
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gray-50 rounded-2xl p-12 border-l-8 border-primary">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We address the critical challenges organizations face while procuring assets from multiple vendors. 
            Our comprehensive platform eliminates the complexities of vendor registration, selection processes, 
            and procurement transparency while providing a complete audit trail for compliance and accountability. 
            By streamlining the entire procurement lifecycle, we enable organizations to make informed decisions, 
            reduce costs, and build stronger vendor relationships.
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Why Choose Our Platform?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-gray-800 ml-3">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Process Flow */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Our Streamlined Process
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {step}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Roles */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Role-Based Access Control
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-blue-300 transition-colors">
              <div className="flex items-center mb-3">
                <Users className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {role.title}
                </h3>
              </div>
              <p className="text-gray-600">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Benefits */}
      <div className="bg-primary py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Transform Your Procurement Today
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-white">
            <div className="p-6">
              <Clock className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p>Automate repetitive tasks and reduce procurement cycle time by up to 60%</p>
            </div>
            <div className="p-6">
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Reduce Costs</h3>
              <p>Competitive bidding and transparent pricing lead to better deals</p>
            </div>
            <div className="p-6">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ensure Compliance</h3>
              <p>Complete audit trail and standardized processes for regulatory compliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Streamline Your Procurement?</h3>
          <p className="text-gray-300 mb-6">
            Join hundreds of organizations already transforming their procurement processes
          </p>
          <button className="bg-primary text-white font-semibold py-3 px-8 rounded-lg transition-colors">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;