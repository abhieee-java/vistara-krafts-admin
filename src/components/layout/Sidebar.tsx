import React from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  Ticket,
  BarChart3,
  ShieldCheck,
  Activity,
  Settings,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  setIsOpen
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Catalog', icon: Package },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
    { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag },
    { id: 'customers', label: 'Customer Directory', icon: Users },
    { id: 'promotions', label: 'Coupons & Banners', icon: Ticket },
    { id: 'analytics', label: 'Analytics & Sales', icon: BarChart3 },
    { id: 'security', label: 'Security & Logs', icon: ShieldCheck },
    { id: 'system', label: 'System Health', icon: Activity },
    { id: 'settings', label: 'Store Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#1c1b18] text-[#f9f8f5] flex flex-col border-r border-[#2d2a24] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#2d2a24] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#cda851] to-[#a38032] flex items-center justify-center text-[#1c1b18] font-serif font-black text-sm shadow-md">
              VK
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm text-[#f9f8f5] tracking-wide leading-tight">
                Vistāra Krafts
              </h1>
              <span className="text-[10px] text-[#cda851] font-medium tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Owner Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold text-[#8a857b] tracking-wider">
            Store Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#cda851] text-[#1c1b18] font-semibold shadow-md translate-x-1'
                    : 'text-[#d6d2c8] hover:bg-[#282622] hover:text-white hover:translate-x-1'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[#1c1b18]' : 'text-[#a6a092]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live Storefront Link Button */}
        <div className="p-3 border-t border-[#2d2a24] bg-[#161513]">
          <a
            href="http://localhost:3000/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs text-[#cda851] bg-[#23211d] hover:bg-[#2c2924] border border-[#3d3830] transition-colors"
          >
            <span className="font-medium">View Storefront (Port 3000)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="mt-2 text-[10px] text-center text-[#7a756b]">
            Single-Owner Mode • v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};
