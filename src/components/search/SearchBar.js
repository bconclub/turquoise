'use client';

import { useState } from 'react';
import SearchModal from './SearchModal';

export default function SearchBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    setIsModalOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-2xl rounded-full shadow-2xl border border-white/40 p-2 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 px-4">
            <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search destinations, packages, or experiences..."
              className="flex-1 py-3 text-white placeholder-white/70 bg-transparent border-none outline-none text-base"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-turquoise-500 hover:bg-turquoise-600 text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      <SearchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        searchQuery={searchQuery}
      />
    </>
  );
}

