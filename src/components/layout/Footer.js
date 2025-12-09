'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-turquoise-600 text-white">
            {/* Main Footer Content */}
            <div className="container py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Left Column - Logo & Social Media */}
                    <div>
                        {/* Logo */}
                        <div className="mb-6">
                            <Link href="/" className="inline-block">
                                <div className="relative">
                                    {/* Turquoise Logo Image */}
                                    <Image 
                                        src="/TQ-Full.webp" 
                                        alt="Turquoise Holidays Logo" 
                                        width={200}
                                        height={80}
                                        className="h-20 w-auto object-contain"
                                        priority
                                    />
                                </div>
                            </Link>
                        </div>
                        
                        {/* Social Media Icons */}
                        <div className="flex gap-4">
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://twitter.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity"
                                aria-label="Twitter/X"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://youtube.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity"
                                aria-label="YouTube"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Middle-Left Column - Map & Contact */}
                    <div>
                        {/* Google Maps Embed */}
                        <div className="mb-4 rounded-lg overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.1234567890123!2d77.6123456!3d13.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAwJzQ0LjQiTiA3N8KwMzYnNDQuNSJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                                width="100%"
                                height="200"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full"
                            ></iframe>
                        </div>
                        
                        {/* Contact Information */}
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <span>
                                    1st Floor, Balaji Building, Hennur Bagalur Main Rd, Kothanur, Bengaluru, Karnataka 560077
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 flex-shrink-0" />
                                <a href="tel:+919980001230" className="hover:underline">
                                    +91-9980001230
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 flex-shrink-0" />
                                <a href="mailto:Ali@turquoiseholidays.in" className="hover:underline">
                                    Ali@turquoiseholidays.in
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Middle-Right Column - Pages */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Pages</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="hover:underline transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/destinations" className="hover:underline transition-colors">
                                    Destinations
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="hover:underline transition-colors">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:underline transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:underline transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Right Column - Link */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Link</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy" className="hover:underline transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/career" className="hover:underline transition-colors">
                                    Career
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:underline transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:underline transition-colors">
                                    Term & Condition
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-turquoise-500 border-t border-turquoise-400">
                <div className="container py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-900">
                        <p>Turquoise Holidays © 2025. All Rights Reserved.</p>
                        <p>
                            Built with <span className="text-red-500">❤️</span> at{' '}
                            <a 
                                href="https://bconclub.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="underline hover:opacity-80 transition-opacity"
                            >
                                BCON Club
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
