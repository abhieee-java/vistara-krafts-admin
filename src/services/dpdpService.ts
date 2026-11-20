import { DpdpTicket } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const DPDP_STORAGE_KEY = 'vk_dpdp_tickets_v1';
const STOREFRONT_DPDP_KEY = 'ram_vk_dpdp_tickets_v1';

export const dpdpService = {
  getTickets(): DpdpTicket[] {
    const map = new Map<string, DpdpTicket>();

    // 1. Check admin storage
    try {
      const adminData = localStorage.getItem(DPDP_STORAGE_KEY);
      if (adminData) {
        const parsed = JSON.parse(adminData);
        if (Array.isArray(parsed)) {
          parsed.forEach((t: DpdpTicket) => {
            if (t && (t.ticketId || t.id)) {
              map.set(t.ticketId || (t.id as string), t);
            }
          });
        }
      }
    } catch (e) {
      console.warn('[dpdpService] Error reading admin tickets:', e);
    }

    // 2. Check storefront local storage bridge
    try {
      const storeData = localStorage.getItem(STOREFRONT_DPDP_KEY);
      if (storeData) {
        const parsed = JSON.parse(storeData);
        if (Array.isArray(parsed)) {
          parsed.forEach((t: any) => {
            const ticketId = t.ticketId || t.id;
            if (ticketId && !map.has(ticketId)) {
              map.set(ticketId, {
                id: t.id || ticketId,
                ticketId: ticketId,
                requestType: t.requestType || 'Grievance Redressal',
                fullName: t.fullName || 'Patron',
                email: t.email || '',
                mobile: t.mobile || '',
                orderId: t.orderId || '',
                details: t.details || '',
                status: t.status === 'In Review (SLA <= 7 Days)' ? 'open' : (t.status || 'open'),
                slaDeadline: t.slaDeadline || new Date(Date.now() + 7 * 86400000).toISOString(),
                resolutionNotes: t.resolutionNotes || '',
                resolvedAt: t.resolvedAt || null,
                createdAt: t.createdAtIso || t.timestamp || new Date().toISOString(),
                updatedAt: t.updatedAtIso || t.createdAtIso || new Date().toISOString()
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('[dpdpService] Error reading storefront tickets:', e);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async fetchFromSupabase(): Promise<DpdpTicket[]> {
    const local = this.getTickets();
    if (!isSupabaseConfigured) return local;

    try {
      const { data, error } = await supabase
        .from('dpdp_grievances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[dpdpService] Supabase fetch error:', error.message);
        return local;
      }

      if (Array.isArray(data)) {
        const map = new Map<string, DpdpTicket>();

        // Seed with local first
        local.forEach((t) => map.set(t.ticketId, t));

        // Overwrite/merge with authoritative Supabase records
        data.forEach((row: any) => {
          const ticketId = row.ticket_id || row.id;
          map.set(ticketId, {
            id: row.id,
            ticketId: ticketId,
            requestType: row.request_type || 'Grievance Redressal',
            fullName: row.full_name || 'Patron',
            email: row.email,
            mobile: row.mobile || '',
            orderId: row.order_id || '',
            details: row.details || '',
            status: row.status || 'open',
            slaDeadline: row.sla_deadline,
            resolutionNotes: row.resolution_notes || '',
            resolvedAt: row.resolved_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          });
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        try {
          localStorage.setItem(DPDP_STORAGE_KEY, JSON.stringify(merged));
        } catch (_e) {}

        return merged;
      }
    } catch (err: any) {
      console.warn('[dpdpService] Exception fetching from Supabase:', err.message);
    }

    return local;
  },

  async updateTicketStatus(
    ticketId: string,
    status: string,
    resolutionNotes?: string
  ): Promise<DpdpTicket | null> {
    const nowIso = new Date().toISOString();
    const isResolved = status === 'resolved';

    // 1. Update in Supabase
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('dpdp_grievances')
          .update({
            status,
            resolution_notes: resolutionNotes ?? '',
            resolved_at: isResolved ? nowIso : null,
            updated_at: nowIso
          })
          .eq('ticket_id', ticketId);

        if (error) {
          console.warn('[dpdpService] Supabase update warning:', error.message);
        }
      } catch (err: any) {
        console.warn('[dpdpService] Exception updating Supabase:', err.message);
      }
    }

    // 2. Update local storage
    const currentTickets = this.getTickets();
    const idx = currentTickets.findIndex((t) => t.ticketId === ticketId);
    let updatedTicket: DpdpTicket;

    if (idx !== -1) {
      updatedTicket = {
        ...currentTickets[idx],
        status,
        resolutionNotes: resolutionNotes ?? currentTickets[idx].resolutionNotes ?? '',
        resolvedAt: isResolved ? nowIso : null,
        updatedAt: nowIso
      };
      currentTickets[idx] = updatedTicket;
    } else {
      updatedTicket = {
        ticketId,
        requestType: 'Grievance Redressal',
        fullName: 'Patron',
        email: '',
        details: '',
        status,
        resolutionNotes: resolutionNotes ?? '',
        resolvedAt: isResolved ? nowIso : null,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      currentTickets.unshift(updatedTicket);
    }

    try {
      localStorage.setItem(DPDP_STORAGE_KEY, JSON.stringify(currentTickets));
      // Also sync to storefront key if present
      const storeData = localStorage.getItem(STOREFRONT_DPDP_KEY);
      if (storeData) {
        const parsed = JSON.parse(storeData);
        if (Array.isArray(parsed)) {
          const storeIdx = parsed.findIndex((t: any) => t.ticketId === ticketId);
          if (storeIdx !== -1) {
            parsed[storeIdx] = {
              ...parsed[storeIdx],
              status,
              resolutionNotes: resolutionNotes ?? '',
              resolvedAt: isResolved ? nowIso : null,
              updatedAtIso: nowIso
            };
            localStorage.setItem(STOREFRONT_DPDP_KEY, JSON.stringify(parsed));
          }
        }
      }
    } catch (_e) {}

    // 3. Broadcast cross-tab to storefront
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({
          type: 'DPDP_TICKET_UPDATED',
          ticket: updatedTicket
        });
        channel.close();
      }
    } catch (_e) {}

    return updatedTicket;
  }
};
