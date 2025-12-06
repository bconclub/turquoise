'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Mountain, Waves, Camera, ShoppingBag, Car, MapPin,
  Coffee, Star, Landmark, Binoculars, Route, ChevronRight, X, ChevronLeft
} from 'lucide-react';
import { getPackages, getDestinations, getTopDestinations, getPackageDetails } from '@/lib/supabase/queries';

const DURATIONS = ['3-5 days', '6-8 days', '9-12 days', '13+ days'];

// Map activity types to Lucide icons based on database activity types
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

  // Return the mapped icon or default to Compass if type not found
  return typeMap[activityType] || Camera; // Default to Camera for unknown types
};

// Get display label for activity type
const getActivityTypeLabel = (activityType) => {
  const labelMap = {
    'sightseeing': 'Sightseeing',
    'cultural': 'Cultural',
    'adventure': 'Adventure',
    'beach': 'Beach',
    'shopping': 'Shopping',
    'leisure': 'Leisure',
    'transfer': 'Transfer',
    'show': 'Show',
    'trek': 'Trek',
    'wildlife': 'Wildlife',
  };

  return labelMap[activityType] || activityType;
};

export default function SearchModal({ isOpen, onClose, searchQuery = '', initialDestinations = [], initialDuration = '' }) {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  // Convert initialDestinations array to single destination string for dropdown
  const [selectedDestination, setSelectedDestination] = useState(
    Array.isArray(initialDestinations) && initialDestinations.length > 0 
      ? initialDestinations[0] 
      : ''
  );
  const [selectedDuration, setSelectedDuration] = useState(initialDuration);
  const [allPackages, setAllPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCards, setShowAllCards] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);


  // Sync searchQuery prop with internal state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (searchQuery) {
        setSearchTerm(searchQuery);
      }
      // Sync initial filters when modal opens
      setSelectedDestination(
        Array.isArray(initialDestinations) && initialDestinations.length > 0 
          ? initialDestinations[0] 
          : ''
      );
      setSelectedDuration(initialDuration);
      setShowAllCards(false); // Reset to show limited cards when modal opens
    }
  }, [isOpen, searchQuery, initialDestinations, initialDuration]);

  // Reset showAllCards when filters change
  useEffect(() => {
    setShowAllCards(false);
  }, [selectedDestination, selectedDuration, searchTerm]);

  // Hide header when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Fetch packages and destinations from Supabase
  useEffect(() => {
    if (isOpen) {
      console.log('🔓 [SearchModal] Modal opened, fetching data...');
      setLoading(true);
      Promise.all([
        getPackages(),
        getDestinations(),
        getTopDestinations(3)
      ]).then(([packages, dests, topDests]) => {
        console.log('📥 [SearchModal] Data fetched:', {
          packagesCount: packages.length,
          destinationsCount: dests.length,
          topDestinations: topDests
        });
        console.log('📦 [SearchModal] First 3 packages:', packages.slice(0, 3));
        console.log('📍 [SearchModal] All destinations:', dests);
        setAllPackages(packages);
        setDestinations(dests);
        setTopDestinations(topDests.length > 0 ? topDests : ['Thailand', 'Maldives', 'Switzerland']); // Fallback
        setLoading(false);
        console.log('✅ [SearchModal] Data loaded, loading set to false');
      }).catch(error => {
        console.error('❌ [SearchModal] Error loading data:', error);
        console.error('❌ [SearchModal] Error stack:', error.stack);
        setTopDestinations(['Thailand', 'Maldives', 'Switzerland']); // Fallback
        setLoading(false);
      });
    }
  }, [isOpen]);

  const filteredPackages = useMemo(() => {
    console.log('🔍 [SearchModal] Filtering packages...', {
      totalPackages: allPackages?.length || 0,
      searchTerm,
      selectedDestination,
      selectedDuration
    });
    
    if (!allPackages || allPackages.length === 0) {
      console.warn('⚠️ [SearchModal] No packages to filter');
      return [];
    }

    console.log('📋 [SearchModal] Sample package structure:', allPackages[0]);

    const filtered = allPackages.filter((pkg, index) => {
      // Search filter - check title, subtitle, and destination
      const matchesSearch = !searchTerm || 
        pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.highlights?.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Destination filter - check if package destination matches selected destination
      const matchesDestination = !selectedDestination || 
        (pkg.destination && pkg.destination === selectedDestination);
      
      // Duration filter - compare formatted duration strings
      const matchesDuration = !selectedDuration || pkg.duration === selectedDuration;

      const matches = matchesSearch && matchesDestination && matchesDuration;
      
      if (index < 3) {
        console.log(`🔎 [SearchModal] Package ${index + 1} "${pkg.title}":`, {
          matchesSearch,
          matchesDestination,
          matchesDuration,
          finalMatch: matches,
          destination: pkg.destination,
          duration: pkg.duration
        });
      }

      return matches;
    });
    
    console.log('✅ [SearchModal] Filtering complete:', {
      total: allPackages.length,
      filtered: filtered.length,
      searchTerm,
      selectedDestination,
      selectedDuration,
      firstFiltered: filtered[0] || null
    });
    
    return filtered;
  }, [allPackages, searchTerm, selectedDestination, selectedDuration]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Full Screen */}
      <motion.div 
        className="relative bg-white/10 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {/* Search Bar at Top */}
        <div className="p-4 border-b border-white/20 bg-white/10 backdrop-blur-xl text-white">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 bg-white/20 backdrop-blur-md rounded-full shadow-lg flex items-center gap-3 px-4 border border-white/30">
              <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search destinations, packages, or experiences..."
              className="flex-1 py-3 text-white placeholder-white/70 bg-transparent border-none outline-none"
              autoFocus
              />
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 md:p-4 border-b border-white/20 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 md:gap-4 flex-nowrap overflow-x-auto">
            {/* Filters Label */}
            <div className="flex items-center gap-1 md:gap-2 text-white font-medium flex-shrink-0 text-sm md:text-base">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {(selectedDestination || selectedDuration) && (
                <span className="text-xs md:text-sm text-white/70">
                  ({(selectedDestination ? 1 : 0) + (selectedDuration ? 1 : 0)})
                </span>
              )}
            </div>

            {/* Destination Filter */}
            <div className="flex-1 min-w-[140px] md:min-w-[180px] md:max-w-[200px]">
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
              >
                <option value="" className="text-gray-900">All Destinations</option>
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.name} className="text-gray-900">{dest.name}</option>
                ))}
              </select>
            </div>

            {/* Duration/Days Filter */}
            <div className="flex-1 min-w-[120px] md:min-w-[150px] md:max-w-[180px]">
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
              >
                <option value="" className="text-gray-900">All Durations</option>
                {DURATIONS.map(dur => (
                  <option key={dur} value={dur} className="text-gray-900">{dur}</option>
                ))}
              </select>
            </div>

            {/* Packages Count */}
            <div className="text-xs md:text-sm text-white/90 ml-auto flex-shrink-0 whitespace-nowrap">
              {filteredPackages.length} found
            </div>
          </div>

          {/* Active Filters */}
          {(selectedDestination || selectedDuration) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedDestination && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-turquoise-100 text-turquoise-700 rounded-full text-sm">
                  {selectedDestination}
                  <button 
                    onClick={() => setSelectedDestination('')} 
                    className="hover:text-turquoise-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedDuration && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-turquoise-100 text-turquoise-700 rounded-full text-sm">
                  {selectedDuration}
                  <button onClick={() => setSelectedDuration('')} className="hover:text-turquoise-900">×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedDestination('');
                  setSelectedDuration('');
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Packages List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600 mx-auto mb-4"></div>
              <p className="text-white/90 text-lg">Loading packages...</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white/90 text-lg">No packages found</p>
              <p className="text-white/70 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {(showAllCards ? filteredPackages : filteredPackages.slice(0, 20)).map((pkg, index) => (
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
                  onClick={async () => {
                    setSelectedPackage(pkg);
                    setLoadingDetails(true);
                    setSelectedImageIndex(0);
                    const details = await getPackageDetails(pkg.id);
                    setPackageDetails(details);
                    setLoadingDetails(false);
                  }}
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-turquoise-100 to-turquoise-200 rounded-t-xl">
                    {(() => {
                      // Use a travel/desert themed fallback for Jordan, otherwise generic travel image
                      const isJordan = pkg.destination?.toLowerCase().includes('jordan');
                      const fallbackImage = isJordan 
                        ? 'https://images.unsplash.com/photo-1512343879784-a960bf40e5f1?q=80&w=800&h=600&fit=crop'
                        : 'https://images.unsplash.com/photo-1512343879784-a960bf40e5f1?q=80&w=800&h=600&fit=crop';
                      
                      let imageSrc = fallbackImage;
                      
                      // Better image validation
                      if (pkg.image && typeof pkg.image === 'string') {
                        const trimmed = pkg.image.trim();
                        // Check if it's a valid URL or path
                        const isValid = trimmed !== '' && 
                                       trimmed !== 'null' && 
                                       trimmed !== 'undefined' &&
                                       !trimmed.includes('undefined') && 
                                       !trimmed.includes('null') &&
                                       (trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('data:'));
                        
                        if (isValid) {
                          imageSrc = trimmed;
                        }
                      }
                      
                      return (
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
                          onLoad={(e) => {
                            // Reset error flag on successful load
                            e.target.dataset.fallbackSet = 'false';
                          }}
                          loading="lazy"
                        />
                      );
                    })()}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-3 flex-1">
                      <h3 className="text-lg md:text-[1.5125rem] font-semibold text-gray-900 group-hover:text-turquoise-600 transition-colors line-clamp-2 text-left mb-2">
                        {pkg.title}
                      </h3>
                      {pkg.subtitle && (
                        <p className="text-sm text-gray-600 line-clamp-2 text-left">
                          {pkg.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-base md:text-lg text-gray-600 mb-3">
                      <MapPin className="w-5 h-5" />
                      <span>{pkg.destination}</span>
                    </div>
                    
                    {/* Activity Type Icons */}
                    {pkg.activityTypes && Array.isArray(pkg.activityTypes) && pkg.activityTypes.length > 0 && (
                      <div className="mb-3 relative -mx-4 px-4 group/activities">
                        <div 
                          ref={(el) => {
                            if (el) {
                              const checkScroll = () => {
                                const hasScroll = el.scrollWidth > el.clientWidth;
                                const isScrolledRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
                                const arrow = el.parentElement?.querySelector('.scroll-arrow');
                                if (arrow) {
                                  arrow.style.display = hasScroll && !isScrolledRight ? 'flex' : 'none';
                                }
                              };
                              el.addEventListener('scroll', checkScroll);
                              checkScroll();
                              // Check on resize
                              const resizeObserver = new ResizeObserver(checkScroll);
                              resizeObserver.observe(el);
                            }
                          }}
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
                                  title={getActivityTypeLabel(activityType)}
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
                          onMouseEnter={(e) => {
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
                      <svg className="w-5 h-5 text-turquoise-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-turquoise-700 font-semibold text-base">{pkg.duration}</span>
                    </div>
                  </div>
                </motion.div>
                ))}
              </div>
              
              {/* Show More Button */}
              {!showAllCards && filteredPackages.length > 20 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllCards(true)}
                    className="px-6 py-3 bg-turquoise-500 hover:bg-turquoise-600 text-white rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl"
                  >
                    +{filteredPackages.length - 20} more packages
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setSelectedPackage(null);
              setPackageDetails(null);
              setSelectedImageIndex(0);
            }}
          />
          
          {/* Detail Modal - Mobile: 70% height, Desktop: centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-4xl h-[70vh] md:h-auto md:max-h-[85vh] md:max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedPackage(null);
                setPackageDetails(null);
                setSelectedImageIndex(0);
              }}
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {loadingDetails ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
              </div>
            ) : packageDetails ? (
              <div className="flex flex-col md:flex-row h-full overflow-hidden">
                {/* Image Gallery - Mobile: Top, Desktop: Left */}
                <div className="w-full md:w-1/2 h-48 md:h-auto bg-gray-100 relative flex-shrink-0">
                  {packageDetails.images && packageDetails.images.length > 0 ? (
                    <>
                      {/* Main Image */}
                      <div className="relative w-full h-full">
                        <img
                          src={packageDetails.images[selectedImageIndex] || packageDetails.images[0]}
                          alt={packageDetails.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Navigation Arrows */}
                        {packageDetails.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) => 
                                  prev === 0 ? packageDetails.images.length - 1 : prev - 1
                                );
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                            >
                              <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) => 
                                  prev === packageDetails.images.length - 1 ? 0 : prev + 1
                                );
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                            >
                              <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                          </>
                        )}
                        {/* Image Indicator */}
                        {packageDetails.images.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {packageDetails.images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImageIndex(idx);
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === selectedImageIndex ? 'bg-white w-6' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Thumbnail Gallery */}
                      {packageDetails.images.length > 1 && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm overflow-x-auto scrollbar-hide">
                          <div className="flex gap-2">
                            {packageDetails.images.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImageIndex(idx);
                                }}
                                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                                  idx === selectedImageIndex ? 'border-turquoise-500' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={img} alt={`${packageDetails.title} ${idx + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-turquoise-100 to-turquoise-200 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-turquoise-300" />
                    </div>
                  )}
                </div>

                {/* Content - Mobile: Bottom, Desktop: Right */}
                <div className="w-full md:w-1/2 relative flex flex-col overflow-hidden">
                  {/* Scrollable Content */}
                  <div className="overflow-y-auto p-6 md:p-8 text-left flex-1">
                    {/* 2. HEADER */}
                    <div className="mb-6">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {packageDetails.title}
                    </h2>
                    {packageDetails.subtitle && (
                        <p className="text-lg text-gray-600 mb-3">{packageDetails.subtitle}</p>
                    )}
                      {/* Duration Badge */}
                      {(packageDetails.duration_display || selectedPackage.duration) && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-turquoise-100 text-turquoise-700 rounded-full text-sm font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{packageDetails.duration_display || selectedPackage.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* 3. DESTINATIONS COVERED */}
                    {packageDetails.cities_covered && packageDetails.cities_covered.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Destinations Covered</h3>
                        <div className="flex flex-wrap gap-2">
                          {packageDetails.cities_covered.map((city, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {idx > 0 && <span className="text-gray-400">→</span>}
                              <span>{city}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. STAY BREAKDOWN */}
                    {packageDetails.stay_breakdown && packageDetails.stay_breakdown.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Stay Breakdown</h3>
                        <div className="space-y-2">
                          {packageDetails.stay_breakdown.map((stay, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-gray-900 font-medium">{stay.location}</span>
                              <span className="text-gray-600 text-sm">{stay.nights} {stay.nights === 1 ? 'Night' : 'Nights'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. HIGHLIGHTS */}
                    {packageDetails.highlights && packageDetails.highlights.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h3>
                        <ul className="space-y-2">
                          {packageDetails.highlights.slice(0, 6).map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <Star className="w-5 h-5 text-turquoise-600 flex-shrink-0 mt-0.5" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 6. KEY EXPERIENCES (Filtered Activities) */}
                    {(() => {
                      // Filter activities: exclude transfer and leisure types
                      const keyExperiences = packageDetails.activities?.filter(activity => 
                        activity.type !== 'transfer' && 
                        activity.type !== 'leisure' &&
                        !activity.name.toLowerCase().includes('arrival') &&
                        !activity.name.toLowerCase().includes('departure') &&
                        !activity.name.toLowerCase().includes('check-in') &&
                        !activity.name.toLowerCase().includes('breakfast') &&
                        !activity.name.toLowerCase().includes('lunch') &&
                        !activity.name.toLowerCase().includes('dinner') &&
                        !activity.name.toLowerCase().includes('overnight')
                      ) || [];

                      if (keyExperiences.length > 0) {
                        return (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Experiences</h3>
                            <div className="space-y-2">
                              {keyExperiences.map((activity, idx) => {
                            const IconComponent = getIconForActivityType(activity.type);
                            return (
                                  <div key={idx} className="flex items-start gap-3 p-3 bg-turquoise-50 rounded-lg">
                                <IconComponent className="w-5 h-5 text-turquoise-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{activity.name}</p>
                                  {activity.description && (
                                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Package Info Footer */}
                    <div className="border-t pt-4 mt-auto">
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{packageDetails.destinations?.name || selectedPackage.destination}</span>
                        </div>
                      </div>
                      {packageDetails.starting_price && (
                        <div className="text-xl font-bold text-turquoise-600 mb-4">
                          From {packageDetails.starting_price.toLocaleString()} {packageDetails.currency || 'INR'}
                        </div>
                      )}
                      
                      {/* View Complete Itinerary Button - Mobile */}
                      {packageDetails.slug && (
                        <Link
                          href={`/packages/${packageDetails.slug}`}
                          className="block w-full bg-turquoise-600 hover:bg-turquoise-700 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl md:hidden"
                          onClick={() => {
                            setSelectedPackage(null);
                            setPackageDetails(null);
                            setSelectedImageIndex(0);
                          }}
                        >
                          View Complete Itinerary
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Sticky Button at Bottom Right - Desktop */}
                  {packageDetails.slug && (
                    <div className="sticky bottom-0 p-6 md:p-8 pt-0 bg-white/10 backdrop-blur-xl border-t border-white/20 md:flex hidden justify-center">
                      <Link
                        href={`/packages/${packageDetails.slug}`}
                        className="bg-turquoise-600/90 hover:bg-turquoise-700/90 backdrop-blur-sm text-white py-3 px-8 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl border border-white/20"
                        onClick={() => {
                          setSelectedPackage(null);
                          setPackageDetails(null);
                          setSelectedImageIndex(0);
                        }}
                      >
                        View Complete Itinerary
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-600">Unable to load package details</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

