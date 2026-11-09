import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Rocket,
  Package,
  ShoppingBag,
  Sliders,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';

export const COACHMARKS_STORAGE_KEY = 'vk_admin_coachmarks_seen';

interface CoachTip {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  targetTab?: string;
  actionLabel?: string;
}

const COACH_TIPS: CoachTip[] = [
  {
    id: 'overview',
    badge: '1 OF 5 • DAILY PULSE',
    title: 'Overview: Check Store Pulse',
    description:
      'Start here every day. Review today’s revenue, pending orders needing dispatch, and low stock warnings at a glance before handling orders or catalog updates.',
    icon: LayoutDashboard,
    iconBg: 'bg-amber-500/10 text-amber-600 border-amber-200',
    iconColor: 'text-[#cda851]',
    targetTab: 'dashboard',
    actionLabel: 'Open Overview'
  },
  {
    id: 'catalog',
    badge: '2 OF 5 • MANAGE ARTWORKS',
    title: 'Catalog: Add & Edit Products',
    description:
      'Use this whenever you want to list a new resin piece, adjust prices, edit descriptions, or upload photos. Tap any card to edit it, or tap "+ Add Product" to publish a new piece.',
    icon: Package,
    iconBg: 'bg-blue-500/10 text-blue-600 border-blue-200',
    iconColor: 'text-blue-700',
    targetTab: 'products',
    actionLabel: 'Open Catalog'
  },
  {
    id: 'orders',
    badge: '3 OF 5 • ORDER FULFILLMENT',
    title: 'Orders: Ship & Print GST Bills',
    description:
      'Use this when customers place orders. Tap any order to view delivery details, paste BlueDart/Delhivery tracking numbers, and download official 18% GST tax invoices in 1 click.',
    icon: ShoppingBag,
    iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    iconColor: 'text-emerald-700',
    targetTab: 'orders',
    actionLabel: 'Open Orders'
  },
  {
    id: 'settings',
    badge: '4 OF 5 • STORE RULES',
    title: 'Settings: Shipping, Coupons & Banners',
    description:
      'Use this tab to set your free delivery order cutoff (e.g. ₹999), create promotional discount coupon codes, or customize the header announcement bar shown on customer phones.',
    icon: Sliders,
    iconBg: 'bg-purple-500/10 text-purple-600 border-purple-200',
    iconColor: 'text-purple-700',
    targetTab: 'settings',
    actionLabel: 'Open Settings'
  },
  {
    id: 'publishing',
    badge: '5 OF 5 • PUSH LIVE',
    title: 'Publish: Push Changes to Customers',
    description:
      'Whenever you finish adding products, modifying prices, or editing store announcements, tap the red "Publish" button in the top header. Your updates reflect live on customer screens immediately.',
    icon: Rocket,
    iconBg: 'bg-rose-500/10 text-rose-600 border-rose-200',
    iconColor: 'text-[#9e3322]',
    actionLabel: 'Got it!'
  }
];

interface CoachmarksProps {
  onNavigateTab?: (tab: string) => void;
  forceOpen?: boolean;
  onCloseForce?: () => void;
}

export const Coachmarks: React.FC<CoachmarksProps> = ({
  onNavigateTab,
  forceOpen = false,
  onCloseForce
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-detect first time login on this device (gentle, optional prompt)
  useEffect(() => {
    if (forceOpen) {
      setCurrentStep(0);
      setIsVisible(true);
      return;
    }

    try {
      const seen = localStorage.getItem(COACHMARKS_STORAGE_KEY);
      if (!seen) {
        // Subtle delay so interface mounts gracefully before showing tip card
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch (_e) {}
  }, [forceOpen]);

  // Global trigger helper (e.g., from header "How to Use" button)
  useEffect(() => {
    const handleTrigger = () => {
      setCurrentStep(0);
      setIsVisible(true);
    };
    window.addEventListener('vk_open_coachmarks', handleTrigger);
    return () => window.removeEventListener('vk_open_coachmarks', handleTrigger);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(COACHMARKS_STORAGE_KEY, 'true');
    } catch (_e) {}
    if (onCloseForce) onCloseForce();
  };

  const handleNext = () => {
    if (currentStep < COACH_TIPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAction = (tip: CoachTip) => {
    if (tip.targetTab && onNavigateTab) {
      onNavigateTab(tip.targetTab);
    }
    handleNext();
  };

  if (!isVisible) return null;

  const tip = COACH_TIPS[currentStep];
  const IconComponent = tip.icon;
  const isLast = currentStep === COACH_TIPS.length - 1;

  const coachContent = (
    <div
      className="fixed z-[90] bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm w-auto tipkit-enter"
      style={{ isolation: 'isolate' }}
      role="region"
      aria-label="How to Use Vistāra Krafts Console"
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#e6e2d8] shadow-[0_20px_50px_-12px_rgba(28,27,24,0.35)] p-4 sm:p-5 flex flex-col gap-3.5 transition-all duration-300">
        
        {/* Top Header Row with Step Badge & Corner Cross (X) Button */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${tip.iconBg}`}>
              <IconComponent className={`w-4 h-4 ${tip.iconColor}`} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase block truncate">
                {tip.badge}
              </span>
            </div>
          </div>

          {/* Cross (X) Button in the Right Corner for Instant Optional Dismissal */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all flex items-center justify-center cursor-pointer active:scale-90 shrink-0"
            aria-label="Close guide"
            title="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tip Title and "How to Use" Explanatory Copy */}
        <div className="space-y-1.5">
          <h4 className="font-serif font-bold text-sm sm:text-base text-[#1c1b18] leading-tight">
            {tip.title}
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            {tip.description}
          </p>
        </div>

        {/* Optional Action Pill / Tab Navigation Link */}
        {tip.targetTab && (
          <button
            type="button"
            onClick={() => handleAction(tip)}
            className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a7238] hover:text-[#cda851] cursor-pointer transition-colors"
          >
            <span>{tip.actionLabel || 'Go to Tab'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom Pagination & Navigation Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-[#f0ece3] gap-2 shrink-0">
          
          {/* Apple-style Pagination Dots + Quick Skip Option */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {COACH_TIPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentStep
                      ? 'w-5 bg-[#cda851]'
                      : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer transition-colors px-1"
            >
              Skip
            </button>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="h-8 px-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer active:scale-95 flex items-center gap-0.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`h-8 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs ${
                isLast
                  ? 'bg-[#1c1b18] text-[#cda851] hover:bg-[#2d2a24]'
                  : 'bg-[#cda851] text-[#1c1b18] hover:bg-[#dfc27d]'
              }`}
            >
              <span>{isLast ? 'Done' : 'Next'}</span>
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(coachContent, document.body);
};
