import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
    loading?: boolean;
  };
  compact?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className = ''
}) => {
  const ActionIcon = action?.icon;
  const SecondaryIcon = secondaryAction?.icon;

  const actionVariantClass =
    action?.variant === 'secondary'
      ? 'bg-white text-gray-700 border border-[#e6e2d8] hover:bg-[#faf8f5]'
      : action?.variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-[#1c1b18] text-[#cda851] hover:bg-[#2d2a24] shadow-sm';

  return (
    <div
      className={`rounded-2xl border border-[#e6e2d8] bg-white text-center flex flex-col items-center justify-center transition-all ${
        compact ? 'p-6 sm:p-8' : 'p-8 sm:p-12'
      } ${className}`}
    >
      {/* Icon with gentle golden halo glow */}
      <div className="relative mb-3.5 group">
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#cda851]/20 via-[#cda851]/10 to-transparent blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-[#faf8f5] to-[#f4f0e6] border border-[#e6e2d8] flex items-center justify-center text-[#cda851] shadow-sm">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md space-y-1">
        <h4 className="font-serif font-bold text-sm sm:text-base text-[#1c1b18]">
          {title}
        </h4>
        <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${actionVariantClass}`}
            >
              {action.loading ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                ActionIcon && <ActionIcon className="w-4 h-4" />
              )}
              <span>{action.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled || secondaryAction.loading}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-[#e6e2d8] bg-white text-xs font-semibold text-gray-700 hover:bg-[#faf8f5] transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {secondaryAction.loading ? (
                <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin text-[#cda851]" />
              ) : (
                SecondaryIcon && <SecondaryIcon className="w-3.5 h-3.5 text-[#cda851]" />
              )}
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
