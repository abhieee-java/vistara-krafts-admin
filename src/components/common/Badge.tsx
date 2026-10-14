import React from 'react';
import { OrderStatus, PaymentStatus } from '../../types';

interface BadgeProps {
  status: OrderStatus | PaymentStatus | 'in_stock' | 'out_of_stock' | 'low_stock' | 'active' | 'blocked';
  label?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, label }) => {
  const getStyle = () => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'packed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipped':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'delivered':
      case 'paid':
      case 'in_stock':
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
      case 'failed':
      case 'out_of_stock':
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
      case 'low_stock':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const displayText = label || status.replace('_', ' ').toUpperCase();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border tracking-wider uppercase ${getStyle()}`}
    >
      {displayText}
    </span>
  );
};
