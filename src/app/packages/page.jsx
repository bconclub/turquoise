'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Mountain, Waves, Camera, ShoppingBag, Car, MapPin,
  Coffee, Star, Landmark, Binoculars, Route, ChevronRight, ChevronLeft
} from 'lucide-react';
import { getPackages } from '@/lib/supabase/queries';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EnquiryModal from '@/components/EnquiryModal';

// Map activity types to Lucide icons
const getIconForActivityType = (activityType) => {
  const typeMap = {
    'sightseeing': Camera,
    'cultural': Landmark,
    'adventure': Mountain,
    'beach': Waves,
    'shopping': ShoppingBag,
    'leisure': Coffee,
    'transfer': Car,
    'show': Star,
    'trek': Route,
    'wildlife': Binoculars,
  };
  return typeMap[activityType] || Camera;
};

export default function PackagesPage() {
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [travelType, setTravelType] = useState('all'); // 'all', 'international', 'domestic'
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const packages = await getPackages({});
      setAllPackages(packages || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter packages based on travel type
  const filteredPackages = useMemo(() => {
    if (travelType === 'all') {
      return allPackages;
    } else if (travelType === 'international') {
      return allPackages.filter(pkg => !pkg.is_domestic);
    } else if (travelType === 'domestic') {
      return allPackages.filter(pkg => pkg.is_domestic);
    }
    return allPackages;
  }, [allPackages, travelType]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream">
          <div className="container py-20">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-turquoise-600 to-turquoise-800 text-white py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">All Travel Packages</h1>
            <p className="text-xl text-white/90">Discover amazing destinations around the world</p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="container">
            <div className="flex items-center justify-center gap-4">
              <span className="text-gray-700 font-medium">Filter by:</span>
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTravelType('all')}
                  className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                    travelType === 'all'
                      ? 'bg-turquoise-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Packages
                </button>
                <button
                  onClick={() => setTravelType('international')}
                  className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                    travelType === 'international'
                      ? 'bg-turquoise-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  International
                </button>
                <button
                  onClick={() => setTravelType('domestic')}
                  className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                    travelType === 'domestic'
                      ? 'bg-turquoise-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Domestic
                </button>
              </div>
              <span className="text-gray-600 text-sm">
                {filteredPackages.length} {filteredPackages.length === 1 ? 'package' : 'packages'}
              </span>
            </div>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="py-12">
          <div className="container">
            {filteredPackages.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">No packages found</p>
                <p className="text-gray-500 text-sm mt-2">Try selecting a different filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPackages.map((pkg, index) => {
                  // Get image source - use transformed image field or fallback
                  const fallbackImage = 'https://images.unsplash.com/photo-1512343879784-a960bf40e5f1?q=80&w=800&h=600&fit=crop';
                  let imageSrc = pkg.image || pkg.hero_image || pkg.thumbnail || fallbackImage;
                  
                  // Validate image
                  if (imageSrc && typeof imageSrc === 'string') {
                    const trimmed = imageSrc.trim();
                    if (trimmed === 'null' || trimmed === 'undefined' || trimmed.includes('undefined') || trimmed.includes('null')) {
                      imageSrc = fallbackImage;
                    } else if (!trimmed.startsWith('http') && !trimmed.startsWith('/') && !trimmed.startsWith('data:')) {
                      imageSrc = `/${trimmed}`;
                    }
                  } else {
                    imageSrc = fallbackImage;
                  }

                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-visible border border-gray-200 cursor-pointer group relative flex flex-col h-full"
                    >
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-turquoise-100 to-turquoise-200 rounded-t-xl">
                        <img
                          src={imageSrc}
                          alt={pkg.title || 'Package image'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-xl"
                          onError={(e) => {
                            if (e.target.src !== fallbackImage && !e.target.dataset.fallbackSet) {
                              e.target.src = fallbackImage;
                              e.target.dataset.fallbackSet = 'true';
                            }
                          }}
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="p-4 flex flex-col flex-1">
                        <div className="mb-3 flex-1">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 group-hover:text-turquoise-600 transition-colors line-clamp-2 text-left mb-2">
                            {pkg.title}
                          </h3>
                          {pkg.subtitle && (
                            <p className="text-sm text-gray-600 line-clamp-2 text-left">
                              {pkg.subtitle}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-base text-gray-600 mb-3">
                          <MapPin className="w-5 h-5 flex-shrink-0" />
                          <span className="truncate">{pkg.destination || pkg.destinations?.name || 'Destination'}</span>
                        </div>
                        
                        {/* Activity Type Icons */}
                        {pkg.activityTypes && Array.isArray(pkg.activityTypes) && pkg.activityTypes.length > 0 && (
                          <div className="mb-3 relative -mx-4 px-4 group/activities">
                            <div 
                              className="overflow-x-auto overflow-y-hidden scrollbar-hide cursor-grab active:cursor-grabbing scroll-smooth"
                              style={{ WebkitOverflowScrolling: 'touch' }}
                              onMouseDown={(e) => {
                                const container = e.currentTarget;
                                if (!container) return;
                                const startX = e.pageX - container.offsetLeft;
                                const scrollLeft = container.scrollLeft;
                                let isDown = true;

                                const onMouseMove = (e) => {
                                  if (!isDown || !container) return;
                                  e.preventDefault();
                                  const x = e.pageX - container.offsetLeft;
                                  const walk = (x - startX) * 2;
                                  container.scrollLeft = scrollLeft - walk;
                                };

                                const onMouseUp = () => {
                                  isDown = false;
                                  document.removeEventListener('mousemove', onMouseMove);
                                  document.removeEventListener('mouseup', onMouseUp);
                                };

                                document.addEventListener('mousemove', onMouseMove);
                                document.addEventListener('mouseup', onMouseUp);
                              }}
                            >
                              <div className="flex items-center gap-2 select-none">
                                {pkg.activityTypes.map((activityType, idx) => {
                                  if (!activityType) return null;
                                  const IconComponent = getIconForActivityType(activityType);
                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-1 px-2 py-1 bg-turquoise-50 rounded-md border border-turquoise-200 flex-shrink-0"
                                      title={activityType}
                                    >
                                      <IconComponent className="w-4 h-4 text-turquoise-600 flex-shrink-0" />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {/* Fade-out gradient on the right */}
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none"></div>
                            {/* Scroll arrow indicator */}
                            <div 
                              className="scroll-arrow absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg cursor-pointer opacity-0 group-hover/activities:opacity-100 transition-opacity hover:bg-white hover:scale-110 z-10 pointer-events-auto"
                              onClick={(e) => {
                                const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
                                if (container) {
                                  container.scrollBy({ left: 150, behavior: 'smooth' });
                                }
                              }}
                            >
                              <ChevronRight className="w-4 h-4 text-turquoise-600" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 bg-turquoise-50 px-4 py-3 rounded-lg border border-turquoise-200 mt-auto">
                          <svg className="w-5 h-5 text-turquoise-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-turquoise-700 font-semibold text-base">
                            {pkg.duration || pkg.duration_display || `${pkg.days || pkg.durationDays || 0} Days / ${pkg.nights || pkg.durationNights || 0} Nights`}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => {
                              setSelectedPackage(pkg);
                              setEnquiryModalOpen(true);
                            }}
                            className="flex-1 bg-turquoise-600 hover:bg-turquoise-700 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-colors"
                          >
                            Enquire Now
                          </button>
                          {pkg.slug && (
                            <Link
                              href={`/packages/${pkg.slug}`}
                              className="flex-1 bg-white hover:bg-gray-50 text-turquoise-600 border-2 border-turquoise-600 py-2 px-4 rounded-lg font-semibold text-sm text-center transition-colors"
                            >
                              View Details
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Enquiry Modal */}
      <EnquiryModal 
        isOpen={enquiryModalOpen} 
        onClose={() => {
          setEnquiryModalOpen(false);
          setSelectedPackage(null);
        }}
        packageData={selectedPackage}
      />
    </>
  );
}

