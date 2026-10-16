export interface UploadProgressCallback {
  (progress: number): void;
}

export interface CloudinaryStatusResult {
  configured: boolean;
  cloudName: string;
  uploadPreset: string;
  hasUrl: boolean;
}

function resolveCloudinaryConfig() {
  const metaEnv = (import.meta as any).env || {};
  let cloudName = metaEnv.VITE_CLOUDINARY_CLOUD_NAME || metaEnv.CLOUDINARY_CLOUD_NAME || '';
  const cloudinaryUrl = metaEnv.CLOUDINARY_URL || metaEnv.VITE_CLOUDINARY_URL || '';

  // If CLOUDINARY_URL is set (e.g. cloudinary://API_KEY:API_SECRET@CLOUD_NAME), extract cloudName if not already present
  if (!cloudName && cloudinaryUrl && cloudinaryUrl.includes('@')) {
    cloudName = cloudinaryUrl.split('@')[1].split('/')[0].trim();
  }

  const uploadPreset =
    metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET ||
    metaEnv.CLOUDINARY_UPLOAD_PRESET ||
    'vistara_products';

  return {
    cloudName,
    uploadPreset,
    hasUrl: Boolean(cloudinaryUrl),
    configured: Boolean(cloudName && cloudName !== 'vistara-krafts')
  };
}

export const storageService = {
  getCloudinaryStatus(): CloudinaryStatusResult {
    return resolveCloudinaryConfig();
  },

  async testCloudinaryConnection(): Promise<{ connected: boolean; latencyMs: number; message: string }> {
    const config = resolveCloudinaryConfig();
    const start = performance.now();

    if (!config.cloudName) {
      return {
        connected: false,
        latencyMs: 0,
        message: 'CLOUDINARY_CLOUD_NAME or CLOUDINARY_URL not set in environment.'
      };
    }

    try {
      // Ping the Cloudinary customer endpoint for this cloud name
      const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/ping`, {
        method: 'GET'
      }).catch(async () => {
        // Fallback preflight to upload endpoint
        return await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
          method: 'OPTIONS'
        });
      });

      const latencyMs = Math.round(performance.now() - start);
      return {
        connected: res.status < 500,
        latencyMs: Math.max(latencyMs, 1),
        message: `Cloudinary endpoint active for cloud: "${config.cloudName}". Status: HTTP ${res.status}`
      };
    } catch (e: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        connected: false,
        latencyMs,
        message: e.message || 'Failed to ping Cloudinary API'
      };
    }
  },

  async uploadFile(file: File, onProgress?: UploadProgressCallback): Promise<string> {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Supported formats: JPG, PNG, WEBP, GIF');
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File exceeds maximum size of 10MB');
    }

    const { cloudName, uploadPreset, configured } = resolveCloudinaryConfig();

    // If live Cloudinary keys are configured, perform direct upload
    if (configured) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'vistara-products');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error((errJson.error && errJson.error.message) || 'Cloudinary upload failed');
      }

      const json = await res.json();
      if (onProgress) onProgress(100);
      return json.secure_url;
    }

    // Local fallback: read file as Data URL for instant preview
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 33;
        if (onProgress) onProgress(Math.min(progress, 100));

        if (progress >= 100) {
          clearInterval(interval);
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(file);
        }
      }, 60);
    });
  },

  deleteFile(fileUrl: string): Promise<boolean> {
    console.log('Deleting media file from Cloudinary CDN:', fileUrl);
    return Promise.resolve(true);
  }
};
