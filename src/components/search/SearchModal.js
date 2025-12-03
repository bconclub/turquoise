'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getPackages, getDestinations, getTopDestinations } from '@/lib/supabase/queries';

const DURATIONS = ['3-5 days', '6-8 days', '9-12 days', '13+ days'];

export default function SearchModal({ isOpen, onClose, searchQuery = '' }) {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedDestinations, setSelectedDestinations] = useState([]); // Array for multiple selections
  const [selectedDuration, setSelectedDuration] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [allPackages, setAllPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Temporary selections for the destination modal
  const [tempSelectedDestinations, setTempSelectedDestinations] = useState([]);
  const [tempSelectedDuration, setTempSelectedDuration] = useState('');

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync searchQuery prop with internal state when modal opens
  useEffect(() => {
    if (isOpen && searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [isOpen, searchQuery]);

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
      setLoading(true);
      Promise.all([
        getPackages(),
        getDestinations(),
        getTopDestinations(3)
      ]).then(([packages, dests, topDests]) => {
        console.log('Fetched packages:', packages.length, packages);
        console.log('Fetched destinations:', dests.length, dests);
        console.log('Top destinations:', topDests);
        setAllPackages(packages);
        setDestinations(dests);
        setTopDestinations(topDests.length > 0 ? topDests : ['Thailand', 'Maldives', 'Switzerland']); // Fallback
        setLoading(false);
      }).catch(error => {
        console.error('Error loading data:', error);
        setTopDestinations(['Thailand', 'Maldives', 'Switzerland']); // Fallback
        setLoading(false);
      });
    }
  }, [isOpen]);

  const filteredPackages = useMemo(() => {
    const filtered = allPackages.filter(pkg => {
      const matchesSearch = !searchTerm || 
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDestination = selectedDestinations.length === 0 || selectedDestinations.includes(pkg.destination);
      const matchesDuration = !selectedDuration || pkg.duration === selectedDuration;

      return matchesSearch && matchesDestination && matchesDuration;
    });
    
    console.log('Filtered packages:', filtered.length, {
      total: allPackages.length,
      searchTerm,
      selectedDestinations,
      selectedDuration,
      filtered
    });
    
    return filtered;
  }, [allPackages, searchTerm, selectedDestinations, selectedDuration]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div 
        className="relative bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20"
        initial={false}
        animate={{ 
          width: isMobile ? '90%' : (isExpanded ? '90%' : '60%'),
          height: isMobile ? '90vh' : (isExpanded ? '90vh' : '60vh')
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        onClick={() => !isExpanded && !isMobile && setIsExpanded(true)}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20 bg-white/10 backdrop-blur-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Search Packages</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="bg-white/20 backdrop-blur-md rounded-full shadow-lg flex items-center gap-3 px-4 mb-4 border border-white/30">
            <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isExpanded) setIsExpanded(true);
              }}
              placeholder="Search destinations, packages, or experiences..."
              className="flex-1 py-3 text-white placeholder-white/70 bg-transparent border-none outline-none"
              autoFocus
              onClick={() => !isExpanded && setIsExpanded(true)}
            />
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Popular Destinations */}
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-xs font-medium">Popular:</span>
              {topDestinations.map(dest => (
                <button
                  key={dest}
                  onClick={() => {
                    if (selectedDestinations.includes(dest)) {
                      setSelectedDestinations(selectedDestinations.filter(d => d !== dest));
                    } else if (selectedDestinations.length < 3) {
                      setSelectedDestinations([...selectedDestinations, dest]);
                    }
                    setShowFilters(true);
                    if (!isExpanded) setIsExpanded(true);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedDestinations.includes(dest)
                      ? 'bg-white text-turquoise-600 shadow-md'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {dest}
                </button>
              ))}
            </div>
            
            {/* Quick Duration Filters */}
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-xs font-medium">Duration:</span>
              {['3-5 days', '6-8 days', '9-12 days'].map(dur => (
                <button
                  key={dur}
                  onClick={() => {
                    setSelectedDuration(selectedDuration === dur ? '' : dur);
                    setShowFilters(true);
                    if (!isExpanded) setIsExpanded(true);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedDuration === dur
                      ? 'bg-white text-turquoise-600 shadow-md'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-white/20 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-white hover:text-white/80 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {showFilters && (
                <span className="text-sm text-white/70">
                  ({selectedDestinations.length + (selectedDuration ? 1 : 0)} active)
                </span>
              )}
            </button>
            <div className="text-sm text-white/90">
              {filteredPackages.length} packages found
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-end gap-4 mt-4">
              {/* Destination Filter */}
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-white/90 mb-2">Destination</label>
                <button
                  onClick={() => {
                    setTempSelectedDestinations([...selectedDestinations]);
                    setTempSelectedDuration(selectedDuration);
                    setShowDestinationModal(true);
                  }}
                  className="w-full px-3 py-2 text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition-colors text-left flex items-center justify-between"
                >
                  <span>
                    {selectedDestinations.length === 0 
                      ? 'All Destinations' 
                      : selectedDestinations.length === 1
                      ? selectedDestinations[0]
                      : `${selectedDestinations.length} destinations`}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Duration Filter */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-white/90 mb-2">Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                >
                  <option value="" className="text-gray-900">All Durations</option>
                  {DURATIONS.map(dur => (
                    <option key={dur} value={dur} className="text-gray-900">{dur}</option>
                  ))}
                </select>
              </div>

            </div>
          )}

          {/* Active Filters */}
          {(selectedDestinations.length > 0 || selectedDuration) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedDestinations.map((dest, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-turquoise-100 text-turquoise-700 rounded-full text-sm">
                  {dest}
                  <button 
                    onClick={() => setSelectedDestinations(selectedDestinations.filter((_, i) => i !== index))} 
                    className="hover:text-turquoise-900"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedDuration && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-turquoise-100 text-turquoise-700 rounded-full text-sm">
                  {selectedDuration}
                  <button onClick={() => setSelectedDuration('')} className="hover:text-turquoise-900">×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedDestinations([]);
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200 cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-turquoise-100 to-turquoise-200">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 group-hover:text-turquoise-600 transition-colors line-clamp-2">
                        {pkg.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{pkg.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-turquoise-50 px-4 py-3 rounded-lg border border-turquoise-200">
                      <svg className="w-5 h-5 text-turquoise-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-turquoise-700 font-semibold text-base">{pkg.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

