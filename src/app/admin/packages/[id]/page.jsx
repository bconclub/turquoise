'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPackageForEdit, getItineraryDays, updatePackage, updateItineraryDay, createItineraryDay, getDestinations } from '@/lib/supabase/queries';
import { Save, Eye, ChevronDown, ChevronUp, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
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
    media: false,
    seo: false,
    itinerary: false,
  });
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerType, setImagePickerType] = useState('hero');

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
        hero_image: '',
        thumbnail: '',
        is_active: true,
        is_featured: false,
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
        hero_image: pkgData.hero_image || '',
        thumbnail: pkgData.thumbnail || '',
        is_active: pkgData.is_active !== undefined ? pkgData.is_active : true,
        is_featured: pkgData.is_featured || false,
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
      if (error) throw error;
      alert('Package saved successfully!');
      router.push('/admin/packages');
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Failed to save package');
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={packageData.title || ''}
                onChange={(e) => setPackageData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtitle</label>
              <input
                type="text"
                value={packageData.subtitle || ''}
                onChange={(e) => setPackageData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={packageData.description || ''}
                onChange={(e) => setPackageData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
              />
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
        </div>
      </div>
    </div>
  );
}

