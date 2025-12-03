import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-turquoise-900 text-white py-12">
            <div className="container">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Logo & Description */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4">TURQUOISE</h3>
                        <p className="text-turquoise-200 text-sm">
                            Creating unforgettable travel experiences since 2020.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/destinations" className="text-turquoise-200 hover:text-white transition-colors">
                                    Destinations
                                </Link>
                            </li>
                            <li>
                                <Link href="/packages" className="text-turquoise-200 hover:text-white transition-colors">
                                    Packages
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-turquoise-200 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-turquoise-200 hover:text-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/faq" className="text-turquoise-200 hover:text-white transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-turquoise-200 hover:text-white transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-turquoise-200 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-turquoise-200">
                            <li>Email: info@turquoiseholidays.com</li>
                            <li>Phone: +1 (555) 123-4567</li>
                            <li>Available 24/7</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-turquoise-700 pt-6 text-center text-sm text-turquoise-200">
                    <p>&copy; {new Date().getFullYear()} Turquoise Holidays. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
