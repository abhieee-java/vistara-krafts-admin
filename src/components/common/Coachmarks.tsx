import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Rocket,
  UploadCloud,
  PackageCheck,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Sparkles,
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
    id: 'publishing',
    badge: 'TIP 1 OF 4 • 1-TAP SYNC',
    title: 'Instant Live Storefront Publishing',
    description:
      'Whenever you add products, edit prices, or adjust announcements, tap the red "Publish" button in the top header. Changes sync live across customer browsers in under a second.',
    icon: Rocket,
    iconBg: 'bg-red-500/10 text-red-600 border-red-200',
    iconColor: 'text-[#9e3322]',
    actionLabel: 'Got it'
  },
  {
    id: 'products',
    badge: 'TIP 2 OF 4 • CATALOG & MEDIA',
    title: 'Multi-File & Auto-WebP Image Engine',
    description:
      'Upload product photography effortlessly. Select multiple files or drag & drop—images are automatically transcoded to optical-grade WebP and stored directly on Supabase Storage.',
    icon: UploadCloud,
    iconBg: 'bg-amber-500/10 text-amber-600 border-amber-200',
    iconColor: 'text-[#cda851]',
    targetTab: 'products',
    actionLabel: 'View Products'
  },
  {
    id: 'orders',
    badge: 'TIP 3 OF 4 • DISPATCH & TAX',
    title: 'Live Orders & Official GST Invoices',
    description:
      'Track incoming bookings in real-time. Generate downloadable 18% GST tax invoices with HSN 39073010 and link BlueDart or Delhivery express tracking in one tap.',
    icon: PackageCheck,
    iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    iconColor: 'text-emerald-700',
    targetTab: 'orders',
    actionLabel: 'View Orders'
  },
  {
    id: 'logistics',
    badge: 'TIP 4 OF 4 • STORE SETTINGS',
    title: 'Logistics, Shipping & Banners',
    description:
      'Configure free express delivery thresholds, promotional coupon codes, and the customer header announcement ribbon with instant preview and cross-tab verification.',
    icon: Sliders,
    iconBg: 'bg-blue-500/10 text-blue-600 border-blue-200',
    iconColor: 'text-blue-700',
    targetTab: 'settings',
    actionLabel: 'Open Settings'
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

  // Auto-detect first time login on this device
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
        }, 900);
        return () => clearTimeout(timer);
      }
    } catch (_e) {}
  }, [forceOpen]);

  // Global trigger helper
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
      aria-label="Admin Guide Coachmarks"
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#e6e2d8] shadow-[0_20px_50px_-12px_rgba(28,27,24,0.35)] p-4 sm:p-5 flex flex-col gap-3.5 transition-all duration-300">
        
        {/* Top Header Row with Badge & Corner Cross (X) Button */}
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

          {/* Cross (X) Button in the Right Corner */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all flex items-center justify-center cursor-pointer active:scale-90 shrink-0"
            aria-label="Close tips"
            title="Dismiss coach tips"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tip Title and Concise Copy */}
        <div className="space-y-1.5">
          <h4 className="font-serif font-bold text-sm sm:text-base text-[#1c1b18] leading-tight">
            {tip.title}
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            {tip.description}
          </p>
        </div>

        {/* Optional Action Pill / Tab Shortcut */}
        {tip.targetTab && (
          <button
            type="button"
            onClick={() => handleAction(tip)}
            className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a7238] hover:text-[#cda851] cursor-pointer transition-colors"
          >
            <span>{tip.actionLabel || 'Explore'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom Pagination & Navigation Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-[#f0ece3] gap-2 shrink-0">
          
          {/* Apple-style Pagination Dots */}
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
                aria-label={`Go to tip ${idx + 1}`}
              />
            ))}
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
              <span>{isLast ? 'Got it' : 'Next'}</span>
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(coachContent, document.body);
};
