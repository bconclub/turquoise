
'use client';

import { useState, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle, XCircle, Loader, Image as ImageIcon,
  Plus, MapPin, Calendar, Clock, ChevronDown, ChevronUp, AlertCircle,
  Coffee, Moon, Sun, Camera, Info
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

  // Add Destination State
  const [isAddingDestination, setIsAddingDestination] = useState(false);
  const [newDestinationName, setNewDestinationName] = useState('');
  const [addingDestLoading, setAddingDestLoading] = useState(false);

  // UI State
  const [showItinerary, setShowItinerary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      setPreviewData(data);

      // Reset images if new file
      setHeroImage('');
      setThumbnail('');

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
      // 1. Insert Package
      const { data: pkgData, error: pkgError } = await supabase
        .from('packages')
        .insert({
          title: previewData.title,
          subtitle: previewData.subtitle || '',
          description: previewData.description || '',
          destination_id: selectedDestination,
          slug: previewData.slug,
          nights: previewData.nights,
          days: previewData.days,
          duration_display: previewData.duration_display,
          hero_image: heroImage,
          thumbnail: thumbnail,
          includes: previewData.includes || [],
          excludes: previewData.excludes || [],
          highlights: previewData.highlights || [],
          is_active: true, // Default to active? Or draft?
          is_featured: false
        })
        .select()
        .single();

      if (pkgError) throw pkgError;

      // 2. Insert Itinerary Days
      if (previewData.itinerary && previewData.itinerary.length > 0) {
        const itineraryDays = previewData.itinerary.map(day => ({
          package_id: pkgData.id,
          day_number: day.day_number,
          title: day.title,
          description: day.description,
          activities: day.activities, // JSONB
          meals: day.meals, // JSONB
          overnight: day.overnight,
          route_from: day.route_from,
          route_to: day.route_to
        }));

        const { error: daysError } = await supabase
          .from('itinerary_days')
          .insert(itineraryDays);

        if (daysError) throw daysError;
      }

      setSaveSuccess(true);
      // Optional: Redirect or clear
      // router.push(`/admin/packages/${pkgData.id}`);
    } catch (error) {
      console.error('Save error:', error);
      setSaveError(error.message || 'Failed to save package');
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
    itinerary: !!(previewData?.itinerary?.length > 0)
  };

  const allValid = Object.values(validation).every(Boolean);

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

            {/* Validation Checklist */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Validation Checklist</h3>
              <div className="space-y-2">
                <ValidationItem label="Title" valid={validation.title} />
                <ValidationItem label="Duration" valid={validation.duration} />
                <ValidationItem label="Destination" valid={validation.destination} />
                <ValidationItem label="Hero Image" valid={validation.hero} />
                <ValidationItem label="Thumbnail" valid={validation.thumbnail} />
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
                    {previewData.title}
                  </h3>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(previewData.highlights || []).slice(0, 3).map((highlight, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                        {highlight}
                      </span>
                    ))}
                    {(previewData.highlights?.length > 3) && (
                      <span className="text-xs px-2 py-1 bg-gray-50 text-gray-400 rounded-md">
                        +{previewData.highlights.length - 3} more
                      </span>
                    )}
                  </div>

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
                  {previewData.itinerary.map((day, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0">
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-turquoise-100 rounded-lg flex items-center justify-center text-turquoise-700 font-bold">
                            {day.day_number}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{day.title}</h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{day.description}</p>

                            <div className="flex flex-wrap gap-3 text-xs">
                              {day.meals && day.meals.length > 0 && (
                                <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                  <Coffee className="w-3.5 h-3.5" />
                                  <span className="capitalize">{day.meals.join(', ')}</span>
                                </div>
                              )}
                              {day.overnight && (
                                <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                  <Moon className="w-3.5 h-3.5" />
                                  <span>Overnight: {day.overnight}</span>
                                </div>
                              )}
                              {day.activities && day.activities.length > 0 && (
                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>{day.activities.length} Activities</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

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
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ValidationItem({ label, valid }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      {valid ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
    </div>
  );
}
