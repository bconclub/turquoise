'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    // Check if modal is open by checking body class
    useEffect(() => {
        const checkModal = () => {
            setIsModalOpen(document.body.classList.contains('modal-open'));
        };
        // Check initially
        checkModal();
        // Set up observer to watch for class changes
        const observer = new MutationObserver(checkModal);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    });

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm border-b border-white/20 transition-opacity duration-300 ${isModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="container py-3 md:py-4 px-4">
                <div className="flex items-center justify-between gap-2">
                    {/* Logo */}
                    <Link href="/" className="relative h-10 md:h-12 w-32 md:w-48 flex-shrink-0">
                        <Image
                            src="/TQ Dark.webp"
                            alt="Turquoise Holidays"
                            fill
                            className="object-contain brightness-0 invert"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-white hover:text-white/80 transition-colors font-medium">
                            Home
                        </Link>
                        <Link href="/destinations" className="text-white hover:text-white/80 transition-colors font-medium">
                            Destinations
                        </Link>
                        <Link href="/packages" className="text-white hover:text-white/80 transition-colors font-medium">
                            Packages
                        </Link>
                        <Link href="/about" className="text-white hover:text-white/80 transition-colors font-medium">
                            About
                        </Link>
                        <Link href="/contact" className="text-white hover:text-white/80 transition-colors font-medium">
                            Contact
                        </Link>
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-white hover:text-white/80 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-white hover:text-white/80 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-white"
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
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
                        <Link
                            href="/"
                            className="text-white hover:text-white/80 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/destinations"
                            className="text-white hover:text-white/80 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Destinations
                        </Link>
                        <Link
                            href="/packages"
                            className="text-white hover:text-white/80 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Packages
                        </Link>
                        <Link
                            href="/about"
                            className="text-white hover:text-white/80 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="text-white hover:text-white/80 transition-colors font-medium"
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
