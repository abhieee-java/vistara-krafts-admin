import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory } from '../types';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import {
  Search,
  Plus,
  Copy,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface ProductsProps {
  onOpenNewProduct: () => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const Products: React.FC<ProductsProps> = ({
  onOpenNewProduct,
  isCreateModalOpen,
  setIsCreateModalOpen
}) => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    toggleStock,
    refreshFromDb,
    isLoadingDb
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 max-w-xl">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title, SKU, resin ratio..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e6e2d8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full sm:w-48 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e6e2d8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            >
              <option value="all">All Categories</option>
              <option value="keepsakes">Bridal Keepsakes</option>
              <option value="casting">3:1 Casting Resin</option>
              <option value="deep_pour">2:1 Deep Pour River</option>
              <option value="pigments">Mica Pigments</option>
              <option value="molds">Silicone Molds</option>
            </select>
          </div>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="inline-flex items-center justify-center gap-2 px-5 h-10 rounded-xl bg-[#cda851] text-[#1c1b18] text-xs font-bold hover:bg-[#dfc27d] transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Zero Mock Data Empty Catalog State */}
      {products.length === 0 && !search && selectedCategory === 'all' && (
        <div className="bg-white border border-[#e6e2d8] rounded-2xl p-10 text-center max-w-xl mx-auto shadow-sm space-y-4 my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#faf8f5] border border-[#e6e2d8] flex items-center justify-center text-[#cda851] mx-auto shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-base text-[#1c1b18]">
              Your Atelier Catalog is Ready
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
              Zero mock data active. Only real products created in this portal or imported into your Supabase database will appear here and on the storefront.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenNewProduct}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#cda851] text-[#1c1b18] text-xs font-bold hover:bg-[#dfc27d] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add First Product
            </button>
            <button
              onClick={refreshFromDb}
              disabled={isLoadingDb}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-semibold text-gray-700 hover:bg-[#faf8f5] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#cda851] ${isLoadingDb ? 'animate-spin' : ''}`} />
              <span>{isLoadingDb ? 'Checking DB...' : 'Sync from Supabase'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Card List (Visible on Phone Screens < 768px) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-[#e6e2d8] rounded-2xl p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#e6e2d8] shrink-0 bg-gray-50">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-bold text-sm text-[#1c1b18] leading-tight line-clamp-2">
                    {p.name}
                  </h4>
                  {p.badge && (
                    <span className="shrink-0 text-[9px] font-bold text-[#9e3322] bg-[#9e3322]/10 px-1.5 py-0.5 rounded">
                      {p.badge}
                    </span>
                  )}
                </div>
                {p.subtitle && (
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{p.subtitle}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {p.sku}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-600 capitalize">
                    {p.category.replace('_', ' ')}
                  </span>
                  {p.ratio && (
                    <span className="px-1.5 py-0.5 rounded bg-[#23211d] text-[#cda851] text-[9px] font-bold font-mono">
                      {p.ratio}
                    </span>
                  )}
                  {p.gender === 'women' && (
                    <span className="px-1.5 py-0.5 rounded bg-[#9e3322]/10 text-[#9e3322] text-[9px] font-semibold">
                      🌸 Women
                    </span>
                  )}
                  {p.gender === 'men' && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[9px] font-semibold">
                      👔 Men
                    </span>
                  )}
                  {((p.colors && p.colors.length > 0) || (p.shapes && p.shapes.length > 0) || (p.sizes && p.sizes.length > 0)) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[9px] font-semibold">
                      🎨 Varieties
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price & Stock Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <div>
                <span className="font-bold text-base text-[#1c1b18]">₹{p.price.toLocaleString()}</span>
                {p.regularPrice > p.price && (
                  <span className="text-[10px] text-gray-400 line-through ml-1.5">
                    ₹{p.regularPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`font-semibold text-xs ${
                    p.stockQuantity === 0
                      ? 'text-red-600'
                      : p.stockQuantity <= (p.lowStockThreshold || 5)
                      ? 'text-amber-600'
                      : 'text-gray-700'
                  }`}
                >
                  {p.stockQuantity} units
                </span>
              </div>
            </div>

            {/* Bottom Actions Row: One-tap Stock Toggle & Action Icons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
              <button
                onClick={() => toggleStock(p.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                  p.inStock
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {p.inStock ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>Out of Stock</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => duplicateProduct(p.id)}
                  className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Duplicate Product"
                  aria-label="Duplicate Product"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingProduct(p)}
                  className="p-2 text-gray-700 hover:text-[#cda851] bg-gray-50 hover:bg-[#cda851]/10 rounded-xl transition-colors"
                  title="Edit Product"
                  aria-label="Edit Product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingProductId(p.id)}
                  className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Product"
                  aria-label="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Products Table Card (Hidden on Mobile) */}
      <div className="hidden md:block bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#faf8f5] border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4 text-left">Product</th>
                <th className="py-3 px-3 text-left">Category &amp; SKU</th>
                <th className="py-3 px-3 text-right">Selling Price</th>
                <th className="py-3 px-3 text-center">Ratio / Specs</th>
                <th className="py-3 px-3 text-center">Stock Count</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="interactive-row group">
                  {/* Title & Image */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#e6e2d8] shrink-0 bg-gray-50">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#1c1b18] truncate max-w-xs">{p.name}</div>
                        {p.subtitle && (
                          <div className="text-[11px] text-gray-500 truncate max-w-xs mt-0.5">
                            {p.subtitle}
                          </div>
                        )}
                        {p.badge && (
                          <span className="inline-block mt-1 text-[9px] font-bold text-[#9e3322] bg-[#9e3322]/10 px-1.5 py-0.5 rounded">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category & SKU */}
                  <td className="py-3 px-3">
                    <span className="font-semibold text-gray-800 capitalize">
                      {p.category.replace('_', ' ')}
                    </span>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{p.sku}</div>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {p.gender === 'women' && (
                        <span className="px-1.5 py-0.5 rounded bg-[#9e3322]/10 text-[#9e3322] text-[9px] font-semibold">
                          🌸 Women
                        </span>
                      )}
                      {p.gender === 'men' && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[9px] font-semibold">
                          👔 Men
                        </span>
                      )}
                      {((p.colors && p.colors.length > 0) || (p.shapes && p.shapes.length > 0) || (p.sizes && p.sizes.length > 0)) && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[9px] font-semibold">
                          🎨 Varieties
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 text-right">
                    <div className="font-bold text-[#1c1b18]">₹{p.price.toLocaleString()}</div>
                    {p.regularPrice > p.price && (
                      <div className="text-[10px] text-gray-400 line-through">
                        ₹{p.regularPrice.toLocaleString()}
                      </div>
                    )}
                  </td>

                  {/* Ratio / Specs */}
                  <td className="py-3 px-3 text-center">
                    {p.ratio ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#23211d] text-[#cda851] text-[10px] font-bold font-mono">
                        {p.ratio}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Stock Count */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-semibold ${
                        p.stockQuantity === 0
                          ? 'text-red-600'
                          : p.stockQuantity <= (p.lowStockThreshold || 5)
                          ? 'text-amber-600'
                          : 'text-gray-800'
                      }`}
                    >
                      {p.stockQuantity} units
                    </span>
                  </td>

                  {/* Stock Toggle Button */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => toggleStock(p.id)}
                      title="Click to toggle stock status"
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                        p.inStock
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                      }`}
                    >
                      {p.inStock ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>Out of Stock</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => duplicateProduct(p.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Duplicate Product"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="p-1.5 text-gray-400 hover:text-[#cda851] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingProductId(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-xs">
            No products match your current search and category filter.
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {(isCreateModalOpen || editingProduct) && (
        <ProductFormModal
          isOpen={isCreateModalOpen || !!editingProduct}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onSubmit={(data) => {
            if (editingProduct) {
              updateProduct(editingProduct.id, data);
            } else {
              addProduct(data);
            }
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        onConfirm={() => {
          if (deletingProductId) {
            deleteProduct(deletingProductId);
            setDeletingProductId(null);
          }
        }}
        title="Delete Product from Atelier"
        message="Are you sure you want to delete this product? This will remove it from the catalog and the live storefront."
        confirmLabel="Yes, Delete Product"
        confirmVariant="danger"
      />
    </div>
  );
};
