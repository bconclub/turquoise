'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getDestinations } from '@/lib/supabase/queries';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Destination image mapping - maps destination names to appropriate images
const getDestinationImage = (destinationName) => {
  if (!destinationName) return null;
  
  const name = destinationName.toLowerCase().trim();
  
  // Map destination names to specific images
  const imageMap = {
    'gujarat': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&h=800&fit=crop', // Rann of Kutch
    'karnataka': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&h=800&fit=crop', // Hampi ruins
    'sikkim': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&h=800&fit=crop', // Mountain landscape
    'darjeeling': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&h=800&fit=crop', // Tea gardens
    'ladakh': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=1200&h=800&fit=crop', // Leh landscape
    'laddakh': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=1200&h=800&fit=crop', // Leh landscape
    'cambodia': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&h=800&fit=crop', // Angkor Wat
    'jordan': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?q=80&w=1200&h=800&fit=crop', // Petra
    'europe': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&h=800&fit=crop', // European architecture
    'croatia': 'https://images.unsplash.com/photo-1555993536-0e6c0c0b0a5a?q=80&w=1200&h=800&fit=crop', // Dubrovnik
    'turkey': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&h=800&fit=crop', // Cappadocia
    'south korea': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&h=800&fit=crop', // Seoul
    'korea': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&h=800&fit=crop', // Seoul
  };
  
  // Check exact match first
  if (imageMap[name]) {
    return imageMap[name];
  }
  
  // Check partial matches
  for (const [key, value] of Object.entries(imageMap)) {
    if (name.includes(key) || key.includes(name)) {
      return value;
    }
  }
  
  return null;
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [destinationsByRegion, setDestinationsByRegion] = useState({});
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch destinations
      const dests = await getDestinations();
      setDestinations(dests || []);

      // Fetch regions
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('id, name, slug, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (regionsError) {
        console.error('Error loading regions:', regionsError);
      } else {
        setRegions(regionsData || []);
      }

      // Group destinations by region
      const grouped = {};
      (dests || []).forEach(dest => {
        const regionId = dest.region_id || 'uncategorized';
        const regionName = dest.region?.name || 'Other Destinations';
        
        if (!grouped[regionId]) {
          grouped[regionId] = {
            id: regionId,
            name: regionName,
            slug: dest.region?.slug || null,
            destinations: []
          };
        }
        grouped[regionId].destinations.push(dest);
      });

      setDestinationsByRegion(grouped);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter destinations based on selected filters
  const filteredDestinationsByRegion = useMemo(() => {
    const filtered = {};
    
    Object.keys(destinationsByRegion).forEach(regionId => {
      const regionGroup = destinationsByRegion[regionId];
      
      // Filter by region
      if (selectedRegion !== 'all' && regionId !== selectedRegion) {
        return; // Skip this region
      }
      
      // Add all destinations for this region
      if (regionGroup.destinations.length > 0) {
        filtered[regionId] = regionGroup;
      }
    });
    
    return filtered;
  }, [destinationsByRegion, selectedRegion]);

  // Sort regions by display_order, then by name
  const sortedRegions = Object.values(filteredDestinationsByRegion).sort((a, b) => {
    const regionA = regions.find(r => r.id === a.id);
    const regionB = regions.find(r => r.id === b.id);
    const orderA = regionA?.display_order || 999;
    const orderB = regionB?.display_order || 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Destinations</h1>
            <p className="text-xl text-white/90">Discover amazing places around the world</p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="container">
            <div className="flex items-center justify-center">
              {/* Region Filter */}
              <div className="flex items-center gap-4 w-full justify-center">
                <div className="flex gap-2 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-hide md:flex-wrap">
                  <button
                    onClick={() => setSelectedRegion('all')}
                    className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                      selectedRegion === 'all'
                        ? 'bg-turquoise-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Regions
                  </button>
                  {regions.map(region => (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                        selectedRegion === region.id
                          ? 'bg-turquoise-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Destinations by Region */}
        <section className="py-12">
          <div className="container">
            {sortedRegions.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">No destinations found</p>
              </div>
            ) : (
              <div className="space-y-16">
                {sortedRegions.map((regionGroup, regionIndex) => (
                  <div key={regionGroup.id || `region-${regionIndex}`}>
                    {/* Region Header */}
                    <div className="mb-8">
                      <h2 className="text-3xl md:text-4xl font-bold text-turquoise-900 mb-2">
                        {regionGroup.name}
                      </h2>
                      <div className="h-1 w-20 bg-turquoise-600 rounded-full"></div>
                    </div>

                    {/* Destinations Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {regionGroup.destinations.map((dest, index) => {
                        const defaultFallback = 'https://images.unsplash.com/photo-1512343879784-a960bf40e5f1?q=80&w=800&h=600&fit=crop';
                        let imageSrc = dest.hero_image || dest.thumbnail;
                        
                        // Validate and clean image source
                        if (imageSrc && typeof imageSrc === 'string') {
                          const trimmed = imageSrc.trim();
                          // Check for invalid values
                          if (!trimmed || 
                              trimmed === 'null' || 
                              trimmed === 'undefined' || 
                              trimmed === 'NULL' ||
                              trimmed === 'UNDEFINED' ||
                              trimmed.toLowerCase() === 'null' ||
                              trimmed.toLowerCase() === 'undefined' ||
                              trimmed.includes('undefined') || 
                              trimmed.includes('null') ||
                              trimmed.length === 0) {
                            imageSrc = null; // Will use destination-specific fallback
                          } else if (!trimmed.startsWith('http') && !trimmed.startsWith('/') && !trimmed.startsWith('data:')) {
                            // Relative path - add leading slash if needed
                            imageSrc = trimmed.startsWith('./') ? trimmed.substring(2) : trimmed;
                            imageSrc = `/${imageSrc}`;
                          }
                        } else {
                          imageSrc = null; // Will use destination-specific fallback
                        }
                        
                        // If no valid image, try destination-specific mapping, then default fallback
                        if (!imageSrc) {
                          const destinationImage = getDestinationImage(dest.name);
                          imageSrc = destinationImage || defaultFallback;
                        }

                        return (
                          <motion.div
                            key={dest.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: (regionIndex * 0.1) + (index * 0.05),
                            }}
                          >
                            <Link
                              href={`/destinations/${dest.slug}`}
                              className="block group relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                            >
                              {/* Destination Image */}
                              <div className="relative w-full h-full">
                                <img
                                  src={imageSrc}
                                  alt={dest.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  onError={(e) => {
                                    if (e.target.src !== fallbackImage && !e.target.dataset.fallbackSet) {
                                      e.target.src = fallbackImage;
                                      e.target.dataset.fallbackSet = 'true';
                                    }
                                  }}
                                  loading="lazy"
                                />
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 transition-colors"></div>
                                
                                {/* Destination Info Overlay */}
                                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-5 h-5 text-turquoise-300" />
                                    {dest.country && (
                                      <span className="text-sm text-white/80">{dest.country}</span>
                                    )}
                                  </div>
                                  <h3 className="text-2xl font-bold mb-1 group-hover:text-turquoise-300 transition-colors">
                                    {dest.name}
                                  </h3>
                                  {dest.package_count > 0 && (
                                    <p className="text-sm text-white/70">
                                      {dest.package_count} {dest.package_count === 1 ? 'package' : 'packages'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
