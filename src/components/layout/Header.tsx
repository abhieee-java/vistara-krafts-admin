import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, Shield, Wifi } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onOpenMobileMenu }) => {
  const { user, logout } = useAuth();

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
        return 'System Health & Cloudflare Services';
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
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold">
          <Wifi className="w-3 h-3 text-amber-600 animate-pulse" />
          <span>Local Mock Layer Active</span>
        </div>

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
