import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Menu, LogOut, Shield, Wifi, Rocket } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const { publishToStorefront, isPublishing, lastPublishedVersion, lastPublishedAt } = useStore();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Executive Overview';
      case 'products':
        return 'Products & Optical Resin Catalog';
      case 'inventory':
        return 'Inventory & Stock Auditing';
      case 'orders':
        return 'Orders, Garlands & Express Dispatch';
      case 'customers':
        return 'Customer & Patron Directory';
      case 'promotions':
        return 'Coupons & Announcement Banners';
      case 'analytics':
        return 'Sales & Conversion Analytics';
      case 'security':
        return 'Security, Sessions & Audit Logs';
      case 'system':
        return 'System Health & Cloud Services';
      case 'settings':
        return 'Store & Brand Settings';
      default:
        return 'Owner Portal';
    }
  };

  const getMobileTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Overview';
      case 'products':
        return 'Products';
      case 'inventory':
        return 'Inventory';
      case 'orders':
        return 'Orders';
      case 'customers':
        return 'Patrons';
      case 'promotions':
        return 'Coupons';
      case 'analytics':
        return 'Analytics';
      case 'security':
        return 'Security';
      case 'system':
        return 'System';
      case 'settings':
        return 'Settings';
      default:
        return 'Owner Portal';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#f9f8f5]/90 backdrop-blur-md border-b border-[#e6e2d8] px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
      {/* Left section: mobile button & tab heading */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-1 text-gray-700 hover:bg-gray-200/60 rounded-xl lg:hidden active:scale-95 transition-transform"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="font-serif font-bold text-base sm:text-lg text-[#1c1b18] leading-tight truncate">
            <span className="sm:hidden">{getMobileTitle(currentTab)}</span>
            <span className="hidden sm:inline">{getTabTitle(currentTab)}</span>
          </h2>
          <p className="text-[10px] text-gray-500 hidden sm:block truncate">
            Vistāra Krafts Studio Administration
          </p>
        </div>
      </div>

      {/* Right section: System state & Owner Profile */}
      <div className="flex items-center gap-3">
        {/* Service Readiness Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Supabase Connected</span>
        </div>

        {/* Publish to Live Storefront Button */}
        <button
          onClick={() => publishToStorefront()}
          disabled={isPublishing}
          className="group relative inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#9e3322] via-[#b33a27] to-[#7f2617] hover:from-[#b33a27] hover:to-[#6b1e11] text-white text-xs font-semibold shadow-[0_2px_12px_rgba(158,51,34,0.35)] hover:shadow-[0_4px_20px_rgba(158,51,34,0.5)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer overflow-hidden"
          title={lastPublishedAt ? `Published: ${new Date(lastPublishedAt).toLocaleTimeString()}` : 'Deploy latest catalog & settings in-place to customer storefront'}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          {isPublishing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Rocket className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-amber-200" />
              <span className="hidden sm:inline">Publish to Live Storefront</span>
              <span className="sm:hidden">Publish</span>
              {lastPublishedVersion && (
                <span className="hidden md:inline-flex items-center px-1.5 py-0.2 rounded-full bg-black/20 text-[9px] font-mono opacity-80">
                  v{String(lastPublishedVersion).slice(-4)}
                </span>
              )}
            </>
          )}
        </button>

        {/* Owner Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#e6e2d8]">
          <div className="flex items-center gap-2 text-right">
            <div className="w-8 h-8 rounded-full bg-[#1c1b18] text-[#cda851] flex items-center justify-center font-serif font-bold text-xs shadow-sm">
              <Shield className="w-4 h-4 text-[#cda851]" />
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-[#1c1b18]">
                {user?.name || 'Store Owner'}
              </div>
              <div className="text-[10px] text-gray-500 font-medium">Single Owner</div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out of Owner Portal"
            className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
