"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/lib/toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Upload, X, Camera, Loader2 } from 'lucide-react';

export default function PhotoUpload({ 
  photoUrl, 
  onUpload, 
  onDelete, 
  entityId, 
  entityType = 'client', // 'client' or 'tc'
  size = 'large' // 'small', 'medium', 'large'
}) {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    if (!entityId) {
      showError('Entity ID is required');
      return;
    }

    try {
      setUploading(true);
      
      if (entityType === 'client') {
        const response = await onUpload(entityId, file);
        if (response?.photo_url) {
          success('Photo uploaded successfully!');
          setPreview(null);
        }
      } else {
        const response = await onUpload(entityId, file);
        if (response?.photo_url) {
          success('Photo uploaded successfully!');
          setPreview(null);
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to upload photo');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = () => {
    if (!entityId) {
      showError('Entity ID is required');
      return;
    }
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!entityId) return;

    try {
      setDeleting(true);
      setShowDeleteConfirmModal(false);
      await onDelete(entityId);
      success('Photo deleted successfully!');
      setPreview(null);
    } catch (err) {
      showError(err.message || 'Failed to delete photo');
    } finally {
      setDeleting(false);
    }
  };

  const displayPhoto = preview || photoUrl;
  const photoDisplayUrl = displayPhoto 
    ? (displayPhoto.startsWith('http') 
        ? displayPhoto 
        : displayPhoto.startsWith('/storage') 
        ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${displayPhoto}`
        : displayPhoto.startsWith('storage/')
        ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${displayPhoto}`
        : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${displayPhoto}`)
    : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center group`}>
        {displayPhoto ? (
          <>
            <img
              src={photoDisplayUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            {!uploading && !deleting && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full hover:bg-red-100 transition-all"
                  title="Delete photo"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">No photo</span>
              </>
            )}
          </div>
        )}
      </div>

      {!displayPhoto && !uploading && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Photo
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {(uploading || deleting) && (
        <div className="text-xs text-gray-500">
          {uploading ? 'Uploading...' : 'Deleting...'}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This action cannot be undone."
        itemName="this photo"
        confirmText="Delete Photo"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
}

