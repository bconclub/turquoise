'use client';

import { useState, useEffect } from 'react';
import SearchModal from './SearchModal';
import { getTopDestinations } from '@/lib/supabase/queries';

export default function SearchBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [topDestinations, setTopDestinations] = useState(['Goa', 'Andaman & Nicobar', 'Jordan']);
  const [loading, setLoading] = useState(true);

  // Fetch top destinations on mount
  useEffect(() => {
    getTopDestinations(3)
      .then(dests => {
        if (dests && dests.length > 0) {
          setTopDestinations(dests);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading top destinations:', error);
        setLoading(false);
      });
  }, []);

  const handleSearch = () => {
    setIsModalOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDestinationClick = (dest) => {
    if (selectedDestinations.includes(dest)) {
      // If already selected, remove it and open modal
      setSelectedDestinations(selectedDestinations.filter(d => d !== dest));
      setIsModalOpen(true);
    } else if (selectedDestinations.length < 3) {
      // Add destination and open modal
      setSelectedDestinations([...selectedDestinations, dest]);
      setIsModalOpen(true);
    } else {
      // If max selections reached, just open modal
      setIsModalOpen(true);
    }
  };


  return (
    <>
      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-white/20 backdrop-blur-2xl rounded-full shadow-2xl border border-white/50 p-2 flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center gap-3 px-4">
            <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search destinations, packages, or experiences..."
              className="flex-1 py-3 text-white placeholder:text-white bg-transparent border-none outline-none text-sm md:text-base font-semibold"
              style={{ color: '#ffffff' }}
            />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-turquoise-500 hover:bg-turquoise-600 text-white px-4 md:px-8 py-3 rounded-full font-semibold transition-colors flex-shrink-0 text-sm md:text-base shadow-lg"
          >
            Search
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-3 justify-center">
          {/* Popular Destinations */}
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-semibold">Popular:</span>
            {topDestinations.map(dest => (
              <button
                key={dest}
                onClick={() => handleDestinationClick(dest)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedDestinations.includes(dest)
                    ? 'bg-white text-turquoise-600 shadow-md'
                    : 'bg-white/30 text-white hover:bg-white/40 border border-white/40'
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SearchModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
        }}
        searchQuery={searchQuery}
        initialDestinations={selectedDestinations}
        initialDuration=""
      />
    </>
  );
}

