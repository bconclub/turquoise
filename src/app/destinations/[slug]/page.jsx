'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getDestinationBySlug } from '@/lib/supabase/queries';
import { MapPin, ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  
  const [destinationData, setDestinationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadDestination();
    }
  }, [slug]);

  const loadDestination = async () => {
    setLoading(true);
    try {
      const data = await getDestinationBySlug(slug);
      if (!data) {
        router.push('/destinations');
        return;
      }
      setDestinationData(data);
    } catch (error) {
      console.error('Error loading destination:', error);
      router.push('/destinations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!destinationData) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Destination not found</h1>
            <Link href="/destinations" className="text-turquoise-600 hover:underline">
              Back to Destinations
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const packages = destinationData.packages || [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[400px]">
          {destinationData.hero_image ? (
            <Image
              src={destinationData.hero_image}
              alt={destinationData.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-turquoise-400 to-turquoise-600" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="container relative z-10 h-full flex flex-col justify-end pb-12 text-white">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 mb-6 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Destinations
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {destinationData.name}
            </h1>
            <div className="flex flex-wrap gap-6 text-lg">
              {destinationData.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{destinationData.country}</span>
                </div>
              )}
              {destinationData.region && (
                <span className="text-white/80">{destinationData.region}</span>
              )}
            </div>
          </div>
        </section>

        {/* Destination Content */}
        <section className="py-16">
          <div className="container">
            {/* Description */}
            {destinationData.description && (
              <div className="max-w-4xl mx-auto mb-12">
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: destinationData.description }}
                />
              </div>
            )}

            {/* Packages Grid */}
            {packages.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-turquoise-900 mb-8">
                  Packages in {destinationData.name}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <Link
                      key={pkg.id}
                      href={`/packages/${pkg.slug}`}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                    >
                      {pkg.hero_image || pkg.thumbnail ? (
                        <div className="relative h-48">
                          <Image
                            src={pkg.hero_image || pkg.thumbnail}
                            alt={pkg.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-turquoise-400 to-turquoise-600" />
                      )}
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-turquoise-600 transition-colors">
                          {pkg.title}
                        </h3>
                        {pkg.subtitle && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {pkg.subtitle}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          {pkg.duration_display && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{pkg.duration_display}</span>
                            </div>
                          )}
                          {pkg.starting_price && (
                            <div className="flex items-center gap-1 font-semibold text-turquoise-600">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                {pkg.currency || 'INR'} {pkg.starting_price.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {pkg.highlights && pkg.highlights.length > 0 && (
                          <ul className="space-y-1">
                            {pkg.highlights.slice(0, 2).map((highlight, index) => (
                              <li key={index} className="text-xs text-gray-500 flex items-start gap-1">
                                <span className="text-turquoise-600">•</span>
                                <span className="line-clamp-1">{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {packages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No packages available for this destination yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

