import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Orders } from './pages/Orders';
import { Customers } from './pages/Customers';
import { Promotions } from './pages/Promotions';
import { Analytics } from './pages/Analytics';
import { Security } from './pages/Security';
import { SystemHealth } from './pages/SystemHealth';
import { Settings } from './pages/Settings';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/Toast';
import { Order } from './types';

const AdminPortalApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [activeOrderForDrawer, setActiveOrderForDrawer] = useState<Order | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1c1b18] text-[#cda851] flex items-center justify-center font-serif text-lg">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-[#cda851] border-t-transparent animate-spin" />
          <span>Loading Vistāra Krafts Console...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#f9f8f5] text-[#1c1b18] flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenOrder={(ord) => {
                setActiveOrderForDrawer(ord);
                setCurrentTab('orders');
              }}
              onOpenNewProduct={() => {
                setCurrentTab('products');
                setIsNewProductModalOpen(true);
              }}
            />
          )}

          {currentTab === 'products' && (
            <Products
              onOpenNewProduct={() => setIsNewProductModalOpen(true)}
              isCreateModalOpen={isNewProductModalOpen}
              setIsCreateModalOpen={setIsNewProductModalOpen}
            />
          )}

          {currentTab === 'inventory' && <Inventory />}

          {currentTab === 'orders' && (
            <Orders
              selectedOrder={activeOrderForDrawer}
              setSelectedOrder={setActiveOrderForDrawer}
            />
          )}

          {currentTab === 'customers' && <Customers />}

          {currentTab === 'promotions' && <Promotions />}

          {currentTab === 'analytics' && <Analytics />}

          {currentTab === 'security' && <Security />}

          {currentTab === 'system' && <SystemHealth />}

          {currentTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <AdminPortalApp />
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;
