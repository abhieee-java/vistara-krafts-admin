import React from 'react';
import { Order } from '../../types';
import { Modal } from '../common/Modal';
import { Printer, Sparkles } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Store Order Invoice"
      subtitle={`Tax Invoice #${(order.orderNumber || '').replace(/^#/, '')}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 text-[#1c1b18]">
        {/* Printable Paper Area */}
        <div id="printable-invoice" className="p-8 border border-[#e6e2d8] rounded-2xl bg-white shadow-sm space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-[#e6e2d8] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1c1b18] text-[#cda851] flex items-center justify-center font-serif font-black text-xs">
                  VK
                </div>
                <h2 className="font-serif font-bold text-xl text-[#1c1b18]">Vistāra Krafts</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#cda851]" />
                Resin Art Memories Studio • Pan-India Atelier
              </p>
              <p className="text-[11px] text-gray-400">GSTIN: 29AABCV1234F1Z5 • Bengaluru, KA</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#cda851] bg-[#1c1b18] px-2.5 py-1 rounded">
                TAX INVOICE
              </span>
              <p className="text-xs font-mono font-bold mt-2 whitespace-nowrap">{order.orderNumber}</p>
              <p className="text-[11px] text-gray-500">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Billing & Shipping Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs">
            <div>
              <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                Billed / Shipped To:
              </p>
              <p className="font-bold text-sm text-[#1c1b18] mt-1">{order.customerName}</p>
              <p className="text-gray-600 mt-0.5">{order.shippingAddress.street}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                <strong>{order.shippingAddress.pincode}</strong>
              </p>
              <p className="text-gray-600 mt-1">Contact: {order.customerPhone}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                Dispatch Details:
              </p>
              <p className="text-gray-700 mt-1">Courier: {order.carrier || 'Delhivery Express'}</p>
              <p className="text-gray-700">AWB Tracking: {order.trackingNumber || 'Pending'}</p>
              <p className="text-gray-700">Payment: {order.paymentMethod.toUpperCase()} (Paid)</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-[#1c1b18] text-gray-700 uppercase font-bold text-[10px]">
                  <th className="py-2 text-left">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {order.items.map((it, i) => (
                <tr key={i} className="py-3">
                  <td className="py-3 pr-2">
                    <p className="font-bold text-[#1c1b18]">{it.productName}</p>
                    {it.variantLabel && (
                      <p className="text-[11px] text-gray-500">Edition: {it.variantLabel}</p>
                    )}
                    <p className="text-[10px] text-gray-400 font-mono">SKU: {it.sku}</p>
                  </td>
                  <td className="py-3 text-center">{it.quantity}</td>
                  <td className="py-3 text-right">₹{it.unitPrice.toLocaleString()}</td>
                  <td className="py-3 text-right font-bold">₹{it.totalPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Totals */}
          <div className="border-t border-[#e6e2d8] pt-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({order.couponCode || 'Special Promotion'})</span>
                <span>-₹{order.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Express Insured Shipping</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-[#1c1b18] pt-2 border-t-2 border-[#1c1b18]">
              <span>Final Total Paid</span>
              <span>₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[10px] text-gray-400 text-center pt-4 border-t border-dashed border-[#e6e2d8]">
            Thank you for supporting handcrafted resin art and floral preservation by Vistāra Krafts.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#1c1b18] bg-[#cda851] hover:bg-[#dfc27d] shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};
