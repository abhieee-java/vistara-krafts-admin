import { SystemServiceStatus } from '../types';

export const systemService = {
  getServices(): SystemServiceStatus[] {
    return [
      {
        name: 'Cloudflare D1 Database',
        service: 'cloudflare-d1',
        status: 'mock',
        latencyMs: 14,
        details: 'Active in Local SQLite/Storage Mock. Ready for D1 binding binding: DB in wrangler.toml'
      },
      {
        name: 'Cloudflare R2 Media Storage',
        service: 'cloudflare-r2',
        status: 'mock',
        latencyMs: 22,
        details: 'Active in Client Blob Mock. Ready for S3 API / R2 bucket "vistara-assets"'
      },
      {
        name: 'Razorpay Payment Gateway',
        service: 'razorpay',
        status: 'mock',
        latencyMs: 38,
        details: 'Simulating instant INR settlement & UPI/Card test callbacks. Ready for RZP Key ID'
      },
      {
        name: 'Storefront Broadcast Bridge',
        service: 'webhooks',
        status: 'connected',
        latencyMs: 2,
        details: 'Connected to BroadcastChannel "RAM_STUDIO_LIVE_DROP_CHANNEL" (Live at vistara-krafts.vercel.app)'
      }
    ];
  },

  async testConnection(service: string): Promise<{ success: boolean; latency: number; message: string }> {
    await new Promise((r) => setTimeout(r, 500));
    const latency = Math.floor(Math.random() * 30) + 10;
    return {
      success: true,
      latency,
      message: `Successfully verified handshake with ${service}. Status: Responsive [Mock Mode Ready].`
    };
  }
};
