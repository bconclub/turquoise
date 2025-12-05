'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a dummy client if env vars are missing (for build time)
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables');
  
  // Store error in localStorage for status page (client-side only)
  if (typeof window !== 'undefined') {
    try {
      const errors = JSON.parse(localStorage.getItem('turquoise_errors') || '[]');
      errors.push({
        timestamp: new Date().toISOString(),
        message: 'Missing Supabase environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey
        },
        source: 'supabase-client-init'
      });
      localStorage.setItem('turquoise_errors', JSON.stringify(errors.slice(-50)));
    } catch (e) {
      // Ignore localStorage errors
    }
  }
  
  // Create a dummy client to prevent crashes during build/SSR
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

