import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Order, OrderStatus, PreservationStage } from '../../types';
import { useStore } from '../../context/StoreContext';
import { StatusBadge } from '../common/Badge';
import {
  X,
  Truck,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  RotateCcw,
  Ban,
  Trash2,
  CheckCircle2,
  Sparkles,
  Camera,
  Calendar,
  Layers,
  Save,
  Maximize2
} from 'lucide-react';

interface OrderDetailDrawerProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onUpdateTracking: (
    orderId: string,
    carrier: 'Delhivery' | 'BlueDart' | 'DTDC',
    trackingNumber: string
  ) => void;
  onCancelOrder: (orderId: string) => void;
  onRefundOrder: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  onOpenInvoice: (order: Order) => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onUpdateTracking,
  onCancelOrder,
  onRefundOrder,
  onDeleteOrder,
  onOpenInvoice
}) => {
  const { updatePreservationStage, updateCustomArtisanNotes } = useStore();
  const [carrier, setCarrier] = useState<'Delhivery' | 'BlueDart' | 'DTDC'>(
    order?.carrier || 'Delhivery'
  );
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [artisanNotes, setArtisanNotes] = useState(order?.customDetails?.artisanNotes || '');
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  if (!order) return null;

  const isCustom = Boolean(
    order.isCustomPreservation ||
    order.customDetails ||
    (order.items && order.items.some((i) => i.sku === 'RAM-CUSTOM-KEEP' || (i as any).isCustomPreservation || (i as any).customDetails))
  );
  const custom = order.customDetails;

  const preservationStages: PreservationStage[] = [
    'Floral Awaiting Pickup',
    'Cryo-Silica Dehydration',
    'Botanical Prep & Color Lock',
    'Base Layer Optical Pour',
    'Deep Pour & Pressure Curing',
    'Diamond Milling & Lapping',
    'Ceramic Coating & QA Inspection',
    'Dispatched in Velvet Vault'
  ];

  const currentStage = order.preservationStage || custom?.preservationStage || 'Floral Awaiting Pickup';
  const currentStageIndex = Math.max(0, preservationStages.indexOf(currentStage));

  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    onUpdateTracking(order.id, carrier, trackingNumber.trim());
    setIsUpdatingTracking(false);
  };

  const handleSaveArtisanNotes = () => {
    updateCustomArtisanNotes(order.id, artisanNotes);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black/65 backdrop-blur-md modal-backdrop-enter">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-xl flex pl-0 sm:pl-10 z-10 drawer-slide-in">
        <div className="w-full bg-white shadow-2xl flex flex-col border-l border-[#e6e2d8]">
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 bg-[#faf8f5] border-b border-[#e6e2d8] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#1c1b18] whitespace-nowrap">
                  {order.orderNumber}
                </h3>
                <StatusBadge status={order.orderStatus} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1 font-medium flex-wrap">
                <Clock className="w-3.5 h-3.5 text-[#cda851] shrink-0" />
                <span>Placed: <strong className="text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</strong></span>
                <span>•</span>
                <span className="uppercase text-[11px] font-semibold text-emerald-700">{order.paymentMethod} ({order.paymentStatus})</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenInvoice(order)}
                className="p-2 rounded-xl text-gray-600 hover:text-[#1c1b18] hover:bg-gray-100 transition-all active:scale-95 cursor-pointer"
                title="Print Invoice"
              >
                <FileText className="w-5 h-5 text-[#cda851]" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all active:scale-95 cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Quick Status Bar */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#1c1b18]">Fulfillment Status:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['pending', 'processing', 'packed', 'shipped', 'delivered'] as OrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => onUpdateStatus(order.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          order.orderStatus === st
                            ? 'bg-[#1c1b18] text-[#cda851] shadow-sm'
                            : 'bg-white text-gray-600 border border-[#e6e2d8] hover:bg-gray-50'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Courier Tracking Section */}
              <div className="pt-3 border-t border-[#e6e2d8]">
                {order.trackingNumber && !isUpdatingTracking ? (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-teal-800">
                      <Truck className="w-4 h-4 text-teal-600" />
                      <span>
                        <strong>{order.carrier}</strong> AWB: {order.trackingNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsUpdatingTracking(true)}
                      className="text-[11px] text-[#cda851] font-semibold underline"
                    >
                      Edit Tracking
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveTracking} className="space-y-2">
                    <label className="block text-[11px] font-bold text-gray-700">
                      Assign Courier & Tracking AWB
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value as any)}
                        className="h-9 px-2 rounded-lg border border-[#e6e2d8] text-xs bg-white"
                      >
                        <option value="Delhivery">Delhivery Express</option>
                        <option value="BlueDart">BlueDart Air</option>
                        <option value="DTDC">DTDC Priority</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. DEL98213812 or BD771829"
                        className="flex-1 h-9 px-3 rounded-lg border border-[#e6e2d8] text-xs font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 h-9 rounded-lg bg-[#cda851] text-[#1c1b18] text-xs font-bold hover:bg-[#dfc27d]"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* ARTISAN FLORAL PRESERVATION CONTROL CENTER (When Custom Commission) */}
            {isCustom && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#fdfbf7] to-[#fff6f3] border-2 border-[#b08d57]/35 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌸</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1c1b18] uppercase tracking-wider flex items-center gap-1.5">
                        <span>Artisan Floral Preservation Control Center</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          Custom Keepsake
                        </span>
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Manage cryo-dehydration chemistry, 50mm diamond cast layers, and patron communications.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#aa771c] font-mono">
                    Stage {currentStageIndex + 1}/8
                  </span>
                </div>

                {/* 1. Attached Floral Reference Photo */}
                <div className="p-3 rounded-xl bg-white border border-[#e6e2d8] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1b18]">
                      <Camera className="w-3.5 h-3.5 text-[#cda851]" />
                      <span>Patron Flower Reference Photo</span>
                    </div>
                    {custom?.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setIsPhotoZoomed(true)}
                        className="text-[11px] text-[#cda851] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Enlarge Photo</span>
                      </button>
                    )}
                  </div>

                  {custom?.photoUrl ? (
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setIsPhotoZoomed(true)}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#cda851]/40 shadow-xs cursor-pointer group shrink-0"
                      >
                        <img
                          src={custom.photoUrl}
                          alt="Patron's Uploaded Flower Reference"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xs space-y-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {custom.photoName || 'Client Flower Photo Reference'}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Verify flower variety (roses, marigolds, orchids) before pre-treatment.
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Image Verified</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#faf8f5] border border-dashed border-[#e6e2d8] text-center text-xs text-gray-500">
                      <span>No digital flower photo attached by patron. Proceed with physical garland inspection upon doorstep pickup.</span>
                    </div>
                  )}
                </div>

                {/* 2. Interactive Preservation Lifecycle Stepper */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1c1b18] uppercase tracking-wider text-[11px]">
                      Advance Preservation Stage:
                    </span>
                    <span className="text-[11px] text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Active: {currentStage}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {preservationStages.map((st, i) => {
                      const isCurrent = st === currentStage;
                      const isPast = i < currentStageIndex;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updatePreservationStage(order.id, st)}
                          className={`p-2 rounded-xl text-left transition-all text-xs font-semibold flex flex-col justify-between min-h-[58px] cursor-pointer active:scale-95 ${
                            isCurrent
                              ? 'bg-[#1c1b18] text-[#cda851] ring-2 ring-[#cda851] shadow-xs'
                              : isPast
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-white text-gray-600 border border-[#e6e2d8] hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] font-mono opacity-70">0{i + 1}</span>
                            {isPast && <span className="text-emerald-600 text-xs">✓</span>}
                          </div>
                          <span className="text-[10.5px] leading-tight font-bold mt-1 line-clamp-2">
                            {st}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Bespoke Specifications Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-[#e6e2d8]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Occasion</span>
                    <span className="font-bold text-gray-900">{custom?.occasion || 'Wedding Varmala'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#e6e2d8]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Keepsake Architecture</span>
                    <span className="font-bold text-gray-900">{custom?.shape || '12" Royal Heirloom Block'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#e6e2d8]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Floral Source</span>
                    <span className="font-semibold text-gray-900 truncate block">{custom?.flowerSource || 'Fresh Garlands'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#e6e2d8]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Luxury Inclusions</span>
                    <span className="font-semibold text-gray-900">{custom?.metallic || '24K Gold Leaf'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#e6e2d8]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Secondary Add-On</span>
                    <span className="font-semibold text-gray-900">{custom?.secondaryKeepsake || 'None'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#e6e2d8]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Teak LED Stand</span>
                    <span className="font-bold text-gray-900">{custom?.ledBase ? 'Included (+₹499)' : 'No'}</span>
                  </div>
                </div>

                {/* Calligraphy Inscription */}
                {custom?.engraving && (
                  <div className="p-3 rounded-xl bg-white border border-[#e6e2d8] space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Calligraphy Inscription</span>
                    <div className="flex items-baseline justify-between">
                      <p className="font-serif italic text-sm text-[#1c1b18] font-bold">
                        “{custom.engraving}”
                      </p>
                      <span className="text-[10px] text-gray-500 font-mono">
                        Font: {custom.fontStyle || 'Royal Italic Serif'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Event Schedule & Pickup */}
                <div className="p-3 rounded-xl bg-white border border-[#e6e2d8] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#cda851]" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Event &amp; Pickup Window</span>
                      <span className="font-bold text-gray-900">
                        {custom?.eventDate || 'Scheduled'} • {custom?.pickupSlot || 'Morning Slot'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Insured Pickup
                  </span>
                </div>

                {/* 4. Artisan Lab Notes */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="artisan-notes-textarea" className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Artisan Studio Lab Notes
                    </label>
                    <button
                      type="button"
                      onClick={handleSaveArtisanNotes}
                      className="px-3 py-1 rounded-lg bg-[#1c1b18] text-[#cda851] text-xs font-bold hover:bg-[#2c2924] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save Notes</span>
                    </button>
                  </div>
                  <textarea
                    id="artisan-notes-textarea"
                    rows={2}
                    value={artisanNotes}
                    onChange={(e) => setArtisanNotes(e.target.value)}
                    placeholder="Enter resin batch, moisture reading (e.g. 0.2%), silica weight, or layer pour timestamps..."
                    className="w-full p-2.5 rounded-xl border border-[#e6e2d8] text-xs bg-white text-gray-900 focus:ring-2 focus:ring-[#cda851] outline-none"
                  />
                </div>
              </div>
            )}

            {/* Customer & Delivery Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1c1b18]">
                  <User className="w-4 h-4 text-[#cda851]" />
                  <span>Customer Profile</span>
                </div>
                <p className="text-xs font-semibold text-gray-800">{order.customerName}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Mail className="w-3.5 h-3.5 opacity-60" />
                  <a href={`mailto:${order.customerEmail}`} className="hover:underline">
                    {order.customerEmail}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Phone className="w-3.5 h-3.5 opacity-60" />
                  <a href={`tel:${order.customerPhone}`} className="hover:underline">
                    {order.customerPhone}
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1c1b18]">
                  <MapPin className="w-4 h-4 text-[#cda851]" />
                  <span>Pan-India Delivery Address</span>
                </div>
                <p className="text-xs text-gray-800 font-medium leading-relaxed">
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                  <br />
                  <strong className="text-primary font-mono">
                    PIN: {order.shippingAddress.pincode}
                  </strong>
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#1c1b18] uppercase tracking-wider">
                Order Items ({order.items.length})
              </h4>
              <div className="divide-y divide-[#e6e2d8] border border-[#e6e2d8] rounded-xl bg-white overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-[#e6e2d8] flex items-center justify-center font-serif text-sm font-bold text-[#cda851] shrink-0">
                      VK
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1c1b18] truncate">
                        {item.productName}
                      </p>
                      {item.variantLabel && (
                        <p className="text-[11px] text-[#cda851] font-medium">
                          Edition: {item.variantLabel}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 font-mono">SKU: {item.sku}</p>
                      {item.customNote && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1 border border-amber-200">
                          <strong>Note:</strong> {item.customNote}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#1c1b18]">
                        ₹{item.totalPrice.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {item.quantity} × ₹{item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-₹{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Express Delivery Charge</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div className="pt-2 border-t border-[#e6e2d8] flex justify-between font-bold text-sm text-[#1c1b18]">
                <span>Total Amount</span>
                <span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1b18]">
                <Clock className="w-4 h-4 text-[#cda851]" />
                <span>Order Event Timeline</span>
              </div>
              <div className="space-y-3 pl-2 border-l-2 border-[#e6e2d8]">
                {order.timeline.map((ev, i) => (
                  <div key={i} className="relative pl-4 text-xs">
                    <span className="absolute -left-[1.35rem] top-0.5 w-2.5 h-2.5 rounded-full bg-[#cda851] ring-4 ring-white" />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">
                        {ev.status}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {ev.note && <p className="text-gray-600 text-[11px] mt-0.5">{ev.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 bg-[#faf8f5] border-t border-[#e6e2d8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {order.orderStatus !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => onCancelOrder(order.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Cancel Order
                </button>
              )}
              {order.paymentStatus === 'paid' && order.orderStatus !== 'refunded' && (
                <button
                  type="button"
                  onClick={() => onRefundOrder(order.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-orange-700 hover:bg-orange-50 border border-orange-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Issue Refund
                </button>
              )}
              {onDeleteOrder && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteOrder(order.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
                  title="Delete fake or mock order"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Order
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1c1b18] hover:bg-[#2d2a24] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Photo Zoom Modal */}
      {isPhotoZoomed && custom?.photoUrl && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-[#cda851]/40">
            <div className="p-3 bg-[#faf8f5] border-b border-[#e6e2d8] flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c1b18] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#cda851]" />
                <span>Patron Flower Reference: {custom.photoName || 'Garland Photo'}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsPhotoZoomed(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={custom.photoUrl}
                alt="Enlarged Flower Reference"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="p-3 bg-[#faf8f5] border-t border-[#e6e2d8] text-center text-xs text-gray-500">
              Verify flower colors, petal count, and stem thickness for moisture extraction planning.
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>,
    document.body
  );
};
