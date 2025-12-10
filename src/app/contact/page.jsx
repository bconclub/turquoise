'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    acceptTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.message) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.acceptTerms) {
        throw new Error('Please accept the terms to proceed');
      }

      // Prepare inquiry data
      const inquiryData = {
        inquiry_type: 'general',
        package_id: null,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        travel_dates_flexible: true,
        preferred_start_date: null,
        travelers_adults: 0,
        travelers_children: 0,
        travelers_infants: 0,
        destinations_interested: [],
        message: `Subject: ${formData.subject || 'General Inquiry'}\n\n${formData.message}`,
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
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          acceptTerms: false
        });
        setSubmitted(false);
      }, 3000);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-turquoise-600 to-turquoise-800 text-white py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-white/90">Get in touch with our travel experts</p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold text-turquoise-900 mb-8">Get in Touch</h2>
                <p className="text-gray-700 mb-8">
                  Have questions about our travel packages? Want to plan a custom itinerary? 
                  Our team is here to help you create your perfect journey.
                </p>

                <div className="space-y-6">
                  {/* Address */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md"
                  >
                    <div className="w-12 h-12 rounded-full bg-turquoise-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-turquoise-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                      <p className="text-gray-600">
                        Shop No 4, 1st Floor, Balaji Building,<br />
                        Hennur Bagalur Main Rd, above Ammas Bakery,<br />
                        Kothanur, Bengaluru, Karnataka 560077
                      </p>
                    </div>
                  </motion.div>

                  {/* Phone */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md"
                  >
                    <div className="w-12 h-12 rounded-full bg-turquoise-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-turquoise-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <a 
                        href="tel:+919980001230" 
                        className="text-turquoise-600 hover:text-turquoise-700 transition-colors"
                      >
                        +91-9980001230
                      </a>
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md"
                  >
                    <div className="w-12 h-12 rounded-full bg-turquoise-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-turquoise-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <a 
                        href="mailto:Ali@turquoiseholidays.in" 
                        className="text-turquoise-600 hover:text-turquoise-700 transition-colors"
                      >
                        Ali@turquoiseholidays.in
                      </a>
                    </div>
                  </motion.div>

                  {/* Business Hours */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md"
                  >
                    <div className="w-12 h-12 rounded-full bg-turquoise-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-turquoise-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                      <p className="text-gray-600">
                        Monday - Saturday: 9:00 AM - 7:00 PM<br />
                        Sunday: 10:00 AM - 5:00 PM
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold text-turquoise-900 mb-8">Send us a Message</h2>
                
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"
                  >
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-900 mb-2">Thank You!</h3>
                    <p className="text-green-700">
                      We've received your message and will get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900"
                        placeholder="Your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900"
                        placeholder="+91-XXXXXXXXXX"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900"
                        placeholder="What is this regarding?"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900 resize-none"
                        placeholder="Tell us about your travel plans or questions..."
                      />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 mt-1 text-turquoise-600 border-gray-300 rounded focus:ring-turquoise-500"
                      />
                      <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                        I accept to receive more details on my contact information. *
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
                      className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Map Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-turquoise-900 mb-8 text-center">Find Us</h2>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.1234567890123!2d77.6488904!3d13.0622232!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae179ed67f2b4d%3A0x783b2ae814059610!2sTurquoise%20Holidays!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                ></iframe>
                <div className="mt-4 text-center">
                  <a
                    href="https://www.google.com/maps/place/Turquoise+Holidays/@13.0622232,77.6488904,17z/data=!3m1!4b1!4m6!3m5!1s0x3bae179ed67f2b4d:0x783b2ae814059610!8m2!3d13.0622232!4d77.6488904!16s%2Fg%2F11cmrwdw3d?entry=ttu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-turquoise-600 hover:text-turquoise-700 font-medium inline-flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

