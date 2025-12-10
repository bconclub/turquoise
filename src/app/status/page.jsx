'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Database, Globe, Activity, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function StatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setStatus(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching status:', error);
      setStatus({
        error: error.message || 'Failed to fetch status'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    if (status === 'healthy') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (status) => {
    if (status === 'healthy') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000);
      
      if (diff < 60) return `${diff} seconds ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
      return `${Math.floor(diff / 86400)} days ago`;
    } catch {
      return timestamp;
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream py-12">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-turquoise-900 mb-2">System Status</h1>
                <p className="text-gray-600">Real-time monitoring of system health and services</p>
              </div>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refreshes every 30 seconds
            </div>
          </div>

          {loading && !status ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
            </div>
          ) : status?.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">Error Loading Status</h3>
              <p className="text-red-700">{status.error}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Version & Build Info */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-turquoise-900 mb-4 flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Version & Build Info
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Version</span>
                    <span className="font-semibold text-gray-900">
                      {status?.gitCommitMsg || status?.version?.app || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Next.js Version</span>
                    <span className="font-semibold text-gray-900">{status?.version?.nextjs || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Node Environment</span>
                    <span className="font-semibold text-gray-900">{status?.version?.node || 'development'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Last Deployed</span>
                    <span className="font-semibold text-gray-900">
                      {status?.buildTime ? formatTimeAgo(status.buildTime) : 'N/A'}
                    </span>
                  </div>
                  {status?.buildTime && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(status.buildTime)}
                    </div>
                  )}
                </div>
              </div>

              {/* Service Status */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-turquoise-900 mb-4 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Service Status
                </h2>
                <div className="space-y-4">
                  {/* Supabase */}
                  {status?.services?.supabase && (
                    <div className={`p-4 rounded-lg border-2 ${getStatusColor(status.services.supabase.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.services.supabase.status)}
                          <span className="font-semibold">Supabase Database</span>
                        </div>
                        <span className="text-xs font-medium uppercase">
                          {status.services.supabase.status}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">{status.services.supabase.message}</p>
                      {status.services.supabase.responseTime && (
                        <p className="text-xs mt-1 opacity-75">
                          Response time: {status.services.supabase.responseTime}ms
                        </p>
                      )}
                    </div>
                  )}

                  {/* Webhook */}
                  {status?.services?.webhook && (
                    <div className={`p-4 rounded-lg border-2 ${getStatusColor(status.services.webhook.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.services.webhook.status)}
                          <span className="font-semibold">Webhook Endpoint</span>
                        </div>
                        <span className="text-xs font-medium uppercase">
                          {status.services.webhook.status}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">{status.services.webhook.message}</p>
                      {status.services.webhook.responseTime && (
                        <p className="text-xs mt-1 opacity-75">
                          Response time: {status.services.webhook.responseTime}ms
                        </p>
                      )}
                    </div>
                  )}

                  {/* API Routes */}
                  <div className="p-4 rounded-lg border-2 bg-green-100 text-green-800 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">API Routes</span>
                      </div>
                      <span className="text-xs font-medium uppercase">Healthy</span>
                    </div>
                    <p className="text-sm opacity-90">All API endpoints operational</p>
                  </div>
                </div>
              </div>

              {/* Database Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-turquoise-900 mb-4 flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Database Statistics
                </h2>
                {status?.database?.error ? (
                  <div className="text-red-600 text-sm">{status.database.error}</div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Total Packages</span>
                      <span className="text-2xl font-bold text-turquoise-600">
                        {status?.database?.packages ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Total Destinations</span>
                      <span className="text-2xl font-bold text-turquoise-600">
                        {status?.database?.destinations ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Total Inquiries</span>
                      <span className="text-2xl font-bold text-turquoise-600">
                        {status?.database?.inquiries ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Last Inquiry</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {status?.database?.lastInquiry 
                          ? formatTimeAgo(status.database.lastInquiry)
                          : 'None'}
                      </span>
                    </div>
                    {status?.database?.lastInquiry && (
                      <div className="text-xs text-gray-500 mt-2">
                        {formatTimestamp(status.database.lastInquiry)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Errors */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-turquoise-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Recent Errors
                </h2>
                <div className="space-y-2">
                  {status?.errors && status.errors.length > 0 ? (
                    status.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-900">{error.message || error}</p>
                        {error.timestamp && (
                          <p className="text-xs text-red-600 mt-1">
                            {formatTimestamp(error.timestamp)}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2 opacity-50" />
                      <p>No recent errors</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
