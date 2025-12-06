'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSession, onAuthStateChange } from '@/lib/supabase/auth';
import { 
  LayoutDashboard, 
  Package, 
  Upload, 
  Activity,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const router = useRouter();
  const pathname = usePathname();

  // Theme management - Admin only
  useEffect(() => {
    // Apply theme immediately on mount
    const savedTheme = localStorage.getItem('admin-theme') || 'light';
    const root = document.documentElement;
    
    // Always apply admin theme when in admin routes
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    setTheme(savedTheme);
  }, [pathname]);

  const applyTheme = (newTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    // Only apply theme if we're in admin routes
    if (pathname?.startsWith('/admin')) {
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-theme', newTheme);
    }
    
    applyTheme(newTheme);
  };

  useEffect(() => {
    checkAuth();

    // Listen to auth state changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setLoading(false);
        // If on login page after sign in, redirect to dashboard
        if (pathname === '/admin/login') {
          router.push('/admin/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        router.push('/admin/login');
      } else if (session) {
        setIsAuthenticated(true);
        setLoading(false);
        // If on login page but have session, redirect to dashboard
        if (pathname === '/admin/login') {
          router.push('/admin/dashboard');
        }
      } else {
        setIsAuthenticated(false);
        // Always redirect to login if no session
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const checkAuth = async () => {
    try {
      const { session, error } = await getSession();
      if (error || !session) {
        // If not on login page, redirect to login
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      // If authenticated and on login page, redirect to dashboard
      if (pathname === '/admin/login') {
        router.push('/admin/dashboard');
      }
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      // If not on login page, redirect to login
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/supabase/auth');
    await signOut();
    router.push('/admin/login');
  };

  // Show login page if not authenticated (or if on login page)
  if (pathname === '/admin/login' || !isAuthenticated) {
    // If loading, show spinner
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
        </div>
      );
    }
    // Show login page content
    return <>{children}</>;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/packages', icon: Package, label: 'Packages' },
    { href: '/admin/import', icon: Upload, label: 'Import' },
    { href: '/admin/status', icon: Activity, label: 'Status' },
  ];

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-900 flex transition-colors">
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-gray-800 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Image
                  src="/TQ Dark.webp"
                  alt="Turquoise Holidays"
                  width={195}
                  height={42}
                  className="object-contain h-[42px] w-auto"
                  priority
                />
                <span className="absolute top-[42px] right-0 text-[17px] font-medium text-gray-500 dark:text-gray-400 leading-none mt-1">
                  Console
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-colors
                        ${isActive 
                          ? 'bg-turquoise-50 dark:bg-turquoise-900/30 text-turquoise-700 dark:text-turquoise-400 font-semibold' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Theme Toggle & Sign Out */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-5 h-5" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
          {children}
        </div>
      </main>
    </div>
  );
}

