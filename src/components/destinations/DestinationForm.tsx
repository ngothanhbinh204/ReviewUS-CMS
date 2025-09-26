import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Save, ArrowLeft } from 'lucide-react';
import { destinationService } from '../../services/destinationService';
import { CreateDestinationDto, UpdateDestinationDto } from '../../types/destination.types';

const DestinationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [destination, setDestination] = useState<CreateDestinationDto>({
    name: '',
    description: '',
    latitude: undefined,
    longitude: undefined,
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    schemaMarkup: null,
    seoMeta: null,
    coverImageId: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      fetchDestination(id);
    }
  }, [id, isEdit]);

  const fetchDestination = async (destinationId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await destinationService.getDestination(destinationId, { forceRefresh: true });
      
      if (response.success && response.data) {
        const data = response.data;
        setDestination({
          name: data.name,
          description: data.description || '',
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          postalCode: data.postalCode || '',
          schemaMarkup: data.schemaMarkup,
          seoMeta: data.seoMeta,
          coverImageId: data.coverImageId,
        });
      } else {
        setError('Destination not found');
      }
    } catch (err: any) {
      console.error('Error fetching destination:', err);
      setError(err.message || 'Failed to fetch destination');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateDestinationDto, value: any) => {
    setDestination(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name' && value) {
      const slug = destinationService.generateSlug(value);
      setDestination(prev => ({ ...prev, slug }));
    }
  };

  const validateForm = (): boolean => {
    const errors = destinationService.validateDestination(destination);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      if (isEdit && id) {
        await destinationService.updateDestination(id, { id, ...destination } as UpdateDestinationDto);
      } else {
        await destinationService.createDestination(destination);
      }

      navigate('/destinations');
    } catch (err: any) {
      console.error('Error saving destination:', err);
      setError(err.message || 'Failed to save destination');
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/destinations')}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Destination' : 'Create New Destination'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update destination settings' : 'Set up a new publication destination'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/destinations')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Destination'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Destination Name *
          </label>
          <input
            type="text"
            value={destination.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Main Website, Blog, News Portal"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address
          </label>
          <input
            type="text"
            value={destination.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="123 Main Street"
          />
        </div>

        {/* Location Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={destination.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="New York"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            <input
              type="text"
              value={destination.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="NY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <input
              type="text"
              value={destination.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="USA"
            />
          </div>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={destination.latitude || ''}
              onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="40.7128"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={destination.longitude || ''}
              onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="-74.0060"
            />
          </div>
        </div>

        {/* Domain */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Postal Code
          </label>
          <input
            type="text"
            value={destination.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="10001"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={destination.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Brief description of this destination..."
          />
        </div>
      </div>
    </div>
  );
};

export default DestinationForm;
