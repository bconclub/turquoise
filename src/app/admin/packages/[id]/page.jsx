'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPackageForEdit, getItineraryDays, updatePackage, updateItineraryDay, createItineraryDay, getDestinations } from '@/lib/supabase/queries';
import { Save, Eye, ChevronDown, ChevronUp, Plus, Trash2, Image as ImageIcon, Sparkles, Loader } from 'lucide-react';
import Link from 'next/link';
import ImagePicker from '@/components/admin/ImagePicker';

export default function EditPackage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id;
  const isNew = packageId === 'new';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [packageData, setPackageData] = useState(null);
  const [itineraryDays, setItineraryDays] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    destination: true,
    content: false,
    additional: false,
    media: false,
    seo: false,
    itinerary: false,
  });
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerType, setImagePickerType] = useState('hero');
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

  useEffect(() => {
    if (!isNew && packageId) {
      loadData();
    } else if (isNew) {
      setPackageData({
        title: '',
        subtitle: '',
        slug: '',
        description: '',
        destination_id: '',
        nights: 0,
        days: 0,
        duration_display: '',
        starting_price: null,
        currency: 'INR',
        highlights: [],
        includes: [],
        excludes: [],
        important_notes: [],
        cities_covered: [],
        stay_breakdown: [],
        travel_styles: [],
        themes: [],
        difficulty: 'easy',
        pace: 'moderate',
        arrival_point: '',
        departure_point: '',
        internal_transport: [],
        best_months: [],
        season_note: '',
        hero_image: '',
        thumbnail: '',
        is_active: true,
        is_featured: false,
        is_domestic: false,
      });
      setLoading(false);
    }
    loadDestinations();
  }, [packageId, isNew]);

  const loadData = async () => {
    if (!packageId || packageId === 'new') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('📦 Loading package data for ID:', packageId);
      
      const [pkgData, itineraryData] = await Promise.all([
        getPackageForEdit(packageId),
        getItineraryDays(packageId),
      ]);
      
      console.log('✅ Loaded package data:', pkgData);
      console.log('✅ Loaded itinerary data:', itineraryData);
      
      if (!pkgData) {
        console.error('❌ Package data is null for ID:', packageId);
        alert('Package not found. Please check if the package exists.');
        router.push('/admin/packages');
        return;
      }
      
      // Ensure all required fields have default values
      const formattedData = {
        ...pkgData,
        title: pkgData.title || '',
        subtitle: pkgData.subtitle || '',
        slug: pkgData.slug || '',
        description: pkgData.description || '',
        destination_id: pkgData.destination_id || (pkgData.destinations?.id || ''),
        nights: pkgData.nights || 0,
        days: pkgData.days || 0,
        duration_display: pkgData.duration_display || '',
        starting_price: pkgData.starting_price || null,
        currency: pkgData.currency || pkgData.price_currency || 'INR',
        highlights: Array.isArray(pkgData.highlights) ? pkgData.highlights : [],
        includes: Array.isArray(pkgData.includes) ? pkgData.includes : [],
        excludes: Array.isArray(pkgData.excludes) ? pkgData.excludes : [],
        important_notes: Array.isArray(pkgData.important_notes) ? pkgData.important_notes : [],
        cities_covered: Array.isArray(pkgData.cities_covered) ? pkgData.cities_covered : [],
        stay_breakdown: Array.isArray(pkgData.stay_breakdown) ? pkgData.stay_breakdown : (pkgData.stay_breakdown ? [pkgData.stay_breakdown] : []),
        travel_styles: Array.isArray(pkgData.travel_styles) ? pkgData.travel_styles : [],
        themes: Array.isArray(pkgData.themes) ? pkgData.themes : [],
        difficulty: pkgData.difficulty || pkgData.difficulty_level || 'easy',
        pace: pkgData.pace || 'moderate',
        arrival_point: pkgData.arrival_point || '',
        departure_point: pkgData.departure_point || '',
        internal_transport: Array.isArray(pkgData.internal_transport) ? pkgData.internal_transport : [],
        best_months: Array.isArray(pkgData.best_months) ? pkgData.best_months : [],
        season_note: pkgData.season_note || '',
        hero_image: pkgData.hero_image || '',
        thumbnail: pkgData.thumbnail || '',
        is_active: pkgData.is_active !== undefined ? pkgData.is_active : true,
        is_featured: pkgData.is_featured || false,
        is_domestic: pkgData.is_domestic || false,
      };
      
      console.log('📝 Formatted package data:', formattedData);
      setPackageData(formattedData);
      setItineraryDays(Array.isArray(itineraryData) ? itineraryData : []);
    } catch (error) {
      console.error('❌ Error loading package:', error);
      alert('Failed to load package: ' + (error.message || 'Unknown error'));
      router.push('/admin/packages');
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    const dests = await getDestinations();
    setDestinations(dests);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updatePackage(packageId, packageData);
      if (error) {
        console.error('❌ [handleSave] Update error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      alert('Package saved successfully!');
      router.push('/admin/packages');
    } catch (error) {
      console.error('❌ [handleSave] Error saving package:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      const errorMessage = error.message || error.code || 'Unknown error';
      const errorDetails = error.details ? `\n\nDetails: ${JSON.stringify(error.details)}` : '';
      const errorHint = error.hint ? `\n\nHint: ${error.hint}` : '';
      alert(`Failed to save package: ${errorMessage}${errorDetails}${errorHint}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addArrayItem = (field) => {
    setPackageData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), ''],
    }));
  };

  const updateArrayItem = (field, index, value) => {
    setPackageData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item),
    }));
  };

  const removeArrayItem = (field, index) => {
    setPackageData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Generate content using Claude API
  const generateWithClaude = async (type) => {
    if (!packageData) {
      alert('Package data is required');
      return;
    }

    setGenerating(prev => ({ ...prev, [type]: true }));

    try {
      const destination = destinations.find(d => d.id === packageData.destination_id);
      const packageDataForClaude = {
        ...packageData,
        destination_name: destination?.name || '',
        itinerary: itineraryDays.map(day => ({
          title: day.title,
          description: day.description,
          activities: day.activities || [],
          overnight: day.overnight,
        })),
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
        setPackageData(prev => ({ ...prev, title: content }));
      } else if (type === 'subtitle') {
        setPackageData(prev => ({ ...prev, subtitle: content }));
      } else if (type === 'description') {
        setPackageData(prev => ({ ...prev, description: content }));
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      alert(`Failed to generate ${type}: ${error.message}`);
    } finally {
      setGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
      </div>
    );
  }

  if (!packageData) {
    return <div>Package not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isNew ? 'New Package' : 'Edit Package'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{packageData.title || 'Package details'}</p>
        </div>
        <div className="flex gap-3">
          {!isNew && packageData.slug && (
            <Link
              href={`/packages/${packageData.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-turquoise-600 hover:bg-turquoise-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
          {expandedSections.basic ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.basic && (
          <div className="px-6 py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
                <button
                  type="button"
                  onClick={() => generateWithClaude('title')}
                  disabled={generating.title}
                  className="flex items-center gap-1 text-xs text-turquoise-600 hover:text-turquoise-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate title with AI based on package data"
                >
                  {generating.title ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={packageData.title || ''}
                onChange={(e) => setPackageData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subtitle</label>
                <button
                  type="button"
                  onClick={() => generateWithClaude('subtitle')}
                  disabled={generating.subtitle}
                  className="flex items-center gap-1 text-xs text-turquoise-600 hover:text-turquoise-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate subtitle with AI based on package data"
                >
                  {generating.subtitle ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={packageData.subtitle || ''}
                onChange={(e) => setPackageData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                placeholder="Short tagline or subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug *</label>
              <input
                type="text"
                value={packageData.slug || ''}
                onChange={(e) => setPackageData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                  <span className="text-xs text-gray-500 ml-2">(Max 3 sentences)</span>
                </label>
                <button
                  type="button"
                  onClick={() => generateWithClaude('description')}
                  disabled={generating.description}
                  className="flex items-center gap-1 text-xs text-turquoise-600 hover:text-turquoise-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate description with AI based on package data"
                >
                  {generating.description ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={packageData.description || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  const sentenceCount = countSentences(newValue);
                  
                  // Limit to 3 sentences
                  if (sentenceCount > 3) {
                    const limited = limitDescription(newValue);
                    setPackageData(prev => ({ ...prev, description: limited }));
                  } else {
                    setPackageData(prev => ({ ...prev, description: newValue }));
                  }
                }}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none resize-none"
                placeholder="Package description (2-3 sentences maximum)"
              />
              {packageData.description && (
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {countSentences(packageData.description)} {countSentences(packageData.description) === 1 ? 'sentence' : 'sentences'}
                    {countSentences(packageData.description) >= 3 && (
                      <span className="text-orange-600 ml-2">(Maximum reached)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {packageData.description.length}/500 characters
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Destination & Duration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('destination')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Destination & Duration</h2>
          {expandedSections.destination ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.destination && (
          <div className="px-6 py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination *</label>
              <select
                value={packageData?.destination_id || ''}
                onChange={(e) => setPackageData(prev => ({ ...prev, destination_id: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select destination</option>
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.id}>{dest.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nights *</label>
                <input
                  type="number"
                  value={packageData?.nights ?? 0}
                  onChange={(e) => setPackageData(prev => ({ ...prev, nights: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Days *</label>
                <input
                  type="number"
                  value={packageData?.days ?? 0}
                  onChange={(e) => setPackageData(prev => ({ ...prev, days: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration Display</label>
                <input
                  type="text"
                  value={packageData?.duration_display || ''}
                  onChange={(e) => setPackageData(prev => ({ ...prev, duration_display: e.target.value }))}
                  placeholder="7 Days / 6 Nights"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Starting Price</label>
                <input
                  type="number"
                  value={packageData?.starting_price ?? ''}
                  onChange={(e) => setPackageData(prev => ({ ...prev, starting_price: parseFloat(e.target.value) || null }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                <select
                  value={packageData?.currency || 'INR'}
                  onChange={(e) => setPackageData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content (Highlights, Includes, Excludes) */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('content')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900">Content</h2>
          {expandedSections.content ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.content && (
          <div className="px-6 py-4 space-y-6 border-t border-gray-200">
            {/* Highlights */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Highlights</label>
                <button
                  onClick={() => addArrayItem('highlights')}
                  className="flex items-center gap-1 text-sm text-turquoise-600 hover:text-turquoise-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(packageData.highlights || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('highlights', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={() => removeArrayItem('highlights', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Includes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Includes</label>
                <button
                  onClick={() => addArrayItem('includes')}
                  className="flex items-center gap-1 text-sm text-turquoise-600 hover:text-turquoise-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(packageData.includes || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('includes', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={() => removeArrayItem('includes', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Excludes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Excludes</label>
                <button
                  onClick={() => addArrayItem('excludes')}
                  className="flex items-center gap-1 text-sm text-turquoise-600 hover:text-turquoise-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(packageData.excludes || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('excludes', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={() => removeArrayItem('excludes', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Important Notes</label>
                <button
                  onClick={() => addArrayItem('important_notes')}
                  className="flex items-center gap-1 text-sm text-turquoise-600 hover:text-turquoise-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(packageData.important_notes || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('important_notes', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={() => removeArrayItem('important_notes', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('additional')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Additional Details</h2>
          {expandedSections.additional ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.additional && (
          <div className="px-6 py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
            {/* Cities Covered */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cities Covered</label>
                <button
                  onClick={() => addArrayItem('cities_covered')}
                  className="flex items-center gap-1 text-sm text-turquoise-600 hover:text-turquoise-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(packageData.cities_covered || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('cities_covered', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                      placeholder="City name"
                    />
                    <button
                      onClick={() => removeArrayItem('cities_covered', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Stay Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stay Breakdown</label>
                <button
                  onClick={() => {
                    setPackageData(prev => ({
                      ...prev,
                      stay_breakdown: [...(prev.stay_breakdown || []), { location: '', nights: 0 }]
                    }));
                  }}
                  className="flex items-center gap-1 text-sm text-turquoise-600 hover:text-turquoise-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(packageData.stay_breakdown || []).map((stay, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={stay.location || ''}
                      onChange={(e) => {
                        setPackageData(prev => ({
                          ...prev,
                          stay_breakdown: prev.stay_breakdown.map((s, i) => 
                            i === index ? { ...s, location: e.target.value } : s
                          )
                        }));
                      }}
                      placeholder="Location"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="number"
                      value={stay.nights || 0}
                      onChange={(e) => {
                        setPackageData(prev => ({
                          ...prev,
                          stay_breakdown: prev.stay_breakdown.map((s, i) => 
                            i === index ? { ...s, nights: parseInt(e.target.value) || 0 } : s
                          )
                        }));
                      }}
                      placeholder="Nights"
                      className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={() => {
                        setPackageData(prev => ({
                          ...prev,
                          stay_breakdown: prev.stay_breakdown.filter((_, i) => i !== index)
                        }));
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Styles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Travel Styles</label>
                <button
                  onClick={() => addArrayItem('travel_styles')}
                  className="flex items-center gap-1 text-sm text-turquoise-600 hover:text-turquoise-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(packageData.travel_styles || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('travel_styles', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                      placeholder="e.g. cultural, luxury, historical"
                    />
                    <button
                      onClick={() => removeArrayItem('travel_styles', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Themes</label>
                <button
                  onClick={() => addArrayItem('themes')}
                  className="flex items-center gap-1 text-sm text-turquoise-600 hover:text-turquoise-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(packageData.themes || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('themes', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                      placeholder="e.g. ancient-ruins, unesco, river-cruise"
                    />
                    <button
                      onClick={() => removeArrayItem('themes', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty & Pace */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                <select
                  value={packageData.difficulty || packageData.difficulty_level || 'easy'}
                  onChange={(e) => setPackageData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pace</label>
                <select
                  value={packageData.pace || 'moderate'}
                  onChange={(e) => setPackageData(prev => ({ ...prev, pace: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                >
                  <option value="relaxed">Relaxed</option>
                  <option value="moderate">Moderate</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </div>

            {/* Arrival & Departure Points */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arrival Point</label>
                <input
                  type="text"
                  value={packageData.arrival_point || ''}
                  onChange={(e) => setPackageData(prev => ({ ...prev, arrival_point: e.target.value }))}
                  placeholder="e.g. Cairo International Airport"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Departure Point</label>
                <input
                  type="text"
                  value={packageData.departure_point || ''}
                  onChange={(e) => setPackageData(prev => ({ ...prev, departure_point: e.target.value }))}
                  placeholder="e.g. Cairo International Airport"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Internal Transport */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Internal Transport</label>
                <button
                  onClick={() => addArrayItem('internal_transport')}
                  className="flex items-center gap-1 text-sm text-turquoise-600 hover:text-turquoise-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(packageData.internal_transport || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('internal_transport', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                      placeholder="e.g. A/C Coach, Domestic Flight, Nile Cruise"
                    />
                    <button
                      onClick={() => removeArrayItem('internal_transport', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Months & Season Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Best Months (1-12, comma-separated)</label>
              <input
                type="text"
                value={(packageData.best_months || []).join(', ')}
                onChange={(e) => {
                  const months = e.target.value.split(',').map(m => parseInt(m.trim())).filter(m => !isNaN(m) && m >= 1 && m <= 12);
                  setPackageData(prev => ({ ...prev, best_months: months }));
                }}
                placeholder="e.g. 10, 11, 12, 1, 2, 3, 4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Season Note</label>
              <input
                type="text"
                value={packageData.season_note || ''}
                onChange={(e) => setPackageData(prev => ({ ...prev, season_note: e.target.value }))}
                placeholder="e.g. Best October to April. Avoid summer heat."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Media */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('media')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Media</h2>
          {expandedSections.media ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.media && (
          <div className="px-6 py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hero Image</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={packageData?.hero_image || ''}
                  onChange={(e) => setPackageData(prev => ({ ...prev, hero_image: e.target.value }))}
                  placeholder="Enter image URL or select from picker"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePickerType('hero');
                    setImagePickerOpen(true);
                  }}
                  className="px-4 py-2 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Select
                </button>
              </div>
              {packageData?.hero_image && (
                <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={packageData.hero_image}
                    alt="Hero preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thumbnail</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={packageData?.thumbnail || ''}
                  onChange={(e) => setPackageData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder="Enter image URL or select from picker"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePickerType('thumbnail');
                    setImagePickerOpen(true);
                  }}
                  className="px-4 py-2 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Select
                </button>
              </div>
              {packageData?.thumbnail && (
                <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={packageData.thumbnail}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Picker Modal */}
      {imagePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-auto">
            <ImagePicker
              type={imagePickerType}
              value={imagePickerType === 'hero' ? (packageData?.hero_image || '') : (packageData?.thumbnail || '')}
              onChange={(url) => {
                if (imagePickerType === 'hero') {
                  setPackageData(prev => ({ ...prev, hero_image: url }));
                } else {
                  setPackageData(prev => ({ ...prev, thumbnail: url }));
                }
                setImagePickerOpen(false);
              }}
              onClose={() => setImagePickerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Status</h2>
        <div className="space-y-4">
          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Active</span>
            <button
              type="button"
              onClick={() => setPackageData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2
                ${packageData.is_active || false 
                  ? 'bg-turquoise-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${packageData.is_active || false ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          
          {/* Featured Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Featured</span>
            <button
              type="button"
              onClick={() => setPackageData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2
                ${packageData.is_featured || false 
                  ? 'bg-turquoise-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${packageData.is_featured || false ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          
          {/* Domestic Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Domestic</span>
            <button
              type="button"
              onClick={() => setPackageData(prev => ({ ...prev, is_domestic: !prev.is_domestic }))}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2
                ${packageData.is_domestic || false 
                  ? 'bg-turquoise-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${packageData.is_domestic || false ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

