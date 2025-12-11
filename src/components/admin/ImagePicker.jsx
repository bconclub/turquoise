'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Upload, Link as LinkIcon, X, Loader, Check, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase/client';

// Get Unsplash API key from environment
const UNSPLASH_ACCESS_KEY = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '')
  : '';

export default function ImagePicker({ type = 'hero', value = '', onChange, onClose, defaultTab = 'stock', initialSearch = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [unsplashResults, setUnsplashResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unsplashError, setUnsplashError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [urlInput, setUrlInput] = useState(value || '');
  const [urlPreview, setUrlPreview] = useState(value || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const hasSearchedInitialRef = useRef(false);

  // Image size configs based on type
  const imageConfig = {
    hero: { maxWidth: 1200, maxSizeKB: 100, urlParam: '?w=1200&q=80' },
    thumbnail: { maxWidth: 400, maxSizeKB: 100, urlParam: '?w=400&q=80' },
    gallery: { maxWidth: 1200, maxSizeKB: 100, urlParam: '?w=1200&q=80' },
  };

  const config = imageConfig[type] || imageConfig.hero;

  // Search Unsplash
  useEffect(() => {
    if (activeTab === 'stock' && searchQuery.trim()) {
      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        await searchUnsplash(searchQuery);
      }, 500);
    } else if (activeTab === 'stock' && !searchQuery.trim()) {
      setUnsplashResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, activeTab]);

  const searchUnsplash = async (query) => {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not configured');
      setUnsplashError('API key not configured');
      return;
    }

    setLoading(true);
    setUnsplashError(null);
    try {
      const apiKey = UNSPLASH_ACCESS_KEY.trim();
      
      // Debug: Log the key (first and last few chars only for security)
      console.log('🔑 Using Unsplash API key:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));
      
      // Build URL with proper encoding
      const url = new URL('https://api.unsplash.com/search/photos');
      url.searchParams.append('query', query);
      url.searchParams.append('client_id', apiKey);
      url.searchParams.append('per_page', '20');
      
      console.log('🌐 Unsplash API URL:', url.toString().replace(apiKey, '***HIDDEN***'));
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept-Version': 'v1',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.errors?.[0] || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ Unsplash API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          fullResponse: errorData
        });
        
        // Check if it's an authentication error
        if (response.status === 401 || errorMessage.includes('OAuth') || errorMessage.includes('invalid') || errorMessage.includes('token')) {
          setUnsplashError(`Authentication failed: ${errorMessage}. Please verify your Access Key is correct (not OAuth token) and restart the dev server.`);
        } else {
          setUnsplashError(errorMessage);
        }
        setUnsplashResults([]);
        return;
      }

      const data = await response.json();
      
      console.log('📸 Unsplash API response:', {
        total: data.total,
        total_pages: data.total_pages,
        results_count: data.results?.length || 0,
        first_result: data.results?.[0] || null
      });
      
      if (data.errors) {
        const errorMessage = data.errors[0] || 'Unknown error';
        console.error('Unsplash API errors:', data.errors);
        setUnsplashError(errorMessage);
        setUnsplashResults([]);
        return;
      }

      // Ensure results is an array
      const results = Array.isArray(data.results) ? data.results : [];
      console.log('✅ Parsed results:', results.length, 'photos');
      
      setUnsplashResults(results);
      setUnsplashError(null);
    } catch (error) {
      console.error('Error searching Unsplash:', error);
      setUnsplashError(error.message || 'Failed to search Unsplash');
      setUnsplashResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search on mount if initialSearch is provided
  useEffect(() => {
    if (initialSearch && initialSearch.trim() && activeTab === 'stock' && !hasSearchedInitialRef.current) {
      hasSearchedInitialRef.current = true;
      // Trigger search immediately without debounce for initial search
      searchUnsplash(initialSearch.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearch, activeTab]);

  const handleUnsplashSelect = (photo) => {
    if (!photo || !photo.urls) {
      console.error('Invalid photo object:', photo);
      return;
    }
    
    // Use regular for hero, small for thumbnail
    const selectedUrl = type === 'hero' 
      ? photo.urls.regular || photo.urls.full || photo.urls.small
      : photo.urls.small || photo.urls.thumb;
    
    // Add quality parameter if not already present
    const url = selectedUrl.includes('?') 
      ? `${selectedUrl}&q=80`
      : `${selectedUrl}?w=${type === 'hero' ? 1200 : 400}&q=80`;
    
    console.log('🖼️ Selected image:', url);
    onChange(url);
    if (onClose) onClose();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Compress image
      const options = {
        maxSizeMB: config.maxSizeKB / 1024,
        maxWidthOrHeight: config.maxWidth,
        useWebWorker: true,
        quality: 0.8,
      };

      const compressedFile = await imageCompression(file, options);
      console.log('Original size:', (file.size / 1024).toFixed(2), 'KB');
      console.log('Compressed size:', (compressedFile.size / 1024).toFixed(2), 'KB');

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('package-images')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('package-images')
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      setUploadProgress(100);
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUrlChange = (url) => {
    setUrlInput(url);
    // Validate and preview
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      // Check if it's an image URL
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const isImage = imageExtensions.some(ext => url.toLowerCase().includes(ext)) || 
                     url.includes('unsplash.com') || 
                     url.includes('images.unsplash.com');
      
      if (isImage) {
        setUrlPreview(url);
      } else {
        setUrlPreview('');
      }
    } else {
      setUrlPreview('');
    }
  };

  const handleUrlSelect = () => {
    if (urlPreview) {
      onChange(urlPreview);
      if (onClose) onClose();
    }
  };

  const tabs = [
    { id: 'stock', label: 'Stock Photos', icon: Search },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'url', label: 'URL', icon: LinkIcon },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Select {type === 'hero' ? 'Hero' : type === 'thumbnail' ? 'Thumbnail' : 'Gallery'} Image
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-turquoise-600 dark:text-turquoise-400 border-b-2 border-turquoise-600 dark:border-turquoise-400 bg-turquoise-50 dark:bg-turquoise-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {/* Stock Photos Tab */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for images (e.g., beach, mountain, city)..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
              />
            </div>

            {!UNSPLASH_ACCESS_KEY && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Unsplash API key not configured. Add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to .env.local
                </p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-turquoise-600" />
              </div>
            )}

            {!loading && unsplashResults.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Found {unsplashResults.length} images
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {unsplashResults.map((photo) => {
                    if (!photo || !photo.urls) {
                      console.warn('Invalid photo object:', photo);
                      return null;
                    }
                    
                    const imageUrl = photo.urls.small || photo.urls.thumb || photo.urls.regular;
                    const altText = photo.alt_description || 'Unsplash photo';
                    const photographer = photo.user?.name || 'Unknown';
                    
                    return (
                      <button
                        key={photo.id}
                        onClick={() => handleUnsplashSelect(photo)}
                        className="relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-turquoise-500 transition-all bg-gray-100 dark:bg-gray-700"
                        title={altText}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={altText}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image load error:', imageUrl);
                              e.target.style.display = 'none';
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center">
                          <Check className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity mb-2" />
                          <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center">
                            Photo by {photographer}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {unsplashError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>Error:</strong> {unsplashError}
                </p>
                <div className="text-xs text-red-600 dark:text-red-400 mt-2 space-y-1">
                  <p><strong>To fix this:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Make sure you're using the <strong>Access Key</strong> (not OAuth token)</li>
                    <li>Get it from: Unsplash Dashboard → Your App → Keys section</li>
                    <li>It should look like: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">InCHGBd0jpWYA-MYVCGvsV3SYsczWnWyykdRTn@bo_g</code></li>
                    <li>Add it to <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">.env.local</code> as <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">NEXT_PUBLIC_UNSPLASH_ACCESS_KEY</code></li>
                    <li>Restart your dev server after adding the key</li>
                  </ul>
                </div>
              </div>
            )}

            {!loading && !unsplashError && searchQuery && unsplashResults.length === 0 && UNSPLASH_ACCESS_KEY && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No results found. Try a different search term.
              </div>
            )}

            {!loading && !searchQuery && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Enter a search term to find stock photos
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-colors
                ${dragActive 
                  ? 'border-turquoise-500 bg-turquoise-50 dark:bg-turquoise-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-turquoise-400'
                }
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Drag & drop image here
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">or</p>
              <label className="inline-flex items-center gap-2 bg-turquoise-600 hover:bg-turquoise-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors">
                <Upload className="w-5 h-5" />
                Select File
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Max size: {config.maxSizeKB}KB | Max width: {config.maxWidth}px
              </p>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-turquoise-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
              />
            </div>

            {urlPreview && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</p>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={urlPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setUrlPreview('')}
                  />
                </div>
                <button
                  onClick={handleUrlSelect}
                  className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Use This Image
                </button>
              </div>
            )}

            {urlInput && !urlPreview && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Please enter a valid image URL (jpg, png, webp, gif, or Unsplash URL)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current Image Preview */}
      {value && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Image:</p>
          <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={value}
              alt="Current"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}

