'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDestinationForEdit, updateDestination, createDestination } from '@/lib/supabase/queries';
import { Save, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import ImagePicker from '@/components/admin/ImagePicker';
import { supabase } from '@/lib/supabase/client';

export default function EditDestination() {
  const params = useParams();
  const router = useRouter();
  const destinationId = params.id;
  const isNew = destinationId === 'new';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [destinationData, setDestinationData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    media: false,
    additional: false,
  });
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerType, setImagePickerType] = useState('hero');
  const [imagePickerField, setImagePickerField] = useState('hero_image');

  useEffect(() => {
    if (!isNew && destinationId) {
      loadData();
    } else if (isNew) {
      setDestinationData({
        name: '',
        slug: '',
        country: '',
        country_code: '',
        description: '',
        region_id: null,
        hero_image: '',
        thumbnail: '',
        highlights: [],
        best_months: [],
        visa_info: '',
        currency: '',
        language: '',
        timezone: '',
        // starting_price removed - not in destinations table schema
        is_active: true,
        is_featured: false,
        display_order: 0,
        seo_title: '',
        seo_description: '',
      });
      setLoading(false);
    }
    loadRegions();
  }, [destinationId, isNew]);

  const loadData = async () => {
    if (!destinationId || destinationId === 'new') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getDestinationForEdit(destinationId);
      
      if (!data) {
        alert('Destination not found. Please check if the destination exists.');
        router.push('/admin/destinations');
        return;
      }
      
      setDestinationData({
        ...data,
        region_id: data.region_id || null,
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        best_months: Array.isArray(data.best_months) ? data.best_months : [],
      });
    } catch (error) {
      console.error('Error loading destination:', error);
      alert('Failed to load destination data');
    } finally {
      setLoading(false);
    }
  };

  const loadRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading regions:', error);
      } else {
        setRegions(data || []);
      }
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleSave = async () => {
    if (!destinationData.name) {
      alert('Please enter a destination name');
      return;
    }

    setSaving(true);
    try {
      // Generate slug if not provided
      const slug = destinationData.slug || generateSlug(destinationData.name);
      
      // Clean data - remove fields that shouldn't be saved
      // Note: starting_price is not in destinations table schema, removed
      const dataToSave = {
        name: destinationData.name || '',
        slug: slug,
        country: destinationData.country || null,
        country_code: destinationData.country_code || null,
        description: destinationData.description || null,
        region_id: destinationData.region_id || null,
        hero_image: destinationData.hero_image || null,
        thumbnail: destinationData.thumbnail || null,
        highlights: Array.isArray(destinationData.highlights) ? destinationData.highlights.filter(h => h && h.trim()) : null,
        best_months: Array.isArray(destinationData.best_months) ? destinationData.best_months : null,
        visa_info: destinationData.visa_info || null,
        currency: destinationData.currency || null,
        language: destinationData.language || null,
        timezone: destinationData.timezone || null,
        // starting_price removed - not in destinations table schema
        is_active: destinationData.is_active !== undefined ? destinationData.is_active : true,
        is_featured: destinationData.is_featured !== undefined ? destinationData.is_featured : false,
        display_order: destinationData.display_order ? parseInt(destinationData.display_order) : 0,
        seo_title: destinationData.seo_title || null,
        seo_description: destinationData.seo_description || null,
      };

      // Remove null/empty values for optional fields
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === '' || (Array.isArray(dataToSave[key]) && dataToSave[key].length === 0)) {
          dataToSave[key] = null;
        }
      });

      let result;
      if (isNew) {
        // Create new destination
        const { data, error } = await supabase
          .from('destinations')
          .insert([dataToSave])
          .select()
          .single();

        if (error) {
          console.error('Error creating destination:', error);
          throw error;
        }
        result = data;
        alert('Destination created successfully!');
      } else {
        // Update existing destination
        result = await updateDestination(destinationId, dataToSave);
        alert('Destination updated successfully!');
      }

      router.push('/admin/destinations');
    } catch (error) {
      console.error('Error saving destination:', error);
      const errorMessage = error?.message || 'Unknown error';
      const errorDetails = error?.details ? `\n\nDetails: ${JSON.stringify(error.details)}` : '';
      const errorHint = error?.hint ? `\n\nHint: ${error.hint}` : '';
      alert(`Failed to save destination: ${errorMessage}${errorDetails}${errorHint}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openImagePicker = (type, field) => {
    setImagePickerType(type);
    setImagePickerField(field);
    setImagePickerOpen(true);
  };

  const handleImageSelect = (imageUrl) => {
    setDestinationData(prev => ({
      ...prev,
      [imagePickerField]: imageUrl
    }));
    setImagePickerOpen(false);
  };

  const handleArrayFieldChange = (field, index, value) => {
    setDestinationData(prev => {
      const arr = [...(prev[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field) => {
    setDestinationData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setDestinationData(prev => {
      const arr = [...(prev[field] || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
      </div>
    );
  }

  if (!destinationData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Destination not found</p>
        <Link href="/admin/destinations" className="text-turquoise-600 hover:underline mt-4 inline-block">
          Back to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Add New Destination' : 'Edit Destination'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNew ? 'Create a new destination' : `Editing: ${destinationData.name}`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/destinations"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-turquoise-600 hover:bg-turquoise-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Destination'}
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          {expandedSections.basic ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {expandedSections.basic && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Name *
              </label>
              <input
                type="text"
                value={destinationData.name || ''}
                onChange={(e) => {
                  const name = e.target.value;
                  setDestinationData(prev => ({
                    ...prev,
                    name,
                    slug: prev.slug || generateSlug(name)
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                placeholder="e.g., Gujarat, Karnataka, Jordan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={destinationData.slug || ''}
                onChange={(e) => setDestinationData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                placeholder="Auto-generated from name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={destinationData.country || ''}
                  onChange={(e) => setDestinationData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                  placeholder="e.g., India, Jordan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Code
                </label>
                <input
                  type="text"
                  value={destinationData.country_code || ''}
                  onChange={(e) => setDestinationData(prev => ({ ...prev, country_code: e.target.value.toUpperCase().slice(0, 2) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                  placeholder="e.g., IN, JO"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={destinationData.region_id || ''}
                onChange={(e) => setDestinationData(prev => ({ ...prev, region_id: e.target.value || null }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
              >
                <option value="">Select a region</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={destinationData.description || ''}
                onChange={(e) => setDestinationData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none resize-none"
                placeholder="Destination description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={destinationData.display_order || 0}
                  onChange={(e) => setDestinationData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={destinationData.is_active || false}
                    onChange={(e) => setDestinationData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-turquoise-600 border-gray-300 rounded focus:ring-turquoise-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={destinationData.is_featured || false}
                    onChange={(e) => setDestinationData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 text-turquoise-600 border-gray-300 rounded focus:ring-turquoise-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Media */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('media')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900">Images</h2>
          {expandedSections.media ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {expandedSections.media && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Image
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={destinationData.hero_image || ''}
                  onChange={(e) => setDestinationData(prev => ({ ...prev, hero_image: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                  placeholder="Image URL"
                />
                <button
                  onClick={() => openImagePicker('hero', 'hero_image')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="w-5 h-5" />
                  Pick Image
                </button>
              </div>
              {destinationData.hero_image && (
                <img
                  src={destinationData.hero_image}
                  alt="Hero preview"
                  className="mt-2 w-full h-48 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail Image
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={destinationData.thumbnail || ''}
                  onChange={(e) => setDestinationData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                  placeholder="Image URL"
                />
                <button
                  onClick={() => openImagePicker('thumbnail', 'thumbnail')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="w-5 h-5" />
                  Pick Image
                </button>
              </div>
              {destinationData.thumbnail && (
                <img
                  src={destinationData.thumbnail}
                  alt="Thumbnail preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('additional')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
          {expandedSections.additional ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {expandedSections.additional && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlights
              </label>
              {(destinationData.highlights || []).map((highlight, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleArrayFieldChange('highlights', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                    placeholder="Highlight"
                  />
                  <button
                    onClick={() => removeArrayItem('highlights', index)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('highlights')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Add Highlight
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <input
                  type="text"
                  value={destinationData.currency || ''}
                  onChange={(e) => setDestinationData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                  placeholder="e.g., INR, USD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <input
                  type="text"
                  value={destinationData.language || ''}
                  onChange={(e) => setDestinationData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                  placeholder="e.g., Hindi, English"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <input
                  type="text"
                  value={destinationData.timezone || ''}
                  onChange={(e) => setDestinationData(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                  placeholder="e.g., IST, GMT+5:30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visa Information
              </label>
              <textarea
                value={destinationData.visa_info || ''}
                onChange={(e) => setDestinationData(prev => ({ ...prev, visa_info: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none resize-none"
                placeholder="Visa requirements and information..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Price
              </label>
              <input
                type="number"
                value={destinationData.starting_price || ''}
                onChange={(e) => setDestinationData(prev => ({ ...prev, starting_price: e.target.value ? parseFloat(e.target.value) : null }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
        )}
      </div>

      {/* Image Picker Modal */}
      {imagePickerOpen && (
        <ImagePicker
          type={imagePickerType}
          value={destinationData[imagePickerField] || ''}
          onChange={handleImageSelect}
          onClose={() => setImagePickerOpen(false)}
          defaultTab="stock"
        />
      )}
    </div>
  );
}
