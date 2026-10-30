import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton, MobileCardSkeleton } from '../components/common/Skeleton';
import { Boxes, AlertTriangle, ArrowUpDown, History, Plus, Minus, Search, RefreshCw } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { products, movements, adjustStock, refreshFromDb, isLoadingDb } = useStore();

  const [search, setSearch] = useState('');
  const [adjustingProductId, setAdjustingProductId] = useState<string | null>(null);
  const [changeAmount, setChangeAmount] = useState<number>(10);
  const [isAddition, setIsAddition] = useState<boolean>(true);
  const [reason, setReason] = useState<
    'Manual Restock' | 'Order Deduction' | 'Damaged / Spoilage' | 'Correction' | 'Return Restock'
  >('Manual Restock');

  const selectedProduct = products.find((p) => p.id === adjustingProductId);

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProductId || changeAmount <= 0) return;
    const finalChange = isAddition ? changeAmount : -changeAmount;
    adjustStock(adjustingProductId, finalChange, reason);
    setAdjustingProductId(null);
    setChangeAmount(10);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Overview Ribbon */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory by title or SKU..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e6e2d8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
          />
        </div>
      </div>

      {/* Loading Skeletons during live database sync */}
      {isLoadingDb && products.length === 0 && (
        <div className="space-y-4">
          <div className="md:hidden">
            <MobileCardSkeleton count={3} />
          </div>
          <div className="hidden md:block bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden p-2">
            <TableSkeleton rows={5} columns={6} />
          </div>
        </div>
      )}

      {/* Zero Products in Inventory State */}
      {!isLoadingDb && products.length === 0 && (
        <div className="my-6">
          <EmptyState
            icon={Boxes}
            title="Inventory Directory Empty"
            description="Products created in the atelier catalog will automatically appear here for real-time stock level and threshold auditing."
            secondaryAction={{
              label: isLoadingDb ? 'Checking DB...' : 'Sync Catalog from Supabase',
              onClick: refreshFromDb,
              icon: RefreshCw,
              loading: isLoadingDb
            }}
          />
        </div>
      )}

      {/* Empty Filter State (Mobile & Desktop) */}
      {products.length > 0 && filteredProducts.length === 0 && (
        <div className="py-4">
          <EmptyState
            icon={Search}
            title="No Matching Inventory Items"
            description="No inventory items match your search keyword. Try clearing or searching for another SKU or title."
            compact
            secondaryAction={{
              label: 'Clear Search',
              onClick: () => setSearch('')
            }}
          />
        </div>
      )}

      {/* Mobile Stock Cards (Phone Screens < 768px) */}
      {filteredProducts.length > 0 && (
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#cda851]" />
              <span className="font-serif font-bold text-xs text-[#1c1b18]">Current Atelier Stock</span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium">{filteredProducts.length} items</span>
          </div>

          {filteredProducts.map((p) => {
            const isOut = p.stockQuantity === 0;
            const isLow = !isOut && p.stockQuantity <= (p.lowStockThreshold || 5);

            return (
              <div
                key={p.id}
                className="bg-white border border-[#e6e2d8] rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#1c1b18]">{p.shortName}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{p.name}</p>
                    <span className="font-mono text-[10px] text-gray-400 mt-1 inline-block">
                      SKU: {p.sku}
                    </span>
                  </div>
                  <div>
                    {isOut ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                        OUT OF STOCK
                      </span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        LOW STOCK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        HEALTHY
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">Available Stock:</div>
                    <div className="font-serif font-bold text-lg text-[#1c1b18]">
                      {p.stockQuantity} <span className="text-xs font-normal text-gray-500">units</span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Threshold: {p.lowStockThreshold || 5} units
                    </div>
                  </div>

                  <button
                    onClick={() => setAdjustingProductId(p.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#1c1b18] bg-[#cda851] hover:bg-[#dfc27d] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Adjust Stock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop Stock Table Card (Hidden on Mobile) */}
      {filteredProducts.length > 0 && (
        <div className="hidden md:block bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#e6e2d8] bg-[#faf8f5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#cda851]" />
              <h3 className="font-serif font-bold text-sm text-[#1c1b18]">
                Current Atelier Stock &amp; Thresholds
              </h3>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              {filteredProducts.length} catalog items tracked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4 text-left">Product Item</th>
                  <th className="py-3 px-3 text-left">SKU</th>
                  <th className="py-3 px-3 text-center">Available Stock</th>
                  <th className="py-3 px-3 text-center">Low Threshold</th>
                  <th className="py-3 px-3 text-center">Health</th>
                  <th className="py-3 px-4 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const isOut = p.stockQuantity === 0;
                  const isLow = !isOut && p.stockQuantity <= (p.lowStockThreshold || 5);

                  return (
                    <tr key={p.id} className="interactive-row group">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1c1b18] group-hover:text-[#cda851] transition-colors">{p.shortName}</div>
                      <div className="text-[11px] text-gray-500 truncate max-w-sm">{p.name}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-500">{p.sku}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-sm text-[#1c1b18]">{p.stockQuantity}</span>{' '}
                      units
                    </td>
                    <td className="py-3 px-3 text-center text-gray-500">
                      {p.lowStockThreshold || 5} units
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          OUT OF STOCK
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          OPTIMAL
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustingProductId(p.id);
                          setIsAddition(true);
                          setChangeAmount(10);
                        }}
                        className="interactive-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e6e2d8] text-xs font-semibold text-gray-700 bg-white hover:bg-[#faf8f5] hover:text-[#1c1b18] hover:border-[#cda851]/50 transition-all cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-[#cda851]" />
                        <span>Adjust Stock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProductId && selectedProduct && (
        <Modal
          isOpen={true}
          onClose={() => setAdjustingProductId(null)}
          title={`Adjust Stock — ${selectedProduct.shortName}`}
          subtitle={`Current Units on Hand: ${selectedProduct.stockQuantity}`}
          maxWidth="md"
        >
          <form onSubmit={handleApplyAdjustment} className="space-y-4">
            <div className="flex rounded-xl bg-[#faf8f5] p-1 border border-[#e6e2d8]">
              <button
                type="button"
                onClick={() => setIsAddition(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  isAddition ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Stock (+)
              </button>
              <button
                type="button"
                onClick={() => setIsAddition(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  !isAddition ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                <Minus className="w-4 h-4" />
                Deduct Stock (-)
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                Quantity to {isAddition ? 'Add' : 'Deduct'}
              </label>
              <input
                type="number"
                required
                min="1"
                value={changeAmount}
                onChange={(e) => setChangeAmount(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                Audit Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
              >
                <option value="Manual Restock">Manual Restock / Production Batch</option>
                <option value="Order Deduction">Offline Order / Custom Pour</option>
                <option value="Damaged / Spoilage">Damaged / Crystallized / Spoilage</option>
                <option value="Correction">Inventory Count Correction</option>
                <option value="Return Restock">Customer Return Restock</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              New Projected Stock: <strong>{Math.max(0, selectedProduct.stockQuantity + (isAddition ? changeAmount : -changeAmount))} units</strong>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAdjustingProductId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#1c1b18] bg-[#cda851] hover:bg-[#dfc27d]"
              >
                Confirm &amp; Record Audit
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Empty Movement History State */}
      {movements.length === 0 && (
        <div className="py-2">
          <EmptyState
            icon={History}
            title="No Stock Movements Logged"
            description="Stock adjustments, restock batches, customer deductions, and damage write-offs will log a live audit record here."
            compact
          />
        </div>
      )}

      {/* Mobile Movements Audit Cards (Phone Screens < 768px) */}
      {movements.length > 0 && (
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#cda851]" />
              <span className="font-serif font-bold text-xs text-[#1c1b18]">Recent Movement History</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{movements.length} events</span>
          </div>

          {movements.map((m) => (
          <div
            key={m.id}
            className="bg-white border border-[#e6e2d8] rounded-2xl p-4 shadow-sm space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">{m.productName}</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  m.change > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {m.change > 0 ? `+${m.change}` : m.change}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-gray-100">
              <div>
                <span>Reason: </span>
                <strong className="text-gray-800">{m.reason}</strong>
              </div>
              <div>
                <span>Resulting: </span>
                <strong className="text-gray-900 font-mono">{m.newStock} units</strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-1">
              <span>{new Date(m.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              <span>By {m.performedBy}</span>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Desktop Inventory Movements Audit History (Hidden on Mobile) */}
      {movements.length > 0 && (
        <div className="hidden md:block bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#e6e2d8] bg-[#faf8f5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#cda851]" />
              <h3 className="font-serif font-bold text-sm text-[#1c1b18]">
                Stock Movement History &amp; Audit Trail
              </h3>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">
              {movements.length} logged events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4 text-left">Timestamp</th>
                  <th className="py-3 px-3 text-left">Product</th>
                  <th className="py-3 px-3 text-center">Movement</th>
                  <th className="py-3 px-3 text-center">Resulting Stock</th>
                  <th className="py-3 px-3 text-left">Audit Reason</th>
                  <th className="py-3 px-4 text-right">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                    <td className="py-3 px-4 text-gray-500 font-mono">
                      {new Date(m.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#1c1b18]">{m.productName}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          m.change > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {m.change > 0 ? `+${m.change}` : m.change}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-800">
                      {m.newStock} units
                    </td>
                    <td className="py-3 px-3 text-gray-600">{m.reason}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-500">
                      {m.performedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
