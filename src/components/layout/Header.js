'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
            <div className="container py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="relative h-12 w-48">
                        <Image
                            src="/TQ Dark.webp"
                            alt="Turquoise Holidays"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-turquoise-600 hover:text-turquoise-500 transition-colors font-medium">
                            Home
                        </Link>
                        <Link href="/destinations" className="text-turquoise-600 hover:text-turquoise-500 transition-colors font-medium">
                            Destinations
                        </Link>
                        <Link href="/packages" className="text-turquoise-600 hover:text-turquoise-500 transition-colors font-medium">
                            Packages
                        </Link>
                        <Link href="/about" className="text-turquoise-600 hover:text-turquoise-500 transition-colors font-medium">
                            About
                        </Link>
                        <Link href="/contact" className="text-turquoise-600 hover:text-turquoise-500 transition-colors font-medium">
                            Contact
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-turquoise-600"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
                        <Link
                            href="/"
                            className="text-turquoise-600 hover:text-turquoise-500 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/destinations"
                            className="text-turquoise-600 hover:text-turquoise-500 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Destinations
                        </Link>
                        <Link
                            href="/packages"
                            className="text-turquoise-600 hover:text-turquoise-500 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Packages
                        </Link>
                        <Link
                            href="/about"
                            className="text-turquoise-600 hover:text-turquoise-500 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="text-turquoise-600 hover:text-turquoise-500 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contact
                        </Link>
                    </nav>
                )}
            </div>
        </header>
    );
}
