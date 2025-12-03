'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase environment variables');
  
  // Store error in localStorage for status page
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
  
  throw error;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

