'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPackageBySlug } from '@/lib/supabase/queries';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageSlug = searchParams.get('package');
  const name = searchParams.get('name');
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fire Google Analytics event on page load
  useEffect(() => {
    if (typeof gtag !== 'undefined') {
      const packageName = packageData?.title || 'Enquiry';
      gtag('event', 'Package Enquiry Lead', {
        'package_name': packageName,
        'source_page': document.referrer
      });
    }
  }, []);

  // Fetch package data if slug is provided
  useEffect(() => {
    if (packageSlug) {
      setLoading(true);
      getPackageBySlug(packageSlug)
        .then((data) => {
          if (data) {
            setPackageData(data);
          }
        })
        .catch((error) => {
          console.error('Error fetching package:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [packageSlug]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          {/* Thank You Message */}
          <div className="text-center mb-8 md:mb-12">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10 md:w-12 md:h-12 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Thank you{name ? `, ${name}` : ''}!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              We've received your enquiry and will get back to you soon.
            </p>
          </div>

          {/* Package Card */}
          {packageSlug && (
            <div className="mb-8 md:mb-12">
              {loading ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ) : packageData ? (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative h-48 md:h-64 bg-gradient-to-br from-turquoise-500 to-turquoise-700">
                    {packageData.hero_image || packageData.thumbnail ? (
                      <Image
                        src={packageData.hero_image || packageData.thumbnail}
                        alt={packageData.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-turquoise-500 to-turquoise-700" />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                  <div className="p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {packageData.title}
                    </h2>
                    {packageData.subtitle && (
                      <p className="text-gray-600 mb-4">{packageData.subtitle}</p>
                    )}
                    {packageData.duration_display && (
                      <div className="flex items-center gap-2 text-turquoise-600 font-semibold">
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          />
                        </svg>
                        <span>{packageData.duration_display}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-600">
                  Package information not available.
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3 bg-turquoise-600 hover:bg-turquoise-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Back to Home
            </Link>
            <Link
              href="/packages"
              className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-gray-50 text-turquoise-600 border-2 border-turquoise-600 font-semibold rounded-lg transition-colors text-center"
            >
              Browse More Packages
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
