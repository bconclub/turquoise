'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader, Image as ImageIcon } from 'lucide-react';
import { getDestinations } from '@/lib/supabase/queries';
import ImagePicker from '@/components/admin/ImagePicker';

export default function ImportPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerType, setImagePickerType] = useState('hero');
  const [heroImage, setHeroImage] = useState('');
  const [thumbnail, setThumbnail] = useState('');

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
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    setProcessing(true);

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
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setPreviewData(data);
      setProcessing(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload and process files');
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!previewData || !selectedDestination) {
      alert('Please select a destination and ensure data is parsed');
      return;
    }

    // TODO: Implement save to database
    alert('Save functionality will be implemented');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import Packages</h1>
        <p className="text-gray-600 mt-1">Upload Word documents to bulk import packages</p>
      </div>

      {/* Upload Zone */}
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
      </div>

      {/* Preview Data */}
      {previewData && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview Parsed Data</h2>
          
          {previewData.error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {previewData.error}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Destination Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Destination *
                </label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Choose destination...</option>
                  {destinations.map(dest => (
                    <option key={dest.id} value={dest.id}>{dest.name}</option>
                  ))}
                </select>
              </div>

              {/* Parsed Package Data */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Package Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Title: </span>
                    <span className="text-gray-900">{previewData.title || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Duration: </span>
                    <span className="text-gray-900">{previewData.duration || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Days: </span>
                    <span className="text-gray-900">{previewData.days?.length || 0} days found</span>
                  </div>
                  
                  {/* Hero Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                        placeholder="Enter image URL or select from picker"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
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
                    {heroImage && (
                      <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={heroImage}
                          alt="Hero preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        placeholder="Enter image URL or select from picker"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
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
                    {thumbnail && (
                      <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={thumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {previewData.includes && previewData.includes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Includes: </span>
                      <ul className="list-disc list-inside mt-1 text-gray-900">
                        {previewData.includes.map((item, idx) => (
                          <li key={idx} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {previewData.excludes && previewData.excludes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Excludes: </span>
                      <ul className="list-disc list-inside mt-1 text-gray-900">
                        {previewData.excludes.map((item, idx) => (
                          <li key={idx} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Days Preview */}
              {previewData.days && previewData.days.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Itinerary Days</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {previewData.days.map((day, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="font-medium text-gray-900 mb-1">
                          {day.title || `Day ${day.dayNumber || index + 1}`}
                        </div>
                        {day.description && (
                          <p className="text-sm text-gray-600">{day.description}</p>
                        )}
                        {day.activities && day.activities.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500">Activities: </span>
                            <span className="text-xs text-gray-600">
                              {day.activities.map(a => a.name || a).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!selectedDestination}
                className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Save to Database
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Picker Modal */}
      {imagePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-auto">
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

