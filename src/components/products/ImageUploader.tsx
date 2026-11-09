import React, { useState, useRef } from 'react';
import { UploadCloud, X, Star, Link2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const newUrls: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setStatusMessage(`Transcoding & uploading ${i + 1} of ${totalFiles}: ${file.name.slice(0, 24)}...`);
        
        const url = await storageService.uploadFile(file, (p) => {
          const baseProgress = Math.round((i / totalFiles) * 100);
          const currentStep = Math.round((p / 100) * (100 / totalFiles));
          setUploadProgress(Math.min(baseProgress + currentStep, 99));
        });

        newUrls.push(url);
      }

      setUploadProgress(100);
      setStatusMessage(`Successfully uploaded ${totalFiles} ${totalFiles === 1 ? 'image' : 'images'}!`);

      const updated = [...images, ...newUrls];
      const newMain = mainImage || newUrls[0] || (updated[0] || '');
      onImagesChange(updated, newMain);

      setTimeout(() => {
        setStatusMessage(null);
        setUploadProgress(0);
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload one or more images. Please retry.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('Please enter a valid HTTP/HTTPS image URL');
      return;
    }

    const updated = [...images, trimmed];
    const newMain = mainImage || trimmed;
    onImagesChange(updated, newMain);
    setUrlInput('');
    setShowUrlField(false);
    setError(null);
  };

  const handleRemove = async (url: string) => {
    const updated = images.filter((img) => img !== url);
    const newMain = mainImage === url ? (updated[0] || '') : mainImage;
    onImagesChange(updated, newMain);
    // Delete file from Supabase storage silently if applicable
    await storageService.deleteFile(url).catch(() => {});
  };

  const handleSetMain = (url: string) => {
    onImagesChange(images, url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#1c1b18]">
          Product Photography (Supabase Storage • Auto-WebP)
        </label>
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8a7238] hover:text-[#cda851] cursor-pointer"
        >
          <Link2 className="w-3.5 h-3.5" />
          {showUrlField ? 'Hide URL input' : 'Add via direct URL'}
        </button>
      </div>

      {/* Direct URL input accordion */}
      {showUrlField && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/60 border border-amber-200/80">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="https://.../photo.webp (Paste any web link)"
            className="flex-1 h-8 px-3 rounded-lg border border-[#e6e2d8] bg-white text-xs outline-none focus:ring-2 focus:ring-[#cda851]"
          />
          <button
            type="button"
            onClick={() => handleAddUrl()}
            className="h-8 px-3.5 rounded-lg bg-[#cda851] text-[#1c1b18] text-xs font-bold hover:bg-[#dfc27d] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      )}

      {/* Multi-File Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#cda851] bg-amber-50/80 scale-[1.01] shadow-md ring-4 ring-[#cda851]/20'
            : 'border-[#dcd6c8] hover:border-[#cda851] bg-[#faf8f5] hover:bg-[#faf7f0]'
        } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.heic,.heif,.tiff,.bmp,.svg,.avif,.webp,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          title="Upload product images"
        />
        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#e6e2d8] flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-[#cda851]" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#1c1b18]">
              {isDragging ? 'Drop images here to upload' : 'Click to select multiple images or drag & drop'}
            </p>
            <p className="text-[11px] text-gray-500">
              Select 1 or more images • JPG, PNG, HEIC, WEBP, AVIF (Auto-transcoded to WebP, max 20MB)
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar & Status */}
      {isUploading && (
        <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
          <div className="flex justify-between items-center text-[11px] font-semibold text-gray-700">
            <span className="truncate max-w-[80%]">{statusMessage || 'Uploading...'}</span>
            <span className="text-[#8a7238] font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-amber-100/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#cda851] to-[#dfc27d] transition-all duration-150 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Notification */}
      {statusMessage && !isUploading && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-800 text-xs font-medium border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Previews Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>Uploaded Images ({images.length})</span>
            <span className="text-[10px]">Click star to set primary thumbnail</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
            {images.map((url, idx) => {
              const isMain = url === mainImage || (!mainImage && idx === 0);
              return (
                <div
                  key={`${url}-${idx}`}
                  className={`relative group aspect-square rounded-xl overflow-hidden border bg-white transition-all shadow-xs ${
                    isMain ? 'border-[#cda851] ring-2 ring-[#cda851]/40 shadow-sm' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Product view ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Hover / Touch Overlay Controls */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                    <button
                      type="button"
                      onClick={() => handleSetMain(url)}
                      className={`p-1.5 rounded-full cursor-pointer transition-transform active:scale-90 ${
                        isMain
                          ? 'bg-[#cda851] text-white shadow-xs'
                          : 'bg-white/95 text-gray-700 hover:text-[#cda851] hover:scale-110'
                      }`}
                      title={isMain ? 'Primary Thumbnail' : 'Set as Primary'}
                    >
                      <Star className="w-3.5 h-3.5" fill={isMain ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(url)}
                      className="p-1.5 rounded-full bg-white/95 text-gray-700 hover:text-red-600 hover:scale-110 cursor-pointer transition-transform active:scale-90"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Primary Badge */}
                  {isMain && (
                    <span className="absolute bottom-1.5 left-1.5 bg-[#cda851] text-[#1c1b18] text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs">
                      Primary
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
