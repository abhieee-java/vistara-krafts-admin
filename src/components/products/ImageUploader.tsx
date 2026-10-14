import React, { useState } from 'react';
import { UploadCloud, X, Star } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface ImageUploaderProps {
  images: string[];
  mainImage: string;
  onImagesChange: (images: string[], mainImage: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  mainImage,
  onImagesChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const file = files[0];
      const url = await storageService.uploadFile(file, (p) => setUploadProgress(p));
      const updated = [...images, url];
      const newMain = mainImage || url;
      onImagesChange(updated, newMain);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = (url: string) => {
    const updated = images.filter((img) => img !== url);
    const newMain = mainImage === url ? (updated[0] || '') : mainImage;
    onImagesChange(updated, newMain);
  };

  const handleSetMain = (url: string) => {
    onImagesChange(images, url);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-[#1c1b18]">
        Product Photography (Cloudflare R2 Ready)
      </label>

      {/* Upload Box */}
      <div className="relative border-2 border-dashed border-[#dcd6c8] hover:border-[#cda851] rounded-xl p-5 text-center bg-[#faf8f5] transition-colors">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          title="Upload product image"
        />
        <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
          <UploadCloud className="w-7 h-7 text-[#cda851]" />
          <p className="text-xs font-semibold text-[#1c1b18]">
            Click to upload or drag & drop image
          </p>
          <p className="text-[10px] text-gray-500">
            JPG, PNG, WEBP (Max 10MB) • Scaled for mobile & zoom loupe
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-semibold text-gray-600">
            <span>Uploading to Cloudflare R2 bucket...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#cda851] transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pt-2">
          {images.map((url, idx) => {
            const isMain = url === mainImage;
            return (
              <div
                key={idx}
                className={`group relative aspect-square rounded-lg overflow-hidden border-2 bg-gray-100 ${
                  isMain ? 'border-[#cda851] ring-2 ring-[#cda851]/30' : 'border-[#e6e2d8]'
                }`}
              >
                <img
                  src={url}
                  alt={`Product view ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Main badge */}
                {isMain && (
                  <span className="absolute bottom-1 left-1 bg-[#1c1b18]/90 text-[#cda851] text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                    MAIN
                  </span>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {!isMain && (
                    <button
                      type="button"
                      onClick={() => handleSetMain(url)}
                      title="Set as Main Image"
                      className="p-1 rounded bg-white text-[#1c1b18] hover:bg-[#cda851] transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    title="Remove image"
                    className="p-1 rounded bg-white text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
