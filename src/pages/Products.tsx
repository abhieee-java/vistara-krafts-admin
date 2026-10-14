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
  Sparkles
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
  const { products, addProduct, updateProduct, deleteProduct, duplicateProduct, toggleStock } =
    useStore();

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

      {/* Products Table Card */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
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
