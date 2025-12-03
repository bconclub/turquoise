'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="absolute top-0 left-0 right-0 z-50 text-white">
            <div className="container py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold tracking-wider">
                        TURQUOISE
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="hover:text-turquoise-300 transition-colors">
                            Home
                        </Link>
                        <Link href="/destinations" className="hover:text-turquoise-300 transition-colors">
                            Destinations
                        </Link>
                        <Link href="/packages" className="hover:text-turquoise-300 transition-colors">
                            Packages
                        </Link>
                        <Link href="/about" className="hover:text-turquoise-300 transition-colors">
                            About
                        </Link>
                        <Link href="/contact" className="hover:text-turquoise-300 transition-colors">
                            Contact
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2"
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
                            className="hover:text-turquoise-300 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/destinations"
                            className="hover:text-turquoise-300 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Destinations
                        </Link>
                        <Link
                            href="/packages"
                            className="hover:text-turquoise-300 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Packages
                        </Link>
                        <Link
                            href="/about"
                            className="hover:text-turquoise-300 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="hover:text-turquoise-300 transition-colors"
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
