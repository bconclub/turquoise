'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDestinations } from '@/lib/supabase/queries';
import { supabase } from '@/lib/supabase/client';

export default function EnquiryModal({ isOpen, onClose, packageData = null, destinationData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    city: '',
    interestedDestinations: [],
    packageId: packageData?.id || null,
    travelDate: '',
    adults: 2,
    children: 0,
    acceptTerms: false
  });

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDestinations();
      // Pre-fill package/destination if provided
      if (packageData) {
        setFormData(prev => ({
          ...prev,
          packageId: packageData.id,
          interestedDestinations: packageData.destination_id ? [packageData.destination_id] : []
        }));
      } else if (destinationData) {
        setFormData(prev => ({
          ...prev,
          interestedDestinations: [destinationData.id]
        }));
      }
    }
  }, [isOpen, packageData, destinationData]);

  const loadDestinations = async () => {
    try {
      const dests = await getDestinations();
      setDestinations(dests || []);
    } catch (error) {
      console.error('Error loading destinations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDestinationToggle = (destinationId) => {
    setFormData(prev => ({
      ...prev,
      interestedDestinations: prev.interestedDestinations.includes(destinationId)
        ? prev.interestedDestinations.filter(id => id !== destinationId)
        : [...prev.interestedDestinations, destinationId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.mobile) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.acceptTerms) {
        throw new Error('Please accept the terms to proceed');
      }

      // Prepare inquiry data according to database schema
      const inquiryData = {
        inquiry_type: packageData ? 'package' : 'custom',
        package_id: formData.packageId || null,
        name: formData.name,
        email: formData.email,
        phone: formData.mobile,
        travel_dates_flexible: !formData.travelDate,
        preferred_start_date: formData.travelDate || null,
        travelers_adults: parseInt(formData.adults) || 2,
        travelers_children: parseInt(formData.children) || 0,
        travelers_infants: 0,
        destinations_interested: formData.interestedDestinations.length > 0 
          ? destinations.filter(d => formData.interestedDestinations.includes(d.id)).map(d => d.name)
          : [],
        message: formData.city ? `City: ${formData.city}` : `Interested in: ${packageData?.is_domestic ? 'domestic' : 'international'} travel`,
        status: 'new',
        source_url: typeof window !== 'undefined' ? window.location.href : '',
      };

      const { data, error: insertError } = await supabase
        .from('inquiries')
        .insert(inquiryData)
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message || 'Failed to submit inquiry');
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          mobile: '',
          city: '',
          interestedDestinations: [],
          packageId: null,
          travelDate: '',
          adults: 2,
          children: 0,
          acceptTerms: false
        });
      }, 2000);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[538px] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Background Image */}
          <div className="relative h-48 bg-gradient-to-br from-turquoise-500 to-turquoise-700 rounded-t-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-beach.png')] bg-cover bg-center opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
            <div className="relative h-full flex items-center justify-center text-white px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center">
                Let's Plan Your Next Escape
              </h2>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Package/Destination Info */}
                {(packageData || destinationData) && (
                  <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-turquoise-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Interested In</p>
                        <p className="font-semibold text-turquoise-900">
                          {packageData ? packageData.title : destinationData?.name}
                        </p>
                        {packageData && packageData.duration_display && (
                          <p className="text-sm text-gray-600 mt-1">
                            {packageData.duration_display}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name *"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none placeholder:text-gray-400 placeholder:opacity-100 text-gray-900"
                  />
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none placeholder:text-gray-400 placeholder:opacity-100 text-gray-900"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="Mobile *"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none placeholder:text-gray-400 placeholder:opacity-100 text-gray-900"
                  />
                </div>

                {/* City */}
                <div>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none placeholder:text-gray-400 placeholder:opacity-100 text-gray-900"
                  />
                </div>

                {/* Interested Destinations (if no package selected) */}
                {!packageData && destinations.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interested Destinations
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                      {destinations.map((dest) => (
                        <label
                          key={dest.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.interestedDestinations.includes(dest.id)}
                            onChange={() => handleDestinationToggle(dest.id)}
                            className="w-4 h-4 text-turquoise-600 border-gray-300 rounded focus:ring-turquoise-500"
                          />
                          <span className="text-sm text-gray-700">{dest.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Travel Date and Group Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Travel Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adults
                      </label>
                      <input
                        type="number"
                        name="adults"
                        placeholder="Adults"
                        min="1"
                        value={formData.adults}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none placeholder:text-gray-400 placeholder:opacity-100 text-gray-900"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Children
                      </label>
                      <input
                        type="number"
                        name="children"
                        placeholder="Children"
                        min="0"
                        value={formData.children}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none placeholder:text-gray-400 placeholder:opacity-100 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    required
                    className="w-4 h-4 mt-1 text-turquoise-600 border-gray-300 rounded focus:ring-turquoise-500"
                  />
                  <label className="text-sm text-gray-600">
                    I accept to receive more details on my contact information.
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : "Let's Plan"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

