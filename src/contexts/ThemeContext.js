'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const pathname = usePathname();

  useEffect(() => {
    // Don't apply theme if we're in admin routes - let admin layout handle it
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // Check localStorage for saved theme preference (only for non-admin routes)
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, [pathname]);

  const applyTheme = (newTheme) => {
    // Don't apply theme if we're in admin routes
    if (typeof window !== 'undefined' && window.location.pathname?.startsWith('/admin')) {
      return;
    }

    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    // Don't allow theme toggle in admin routes
    if (pathname?.startsWith('/admin')) {
      return;
    }

    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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

