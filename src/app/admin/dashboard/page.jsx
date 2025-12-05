'use client';

import { useEffect, useState } from 'react';
import { getPackageStats, getMostViewedPackages, getPackageAnalytics, getRecentlyAddedPackages, getFeaturedPackagesAdmin } from '@/lib/supabase/queries';
import { Package, Eye, TrendingUp, Star, Calendar, BarChart3, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [mostViewed, setMostViewed] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, viewedData, analyticsData, recentData, featuredData] = await Promise.all([
        getPackageStats(),
        getMostViewedPackages(5),
        getPackageAnalytics(),
        getRecentlyAddedPackages(5),
        getFeaturedPackagesAdmin(5),
      ]);
      setStats(statsData);
      setMostViewed(viewedData);
      setAnalytics(analyticsData);
      setRecentlyAdded(recentData);
      setFeaturedPackages(featuredData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Packages',
      value: stats?.totalPackages || 0,
      icon: Package,
      color: 'bg-turquoise-500',
    },
    {
      title: 'Active Packages',
      value: stats?.activePackages || 0,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'bg-purple-500',
    },
    {
      title: 'Avg Views/Package',
      value: analytics?.avgViews || 0,
      icon: BarChart3,
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Package analytics and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Package Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Packages by Destination */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-turquoise-600 dark:text-turquoise-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Destinations</h2>
            </div>
            <div className="space-y-3">
              {analytics.topDestinations && analytics.topDestinations.length > 0 ? (
                analytics.topDestinations.map((dest, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-turquoise-100 dark:bg-turquoise-900/30 flex items-center justify-center text-turquoise-600 dark:text-turquoise-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{dest.name}</span>
                    </div>
                    <span className="px-3 py-1 bg-turquoise-100 dark:bg-turquoise-900/30 text-turquoise-700 dark:text-turquoise-300 rounded-full text-sm font-semibold">
                      {dest.count} {dest.count === 1 ? 'package' : 'packages'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No destinations yet</p>
              )}
            </div>
          </div>

          {/* Packages by Duration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-turquoise-600 dark:text-turquoise-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Packages by Duration</h2>
            </div>
            <div className="space-y-3">
              {analytics.packagesByDuration && Object.entries(analytics.packagesByDuration).map(([duration, count]) => (
                <div key={duration} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">{duration}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-turquoise-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats?.totalPackages > 0 ? (count / stats.totalPackages) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Viewed Packages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Most Viewed</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {mostViewed.length > 0 ? (
              mostViewed.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/admin/packages/${pkg.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{pkg.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{pkg.destinations?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 ml-3">
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold">{pkg.view_count || 0}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No packages viewed yet</p>
            )}
          </div>
        </div>

        {/* Featured Packages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured</h2>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {featuredPackages.length > 0 ? (
              featuredPackages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/admin/packages/${pkg.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{pkg.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{pkg.destinations?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 ml-3">
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">{pkg.view_count || 0}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No featured packages</p>
            )}
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recently Added</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentlyAdded.length > 0 ? (
              recentlyAdded.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/admin/packages/${pkg.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">{pkg.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{pkg.destinations?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(pkg.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent packages</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

