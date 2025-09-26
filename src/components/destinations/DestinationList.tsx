import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Search, MoreHorizontal, Edit, Trash2, MapPin, Image as ImageIcon } from 'lucide-react';
import { destinationService } from '../../services/destinationService';
import { DestinationListDto, DestinationQueryParams } from '../../types/destination.types';

const DestinationList: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [cityFilter, setCityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const pageSize = 10;

  useEffect(() => {
    fetchDestinations();
  }, [currentPage, searchTerm, cityFilter, countryFilter]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const params: DestinationQueryParams = {
        pageNumber: currentPage,
        pageSize,
        search: searchTerm || undefined,
        city: cityFilter || undefined,
        country: countryFilter || undefined,
      };

      const response = await destinationService.getDestinations(params);
      
      if (response.success && response.data) {
        setDestinations(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDestinations();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        await destinationService.deleteDestination(id);
        fetchDestinations(); // Refresh list
      } catch (error) {
        console.error('Error deleting destination:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Destinations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your publication destinations ({totalCount} total)
          </p>
        </div>
        <Link
          to="/destinations/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Destination
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </form>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="City..."
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Country..."
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Destinations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Posts</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Created</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {destinations.map((destination) => (
                <tr key={destination.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {destination.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        /{destination.slug}
                      </p>
                      {destination.description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {destination.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {[destination.city, destination.state, destination.country]
                          .filter(Boolean)
                          .join(', ') || 'No location'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {destination.postCount} posts
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(destination.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/destinations/${destination.id}/edit`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(destination.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && destinations.length === 0 && (
        <div className="text-center py-12">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No destinations found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first destination'}
          </p>
          <Link
            to="/destinations/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus size={16} className="mr-2" />
            Add Your First Destination
          </Link>
        </div>
      )}
    </div>
  );
};

export default DestinationList;
