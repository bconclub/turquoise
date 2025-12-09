'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const applyTheme = useCallback((newTheme) => {
    // Theme is only for admin panel, not public site
    // This function is kept for admin layout compatibility
    if (typeof window === 'undefined') return;
    
    const currentPath = window.location.pathname;
    // Only apply theme in admin routes
    if (!currentPath?.startsWith('/admin')) {
      // Ensure dark class is removed from public routes
      document.documentElement.classList.remove('dark');
      return;
    }

    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const currentPath = pathname || window.location.pathname;
    if (currentPath?.startsWith('/admin')) {
      return;
    }

    try {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      applyTheme('light');
    }
  }, [pathname, applyTheme]);

  const toggleTheme = useCallback(() => {
    if (typeof window === 'undefined' || !mounted) return;
    
    const currentPath = pathname || window.location.pathname;
    if (currentPath?.startsWith('/admin')) {
      return;
    }

    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    try {
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme, mounted, pathname, applyTheme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

