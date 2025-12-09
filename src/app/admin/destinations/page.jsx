'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllDestinationsForAdmin, updateDestination, deleteDestination } from '@/lib/supabase/queries';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function DestinationsList() {
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    loadDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [searchTerm, statusFilter, destinations]);

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const data = await getAllDestinationsForAdmin();
      setDestinations(data);
      setFilteredDestinations(data);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDestinations = () => {
    let filtered = destinations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(dest =>
        dest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.region?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(dest => dest.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(dest => !dest.is_active);
    }

    setFilteredDestinations(filtered);
  };

  const toggleStatus = async (dest) => {
    try {
      const { error } = await updateDestination(dest.id, { is_active: !dest.is_active });
      if (error) throw error;
      await loadDestinations();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update destination status');
    }
  };

  const handleDelete = async (dest) => {
    if (!confirm(`Are you sure you want to delete "${dest.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await deleteDestination(dest.id);
      if (error) throw error;
      await loadDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      alert('Failed to delete destination');
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
          <p className="text-gray-600 mt-1">Manage all destinations</p>
        </div>
        <Link
          href="/admin/destinations/new"
          className="flex items-center gap-2 bg-turquoise-600 hover:bg-turquoise-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add New
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, country, or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Destinations Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Packages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{dest.name}</p>
                        <p className="text-xs text-gray-500">{dest.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{dest.country || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{dest.region?.name || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{dest.package_count || 0}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(dest)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          dest.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {dest.is_active ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/destinations/${dest.id}`}
                          className="p-2 text-turquoise-600 hover:bg-turquoise-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(dest)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No destinations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredDestinations.length} of {destinations.length} destinations
      </div>
    </div>
  );
}
