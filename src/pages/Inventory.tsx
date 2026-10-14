import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/common/Modal';
import { Boxes, AlertTriangle, ArrowUpDown, History, Plus, Minus, Search } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { products, movements, adjustStock } = useStore();

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

      {/* Current Stock Levels Table */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e6e2d8] bg-[#faf8f5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#cda851]" />
            <h3 className="font-serif font-bold text-sm text-[#1c1b18]">
              Current Atelier Stock &amp; Thresholds
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            {products.length} catalog items tracked
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
                  <tr key={p.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1c1b18]">{p.shortName}</div>
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          OUT OF STOCK
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6e2d8] text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-[#cda851]" />
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* Inventory Movements Audit History */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
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
    </div>
  );
};
