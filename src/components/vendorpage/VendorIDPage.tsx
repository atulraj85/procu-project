"use client";

import React, { useState } from "react";
import {
  Building2,
  Globe,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Users,
  BadgeDollarSign,
  Shield,
  Calendar,
  Building,
  Facebook,
  Twitter,
  QuoteIcon,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import ExploreCompanies from "@/components/homePage/Vendor2";
import Link from "next/link";
import TestimonialSection from "@/components/homePage/Testimony";
import { VendorProfile } from "@/components/shared/vendor/VendorPage";
import { VendorCertifications } from "@/components/shared/vendor/Certificate";

// Types for Vendor
interface Vendor extends VendorData {
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface VendorData {
  pictures: any;
  id: number;
  userId:string;
  createdAt:string;
  updatedAt:string;
  companyName: string;
  legalEntityType: string;
  taxId: string;
  establishmentYear: number;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    [key: string]: string | undefined;
  };
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  headquartersAddress: string;
  operatingCountries: string[];
  employeeCountRange: string;
  annualRevenueRange: string;
  regulatoryLicenses: string[];
  insuranceCoverage: {
    generalLiability: boolean;
    professionalLiability: boolean;
  };
  certifications: VendorCertification[];
  references: VendorReference[];
}

interface VendorCertification {
  id: number;
  vendorId: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
}

interface VendorReference {
  id: number;
  vendorId: number;
  clientCompanyName: string;
  clientIndustry: string;
  projectDescription: string;
  servicePeriodStart: string;
  servicePeriodEnd: string;
  contactPersonName: string;
  contactEmail: string;
  isPublic: boolean;
}

// Props types for components
export interface Certification {
  id: number;
  vendorId: number;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  certificationNumber?: string;
  verificationUrl?: string;
}
interface VendorCertificationsProps {
certifications: Certification[];
}
export default function VendorDetails({ params }: { params: { id: string } }) {
  const [data, setData] = useState<VendorData | any | null>(null);
  console.log("data",data);
  
  const [services, setServices] = useState([]);
 console.log("data",data);
 
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorResponse] = await Promise.all([
          fetch(`/api/vendor?id=${params.id}`),
          // fetch(`/api/vendorservice?vendorId=${params.id}`),
        ]);

        const vendorData = await vendorResponse.json();
        // const servicesData = await servicesResponse.json();

        setData(vendorData.data);
        // setServices(servicesData);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };

    fetchData();
  }, [params.id]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {data.companyName}
            </h1>

            <div className="flex space-x-4">
              {data.socialLinks &&
                Object.entries(data.socialLinks).map(([platform, url]: any) => {
                  const Icon =
                    platform === "twitter"
                      ? Twitter
                      : platform === "facebook"
                      ? Facebook
                      : platform === "linkedin"
                      ? Linkedin
                      : Globe; // Fallbac

                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Icon className="h-6 w-6" />
                    </a>
                  );
                })}
            </div>
          </div>

          {/* Company Info Cards */}
          <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-4">
            {data.legalEntityType && (
              <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <Building2 className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Legal Entity
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {data.legalEntityType}
                  </p>
                </div>
              </div>
            )}

            {data.headquartersAddress && (
              <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <MapPin className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Headquarters
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {data.headquartersAddress}
                  </p>
                </div>
              </div>
            )}

            {data.employeeCountRange && (
              <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <Users className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Employees</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {data.employeeCountRange}
                  </p>
                </div>
              </div>
            )}

            {data.annualRevenueRange && (
              <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <BadgeDollarSign className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Annual Revenue
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {data.annualRevenueRange}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}

         
          <div className="lg:col-span-2 space-y-8">
          <VendorProfile vendor={data} />
            {/* Company Pictures */}
            {data.pictures?.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm overflow-hidden">
                <ExploreCompanies companies={data.pictures} />
              </section>
            )}

            {/* Services */}
            {services.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                  <Shield className="h-6 w-6 text-blue-500 mr-2" />
                  Services
                </h2>
                <div className="grid gap-4">
                  {services.map((service: any) => (
                    <Link
                      href={`/vendor/service/${service.service.id}`}
                      key={service.service.id}
                    >
                      <div className="group p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-400 transition-all duration-200">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {service.service.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {service.service.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Testimonials */}
           
          </div>

          {/* Sidebar */}
          {/* <div className="space-y-8">
            Contact Information
            {(data.primaryContactEmail || data.primaryContactPhone) && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Primary Contact
                </h2>
                <div className="space-y-4">
                  {data.primaryContactEmail && (
                    <a
                      href={`mailto:${data.primaryContactEmail}`}
                      className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="h-5 w-5 mr-3" />
                      <span>{data.primaryContactEmail}</span>
                    </a>
                  )}

                  {data.primaryContactPhone && (
                    <a
                      href={`tel:${data.primaryContactPhone}`}
                      className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="h-5 w-5 mr-3" />
                      <span>{data.primaryContactPhone}</span>
                    </a>
                  )}
                </div>
              </section>
            )}
          </div> */}

          {/* Certifications */}
          {/* {data.certifications?.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Certifications
              </h2>
              <p className="text-sm text-gray-900">
                {data.certifications.map((cert, index) => (
                  <span key={cert.id}>
                    {cert.name}
                    {index < data.certifications.length - 1 && " | "}
                  </span>
                ))}
              </p>
            </section>
          )} */}
          <div className="w-full">
{data.references && data.references.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Client Testimonials
                </h2>
                <div className="grid gap-1 sm:grid-cols-1">
                  {data.references.map((reference :any) => (
                    <div
                      key={reference.id}
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <QuoteIcon className="h-5 w-5 text-blue-500" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {reference.clientCompanyName || "Company"}
                        </h3>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">
                        {reference.projectDescription ||
                          "No description available"}
                      </p>

                      <div className="space-y-2 text-sm">
                        <p className="text-gray-500">
                          <span className="font-medium">Industry:</span>{" "}
                          {reference.clientIndustry || "N/A"}
                        </p>
                        <p className="text-gray-500">
                          <span className="font-medium">Period:</span>{" "}
                          {new Date(
                            reference.servicePeriodStart
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            reference.servicePeriodEnd
                          ).toLocaleDateString()}
                        </p>

                        {reference.isPublic && reference.contactPersonName && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="font-medium text-gray-900">
                              {reference.contactPersonName}
                            </p>
                            <a
                              href={`mailto:${reference.contactEmail}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {reference.contactEmail}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            </div>
        
        </div>
        {data.certifications && data.certifications.length > 0 && (
                  <VendorCertifications certifications={data.certifications} />
                )}
      </main>
    </div>
  );
}
