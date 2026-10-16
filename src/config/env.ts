/**
 * Vistāra Krafts Admin Portal — Central Environment Configuration
 *
 * Seamlessly resolves environment variables from Vercel, Vite, and local `.env`:
 * Supports both VITE_ prefixed and root variables (e.g. SUPABASE_URL, CLOUDINARY_CLOUD_NAME).
 */

const env = (import.meta as any).env || {};

// If user supplied CLOUDINARY_URL (e.g. cloudinary://apiKey:apiSecret@cloudName)
let parsedCloudName = '';
if (env.CLOUDINARY_URL || env.VITE_CLOUDINARY_URL) {
  const rawUrl = env.CLOUDINARY_URL || env.VITE_CLOUDINARY_URL;
  const match = rawUrl.match(/@([^/?#]+)/);
  if (match) parsedCloudName = match[1];
}

export const SUPABASE_URL: string =
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  'https://niamxrskqhjvzwxomxrx.supabase.co';

export const SUPABASE_ANON_KEY: string =
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  'sb_publishable_gK22Lr7xNqKI7VFAfnsQTA_7UD0S2iu';

export const CLOUDINARY_CLOUD_NAME: string =
  env.VITE_CLOUDINARY_CLOUD_NAME ||
  env.CLOUDINARY_CLOUD_NAME ||
  parsedCloudName ||
  'ecugysfd';

export const CLOUDINARY_UPLOAD_PRESET: string =
  env.VITE_CLOUDINARY_UPLOAD_PRESET ||
  env.CLOUDINARY_UPLOAD_PRESET ||
  env.CLOUDINARY_PRESET ||
  'sxr8cHma94PzeXQGH85s_1yT8FY';

export const IS_PRODUCTION: boolean = env.PROD ?? false;
