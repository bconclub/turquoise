'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Award, Users, Globe, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Authenticity',
      description: 'Genuine experiences that connect you with the heart of each destination',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&h=800&fit=crop'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Every detail matters, from the first consultation to your return home',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&h=800&fit=crop'
    },
    {
      icon: Users,
      title: 'Personalization',
      description: 'Your journey is uniquely yours, tailored to your preferences',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&h=800&fit=crop'
    },
    {
      icon: Globe,
      title: 'Trust',
      description: 'Building lasting relationships through transparency and reliability',
      image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=1200&h=800&fit=crop'
    }
  ];

  const promises = [
    {
      title: 'Craft and Flexibility',
      description: 'Every itinerary is meticulously designed around your unique preferences',
      image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1200&h=800&fit=crop'
    },
    {
      title: '24/7 Travel Insights',
      description: 'Our expert team provides guidance whenever you need it',
      image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1200&h=800&fit=crop'
    },
    {
      title: 'Unmatched Experiences',
      description: 'Access to exclusive destinations and activities beyond the ordinary',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&h=800&fit=crop'
    },
    {
      title: 'Best Value Guarantee',
      description: 'Premium quality experiences at competitive prices',
      image: 'https://images.unsplash.com/photo-1476900543704-4312b78632f8?q=80&w=1200&h=800&fit=crop'
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        {/* Hero Section with Image */}
        <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center text-white overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&h=1200&fit=crop"
            alt="Luxury Travel Experience"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
          <div className="container relative z-10 text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              About Turquoise Holidays
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto"
            >
              Refined luxury travel that transforms journeys into unforgettable experiences
            </motion.p>
          </div>
        </section>

        {/* Story Section with Split Image/Text */}
        <section className="py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative h-[500px] rounded-3xl overflow-hidden"
              >
                <Image
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&h=1200&fit=crop"
                  alt="Travel Experience"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-turquoise-900 mb-6">
                  Our Essence
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We believe that travel is not just about destinations—it's about creating moments 
                  that resonate, stories that inspire, and memories that last a lifetime.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  At Turquoise Holidays, we transform your travel dreams into extraordinary journeys, 
                  crafting each experience with meticulous attention to detail and an unwavering 
                  commitment to excellence.
                </p>
                <div className="pt-6">
                  <Link
                    href="/packages"
                    className="inline-block bg-turquoise-600 hover:bg-turquoise-700 text-white px-8 py-4 rounded-full font-semibold transition-colors"
                  >
                    Explore Our Packages
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values with Images */}
        <section className="py-24 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-turquoise-900 mb-4">
                Our Values
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide every journey we create
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
                  >
                    <Image
                      src={value.image}
                      alt={value.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                      <div className="w-12 h-12 rounded-full bg-turquoise-600/90 backdrop-blur-sm flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{value.title}</h3>
                      <p className="text-white/90 text-sm">{value.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Promise - Image Gallery Style */}
        <section className="py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-turquoise-900 mb-4">
                Our Promise
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                What sets us apart in luxury travel
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-8">
              {promises.map((promise, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative h-[350px] rounded-2xl overflow-hidden"
                >
                  <Image
                    src={promise.image}
                    alt={promise.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-turquoise-900/95 via-turquoise-800/70 to-turquoise-700/50" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{promise.title}</h3>
                    <p className="text-white/90">{promise.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision - Side by Side with Images */}
        <section className="py-24 bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative h-[500px] rounded-3xl overflow-hidden group"
              >
                <Image
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&h=1200&fit=crop"
                  alt="Our Mission"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                  <p className="text-white/90 leading-relaxed">
                    To inspire and enable extraordinary travel experiences that enrich lives, broaden 
                    perspectives, and create lasting memories through expertly curated journeys to the 
                    world's most captivating destinations.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative h-[500px] rounded-3xl overflow-hidden group"
              >
                <Image
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&h=1200&fit=crop"
                  alt="Our Vision"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                  <p className="text-white/90 leading-relaxed">
                    To be the most trusted and sought-after luxury travel partner, recognized for our 
                    commitment to excellence, innovation, and the transformative power of travel.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Image Gallery Section */}
        <section className="py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-turquoise-900 mb-4">
                Moments We Create
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Every journey tells a story
              </p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1476900543704-4312b78632f8?q=80&w=800&h=800&fit=crop',
              ].map((imageUrl, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="relative h-[250px] md:h-[300px] rounded-xl overflow-hidden group cursor-pointer"
                >
                  <Image
                    src={imageUrl}
                    alt={`Travel moment ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section with Background Image */}
        <section className="relative py-32 text-white overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000&h=1200&fit=crop"
            alt="Start Your Journey"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-turquoise-900/80 via-turquoise-800/70 to-turquoise-900/80" />
          <div className="container relative z-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Ready to Start Your Journey?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/95 mb-10 max-w-2xl mx-auto"
            >
              Let us help you create unforgettable travel experiences
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/packages"
                className="bg-white text-turquoise-600 hover:bg-gray-100 px-10 py-5 rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Explore Packages
              </Link>
              <Link
                href="/contact"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-10 py-5 rounded-full font-semibold text-lg transition-all"
              >
                Contact Us
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
