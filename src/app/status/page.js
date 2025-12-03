'use client';

import { useState, useEffect } from 'react';
import { getPackages, getDestinations } from '@/lib/supabase/queries';
import { supabase } from '@/lib/supabase/client';

export default function StatusPage() {
  const [status, setStatus] = useState({
    loading: true,
    nextjsVersion: process.env.NEXT_PUBLIC_VERSION || '16.0.6',
    nodeVersion: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
    supabase: {
      connected: false,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured',
      error: null
    },
    database: {
      packages: { count: 0, error: null },
      destinations: { count: 0, error: null }
    },
    recentErrors: []
  });

  useEffect(() => {
    checkStatus();
    // Refresh every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true }));

    // Check Supabase connection
    let supabaseConnected = false;
    let supabaseError = null;
    
    try {
      const { data, error } = await supabase.from('packages').select('id').limit(1);
      supabaseConnected = !error;
      supabaseError = error?.message || null;
    } catch (err) {
      supabaseError = err.message;
    }

    // Check packages count
    let packagesCount = 0;
    let packagesError = null;
    try {
      const packages = await getPackages();
      packagesCount = packages?.length || 0;
    } catch (err) {
      packagesError = err.message;
    }

    // Check destinations count
    let destinationsCount = 0;
    let destinationsError = null;
    try {
      const destinations = await getDestinations();
      destinationsCount = destinations?.length || 0;
    } catch (err) {
      destinationsError = err.message;
    }

    // Get recent errors from console (we'll track them manually)
    const recentErrors = JSON.parse(localStorage.getItem('turquoise_errors') || '[]').slice(-10);

    setStatus({
      loading: false,
      nextjsVersion: process.env.NEXT_PUBLIC_VERSION || '16.0.6',
      nodeVersion: typeof window !== 'undefined' ? navigator.userAgent.split(' ').pop() : 'N/A',
      supabase: {
        connected: supabaseConnected,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured',
        error: supabaseError
      },
      database: {
        packages: { count: packagesCount, error: packagesError },
        destinations: { count: destinationsCount, error: destinationsError }
      },
      recentErrors
    });
  };

  const getStatusColor = (isConnected) => {
    return isConnected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (isConnected) => {
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? '✓ Connected' : '✗ Disconnected'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
            <button
              onClick={checkStatus}
              disabled={status.loading}
              className="px-4 py-2 bg-turquoise-600 text-white rounded-lg hover:bg-turquoise-700 disabled:opacity-50 transition-colors"
            >
              {status.loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Version Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Version Information</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Next.js Version:</span>
                <span className="font-mono text-gray-900">{status.nextjsVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">React Version:</span>
                <span className="font-mono text-gray-900">19.2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-mono text-gray-900">{process.env.NODE_ENV || 'development'}</span>
              </div>
            </div>
          </section>

          {/* Supabase Connection */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Supabase Connection</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                {getStatusBadge(status.supabase.connected)}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">URL:</span>
                <span className="font-mono text-sm text-gray-900 break-all">
                  {status.supabase.url}
                </span>
              </div>
              {status.supabase.error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800 font-semibold">Error:</p>
                  <p className="text-sm text-red-700 mt-1">{status.supabase.error}</p>
                </div>
              )}
            </div>
          </section>

          {/* Database Status */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Database Status</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Packages */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Packages</h3>
                  {getStatusBadge(!status.database.packages.error)}
                </div>
                <div className="text-2xl font-bold text-turquoise-600">
                  {status.database.packages.count}
                </div>
                <p className="text-sm text-gray-600 mt-1">Active packages</p>
                {status.database.packages.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-700">{status.database.packages.error}</p>
                  </div>
                )}
              </div>

              {/* Destinations */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Destinations</h3>
                  {getStatusBadge(!status.database.destinations.error)}
                </div>
                <div className="text-2xl font-bold text-turquoise-600">
                  {status.database.destinations.count}
                </div>
                <p className="text-sm text-gray-600 mt-1">Active destinations</p>
                {status.database.destinations.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-700">{status.database.destinations.error}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Environment Variables Check */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Environment Variables</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={`font-mono text-sm ${status.supabase.url !== 'Not configured' ? 'text-green-600' : 'text-red-600'}`}>
                  {status.supabase.url !== 'Not configured' ? '✓ Set' : '✗ Not Set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={`font-mono text-sm ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}`}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not Set'}
                </span>
              </div>
            </div>
          </section>

          {/* Recent Errors */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Errors</h2>
            {status.recentErrors.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">✓ No recent errors</p>
              </div>
            ) : (
              <div className="space-y-2">
                {status.recentErrors.map((error, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-red-800">Error</span>
                    </div>
                    <p className="text-sm text-red-700 font-mono">{error.message}</p>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-red-600 cursor-pointer">Stack trace</summary>
                        <pre className="text-xs text-red-700 mt-2 overflow-auto">{error.stack}</pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go to Homepage
              </a>
              <button
                onClick={() => {
                  localStorage.removeItem('turquoise_errors');
                  checkStatus();
                }}
                className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Clear Error Log
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

