import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, ProductVariant } from '../../types';
import { Modal } from '../common/Modal';
import { ImageUploader } from './ImageUploader';
import { Plus, Trash2 } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  product?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('casting');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number>(1299);
  const [regularPrice, setRegularPrice] = useState<number>(1499);
  const [ratio, setRatio] = useState('3:1');
  const [viscosity, setViscosity] = useState<'low' | 'medium' | 'high'>('low');
  const [cureTime, setCureTime] = useState('24h');
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [inStock, setInStock] = useState(true);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [image, setImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setShortName(product.shortName);
      setSubtitle(product.subtitle || '');
      setCategory(product.category);
      setSku(product.sku);
      setPrice(product.price);
      setRegularPrice(product.regularPrice);
      setRatio(product.ratio || '');
      setViscosity(product.viscosity || 'low');
      setCureTime(product.cureTime || '');
      setStockQuantity(product.stockQuantity);
      setLowStockThreshold(product.lowStockThreshold || 5);
      setInStock(product.inStock);
      setIsCustomizable(product.isCustomizable);
      setImage(product.image);
      setGallery(product.gallery || [product.image]);
      setVariants(product.variants || []);
    } else {
      // Default blank form
      setName('');
      setShortName('');
      setSubtitle('');
      setCategory('casting');
      setSku('VK-EPX-' + Math.floor(100 + Math.random() * 900));
      setPrice(1299);
      setRegularPrice(1499);
      setRatio('3:1');
      setViscosity('low');
      setCureTime('24h');
      setStockQuantity(25);
      setLowStockThreshold(5);
      setInStock(true);
      setIsCustomizable(false);
      setImage('https://lh3.googleusercontent.com/aida-public/AB6AXuBRDycw3YoY4kwqRgc2RIKed3egGLaRRPS-s_Rj31II52yPo9mDwes-hs9trRWTLBtNK3kTpXaTRhlSVuTdOCl9dbdO_WTG2X7GPf1I7HYJSKSGD-a3Fgl7B6c8ro6jp7dFha0mHMnnRi-QtFlnFZ4ndGGuGaiAFgz667F1dX9gmHFfhqzuZqqbfuY7BUnC2X8WuzXjYz_F6yqBPS7AOMwiLvJ_ZgwVyGjt1XfOSW2V6nLeNup72rQpSw');
      setGallery([]);
      setVariants([]);
    }
  }, [product, isOpen]);

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: 'var-' + Date.now().toString(36),
      label: 'New Edition / Size',
      price: price,
      regularPrice: regularPrice,
      stock: 10,
      sku: `${sku}-V${variants.length + 1}`
    };
    setVariants([...variants, newVariant]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleUpdateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) {
      alert('Please fill out product name and SKU');
      return;
    }

    onSubmit({
      name,
      shortName: shortName || name,
      subtitle,
      category,
      sku,
      price: Number(price),
      regularPrice: Number(regularPrice),
      ratio,
      viscosity,
      cureTime,
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: Number(lowStockThreshold),
      inStock: stockQuantity > 0 ? inStock : false,
      isCustomizable,
      image: image || gallery[0] || '',
      gallery: gallery.length > 0 ? gallery : [image],
      variants,
      rating: product ? product.rating : 5.0,
      reviewsCount: product ? product.reviewsCount : 0
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product / Keepsake' : 'Add New Product to Atelier'}
      subtitle="Changes sync directly to the live customer storefront via BroadcastChannel"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
              Full Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. UltraClear 3:1 Optical Casting Resin Kit"
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
              Short Display Name
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="e.g. UltraClear 3:1 Casting"
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
              SKU Identifier *
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. VK-EPX-301-12K"
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs font-mono focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
              Product Subtitle / Editorial Note
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Museum-Grade 50mm Deep Optical Cast with 24K Gold Leaf"
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>
        </div>

        {/* Category & Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#e6e2d8]">
          <div>
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            >
              <option value="keepsakes">Bridal Keepsakes & Frames</option>
              <option value="casting">3:1 Casting Epoxy</option>
              <option value="deep_pour">2:1 Deep Pour River Epoxy</option>
              <option value="pigments">Mica & Chameleon Pigments</option>
              <option value="molds">Silicone Geode Molds</option>
              <option value="accessories">Studio Tools & Safety</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
              Selling Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
              Regular / Compare Price (₹)
            </label>
            <input
              type="number"
              min="0"
              value={regularPrice}
              onChange={(e) => setRegularPrice(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>
        </div>

        {/* Technical Specs for Resin */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#e6e2d8]">
          <div>
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">Mix Ratio</label>
            <input
              type="text"
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              placeholder="e.g. 3:1 or 2:1"
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">Viscosity</label>
            <select
              value={viscosity}
              onChange={(e) => setViscosity(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            >
              <option value="low">Low (Thin / Self-Degassing)</option>
              <option value="medium">Medium (Standard Doming)</option>
              <option value="high">High (Thick / Paste)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">Cure Time</label>
            <input
              type="text"
              value={cureTime}
              onChange={(e) => setCureTime(e.target.value)}
              placeholder="e.g. 24h or 72h"
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>
        </div>

        {/* Stock & Inventory */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#e6e2d8]">
          <div>
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
              Current Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>

          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1c1b18]">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 accent-[#cda851] rounded"
              />
              <span>In Stock on Storefront</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1c1b18]">
              <input
                type="checkbox"
                checked={isCustomizable}
                onChange={(e) => setIsCustomizable(e.target.checked)}
                className="w-4 h-4 accent-[#cda851] rounded"
              />
              <span>Allows Custom Engraving / Floral Note</span>
            </label>
          </div>
        </div>

        {/* Image Uploader */}
        <div className="pt-2 border-t border-[#e6e2d8]">
          <ImageUploader
            images={gallery}
            mainImage={image}
            onImagesChange={(imgs, main) => {
              setGallery(imgs);
              setImage(main);
            }}
          />
        </div>

        {/* Variants Builder */}
        <div className="pt-2 border-t border-[#e6e2d8] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#1c1b18]">
              Product Variants / Size Packs ({variants.length})
            </label>
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#23211d] text-[#cda851] text-xs font-medium hover:bg-[#33302a] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Variant
            </button>
          </div>

          {variants.length > 0 && (
            <div className="space-y-2">
              {variants.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                >
                  <input
                    type="text"
                    value={v.label}
                    onChange={(e) => handleUpdateVariant(v.id, { label: e.target.value })}
                    placeholder="Variant Label (e.g. 1.2kg Kit)"
                    className="h-8 px-2.5 rounded-lg border border-[#e6e2d8] text-xs bg-white"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">₹</span>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleUpdateVariant(v.id, { price: Number(e.target.value) })}
                      placeholder="Price"
                      className="w-full h-8 px-2 rounded-lg border border-[#e6e2d8] text-xs bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">Qty:</span>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => handleUpdateVariant(v.id, { stock: Number(e.target.value) })}
                      placeholder="Stock"
                      className="w-full h-8 px-2 rounded-lg border border-[#e6e2d8] text-xs bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e6e2d8]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold text-[#1c1b18] bg-[#cda851] hover:bg-[#dfc27d] shadow-sm transition-all text-center"
          >
            {product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
