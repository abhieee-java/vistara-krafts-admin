import React from 'react';
import { LayoutDashboard, Package, Boxes, ShoppingBag, Menu } from 'lucide-react';
import { AdminTab, useRouter } from '../../context/RouterContext';
import { useStore } from '../../context/StoreContext';

interface MobileBottomNavProps {
  onOpenSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSidebar }) => {
  const { currentTab, navigate } = useRouter();
  const { orders } = useStore();

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Catalog', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { id: 'inventory', label: 'Stock', icon: Boxes },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#1c1b18]/95 backdrop-blur-xl border-t border-[#2d2a24] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#cda851]'
                  : 'text-[#9c9589] hover:text-[#f9f8f5]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-[#cda851]' : ''
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-[16px] h-4 rounded-full bg-amber-500 text-[#1c1b18] text-[9px] font-black flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold text-[#cda851]' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#cda851] mt-0.5 shadow-[0_0_6px_#cda851]" />
              )}
            </button>
          );
        })}

        {/* Menu Toggle for Other Sections (Customers, Coupons, Analytics, Security, System, Settings) */}
        <button
          onClick={onOpenSidebar}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[#9c9589] hover:text-[#f9f8f5] active:scale-95 transition-all duration-200"
          aria-label="Open More Menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">More</span>
        </button>
      </div>
    </nav>
  );
};
