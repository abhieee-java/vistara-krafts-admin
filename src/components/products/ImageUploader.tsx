import React, { useState, useRef } from 'react';
import {
  Plus,
  X,
  Star,
  Link2,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Upload
} from 'lucide-react';
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
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
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
        setStatusMessage(`Transcoding & uploading ${i + 1} of ${totalFiles}: ${file.name.slice(0, 20)}...`);

        const url = await storageService.uploadFile(file, (p) => {
          const baseProgress = Math.round((i / totalFiles) * 100);
          const currentStep = Math.round((p / 100) * (100 / totalFiles));
          setUploadProgress(Math.min(baseProgress + currentStep, 99));
        });

        newUrls.push(url);
      }

      setUploadProgress(100);
      setStatusMessage(`Uploaded ${totalFiles} ${totalFiles === 1 ? 'image' : 'images'} successfully!`);

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

  const handleRemove = async (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = images.filter((img) => img !== url);
    const newMain = mainImage === url ? (updated[0] || '') : mainImage;
    onImagesChange(updated, newMain);
    if (previewModalUrl === url) setPreviewModalUrl(null);
    await storageService.deleteFile(url).catch(() => {});
  };

  const handleSetMain = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onImagesChange(images, url);
  };

  const handleMove = (index: number, direction: 'left' | 'right', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    onImagesChange(reordered, mainImage);
  };

  return (
    <div className="space-y-2.5">
      {/* Section Header with Minimal Vertical Footprint */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#1c1b18]">
            Product Photos
          </label>
          <span className="text-[11px] font-mono font-medium text-gray-500 bg-[#faf8f5] px-2 py-0.5 rounded-full border border-[#e6e2d8]">
            {images.length} {images.length === 1 ? 'photo' : 'photos'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8a7238] hover:text-[#cda851] cursor-pointer transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>{showUrlField ? 'Hide URL' : 'Add via URL'}</span>
        </button>
      </div>

      {/* Direct URL Accordion Input */}
      {showUrlField && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200">
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
            placeholder="Paste direct image URL (https://...)"
            className="flex-1 h-8 px-3 rounded-lg border border-[#e6e2d8] bg-white text-xs outline-none focus:ring-2 focus:ring-[#cda851]"
          />
          <button
            type="button"
            onClick={() => handleAddUrl()}
            className="h-8 px-3 rounded-lg bg-[#cda851] text-[#1c1b18] text-xs font-bold hover:bg-[#dfc27d] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      )}

      {/* Hidden File Input for Multi-Select */}
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

      {/* Compact Horizontal Scrollable Gallery Strip */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth transition-colors rounded-xl ${
          isDragging ? 'bg-amber-50/70 ring-2 ring-[#cda851] p-1.5' : ''
        }`}
      >
        {/* Compact Add Photos Tile (Always Visible First) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-[74px] h-[74px] sm:w-20 sm:h-20 shrink-0 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 text-center p-1.5 ${
            isDragging
              ? 'border-[#cda851] bg-amber-100/70 text-[#8a7238]'
              : 'border-[#dcd6c8] bg-[#faf8f5] hover:border-[#cda851] hover:bg-amber-50/40 text-gray-600 hover:text-[#8a7238]'
          } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
          title="Add product photos (select multiple)"
          aria-label="Add product photos"
        >
          <div className="w-6 h-6 rounded-full bg-white shadow-2xs border border-[#e6e2d8] flex items-center justify-center text-[#cda851]">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold tracking-tight leading-none text-[#1c1b18]">Add Photos</span>
        </button>

        {/* Uploaded Photo Thumbnails in Horizontal Flow */}
        {images.map((url, idx) => {
          const isMain = url === mainImage || (!mainImage && idx === 0);
          return (
            <div
              key={`${url}-${idx}`}
              onClick={() => setPreviewModalUrl(url)}
              className={`group relative w-[74px] h-[74px] sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border bg-white shadow-2xs transition-all cursor-pointer ${
                isMain
                  ? 'border-[#cda851] ring-2 ring-[#cda851]/40 shadow-xs'
                  : 'border-[#e6e2d8] hover:border-gray-400'
              }`}
              title="Tap to preview high-res image"
            >
              <img
                src={url}
                alt={`View ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover select-none pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80';
                }}
              />

              {/* Hover / Touch Quick Actions Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                <button
                  type="button"
                  onClick={(e) => handleSetMain(url, e)}
                  className={`p-1 rounded-full cursor-pointer transition-transform active:scale-90 ${
                    isMain
                      ? 'bg-[#cda851] text-white'
                      : 'bg-white/95 text-gray-700 hover:text-[#cda851]'
                  }`}
                  title={isMain ? 'Primary Thumbnail' : 'Set as Primary'}
                  aria-label="Set as primary thumbnail"
                >
                  <Star className="w-3 h-3" fill={isMain ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRemove(url, e)}
                  className="p-1 rounded-full bg-white/95 text-gray-700 hover:text-red-600 cursor-pointer transition-transform active:scale-90"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Primary Badge */}
              {isMain && (
                <span className="absolute bottom-1 left-1 bg-[#cda851] text-[#1c1b18] text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                  Primary
                </span>
              )}

              {/* Tap to Inspect Indicator Icon */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-black/60 text-white pointer-events-none">
                <Maximize2 className="w-2.5 h-2.5" />
              </div>
            </div>
          );
        })}

        {/* Empty State Prompt (Minimal Footprint: Only when 0 images) */}
        {images.length === 0 && (
          <div className="flex items-center gap-2 text-[11px] text-gray-500 pl-1 py-2">
            <span>Tap <strong className="text-gray-700 font-semibold">+ Add Photos</strong> to upload product views (Auto-WebP, max 20MB)</span>
          </div>
        )}
      </div>

      {/* Progress Bar & Status Message */}
      {isUploading && (
        <div className="space-y-1.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex justify-between items-center text-[11px] font-semibold text-gray-700">
            <span className="truncate max-w-[80%]">{statusMessage || 'Transcoding & uploading...'}</span>
            <span className="text-[#8a7238] font-mono font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#cda851] to-[#dfc27d] transition-all duration-150 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Notification */}
      {statusMessage && !isUploading && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-red-50 text-red-800 text-[11px] font-medium border border-red-200">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-bold text-red-700 hover:underline shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Lightbox / High-Res Image Inspection Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-[#faf8f5]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1c1b18]">Image Inspection</span>
                {previewModalUrl === mainImage && (
                  <span className="bg-[#cda851] text-[#1c1b18] text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                    Primary Thumbnail
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="w-7 h-7 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-Res Image Canvas */}
            <div className="p-4 bg-gray-950 flex items-center justify-center overflow-hidden flex-1 min-h-[260px] max-h-[55vh]">
              <img
                src={previewModalUrl}
                alt="High resolution product view"
                className="max-w-full max-h-[50vh] object-contain rounded-lg"
              />
            </div>

            {/* Modal Quick Actions */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2 bg-white">
              <button
                type="button"
                onClick={() => handleRemove(previewModalUrl)}
                className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Delete Photo</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetMain(previewModalUrl)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewModalUrl === mainImage
                    ? 'bg-amber-100 text-[#8a7238] border border-amber-300'
                    : 'bg-[#cda851] text-[#1c1b18] hover:bg-[#dfc27d]'
                }`}
              >
                <Star className="w-3.5 h-3.5" fill={previewModalUrl === mainImage ? 'currentColor' : 'none'} />
                <span>{previewModalUrl === mainImage ? 'Current Primary' : 'Set as Primary'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
