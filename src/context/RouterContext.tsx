import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'promotions'
  | 'analytics'
  | 'security'
  | 'system'
  | 'settings';

interface RouterContextType {
  currentTab: AdminTab;
  currentPath: string;
  navigate: (pathOrTab: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Mapping between URL rootpaths and internal admin tabs
const TAB_PATH_MAP: Record<AdminTab, string> = {
  dashboard: '/dashboard',
  products: '/products',
  inventory: '/inventory',
  orders: '/orders',
  customers: '/customers',
  promotions: '/promotions',
  analytics: '/analytics',
  security: '/security',
  system: '/system',
  settings: '/settings'
};

const PATH_TAB_MAP: Record<string, AdminTab> = {
  '': 'dashboard',
  '/': 'dashboard',
  dashboard: 'dashboard',
  '/dashboard': 'dashboard',
  products: 'products',
  '/products': 'products',
  inventory: 'inventory',
  '/inventory': 'inventory',
  orders: 'orders',
  '/orders': 'orders',
  customers: 'customers',
  '/customers': 'customers',
  promotions: 'promotions',
  '/promotions': 'promotions',
  analytics: 'analytics',
  '/analytics': 'analytics',
  security: 'security',
  '/security': 'security',
  system: 'system',
  '/system': 'system',
  settings: 'settings',
  '/settings': 'settings'
};

// Extract tab from current browser URL pathname
function getTabFromPath(pathname: string): AdminTab {
  const clean = pathname.toLowerCase().replace(/\/+$/, '');
  const segment = clean.split('/')[1] || '';
  return PATH_TAB_MAP[segment] || PATH_TAB_MAP[clean] || 'dashboard';
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'dashboard';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  // Listen to browser Back and Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const tab = getTabFromPath(path);
      setCurrentTab(tab);
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (pathOrTab: string) => {
    // If passed a tab ID like 'orders' or a full path like '/orders'
    const targetTab = PATH_TAB_MAP[pathOrTab.toLowerCase()] || 'dashboard';
    const targetPath = TAB_PATH_MAP[targetTab] || '/dashboard';

    setCurrentTab(targetTab);
    setCurrentPath(targetPath);

    // Push state to browser address bar without full page reload
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ tab: targetTab }, '', targetPath);
    }
  };

  return (
    <RouterContext.Provider value={{ currentTab, currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
