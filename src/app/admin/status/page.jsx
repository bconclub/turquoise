'use client';

import { useEffect, useState } from 'react';
import { getPackageStats, getPackagesWithIssues } from '@/lib/supabase/queries';
import { CheckCircle, XCircle, AlertCircle, Database, Image as ImageIcon, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AdminStatus() {
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState({ missingImages: [], missingItinerary: [] });
  const [dbStatus, setDbStatus] = useState('checking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, issuesData] = await Promise.all([
        getPackageStats(),
        getPackagesWithIssues(),
      ]);
      setStats(statsData);
      setIssues(issuesData);

      // Test database connection
      try {
        const { supabase } = await import('@/lib/supabase/client');
        const { error } = await supabase.from('packages').select('id').limit(1);
        setDbStatus(error ? 'error' : 'connected');
      } catch (error) {
        setDbStatus('error');
      }
    } catch (error) {
      console.error('Error loading status data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnv = () => {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return hasUrl && hasKey;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
        <p className="text-gray-600 mt-1">Monitor system health and data integrity</p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Database Connection */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Database</h2>
            {dbStatus === 'connected' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : dbStatus === 'checking' ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-turquoise-600"></div>
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
          <p className="text-sm text-gray-600">
            {dbStatus === 'connected' ? 'Connected' : dbStatus === 'checking' ? 'Checking...' : 'Connection failed'}
          </p>
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Environment</h2>
            {checkEnv() ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
          <p className="text-sm text-gray-600">
            {checkEnv() ? 'Variables configured' : 'Missing variables'}
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overall</h2>
            {dbStatus === 'connected' && checkEnv() ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
          </div>
          <p className="text-sm text-gray-600">
            {dbStatus === 'connected' && checkEnv() ? 'All systems operational' : 'Issues detected'}
          </p>
        </div>
      </div>

      {/* Counts */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Counts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Packages</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalPackages || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Destinations</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalDestinations || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Inquiries</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalInquiries || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
          </div>
        </div>
      </div>

      {/* Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Images */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Missing Images ({issues.missingImages.length})
            </h2>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {issues.missingImages.length > 0 ? (
              issues.missingImages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/admin/packages/${pkg.id}`}
                  className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">{pkg.title}</p>
                  <p className="text-sm text-gray-600">{pkg.destinations?.name}</p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">All packages have images ✓</p>
            )}
          </div>
        </div>

        {/* Missing Itinerary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Missing Itinerary ({issues.missingItinerary.length})
            </h2>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {issues.missingItinerary.length > 0 ? (
              issues.missingItinerary.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/admin/packages/${pkg.id}`}
                  className="block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">{pkg.title}</p>
                  <p className="text-sm text-gray-600">{pkg.destinations?.name}</p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">All packages have itineraries ✓</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

