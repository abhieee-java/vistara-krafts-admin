export interface UploadProgressCallback {
  (progress: number): void;
}

export const storageService = {
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

    // Simulate Cloudflare R2 upload progress
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (onProgress) onProgress(Math.min(progress, 100));

        if (progress >= 100) {
          clearInterval(interval);

          // Read file as Data URL for realistic preview
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(file);
        }
      }, 100);
    });
  },

  deleteFile(fileUrl: string): Promise<boolean> {
    console.log('Mock deleting file from Cloudflare R2 bucket:', fileUrl);
    return Promise.resolve(true);
  }
};
