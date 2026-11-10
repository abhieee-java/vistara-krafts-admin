import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, ProductVariant, ProductGender } from '../../types';
import { Modal } from '../common/Modal';
import { ImageUploader } from './ImageUploader';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Package,
  IndianRupee,
  Camera,
  Sliders,
  SlidersHorizontal,
  Info
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
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('Vistāra Krafts');
  const [badge, setBadge] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [category, setCategory] = useState<ProductCategory>('casting');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number>(1299);
  const [regularPrice, setRegularPrice] = useState<number>(1499);
  const [ratio, setRatio] = useState('3:1');
  const [viscosity, setViscosity] = useState<'low' | 'medium' | 'high'>('low');
  const [cureTime, setCureTime] = useState('24h');
  const [extraSpecsText, setExtraSpecsText] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [inStock, setInStock] = useState(true);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [image, setImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Supplementary varieties
  const [colorsText, setColorsText] = useState('');
  const [shapesText, setShapesText] = useState('');
  const [sizesText, setSizesText] = useState('');

  // Target audience
  const [gender, setGender] = useState<ProductGender>('all');
  const isResinKit = category === 'casting' || (category as string) === 'deep_pour';

  // Progressive disclosure: Advanced Settings accordion (collapsed by default)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setShortName(product.shortName);
      setSubtitle(product.subtitle || '');
      setDescription(product.description || product.subtitle || '');
      setBrand(product.brand || 'Vistāra Krafts');
      setBadge(product.badge || '');
      setSubCategory(product.subCategory || '');
      setCategory(product.category);
      setSku(product.sku);
      setPrice(product.price);
      setRegularPrice(product.regularPrice);
      setRatio(product.ratio || '');
      setViscosity(product.viscosity || 'low');
      setCureTime(product.cureTime || '');

      const nonStandardSpecs: Record<string, any> = {};
      if (product.specs && typeof product.specs === 'object') {
        for (const [k, v] of Object.entries(product.specs)) {
          if (!['ratio', 'viscosity', 'cureTime'].includes(k)) {
            nonStandardSpecs[k] = v;
          }
        }
      }
      setExtraSpecsText(Object.keys(nonStandardSpecs).length > 0 ? JSON.stringify(nonStandardSpecs, null, 2) : '');

      setStockQuantity(product.stockQuantity);
      setLowStockThreshold(product.lowStockThreshold || 5);
      setInStock(product.inStock);
      setIsCustomizable(product.isCustomizable);
      setImage(product.image);
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
    } else {
      // Clean defaults for new product
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
      setIsAdvancedOpen(false);
    }
  }, [product, isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
      ...(ratio ? { ratio } : {}),
      ...(viscosity ? { viscosity } : {}),
      ...(cureTime ? { cureTime } : {})
    };

    const finalGallery = gallery.length > 0 ? gallery : (image ? [image] : []);
    const finalMainImage = image || (finalGallery && finalGallery[0]) || '';

    onSubmit({
      name,
      shortName: shortName || name,
      subtitle,
      description,
      brand,
      badge,
      subCategory,
      specs: finalSpecs,
      category,
      sku,
      price: Number(price),
      regularPrice: Number(regularPrice),
      ratio: isResinKit ? ratio : '',
      viscosity: isResinKit ? viscosity : 'low',
      cureTime: isResinKit ? cureTime : '',
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: Number(lowStockThreshold),
      inStock: stockQuantity > 0 ? inStock : false,
      isCustomizable,
      image: finalMainImage,
      gallery: finalGallery,
      variants,
      colors: parsedColors,
      shapes: parsedShapes,
      sizes: parsedSizes,
      gender: isResinKit ? 'all' : gender,
      genderAffinity,
      rating: product ? product.rating : 5.0,
      reviewsCount: product ? product.reviewsCount : 0
    });
    onClose();
  };

  const handleAutoGenerateSku = () => {
    const prefix = category ? category.slice(0, 3).toUpperCase() : 'RES';
    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`VK-${prefix}-${rand}`);
  };

  const discountPercent = regularPrice > price && regularPrice > 0
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      subtitle="Publish updates directly to the live customer storefront"
      maxWidth="6xl"
    >
      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="relative flex flex-col bg-[#f8f7f4] -m-4 sm:-m-6 text-[#1c1b18]"
      >
        <div className="p-4 sm:p-6 lg:p-7 space-y-6">
          {/* Responsive 12-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left / Main Column (col-span-8: ~70% on Desktop) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Card 1: Basic Details */}
              <div className="bg-white rounded-2xl border border-[#e6e2d8] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#f0ece3]">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#8a7238] border border-amber-200 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1c1b18]">Basic Details</h4>
                    <p className="text-[11px] text-gray-500">Core product identity, title, SKU, and catalog categorization</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                      Full Product Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. UltraClear 3:1 Optical Casting Resin Kit"
                      className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none transition-all"
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
                      className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#1c1b18]">
                        SKU Identifier <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateSku}
                        className="text-[10px] text-[#8a7238] hover:text-[#cda851] font-semibold cursor-pointer underline"
                      >
                        Auto-Gen
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. VK-EPX-301-12K"
                      className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs font-mono focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Vistāra Krafts"
                      className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                      Primary Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProductCategory)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none transition-all cursor-pointer"
                    >
                      <option value="casting">Resin & Hardener Kits (Casting / Deep Pour)</option>
                      <option value="molds">Silicone Molds & Frames</option>
                      <option value="pigments">Pigments, Pastes & Metallic Inks</option>
                      <option value="tools">Tools, Torches & Safety Gear</option>
                      <option value="keepsakes">Artisan Keepsakes & Preservation Blocks</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                      Subcategory / Collection Tag
                    </label>
                    <input
                      type="text"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="e.g. Optical Casting, Deep Pour, Floral Preservation, Jewelry"
                      className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                      Product Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Highlight optical clarity, scratch resistance, UV stabilizers, and recommended crafts..."
                      className="w-full p-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: Media (Product Photography Uploads) */}
              <div className="bg-white rounded-2xl border border-[#e6e2d8] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#f0ece3]">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1c1b18]">Product Photography & Media</h4>
                    <p className="text-[11px] text-gray-500">Upload multiple images with automatic WebP conversion and primary star selection</p>
                  </div>
                </div>

                <ImageUploader
                  images={gallery}
                  mainImage={image}
                  onImagesChange={(imgs, main) => {
                    setGallery(imgs);
                    setImage(main);
                  }}
                />
              </div>

              {/* Card 4: Variants & Options */}
              <div className="bg-white rounded-2xl border border-[#e6e2d8] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ece3]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#1c1b18]">
                        {isResinKit ? 'Product Variants & Sizes' : 'Variants & Audience'}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {isResinKit
                          ? 'Color swatches, shapes, and size pack options'
                          : 'Color swatches, shapes, size packs, and gender targeting'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1c1b18] text-[#cda851] text-xs font-semibold hover:bg-[#2d2a24] transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size Pack</span>
                  </button>
                </div>
                {/* Target Audience Selector (Hidden for Resin & Hardener Kits) */}
                {!isResinKit && (
                  <div>
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1.5">
                      Target Audience / Style
                    </label><div className="grid grid-cols-3 gap-2">
                    <label
                      className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        gender === 'all'
                          ? 'border-[#cda851] bg-[#faf6ec] text-[#1c1b18] shadow-xs'
                          : 'border-[#e6e2d8] bg-[#faf8f5] text-gray-600 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="all"
                        checked={gender === 'all'}
                        onChange={() => setGender('all')}
                        className="sr-only"
                      />
                      <span>✨ Universal / All</span>
                    </label>

                    <label
                      className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        gender === 'women'
                          ? 'border-[#cda851] bg-[#faf6ec] text-[#1c1b18] shadow-xs'
                          : 'border-[#e6e2d8] bg-[#faf8f5] text-gray-600 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="women"
                        checked={gender === 'women'}
                        onChange={() => setGender('women')}
                        className="sr-only"
                      />
                      <span>🌸 Female / Women</span>
                    </label>

                    <label
                      className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        gender === 'men'
                          ? 'border-[#cda851] bg-[#faf6ec] text-[#1c1b18] shadow-xs'
                          : 'border-[#e6e2d8] bg-[#faf8f5] text-gray-600 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="men"
                        checked={gender === 'men'}
                        onChange={() => setGender('men')}
                        className="sr-only"
                      />
                      <span>👔 Male / Men</span>
                    </label>
                  </div>
                </div>
              )}

                {/* Supplementary Varieties (Colors, Shapes, Sizes) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      🎨 Colors (Optional)
                    </label>
                    <input
                      type="text"
                      value={colorsText}
                      onChange={(e) => setColorsText(e.target.value)}
                      placeholder="e.g. Royal Gold, Champagne"
                      className="w-full h-9 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Blank = No color pills</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      📐 Shapes (Optional)
                    </label>
                    <input
                      type="text"
                      value={shapesText}
                      onChange={(e) => setShapesText(e.target.value)}
                      placeholder="e.g. Arch, Hexagon"
                      className="w-full h-9 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Blank = No shape pills</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      📏 Sizes (Optional)
                    </label>
                    <input
                      type="text"
                      value={sizesText}
                      onChange={(e) => setSizesText(e.target.value)}
                      placeholder="e.g. 6-inch, 12-inch"
                      className="w-full h-9 px-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Blank = No size pills</span>
                  </div>
                </div>

                {/* Size Packs Table */}
                {variants.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#f0ece3]">
                    <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      Active Size Packs &amp; Pricing ({variants.length})
                    </div>
                    {variants.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] grid grid-cols-1 sm:grid-cols-6 gap-2 items-center"
                      >
                        <input
                          type="text"
                          value={v.label}
                          onChange={(e) => handleUpdateVariant(v.id, { label: e.target.value })}
                          placeholder="Pack Label (e.g. 1.2kg Kit)"
                          className="sm:col-span-2 h-8 px-2.5 rounded-lg border border-[#e6e2d8] text-xs bg-white"
                        />
                        <input
                          type="text"
                          value={v.sku || ''}
                          onChange={(e) => handleUpdateVariant(v.id, { sku: e.target.value })}
                          placeholder="Variant SKU"
                          className="h-8 px-2 rounded-lg border border-[#e6e2d8] text-xs bg-white font-mono"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">₹</span>
                          <input
                            type="number"
                            value={v.price}
                            onChange={(e) => handleUpdateVariant(v.id, { price: Number(e.target.value) })}
                            placeholder="Price"
                            className="w-full h-8 px-2 rounded-lg border border-[#e6e2d8] text-xs bg-white font-semibold"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400">MRP:₹</span>
                          <input
                            type="number"
                            value={v.regularPrice || v.price}
                            onChange={(e) => handleUpdateVariant(v.id, { regularPrice: Number(e.target.value) })}
                            placeholder="MRP"
                            className="w-full h-8 px-2 rounded-lg border border-[#e6e2d8] text-xs bg-white"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-[10px] text-gray-500">Qty:</span>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => handleUpdateVariant(v.id, { stock: Number(e.target.value) })}
                              placeholder="Stock"
                              className="w-full h-8 px-2 rounded-lg border border-[#e6e2d8] text-xs bg-white font-mono"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
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

              {/* Progressive Disclosure: Collapsible Advanced Settings Accordion */}
              <div className="bg-white rounded-2xl border border-[#e6e2d8] overflow-hidden shadow-xs transition-all">
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                  aria-expanded={isAdvancedOpen}
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-xs font-bold text-[#1c1b18] block">Advanced Settings &amp; Customizations</span>
                      <span className="text-[11px] text-gray-500">Ribbons, subtitles, custom engraving, and technical JSON specs</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 bg-gray-100">
                    {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isAdvancedOpen && (
                  <div className="p-5 sm:p-6 border-t border-[#f0ece3] space-y-4 bg-[#faf8f5]/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                          Product Subtitle
                        </label>
                        <input
                          type="text"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          placeholder="e.g. Museum-Grade UV Resistant Resin"
                          className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                          Ribbon / Promotional Badge
                        </label>
                        <input
                          type="text"
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                          placeholder="e.g. Bestseller, 20% Off, New Launch"
                          className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#e6e2d8] bg-white cursor-pointer hover:bg-amber-50/40 transition-colors">
                          <input
                            type="checkbox"
                            checked={isCustomizable}
                            onChange={(e) => setIsCustomizable(e.target.checked)}
                            className="w-4 h-4 text-[#cda851] rounded focus:ring-[#cda851] accent-[#cda851] cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#1c1b18] block">Allows Custom Engraving &amp; Keepsake Personalization</span>
                            <span className="text-[11px] text-gray-500">Enables patron name engraving, wedding dates, or custom floral notes at checkout</span>
                          </div>
                        </label>
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-[#1c1b18]">
                            Additional Technical Specifications (JSON / Key:Value)
                          </label>
                          <span className="text-[10px] text-gray-400 font-mono">Optional</span>
                        </div>
                        <textarea
                          rows={3}
                          value={extraSpecsText}
                          onChange={(e) => setExtraSpecsText(e.target.value)}
                          placeholder={'Heat Resistance: 95°C\nShore Hardness: 85D\nPot Life: 45 min'}
                          className="w-full p-3 rounded-xl border border-[#e6e2d8] bg-white text-xs font-mono focus:ring-2 focus:ring-[#cda851] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Sidebar Column (col-span-4: ~30% on Desktop, Sticky) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
              
              {/* Card 2: Pricing & Stock */}
              <div className="bg-white rounded-2xl border border-[#e6e2d8] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#f0ece3]">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1c1b18]">Pricing &amp; Inventory</h4>
                    <p className="text-[11px] text-gray-500">Live price, MRP, and stock alert levels</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-gray-400 font-semibold">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full h-10 pl-8 pr-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs font-bold text-[#1c1b18] focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                      Regular / MRP Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-gray-400 font-semibold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(Number(e.target.value))}
                        className="w-full h-10 pl-8 pr-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs text-gray-700 focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none"
                      />
                    </div>
                    {discountPercent > 0 && (
                      <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                        🏷️ {discountPercent}% discount active for patrons
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#f0ece3] grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                        Current Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(Number(e.target.value))}
                        className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs font-mono font-bold focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                        Low Stock Alert
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                        className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs font-mono focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 text-[#cda851] rounded focus:ring-[#cda851] accent-[#cda851] cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1c1b18] block">In Stock on Storefront</span>
                      <span className="text-[10px] text-gray-500">Controls instant buy button availability</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Card 3: Resin Specifications (Shown only for Resin & Hardener Kits) */}
              {isResinKit && (
                <div className="bg-white rounded-2xl border border-[#e6e2d8] p-5 sm:p-6 shadow-xs space-y-4"><div className="flex items-center gap-2 pb-3 border-b border-[#f0ece3]">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1c1b18]">Resin Specifications</h4>
                    <p className="text-[11px] text-gray-500">Mix ratios and curing chemistry</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                      Mix Ratio (By Weight)
                    </label>
                    <select
                      value={ratio}
                      onChange={(e) => setRatio(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none cursor-pointer"
                    >
                      <option value="3:1">3:1 (Deep Pour / Thick Casting)</option>
                      <option value="2:1">2:1 (High Gloss / Art &amp; Jewelry)</option>
                      <option value="1:1">1:1 (Doming / Fast Cure Coasters)</option>
                      <option value="UV">100% UV Curable (Single Part)</option>
                      <option value="">N/A (Mold / Pigment / Accessory)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                      Viscosity Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setViscosity(v)}
                          className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                            viscosity === v
                              ? 'bg-[#1c1b18] text-[#cda851] shadow-xs'
                              : 'bg-[#faf8f5] text-gray-600 border border-[#e6e2d8] hover:bg-white'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                      Cure Time
                    </label>
                    <input
                      type="text"
                      value={cureTime}
                      onChange={(e) => setCureTime(e.target.value)}
                      placeholder="e.g. 24h, 12h-16h, 2-4 mins (UV)"
                      className="w-full h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
              )}

            </div>

          </div>
        </div>

        {/* Sticky Bottom Actions Container: Accessible at all times without scrolling */}
        <div className="sticky bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e6e2d8] px-4 sm:px-6 lg:px-7 py-3.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 transition-colors cursor-pointer active:scale-95"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="h-10 px-7 rounded-xl text-xs font-bold text-[#1c1b18] bg-[#cda851] hover:bg-[#dfc27d] transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
          >
            <span>{product ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
