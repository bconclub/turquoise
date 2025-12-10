'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPackageBySlug } from '@/lib/supabase/queries';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  ChevronRight,
  ArrowLeft,
  Check,
  X,
  Camera,
  Utensils,
  Mountain,
  Plane
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EnquiryModal from '@/components/EnquiryModal';

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(null);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const hasRedirectedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const loadPackage = useCallback(async () => {
    if (!slug || hasRedirectedRef.current || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    try {
      const data = await getPackageBySlug(slug);
      if (!data) {
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
        router.push('/packages');
        }
        return;
      }
      setPackageData(data);
    } catch (error) {
      console.error('Error loading package:', error);
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
      router.push('/packages');
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [slug, router]);

  useEffect(() => {
    // Always ensure modal-open class is removed on mount to allow scrolling
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    if (slug) {
      // Reset redirect flag when slug changes
      hasRedirectedRef.current = false;
      loadPackage();
    }
    
    // Cleanup: remove modal-open class when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [slug, loadPackage]);

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

  if (!packageData) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Package not found</h1>
            <Link href="/packages" className="text-turquoise-600 hover:underline">
              Back to Packages
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const destination = packageData.destinations || {};
  const itinerary = packageData.itinerary || [];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sightseeing': return Camera;
      case 'cultural': return Mountain;
      case 'adventure': return Mountain;
      case 'dining': return Utensils;
      case 'transfer': return Plane;
      default: return Camera;
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream overflow-auto">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px]">
          {packageData.hero_image && typeof packageData.hero_image === 'string' && packageData.hero_image.trim() ? (
            <Image
              src={packageData.hero_image}
              alt={packageData.title || 'Package image'}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                console.error('Error loading hero image:', packageData.hero_image);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-turquoise-400 to-turquoise-600" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="container relative z-10 h-full flex flex-col justify-end pb-12 text-white">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 mb-6 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Packages
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {packageData.title}
            </h1>
            {packageData.subtitle && (
              <p className="text-xl md:text-2xl text-white/90 mb-6">
                {packageData.subtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-6 text-lg">
              {destination.name && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{destination.name}</span>
                </div>
              )}
              {packageData.duration_display && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{packageData.duration_display}</span>
                </div>
              )}
              {packageData.starting_price && !isNaN(Number(packageData.starting_price)) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span>
                    From {packageData.currency || 'INR'} {Number(packageData.starting_price).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Package Details */}
        <section className="py-16">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                {packageData.description && (
                  <div>
                    <h2 className="text-3xl font-bold text-turquoise-900 mb-4">Overview</h2>
                    <div 
                      className="prose prose-lg max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: packageData.description }}
                    />
                  </div>
                )}

                {/* Highlights */}
                {packageData.highlights && packageData.highlights.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-turquoise-900 mb-4">Highlights</h2>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {packageData.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-turquoise-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Itinerary */}
                {itinerary.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-turquoise-900 mb-6">Itinerary</h2>
                    <div className="space-y-4">
                      {itinerary.map((day, index) => {
                        const isExpanded = expandedDay === day.id;
                        // Ensure activities is an array - handle JSONB parsing
                        let activities = [];
                        if (day.activities) {
                          if (Array.isArray(day.activities)) {
                            activities = day.activities;
                          } else if (typeof day.activities === 'string') {
                            try {
                              activities = JSON.parse(day.activities);
                            } catch (e) {
                              console.error('Error parsing activities:', e);
                              activities = [];
                            }
                          }
                        }
                        const meals = Array.isArray(day.meals) ? day.meals : [];
                        const dayId = day.id || `day-${index}`;
                        const dayNumber = day.day_number != null && !isNaN(Number(day.day_number)) 
                          ? Number(day.day_number) 
                          : index + 1;
                        
                        return (
                          <div
                            key={dayId}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedDay(isExpanded ? null : dayId)}
                              className="w-full px-6 py-4 bg-turquoise-50 hover:bg-turquoise-100 transition-colors flex items-center justify-between text-left"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-turquoise-600 text-white flex items-center justify-center font-bold text-lg">
                                  {dayNumber}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {day.title || `Day ${dayNumber}`}
                                  </h3>
                                  {day.overnight && (
                                    <p className="text-sm text-gray-600">Overnight: {day.overnight}</p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight
                                className={`w-5 h-5 text-gray-600 transition-transform ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                            
                            {isExpanded && (
                              <div className="p-6 space-y-4">
                                {day.description && (
                                  <p className="text-gray-700">{day.description}</p>
                                )}
                                
                                {day.route && typeof day.route === 'object' && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Plane className="w-4 h-4" />
                                    <span>
                                      {day.route.from || ''} → {day.route.to || ''}
                                      {day.route.distance && typeof day.route.distance === 'string' && ` (${day.route.distance})`}
                                    </span>
                                  </div>
                                )}
                                
                                {activities.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Activities</h4>
                                    <ul className="space-y-2">
                                      {activities.map((activity, actIndex) => {
                                        const Icon = getActivityIcon(activity.type);
                                        return (
                                          <li key={`activity-${dayId}-${actIndex}`} className="flex items-start gap-3">
                                            <Icon className="w-5 h-5 text-turquoise-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                              <span className="font-medium text-gray-900">
                                                {activity.name}
                                              </span>
                                              {activity.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                  {activity.description}
                                                </p>
                                              )}
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                )}
                                
                                {meals.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Meals</h4>
                                    <div className="flex gap-2">
                                      {meals.map((meal, mealIndex) => (
                                        <span
                                          key={`meal-${dayId}-${mealIndex}`}
                                          className="px-3 py-1 bg-turquoise-100 text-turquoise-700 rounded-full text-sm capitalize"
                                        >
                                          {meal}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {day.notes && Array.isArray(day.notes) && day.notes.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                                    <ul className="space-y-1">
                                      {day.notes.map((note, noteIndex) => (
                                        <li key={`note-${dayId}-${noteIndex}`} className="text-sm text-gray-600">
                                          • {note}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Info Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-turquoise-900 mb-4">Package Details</h3>
                  <div className="space-y-4">
                    {destination.name && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Destination</div>
                        <div className="font-semibold text-gray-900">{destination.name}</div>
                        {destination.country && (
                          <div className="text-sm text-gray-600">{destination.country}</div>
                        )}
                      </div>
                    )}
                    
                    {packageData.duration_display && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Duration</div>
                        <div className="font-semibold text-gray-900">{packageData.duration_display}</div>
                      </div>
                    )}
                    
                    {packageData.starting_price && !isNaN(Number(packageData.starting_price)) && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Starting Price</div>
                        <div className="font-semibold text-turquoise-600 text-xl">
                          {packageData.currency || 'INR'} {Number(packageData.starting_price).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setEnquiryModalOpen(true)}
                    className="mt-6 w-full bg-turquoise-600 hover:bg-turquoise-700 text-white px-6 py-3 rounded-lg font-semibold text-center block transition-colors"
                  >
                    Enquire Now
                  </button>
                </div>

                {/* Includes/Excludes */}
                {packageData.includes && packageData.includes.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-turquoise-900 mb-4">Includes</h3>
                    <ul className="space-y-2">
                      {packageData.includes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {packageData.excludes && packageData.excludes.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-turquoise-900 mb-4">Excludes</h3>
                    <ul className="space-y-2">
                      {packageData.excludes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <EnquiryModal 
        isOpen={enquiryModalOpen} 
        onClose={() => setEnquiryModalOpen(false)}
        packageData={packageData}
      />
    </>
  );
}

