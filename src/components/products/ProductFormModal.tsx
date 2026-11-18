import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductCategory, ProductVariant, ProductGender } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import { ImageUploader } from './ImageUploader';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  IndianRupee,
  SlidersHorizontal,
  Tag,
  Palette,
  FlaskConical,
  Settings2,
  Loader2
} from 'lucide-react';

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
  // Section A: Essential Product Details
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('casting');
  const [description, setDescription] = useState('');

  // Section B: Product Photos
  const [image, setImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);

  // Section C: Pricing & Inventory
  const [price, setPrice] = useState<number>(1299);
  const [regularPrice, setRegularPrice] = useState<number>(1499);
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [inStock, setInStock] = useState(true);

  // Section D: More Product Options (Collapsed by Default)
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  // D1. Product Identification
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('Vistāra Krafts');
  const [shortName, setShortName] = useState('');
  const [subCategory, setSubCategory] = useState('');

  // D2. Product Variants & Audience
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [colorsText, setColorsText] = useState('');
  const [shapesText, setShapesText] = useState('');
  const [sizesText, setSizesText] = useState('');
  const [gender, setGender] = useState<ProductGender>('all');

  // D3. Customizations & Badges
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [isCustomizable, setIsCustomizable] = useState(false);

  // D4. Resin Specifications
  const [ratio, setRatio] = useState('3:1');
  const [viscosity, setViscosity] = useState<'low' | 'medium' | 'high'>('low');
  const [cureTime, setCureTime] = useState('24h');

  // D5. Advanced Technical Controls
  const [extraSpecsText, setExtraSpecsText] = useState('');

  // UI / State helpers
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [initialStateHash, setInitialStateHash] = useState('');

  const isResinKit = useMemo(() => {
    return (
      category === 'casting' ||
      category === 'deep_pour' ||
      (typeof category === 'string' && (
        category.toLowerCase().includes('resin') ||
        category.toLowerCase().includes('hardener') ||
        category.toLowerCase().includes('casting') ||
        category.toLowerCase().includes('pour')
      ))
    );
  }, [category]);

  const discountPercent = useMemo(() => {
    return regularPrice > price && regularPrice > 0
      ? Math.round(((regularPrice - price) / regularPrice) * 100)
      : 0;
  }, [price, regularPrice]);

  // Compute a snapshot hash to detect unsaved changes
  const computeStateHash = () => {
    return JSON.stringify({
      name,
      category,
      description,
      image,
      gallery,
      price,
      regularPrice,
      stockQuantity,
      lowStockThreshold,
      inStock,
      sku,
      brand,
      shortName,
      subCategory,
      variants,
      colorsText,
      shapesText,
      sizesText,
      gender,
      subtitle,
      badge,
      isCustomizable,
      ratio,
      viscosity,
      cureTime,
      extraSpecsText
    });
  };

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setShortName(product.shortName || '');
      setSubtitle(product.subtitle || '');
      setDescription(product.description || product.subtitle || '');
      setBrand(product.brand || 'Vistāra Krafts');
      setBadge(product.badge || '');
      setSubCategory(product.subCategory || '');
      setCategory(product.category);
      setSku(product.sku || '');
      setPrice(product.price ?? 1299);
      setRegularPrice(product.regularPrice ?? 1499);
      setRatio(product.ratio || '3:1');
      setViscosity(product.viscosity || 'low');
      setCureTime(product.cureTime || '24h');

      const nonStandardSpecs: Record<string, any> = {};
      if (product.specs && typeof product.specs === 'object') {
        for (const [k, v] of Object.entries(product.specs)) {
          if (!['ratio', 'viscosity', 'cureTime'].includes(k)) {
            nonStandardSpecs[k] = v;
          }
        }
      }
      setExtraSpecsText(Object.keys(nonStandardSpecs).length > 0 ? JSON.stringify(nonStandardSpecs, null, 2) : '');

      setStockQuantity(product.stockQuantity ?? 20);
      setLowStockThreshold(product.lowStockThreshold || 5);
      setInStock(product.inStock !== false);
      setIsCustomizable(Boolean(product.isCustomizable));
      setImage(product.image || '');
      setGallery(product.gallery || (product.image ? [product.image] : []));
      setVariants(product.variants || []);

      const cList = Array.isArray(product.colors)
        ? product.colors.map((c: any) => (typeof c === 'string' ? c : c.label || c.name || '')).filter(Boolean)
        : [];
      setColorsText(cList.join(', '));

      const sList = Array.isArray(product.shapes)
        ? product.shapes.map((s: any) => (typeof s === 'string' ? s : s.label || s.name || '')).filter(Boolean)
        : [];
      setShapesText(sList.join(', '));

      const szList = Array.isArray(product.sizes)
        ? product.sizes.map((sz: any) => (typeof sz === 'string' ? sz : sz.label || sz.name || '')).filter(Boolean)
        : [];
      setSizesText(szList.join(', '));

      setGender(product.gender || 'all');
      setIsMoreOptionsOpen(false);
    } else {
      // Default initial values for new product
      setName('');
      setShortName('');
      setSubtitle('');
      setDescription('');
      setBrand('Vistāra Krafts');
      setBadge('');
      setSubCategory('');
      setCategory('casting');
      setSku(`VK-RES-${Math.floor(100 + Math.random() * 900)}`);
      setPrice(1299);
      setRegularPrice(1499);
      setRatio('3:1');
      setViscosity('low');
      setCureTime('24h');
      setExtraSpecsText('');
      setStockQuantity(20);
      setLowStockThreshold(5);
      setInStock(true);
      setIsCustomizable(false);
      setImage('');
      setGallery([]);
      setVariants([]);
      setColorsText('');
      setShapesText('');
      setSizesText('');
      setGender('all');
      setIsMoreOptionsOpen(false);
    }
  }, [product, isOpen]);

  // Set initial hash once loaded
  useEffect(() => {
    if (isOpen) {
      setInitialStateHash(computeStateHash());
    }
  }, [isOpen]);

  const handleSafeClose = () => {
    const isDirty = computeStateHash() !== initialStateHash;
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: 'var_' + Date.now().toString(36),
      label: '',
      sku: '',
      price: price,
      regularPrice: regularPrice,
      stock: 10
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleAutoGenerateSku = () => {
    const prefix = category ? category.slice(0, 3).toUpperCase() : 'RES';
    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`VK-${prefix}-${rand}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const parsedColors = colorsText.trim()
      ? colorsText
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
          .map((label) => ({
            id: label.toLowerCase().replace(/\s+/g, '-'),
            label,
            inStock: true
          }))
      : [];

    const parsedShapes = shapesText.trim()
      ? shapesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((label) => ({
            id: label.toLowerCase().replace(/\s+/g, '-'),
            label,
            priceDelta: 0
          }))
      : [];

    const parsedSizes = sizesText.trim()
      ? sizesText
          .split(',')
          .map((sz) => sz.trim())
          .filter(Boolean)
          .map((label) => ({
            id: label.toLowerCase().replace(/\s+/g, '-'),
            label,
            priceDelta: 0
          }))
      : [];

    const genderAffinity =
      gender === 'women' ? 'feminine' : gender === 'men' ? 'masculine' : 'neutral';

    let extraSpecs: Record<string, any> = {};
    if (extraSpecsText.trim()) {
      try {
        extraSpecs = JSON.parse(extraSpecsText);
      } catch {
        const lines = extraSpecsText.split('\n');
        for (const line of lines) {
          const parts = line.split(':');
          if (parts.length >= 2) {
            extraSpecs[parts[0].trim()] = parts.slice(1).join(':').trim();
          }
        }
      }
    }

    const finalSpecs: Record<string, any> = {
      ...(product?.specs || {}),
      ...extraSpecs,
      ...(isResinKit && ratio ? { ratio } : {}),
      ...(isResinKit && viscosity ? { viscosity } : {}),
      ...(isResinKit && cureTime ? { cureTime } : {})
    };

    const finalGallery = gallery.length > 0 ? gallery : (image ? [image] : []);
    const finalMainImage = image || (finalGallery && finalGallery[0]) || '';

    const finalBasePrice = Number(price);
    const finalRegularPrice = Number(regularPrice);
    const oldBasePrice = product ? Number(product.price) : null;
    const syncedVariants = (variants || []).map((v, idx) => {
      if (idx === 0) {
        return {
          ...v,
          price: finalBasePrice,
          regularPrice: finalRegularPrice
        };
      }
      if (oldBasePrice !== null && Number(v.price) === oldBasePrice) {
        return {
          ...v,
          price: finalBasePrice,
          regularPrice: Math.max(finalRegularPrice, v.regularPrice || finalRegularPrice)
        };
      }
      return v;
    });

    try {
      onSubmit({
        name: name.trim(),
        shortName: (shortName || name).trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        brand: brand.trim() || 'Vistāra Krafts',
        badge: badge.trim(),
        subCategory: subCategory.trim(),
        specs: finalSpecs,
        category,
        sku: sku.trim() || `VK-RES-${Math.floor(100 + Math.random() * 900)}`,
        price: finalBasePrice,
        regularPrice: finalRegularPrice,
        ratio: isResinKit ? ratio : '',
        viscosity: isResinKit ? viscosity : 'low',
        cureTime: isResinKit ? cureTime : '',
        stockQuantity: Number(stockQuantity),
        lowStockThreshold: Number(lowStockThreshold),
        inStock: stockQuantity > 0 ? inStock : false,
        isCustomizable,
        image: finalMainImage,
        gallery: finalGallery,
        variants: syncedVariants,
        colors: parsedColors,
        shapes: parsedShapes,
        sizes: parsedSizes,
        gender: isResinKit ? 'all' : gender,
        genderAffinity,
        rating: product ? product.rating : 5.0,
        reviewsCount: product ? product.reviewsCount : 0
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleSafeClose}
        title={product ? 'Edit Product' : 'Add New Product'}
        maxWidth="2xl"
        noBodyPadding
        footer={
          <>
            <button
              type="button"
              onClick={handleSafeClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[#e6e2d8] text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 transition-colors cursor-pointer active:scale-95"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="product-form"
              disabled={isSubmitting || !name.trim()}
              className="h-9 px-6 rounded-xl text-xs font-bold text-[#1c1b18] bg-[#cda851] hover:bg-[#dfc27d] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{product ? 'Save Changes' : 'Create Product'}</span>
              )}
            </button>
          </>
        }
      >
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-5 text-[#1c1b18] bg-white"
        >
          {/* =========================================================================
              SECTION A: ESSENTIAL PRODUCT DETAILS
             ========================================================================= */}
            <div className="space-y-3.5">
              {/* Product Name (Most Prominent Input) */}
              <div>
                <label className="block text-xs font-bold text-[#1c1b18] mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. UltraClear 3:1 Optical Casting Resin Kit"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#dcd6c8] bg-white text-sm font-semibold text-[#1c1b18] placeholder:text-gray-400 placeholder:font-normal focus:ring-2 focus:ring-[#cda851] focus:border-[#cda851] outline-none shadow-2xs transition-all"
                />
              </div>

              {/* Product Category Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1c1b18] mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#dcd6c8] bg-[#faf8f5] text-xs font-medium text-[#1c1b18] focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value="casting">Resin &amp; Hardener Kits (3:1 Optical Casting)</option>
                  <option value="deep_pour">Resin &amp; Hardener Kits (2:1 Deep Pour River)</option>
                  <option value="keepsakes">Artisan Keepsakes &amp; Preservation Blocks</option>
                  <option value="molds">Silicone Molds &amp; Frames</option>
                  <option value="pigments">Pigments, Pastes &amp; Metallic Inks</option>
                  <option value="accessories">Tools, Torches &amp; Safety Gear</option>
                </select>
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-xs font-bold text-[#1c1b18] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optical clarity, scratch resistance, UV stabilizers, and recommended crafts..."
                  className="w-full p-3 rounded-xl border border-[#dcd6c8] bg-white text-xs leading-relaxed placeholder:text-gray-400 focus:ring-2 focus:ring-[#cda851] focus:border-[#cda851] outline-none shadow-2xs transition-all resize-none"
                />
              </div>
            </div>

            {/* =========================================================================
                SECTION B: PRODUCT PHOTOS (Compact Horizontal Strip)
               ========================================================================= */}
            <div className="pt-2 border-t border-[#f0ece3]">
              <ImageUploader
                images={gallery}
                mainImage={image}
                onImagesChange={(imgs, main) => {
                  setGallery(imgs);
                  setImage(main);
                }}
              />
            </div>

            {/* =========================================================================
                SECTION C: PRICING & INVENTORY (Compact 2-Column Layout)
               ========================================================================= */}
            <div className="pt-2 border-t border-[#f0ece3] space-y-3">
              <label className="block text-xs font-bold text-[#1c1b18]">
                Pricing &amp; Inventory
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Selling Price */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-gray-700">
                      Selling Price <span className="text-red-500">*</span>
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-9 pl-7 pr-3 rounded-xl border border-[#dcd6c8] bg-white text-xs font-bold text-[#1c1b18] focus:ring-2 focus:ring-[#cda851] outline-none shadow-2xs"
                    />
                  </div>
                </div>

                {/* Regular Price / MRP */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-gray-700">Regular / MRP</span>
                    {discountPercent > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(Number(e.target.value))}
                      className="w-full h-9 pl-7 pr-3 rounded-xl border border-[#dcd6c8] bg-white text-xs text-gray-700 focus:ring-2 focus:ring-[#cda851] outline-none shadow-2xs"
                    />
                  </div>
                </div>

                {/* Current Stock */}
                <div>
                  <span className="block text-[11px] font-semibold text-gray-700 mb-1">Current Stock</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl border border-[#dcd6c8] bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-[#cda851] outline-none shadow-2xs"
                  />
                </div>

                {/* Low Stock Alert */}
                <div>
                  <span className="block text-[11px] font-semibold text-gray-700 mb-1">Low Stock Alert</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl border border-[#dcd6c8] bg-white text-xs font-mono focus:ring-2 focus:ring-[#cda851] outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Storefront In-Stock Availability Switch */}
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] cursor-pointer hover:bg-amber-50/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1c1b18]">Storefront Availability</span>
                  <span className="text-[11px] text-gray-500 hidden sm:inline">• Immediate buy button active</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#cda851]" />
                </div>
              </label>
            </div>

            {/* =========================================================================
                SECTION D: MORE PRODUCT OPTIONS (Single Collapsible Accordion)
               ========================================================================= */}
            <div className="pt-2 border-t border-[#f0ece3]">
              <div className="rounded-2xl border border-[#e6e2d8] overflow-hidden bg-white shadow-2xs transition-all">
                <button
                  type="button"
                  onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors cursor-pointer bg-[#faf8f5]"
                  aria-expanded={isMoreOptionsOpen}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SlidersHorizontal className="w-4 h-4 text-[#8a7238] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#1c1b18] block leading-tight truncate">
                        More Product Options
                      </span>
                      <span className="text-[10px] text-gray-500 block leading-tight truncate">
                        SKU, brand, variants, size packs, resin chemistry &amp; customizations
                      </span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-lg text-gray-500 bg-white border border-[#e6e2d8] flex items-center justify-center shrink-0">
                    {isMoreOptionsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {isMoreOptionsOpen && (
                  <div className="p-4 sm:p-5 border-t border-[#f0ece3] space-y-5 bg-[#faf8f5]/40">

                    {/* D1. Product Identification */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1b18]">
                        <Tag className="w-3.5 h-3.5 text-amber-700" />
                        <span>Product Identification</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* SKU */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-gray-700">SKU Identifier</label>
                            <button
                              type="button"
                              onClick={handleAutoGenerateSku}
                              className="text-[10px] text-[#8a7238] hover:text-[#cda851] font-bold cursor-pointer underline"
                            >
                              Auto-Gen
                            </button>
                          </div>
                          <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="e.g. VK-RES-301"
                            className="w-full h-9 px-3 rounded-xl border border-[#dcd6c8] bg-white text-xs font-mono focus:ring-2 focus:ring-[#cda851] outline-none"
                          />
                        </div>

                        {/* Brand */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Brand</label>
                          <input
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            placeholder="Vistāra Krafts"
                            className="w-full h-9 px-3 rounded-xl border border-[#dcd6c8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                          />
                        </div>

                        {/* Short Display Name */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Short Display Name</label>
                          <input
                            type="text"
                            value={shortName}
                            onChange={(e) => setShortName(e.target.value)}
                            placeholder="e.g. UltraClear 3:1"
                            className="w-full h-9 px-3 rounded-xl border border-[#dcd6c8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                          />
                        </div>

                        {/* Subcategory / Tags */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Subcategory / Collection Tag</label>
                          <input
                            type="text"
                            value={subCategory}
                            onChange={(e) => setSubCategory(e.target.value)}
                            placeholder="e.g. Optical Casting, Deep Pour"
                            className="w-full h-9 px-3 rounded-xl border border-[#dcd6c8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* D2. Product Variants & Audience */}
                    <div className="space-y-3 pt-3 border-t border-[#f0ece3]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1b18]">
                          <Layers className="w-3.5 h-3.5 text-purple-700" />
                          <span>Product Variants &amp; Size Packs</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1c1b18] text-[#cda851] text-[11px] font-bold hover:bg-[#2d2a24] transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Size Pack</span>
                        </button>
                      </div>

                      {/* Target Audience / Style (Hidden for Resin Kits) */}
                      {!isResinKit && (
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                            Target Audience
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['all', 'women', 'men'] as const).map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setGender(g)}
                                className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                                  gender === g
                                    ? 'border-[#cda851] bg-[#faf6ec] text-[#1c1b18] shadow-xs'
                                    : 'border-[#e6e2d8] bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                {g === 'all' ? '✨ Universal' : g === 'women' ? '🌸 Female' : '👔 Male'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Supplementary Swatches (Colors, Shapes, Sizes) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-700 mb-1">
                            🎨 Colors (Optional)
                          </label>
                          <input
                            type="text"
                            value={colorsText}
                            onChange={(e) => setColorsText(e.target.value)}
                            placeholder="Royal Gold, Clear"
                            className="w-full h-8 px-2.5 rounded-lg border border-[#dcd6c8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-700 mb-1">
                            📐 Shapes (Optional)
                          </label>
                          <input
                            type="text"
                            value={shapesText}
                            onChange={(e) => setShapesText(e.target.value)}
                            placeholder="Arch, Hexagon"
                            className="w-full h-8 px-2.5 rounded-lg border border-[#dcd6c8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-700 mb-1">
                            📏 Sizes (Optional)
                          </label>
                          <input
                            type="text"
                            value={sizesText}
                            onChange={(e) => setSizesText(e.target.value)}
                            placeholder="6-inch, 12-inch"
                            className="w-full h-8 px-2.5 rounded-lg border border-[#dcd6c8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                          />
                        </div>
                      </div>

                      {/* Size Packs Table */}
                      {variants.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                            Active Size Packs ({variants.length})
                          </span>
                          {variants.map((v) => (
                            <div
                              key={v.id}
                              className="p-2.5 rounded-xl border border-[#e6e2d8] bg-white grid grid-cols-1 sm:grid-cols-6 gap-2 items-center shadow-2xs"
                            >
                              <input
                                type="text"
                                value={v.label}
                                onChange={(e) => handleUpdateVariant(v.id, { label: e.target.value })}
                                placeholder="Label (e.g. 1.2kg Kit)"
                                className="sm:col-span-2 h-7 px-2 rounded-lg border border-[#e6e2d8] text-xs bg-[#faf8f5]"
                              />
                              <input
                                type="text"
                                value={v.sku || ''}
                                onChange={(e) => handleUpdateVariant(v.id, { sku: e.target.value })}
                                placeholder="Variant SKU"
                                className="h-7 px-2 rounded-lg border border-[#e6e2d8] text-xs bg-[#faf8f5] font-mono"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-400">₹</span>
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) => handleUpdateVariant(v.id, { price: Number(e.target.value) })}
                                  placeholder="Price"
                                  className="w-full h-7 px-1.5 rounded-lg border border-[#e6e2d8] text-xs bg-[#faf8f5] font-semibold"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-400">MRP:</span>
                                <input
                                  type="number"
                                  value={v.regularPrice || v.price}
                                  onChange={(e) => handleUpdateVariant(v.id, { regularPrice: Number(e.target.value) })}
                                  placeholder="MRP"
                                  className="w-full h-7 px-1.5 rounded-lg border border-[#e6e2d8] text-xs bg-[#faf8f5]"
                                />
                              </div>
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 flex-1">
                                  <span className="text-[10px] text-gray-400">Qty:</span>
                                  <input
                                    type="number"
                                    value={v.stock}
                                    onChange={(e) => handleUpdateVariant(v.id, { stock: Number(e.target.value) })}
                                    placeholder="Stock"
                                    className="w-full h-7 px-1.5 rounded-lg border border-[#e6e2d8] text-xs bg-[#faf8f5] font-mono"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(v.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete variant"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* D3. Customizations & Badges */}
                    <div className="space-y-3 pt-3 border-t border-[#f0ece3]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1b18]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Customizations &amp; Highlights</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Product Subtitle</label>
                          <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="e.g. Museum-Grade UV Resistant Resin"
                            className="w-full h-9 px-3 rounded-xl border border-[#dcd6c8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Ribbon / Promo Badge</label>
                          <input
                            type="text"
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                            placeholder="e.g. Bestseller, 20% Off"
                            className="w-full h-9 px-3 rounded-xl border border-[#dcd6c8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#e6e2d8] bg-white cursor-pointer hover:bg-amber-50/30 transition-colors">
                            <input
                              type="checkbox"
                              checked={isCustomizable}
                              onChange={(e) => setIsCustomizable(e.target.checked)}
                              className="w-4 h-4 text-[#cda851] rounded focus:ring-[#cda851] accent-[#cda851] cursor-pointer"
                            />
                            <div>
                              <span className="text-xs font-bold text-[#1c1b18] block leading-tight">
                                Allows Custom Engraving &amp; Keepsake Personalization
                              </span>
                              <span className="text-[10px] text-gray-500 block leading-tight">
                                Enables patron name engraving, wedding dates, or custom notes at checkout
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* D4. Resin Specifications (Contextually relevant) */}
                    {isResinKit && (
                      <div className="space-y-3 pt-3 border-t border-[#f0ece3]">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1b18]">
                          <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                          <span>Resin Specifications</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Mix Ratio</label>
                            <select
                              value={ratio}
                              onChange={(e) => setRatio(e.target.value)}
                              className="w-full h-9 px-2.5 rounded-xl border border-[#dcd6c8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none cursor-pointer"
                            >
                              <option value="3:1">3:1 (Thick Casting)</option>
                              <option value="2:1">2:1 (Deep Pour)</option>
                              <option value="1:1">1:1 (Doming / Fast)</option>
                              <option value="UV">UV Curable</option>
                              <option value="">N/A</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Viscosity</label>
                            <div className="grid grid-cols-3 gap-1">
                              {(['low', 'medium', 'high'] as const).map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => setViscosity(v)}
                                  className={`py-1.5 rounded-lg text-[11px] font-semibold capitalize border transition-all cursor-pointer ${
                                    viscosity === v
                                      ? 'bg-[#1c1b18] text-[#cda851] border-[#1c1b18]'
                                      : 'bg-white text-gray-600 border-[#e6e2d8] hover:bg-gray-50'
                                  }`}
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Cure Time</label>
                            <input
                              type="text"
                              value={cureTime}
                              onChange={(e) => setCureTime(e.target.value)}
                              placeholder="e.g. 24h, 12h-16h"
                              className="w-full h-9 px-3 rounded-xl border border-[#dcd6c8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* D5. Advanced Settings */}
                    <div className="space-y-2 pt-3 border-t border-[#f0ece3]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1b18]">
                          <Settings2 className="w-3.5 h-3.5 text-gray-600" />
                          <span>Technical Specifications (JSON / Key:Value)</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">Optional</span>
                      </div>
                      <textarea
                        rows={2}
                        value={extraSpecsText}
                        onChange={(e) => setExtraSpecsText(e.target.value)}
                        placeholder={'Heat Resistance: 95°C\nShore Hardness: 85D'}
                        className="w-full p-2.5 rounded-xl border border-[#dcd6c8] bg-white text-xs font-mono focus:ring-2 focus:ring-[#cda851] outline-none"
                      />
                    </div>

                  </div>
                )}
              </div>
            </div>
        </form>
      </Modal>

      {/* Discard Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          setShowDiscardConfirm(false);
          onClose();
        }}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes in this product form. If you close now, your edits will be discarded."
        confirmLabel="Discard Edits"
        confirmVariant="danger"
      />
    </>
  );
};
