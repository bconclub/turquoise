
'use client';

import { useState, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle, XCircle, Loader, Image as ImageIcon,
  Plus, MapPin, Calendar, Clock, ChevronDown, ChevronUp, AlertCircle,
  Coffee, Moon, Sun, Camera, Info, Landmark, Car, ShoppingBag, 
  Mountain, Waves, Plane, Star, Route, Binoculars
} from 'lucide-react';
import { getDestinations, createDestination } from '@/lib/supabase/queries';
import { supabase } from '@/lib/supabase/client';
import ImagePicker from '@/components/admin/ImagePicker';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Image Picker State
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerType, setImagePickerType] = useState('hero');
  const [heroImage, setHeroImage] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [generating, setGenerating] = useState({ title: false, subtitle: false, description: false });
  
  // Helper function to count sentences
  const countSentences = (text) => {
    if (!text) return 0;
    // Count sentences by splitting on sentence-ending punctuation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.length;
  };
  
  // Helper function to limit description to 3 sentences
  const limitDescription = (text) => {
    if (!text) return '';
    const sentences = text.split(/([.!?]+)/).filter(s => s.trim().length > 0);
    if (sentences.length <= 6) return text; // 3 sentences = 6 parts (sentence + punctuation)
    
    // Take first 3 sentences
    let result = '';
    let sentenceCount = 0;
    for (let i = 0; i < sentences.length && sentenceCount < 3; i++) {
      result += sentences[i];
      if (/[.!?]/.test(sentences[i])) {
        sentenceCount++;
        if (sentenceCount < 3) result += ' ';
      }
    }
    return result.trim();
  };

  // Add Destination State
  const [isAddingDestination, setIsAddingDestination] = useState(false);
  const [newDestinationName, setNewDestinationName] = useState('');
  const [addingDestLoading, setAddingDestLoading] = useState(false);

  // UI State
  const [showItinerary, setShowItinerary] = useState(false);
  const [expandedDays, setExpandedDays] = useState(new Set([1])); // Day 1 expanded by default
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper function to get icon for activity type
  const getActivityIcon = (type) => {
    const iconMap = {
      'cultural': Landmark,
      'transfer': Car,
      'shopping': ShoppingBag,
      'adventure': Mountain,
      'beach': Waves,
      'sightseeing': Camera,
      'leisure': Coffee,
      'show': Star,
      'trek': Route,
      'wildlife': Binoculars,
    };
    return iconMap[type] || Camera;
  };

  const toggleDay = (dayNumber) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayNumber)) {
        newSet.delete(dayNumber);
      } else {
        newSet.add(dayNumber);
      }
      return newSet;
    });
  };

  // Generate title based on package data
  const generateTitle = (data, destination) => {
    if (!data) return '';
    
    const parts = [];
    
    // Add destination name if available
    if (destination?.name) {
      parts.push(destination.name);
    }
    
    // Add cities if available (first 2-3 cities)
    if (data.cities_covered && data.cities_covered.length > 0) {
      const cities = data.cities_covered.slice(0, 3);
      if (cities.length === 1) {
        parts.push(cities[0]);
      } else if (cities.length === 2) {
        parts.push(`${cities[0]} & ${cities[1]}`);
      } else {
        parts.push(`${cities[0]}, ${cities[1]} & ${cities[2]}`);
      }
    }
    
    // Add theme/travel style if available
    if (data.travel_styles && data.travel_styles.length > 0) {
      const style = data.travel_styles[0];
      const styleMap = {
        'cultural': 'Heritage',
        'adventure': 'Adventure',
        'luxury': 'Luxury',
        'historical': 'Historical',
        'beach': 'Beach',
        'wildlife': 'Wildlife',
        'pilgrimage': 'Pilgrimage',
        'honeymoon': 'Romantic'
      };
      const styleName = styleMap[style] || style.charAt(0).toUpperCase() + style.slice(1);
      parts.push(styleName);
    }
    
    // Add "Tour" or "Experience" suffix
    if (parts.length > 0) {
      return `${parts.join(' ')} Tour`;
    }
    
    // Fallback: use first itinerary day title if available
    if (data.itinerary && data.itinerary.length > 0 && data.itinerary[0].title) {
      const dayTitle = data.itinerary[0].title.replace(/^Day\s+\d+:\s*/i, '').trim();
      if (dayTitle) {
        return `${dayTitle} Package`;
      }
    }
    
    return 'Travel Package';
  };

  // Generate content using Claude API
  const generateWithClaude = async (type) => {
    if (!previewData) {
      alert('Please upload and parse a document first');
      return;
    }

    setGenerating(prev => ({ ...prev, [type]: true }));

    try {
      const destination = destinations.find(d => d.id === selectedDestination);
      const packageDataForClaude = {
        ...previewData,
        destination_name: destination?.name || '',
      };

      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          packageData: packageDataForClaude,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content');
      }

      const { content } = await response.json();
      
      if (type === 'title') {
        setPreviewData(prev => ({ ...prev, title: content }));
      } else if (type === 'subtitle') {
        setPreviewData(prev => ({ ...prev, subtitle: content }));
      } else if (type === 'description') {
        setPreviewData(prev => ({ ...prev, description: content }));
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      alert(`Failed to generate ${type}: ${error.message}`);
    } finally {
      setGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  // Auto-generate title when destination is selected and title is empty (fallback)
  useEffect(() => {
    if (previewData && !previewData.title && selectedDestination && destinations.length > 0) {
      const destination = destinations.find(d => d.id === selectedDestination);
      const generatedTitle = generateTitle(previewData, destination);
      if (generatedTitle && generatedTitle !== 'Travel Package') {
        setPreviewData(prev => ({ ...prev, title: generatedTitle }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDestination]);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    const dests = await getDestinations();
    setDestinations(dests);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList) => {
    const docxFiles = fileList.filter(file =>
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    );

    if (docxFiles.length === 0) {
      alert('Please select .docx files only');
      return;
    }
    setFiles(docxFiles);
    setPreviewData(null);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProcessing(true);
    setPreviewData(null);
    setSaveError(null);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Auto-generate title if missing
      if (!data.title) {
        // We'll generate it after destination is selected, but set a placeholder
        data.title = '';
      }
      
      setPreviewData(data);

      // Reset images if new file
      setHeroImage('');
      setThumbnail('');
      
      // Reset expanded days to Day 1
      setExpandedDays(new Set([1]));

    } catch (error) {
      console.error('Upload error:', error);
      setSaveError(error.message || 'Failed to upload and process files');
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleCreateDestination = async () => {
    if (!newDestinationName.trim()) return;

    setAddingDestLoading(true);
    try {
      const newDest = await createDestination(newDestinationName.trim());
      if (newDest) {
        await loadDestinations();
        setSelectedDestination(newDest.id);
        setIsAddingDestination(false);
        setNewDestinationName('');
        alert(`Destination "${newDest.name}" added successfully!`);
      } else {
        alert('Failed to create destination. It might already exist.');
      }
    } catch (error) {
      console.error('Error creating destination:', error);
      alert('Error creating destination');
    } finally {
      setAddingDestLoading(false);
    }
  };

  const validatePackage = () => {
    const errors = [];
    if (!previewData?.title) errors.push('Title is missing');
    if (!selectedDestination) errors.push('Destination is required');
    if (!heroImage) errors.push('Hero Image is required');
    if (!thumbnail) errors.push('Thumbnail is required');
    if (!previewData?.nights && !previewData?.days) errors.push('Duration is missing');
    if (!previewData?.itinerary || previewData.itinerary.length === 0) errors.push('Itinerary is empty');
    // Warnings (not blocking)
    if (!previewData?.cities_covered || previewData.cities_covered.length === 0) {
      console.warn('No cities covered detected - will be auto-calculated from itinerary');
    }
    if (!previewData?.stay_breakdown || previewData.stay_breakdown.length === 0) {
      console.warn('No stay breakdown detected - will be auto-calculated from itinerary');
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validatePackage();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      console.log('💾 [Import] Starting save process...', {
          title: previewData.title,
        destination: selectedDestination,
          nights: previewData.nights,
          days: previewData.days,
        citiesCount: previewData.cities_covered?.length || 0,
        stayBreakdownCount: previewData.stay_breakdown?.length || 0
      });

      // Prepare package data - ALL fields from Data_Structure.md
      const destination = destinations.find(d => d.id === selectedDestination);
      
      // Generate slug from title if not provided
      const generateSlug = (title) => {
        if (!title) return 'travel-package';
        let slug = title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
          .replace(/(^-|-$)+/g, ''); // Remove leading/trailing hyphens
        
        // Ensure slug is not empty
        if (!slug || slug.length === 0) {
          slug = 'travel-package';
        }
        
        // Add timestamp to ensure uniqueness if needed
        // For now, just return the slug - uniqueness will be handled by database constraint
        return slug;
      };
      
      const finalTitle = previewData.title || generateTitle(previewData, destination) || 'Travel Package';
      const finalSlug = previewData.slug && previewData.slug.trim() 
        ? previewData.slug.trim() 
        : generateSlug(finalTitle);
      
      // Final fallback - should never be empty
      if (!finalSlug || finalSlug.trim().length === 0) {
        throw new Error('Unable to generate slug. Please provide a title.');
      }
      
      const packageData = {
        // Basic Info
        title: finalTitle,
        subtitle: previewData.subtitle || null,
        description: previewData.description || null,
        slug: finalSlug,
        
        // Destination
        destination_id: selectedDestination,
        cities_covered: (previewData.cities_covered && previewData.cities_covered.length > 0) ? previewData.cities_covered : [],
        
        // Duration
        nights: previewData.nights || 0,
        days: previewData.days || 0,
        duration_display: previewData.duration_display || `${previewData.days || 0} Days / ${previewData.nights || 0} Nights`,
        
        // Stay
        stay_breakdown: (previewData.stay_breakdown && previewData.stay_breakdown.length > 0) ? previewData.stay_breakdown : [],
        
        // Categories
        travel_styles: previewData.travel_styles || [],
        themes: previewData.themes || [],
        difficulty: previewData.difficulty || 'easy',
        pace: previewData.pace || 'moderate',
        
        // Content
        highlights: previewData.highlights || [],
          includes: previewData.includes || [],
          excludes: previewData.excludes || [],
        important_notes: previewData.important_notes || [],
        
        // Pricing
        starting_price: previewData.starting_price || null,
        currency: previewData.currency || 'INR',
        price_note: previewData.price_note || null,
        
        // Transport
        arrival_point: previewData.arrival_point || null,
        departure_point: previewData.departure_point || null,
        internal_transport: (previewData.internal_transport && previewData.internal_transport.length > 0) ? previewData.internal_transport : [],
        
        // Timing
        best_months: previewData.best_months || [],
        season_note: previewData.season_note || null,
        
        // Media
        hero_image: heroImage,
        thumbnail: thumbnail,
        gallery: previewData.gallery || [],
        
        // Status
        is_active: true,
        is_featured: false,
        is_domestic: destination?.is_domestic || false
      };

      console.log('💾 [Import] Package data prepared:', packageData);

      // 1. Insert Package
      const { data: pkgData, error: pkgError } = await supabase
        .from('packages')
        .insert(packageData)
        .select()
        .single();

      if (pkgError) {
        console.error('❌ [Import] Package insert error:', {
          message: pkgError.message,
          code: pkgError.code,
          details: pkgError.details,
          hint: pkgError.hint
        });
        throw new Error(`Failed to save package: ${pkgError.message || pkgError.code || 'Unknown error'}`);
      }

      console.log('✅ [Import] Package saved:', pkgData.id);

      // 2. Insert Itinerary Days
      if (previewData.itinerary && previewData.itinerary.length > 0) {
        console.log(`💾 [Import] Inserting ${previewData.itinerary.length} itinerary days...`);
        
        const itineraryDays = previewData.itinerary.map(day => ({
          package_id: pkgData.id,
          day_number: day.day_number || day.day,
          title: day.title || `Day ${day.day_number || day.day}`,
          description: day.description || '',
          activities: Array.isArray(day.activities) ? day.activities : [], // JSONB
          meals: Array.isArray(day.meals) ? day.meals : [], // JSONB
          overnight: day.overnight || null,
          route_from: day.route_from || null,
          route_to: day.route_to || null,
          route_mode: day.route_mode || null,
          optionals: Array.isArray(day.optionals) ? day.optionals : [] // JSONB
        }));

        const { data: daysData, error: daysError } = await supabase
          .from('itinerary_days')
          .insert(itineraryDays)
          .select();

        if (daysError) {
          console.error('❌ [Import] Itinerary days insert error:', daysError);
          throw new Error(`Failed to save itinerary: ${daysError.message}`);
        }

        console.log(`✅ [Import] ${daysData?.length || 0} itinerary days saved`);
      } else {
        console.warn('⚠️ [Import] No itinerary days to save');
      }

      setSaveSuccess(true);
      console.log('✅ [Import] Package import completed successfully!');
      
      // Optional: Redirect or clear
      // router.push(`/admin/packages/${pkgData.id}`);
    } catch (error) {
      console.error('❌ [Import] Save error:', error);
      setSaveError(error.message || 'Failed to save package. Please check the console for details.');
    } finally {
      setSaving(false);
    }
  };

  // Validation Status
  const validation = {
    title: !!previewData?.title,
    duration: !!(previewData?.nights || previewData?.days),
    destination: !!selectedDestination,
    hero: !!heroImage,
    thumbnail: !!thumbnail,
    itinerary: !!(previewData?.itinerary?.length > 0),
    citiesCovered: !!(previewData?.cities_covered?.length > 0),
    highlights: !!(previewData?.highlights?.length > 0),
    includes: !!(previewData?.includes?.length > 0),
    excludes: !!(previewData?.excludes?.length > 0),
    stayBreakdown: !!(previewData?.stay_breakdown?.length > 0)
  };

  // Only check required fields for allValid (stay_breakdown is auto-calculated, so it's optional)
  const requiredValidation = {
    title: validation.title,
    duration: validation.duration,
    destination: validation.destination,
    hero: validation.hero,
    thumbnail: validation.thumbnail,
    itinerary: validation.itinerary
  };
  const allValid = Object.values(requiredValidation).every(Boolean);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import Packages</h1>
        <p className="text-gray-600 mt-1">Upload Word documents to bulk import packages</p>
      </div>

      {/* Upload Zone */}
      {!previewData && !saveSuccess && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-colors
              ${dragActive
                ? 'border-turquoise-500 bg-turquoise-50'
                : 'border-gray-300 hover:border-turquoise-400'
              }
            `}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drag & drop Word documents here
            </h3>
            <p className="text-gray-600 mb-4">or</p>
            <label className="inline-flex items-center gap-2 bg-turquoise-600 hover:bg-turquoise-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors">
              <FileText className="w-5 h-5" />
              Select Files
              <input
                type="file"
                multiple
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-4">Accepts .docx files only</p>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Files ({files.length})</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-900">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading || processing}
                className="mt-4 w-full bg-turquoise-600 hover:bg-turquoise-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading || processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Upload & Process'
                )}
              </button>
            </div>
          )}

          {saveError && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {saveError}
            </div>
          )}
        </div>
      )}

      {/* Success View */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">Package Imported Successfully!</h2>
          <p className="text-green-700 mb-6">The package has been saved to the database.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setFiles([]);
                setPreviewData(null);
                setSaveSuccess(false);
                setHeroImage('');
                setThumbnail('');
              }}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Import Another
            </button>
            <button
              onClick={() => router.push('/admin/packages')}
              className="px-6 py-2 bg-turquoise-600 text-white rounded-lg font-semibold hover:bg-turquoise-700"
            >
              View All Packages
            </button>
          </div>
        </div>
      )}

      {/* Preview & Edit Zone */}
      {previewData && !saveSuccess && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Form & Validation */}
          <div className="lg:col-span-1 space-y-6">

            {/* Title & Description Editor */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Package Details</h3>
              
              {/* Title Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  {!previewData.title && (
                    <button
                      onClick={() => generateWithClaude('title')}
                      disabled={generating.title}
                      className="flex items-center gap-1 text-xs text-turquoise-600 hover:text-turquoise-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating.title ? (
                        <>
                          <Loader className="w-3 h-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate with AI'
                      )}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={previewData.title || ''}
                  onChange={(e) => setPreviewData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter package title or click 'Generate Title'"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              {/* Subtitle Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                  <button
                    onClick={() => generateWithClaude('subtitle')}
                    disabled={generating.subtitle}
                    className="flex items-center gap-1 text-xs text-turquoise-600 hover:text-turquoise-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating.subtitle ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate with AI'
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={previewData.subtitle || ''}
                  onChange={(e) => setPreviewData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Short tagline or subtitle"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              {/* Description Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                    <span className="text-xs text-gray-500 ml-2">(Max 3 sentences)</span>
                  </label>
                  <button
                    onClick={() => generateWithClaude('description')}
                    disabled={generating.description}
                    className="flex items-center gap-1 text-xs text-turquoise-600 hover:text-turquoise-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating.description ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate with AI'
                    )}
                  </button>
                </div>
                <textarea
                  value={previewData.description || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    const sentenceCount = countSentences(newValue);
                    
                    // Limit to 3 sentences
                    if (sentenceCount > 3) {
                      const limited = limitDescription(newValue);
                      setPreviewData(prev => ({ ...prev, description: limited }));
                    } else {
                      setPreviewData(prev => ({ ...prev, description: newValue }));
                    }
                  }}
                  placeholder="Package description (2-3 sentences maximum)"
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900 resize-none"
                />
                {previewData.description && (
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {countSentences(previewData.description)} {countSentences(previewData.description) === 1 ? 'sentence' : 'sentences'}
                      {countSentences(previewData.description) >= 3 && (
                        <span className="text-orange-600 ml-2">(Maximum reached)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {previewData.description.length}/500 characters
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Validation Checklist</h3>
              <div className="space-y-2">
                <ValidationItem label="Title" valid={validation.title} />
                <ValidationItem label="Duration" valid={validation.duration} />
                <ValidationItem label="Destination" valid={validation.destination} />
                <ValidationItem label="Hero Image" valid={validation.hero} />
                <ValidationItem label="Thumbnail" valid={validation.thumbnail} />
                <ValidationItem 
                  label={`Cities Covered (${previewData?.cities_covered?.length || 0} cities)`} 
                  valid={validation.citiesCovered} 
                />
                <ValidationItem 
                  label={`Highlights (${previewData?.highlights?.length || 0} items)`} 
                  valid={validation.highlights} 
                />
                <ValidationItem 
                  label={`Includes (${previewData?.includes?.length || 0} items)`} 
                  valid={validation.includes} 
                />
                <ValidationItem 
                  label={`Excludes (${previewData?.excludes?.length || 0} items)`} 
                  valid={validation.excludes} 
                />
                <ValidationItem 
                  label={`Stay Breakdown (${previewData?.stay_breakdown?.length || 0} locations)`} 
                  valid={validation.stayBreakdown} 
                  warning={true}
                />
                <ValidationItem label="Itinerary" valid={validation.itinerary} />
              </div>
            </div>

            {/* Destination Selector */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination *
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900"
                >
                  <option value="">Choose destination...</option>
                  {destinations.map(dest => (
                    <option key={dest.id} value={dest.id}>{dest.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setIsAddingDestination(true)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                  title="Add New Destination"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Add Destination Inline Form */}
              {isAddingDestination && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-xs font-medium text-gray-600 mb-1">New Destination Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDestinationName}
                      onChange={(e) => setNewDestinationName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-turquoise-500 outline-none"
                      placeholder="e.g. France"
                    />
                    <button
                      onClick={handleCreateDestination}
                      disabled={addingDestLoading || !newDestinationName.trim()}
                      className="px-3 py-1.5 bg-turquoise-600 text-white text-sm rounded-md hover:bg-turquoise-700 disabled:opacity-50"
                    >
                      {addingDestLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Add'}
                    </button>
                    <button
                      onClick={() => setIsAddingDestination(false)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Image Uploads */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => { setImagePickerType('hero'); setImagePickerOpen(true); }}
                    className="p-2 bg-turquoise-100 text-turquoise-700 rounded-lg hover:bg-turquoise-200"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>
                {heroImage && (
                  <img src={heroImage} alt="Hero" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => { setImagePickerType('thumbnail'); setImagePickerOpen(true); }}
                    className="p-2 bg-turquoise-100 text-turquoise-700 rounded-lg hover:bg-turquoise-200"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>
                {thumbnail && (
                  <img src={thumbnail} alt="Thumbnail" className="mt-2 w-full h-24 object-cover rounded-lg" />
                )}
              </div>
            </div>

            {/* Save Actions */}
            <button
              onClick={handleSave}
              disabled={!allValid || saving}
              className="w-full py-3 px-6 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-xl font-bold shadow-lg shadow-turquoise-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Confirm & Save Package'
              )}
            </button>

          </div>

          {/* Right Column: Previews */}
          <div className="lg:col-span-2 space-y-8">

            {/* Card Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Card Preview</h3>
              <div className="max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 group cursor-pointer hover:shadow-xl transition-all duration-300">
                {/* Image Area */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={heroImage || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&h=600&fit=crop'}
                    alt={previewData.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Duration Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-turquoise-900 flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {previewData.duration_display || `${previewData.days} Days / ${previewData.nights} Nights`}
                  </div>

                  {/* Destination Badge */}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5 border border-white/20">
                    <MapPin className="w-3.5 h-3.5" />
                    {destinations.find(d => d.id === selectedDestination)?.name || 'Select Destination'}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-turquoise-600 transition-colors">
                    {previewData.title || generateTitle(previewData, destinations.find(d => d.id === selectedDestination)) || 'Untitled Package'}
                  </h3>

                  {/* Subtitle (Short Description) */}
                  {previewData.subtitle && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {previewData.subtitle}
                    </p>
                  )}

                  {/* Description on Card */}
                  {previewData.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {previewData.description}
                    </p>
                  )}

                  {/* Destination with MapPin */}
                  <div className="flex items-center gap-2 text-base text-gray-600 mb-3">
                    <MapPin className="w-5 h-5" />
                    <span>{destinations.find(d => d.id === selectedDestination)?.name || 'Select Destination'}</span>
                  </div>

                  {/* Destinations Covered - Only show if valid cities exist */}
                  {previewData.cities_covered && previewData.cities_covered.length > 0 && previewData.cities_covered.length <= 10 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                        {previewData.cities_covered.slice(0, 5).map((city, idx) => (
                          <span key={idx} className="flex items-center">
                            {idx > 0 && <span className="mx-1 text-gray-400">→</span>}
                            <span>{city}</span>
                      </span>
                    ))}
                        {previewData.cities_covered.length > 5 && (
                          <span className="text-gray-400 ml-1">+{previewData.cities_covered.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Highlights List - Compact format */}
                  {previewData.highlights && previewData.highlights.length > 0 && (
                    <div className="mb-3">
                      <ul className="space-y-1">
                        {(previewData.highlights || []).slice(0, 3).map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <Star className="w-3 h-3 text-turquoise-600 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{highlight}</span>
                          </li>
                        ))}
                    {(previewData.highlights?.length > 3) && (
                          <li className="text-xs text-gray-400 pl-4">
                            +{previewData.highlights.length - 3} more highlights
                          </li>
                    )}
                      </ul>
                  </div>
                  )}

                  {/* Stay Breakdown - Compact format */}
                  {previewData.stay_breakdown && previewData.stay_breakdown.length > 0 && previewData.stay_breakdown.length <= 5 && (
                    <div className="mb-3 text-xs text-gray-500">
                      {previewData.stay_breakdown.map((stay, idx) => (
                        <span key={idx}>
                          <span className="font-medium text-gray-700">{stay.location}</span>
                          <span>: {stay.nights}N</span>
                          {idx < previewData.stay_breakdown.length - 1 && <span className="mx-1">,</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Best time: All Year</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">Starting from</span>
                      <span className="text-lg font-bold text-turquoise-600">₹ --,---</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Itinerary Preview</h3>
                <button
                  onClick={() => setShowItinerary(!showItinerary)}
                  className="text-sm text-turquoise-600 hover:text-turquoise-700 font-medium flex items-center gap-1"
                >
                  {showItinerary ? 'Hide Details' : 'View Full Itinerary'}
                  {showItinerary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showItinerary && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {previewData.itinerary.map((day, index) => {
                    const isExpanded = expandedDays.has(day.day_number);
                    const routeDisplay = day.route_from && day.route_to && day.route_from !== day.route_to
                      ? `${day.route_from} → ${day.route_to}`
                      : (day.overnight || day.route_to || day.route_from || '');
                    
                    return (
                    <div key={index} className="border-b border-gray-100 last:border-0">
                        {/* Day Header - Always Visible */}
                        <button
                          onClick={() => toggleDay(day.day_number)}
                          className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex gap-4 items-start">
                          <div className="flex-shrink-0 w-12 h-12 bg-turquoise-100 rounded-lg flex items-center justify-center text-turquoise-700 font-bold">
                            {day.day_number}
                          </div>
                          <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900">
                                  Day {day.day_number}: {day.title}
                                </h4>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              {routeDisplay && (
                                <p className="text-sm text-gray-600 mb-2">{routeDisplay}</p>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Day Content - Expandable */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pl-20">
                            {/* Description */}
                            {day.description && (
                              <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">
                                {day.description}
                              </p>
                            )}

                            {/* Activities as Chips */}
                            {day.activities && day.activities.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Activities:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {day.activities.map((activity, actIdx) => {
                                    const IconComponent = getActivityIcon(activity.type);
                                    return (
                                      <div
                                        key={actIdx}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-turquoise-50 text-turquoise-700 rounded-lg text-xs font-medium"
                                      >
                                        <IconComponent className="w-3.5 h-3.5" />
                                        <span>{activity.name}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Meals and Overnight */}
                            <div className="flex flex-wrap gap-2">
                              {day.meals && day.meals.length > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">
                                  <Coffee className="w-3.5 h-3.5" />
                                  <span className="capitalize">{day.meals.join(', ')}</span>
                                </div>
                              )}
                              {day.overnight && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                                  <Moon className="w-3.5 h-3.5" />
                                  <span>Overnight: {day.overnight}</span>
                                </div>
                              )}
                            </div>
                                </div>
                              )}
                            </div>
                    );
                  })}

                  {/* Includes/Excludes Preview */}
                  <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 border-t border-gray-200">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Includes
                      </h5>
                      <ul className="space-y-2">
                        {(previewData.includes || []).slice(0, 5).map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-green-500">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Excludes
                      </h5>
                      <ul className="space-y-2">
                        {(previewData.excludes || []).slice(0, 5).map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-red-500">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Image Picker Modal */}
      {imagePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select {imagePickerType === 'hero' ? 'Hero Image' : 'Thumbnail'}</h3>
              <button onClick={() => setImagePickerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <ImagePicker
              type={imagePickerType}
              value={imagePickerType === 'hero' ? heroImage : thumbnail}
              onChange={(url) => {
                if (imagePickerType === 'hero') {
                  setHeroImage(url);
                } else {
                  setThumbnail(url);
                }
                setImagePickerOpen(false);
              }}
              onClose={() => setImagePickerOpen(false)}
              initialSearch={
                imagePickerType === 'hero' && previewData
                  ? (previewData.destination?.primary || previewData.destination?.name || destinations.find(d => d.id === selectedDestination)?.name || '')
                  : ''
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ValidationItem({ label, valid, warning = false }) {
  return (

    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">

      <span className="text-sm text-gray-600">{label}</span>

      {valid ? (

        <CheckCircle className="w-5 h-5 text-green-500" />

      ) : warning ? (
        <AlertCircle className="w-5 h-5 text-yellow-500" />
      ) : (

        <XCircle className="w-5 h-5 text-red-500" />

      )}

    </div>

  );

}


