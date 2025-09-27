import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { PostLayoutData } from '../../types/postLayout.types';

interface EditPostLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PostLayoutData) => void;
  data: PostLayoutData | null;
}

export const EditPostLayoutModal: React.FC<EditPostLayoutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  data
}) => {
  const [formData, setFormData] = useState<PostLayoutData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
      setErrors({});
    }
  }, [data]);

  const handleInputChange = (field: keyof PostLayoutData, value: string) => {
    if (!formData) return;
    
    setFormData(prev => ({ 
      ...prev!, 
      [field]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    
    const newErrors: Record<string, string> = {};

    if (!formData.outline.trim()) {
      newErrors.outline = 'Outline is required';
    }

    if (!formData.meta_title.trim()) {
      newErrors.meta_title = 'Meta title is required';
    }

    if (!formData.meta_description.trim()) {
      newErrors.meta_description = 'Meta description is required';
    }

    if (!formData.keyword.trim()) {
      newErrors.keyword = 'Keyword is required';
    }

    if (formData.meta_title.length > 60) {
      newErrors.meta_title = 'Meta title should not exceed 60 characters';
    }

    if (formData.meta_description.length > 160) {
      newErrors.meta_description = 'Meta description should not exceed 160 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!formData) return;
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Post Layout
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Outline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outline *
            </label>
            <textarea
              value={formData.outline}
              onChange={(e) => handleInputChange('outline', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[100px] ${
                errors.outline ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter post outline..."
            />
            {errors.outline && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.outline}
              </p>
            )}
          </div>

          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title *
            </label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => handleInputChange('meta_title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.meta_title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter meta title..."
            />
            <div className="mt-1 flex justify-between items-center">
              {errors.meta_title ? (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.meta_title}
                </p>
              ) : (
                <span className="text-sm text-gray-500">
                  Recommended: 50-60 characters
                </span>
              )}
              <span className={`text-sm ${formData.meta_title.length > 60 ? 'text-red-600' : 'text-gray-500'}`}>
                {formData.meta_title.length}/60
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description *
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => handleInputChange('meta_description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[80px] ${
                errors.meta_description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter meta description..."
            />
            <div className="mt-1 flex justify-between items-center">
              {errors.meta_description ? (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.meta_description}
                </p>
              ) : (
                <span className="text-sm text-gray-500">
                  Recommended: 150-160 characters
                </span>
              )}
              <span className={`text-sm ${formData.meta_description.length > 160 ? 'text-red-600' : 'text-gray-500'}`}>
                {formData.meta_description.length}/160
              </span>
            </div>
          </div>

          {/* Keyword */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keyword *
            </label>
            <input
              type="text"
              value={formData.keyword}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.keyword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter target keyword..."
            />
            {errors.keyword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.keyword}
              </p>
            )}
          </div>

          {/* Content (if exists) */}
          {formData.content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (Preview)
              </label>
              <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                {formData.content}
        
              </div>
            </div>
          )}

          {/* Status Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                formData.status === 'ready' ? 'bg-green-100 text-green-800' :
                formData.status === 'need_generate' ? 'bg-yellow-100 text-yellow-800' :
                formData.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                formData.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {formData.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            {formData.created_at && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-700">
                  {new Date(formData.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>

        {/* Keyboard shortcuts info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="bg-gray-100 px-1 rounded">Esc</kbd> to close, 
            <kbd className="bg-gray-100 px-1 rounded">Ctrl+Enter</kbd> to save
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditPostLayoutModal;