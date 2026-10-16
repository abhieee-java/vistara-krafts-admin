import { Product, Order, Customer, Coupon, InventoryMovement, OwnerSession, AuditLog, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'ram-keep-001',
    sku: 'RAM-VRM-BLK-12',
    name: 'Eternal Varmala & Bridal Bouquet Time-Capsule Block',
    shortName: 'Eternal Varmala Block',
    subtitle: 'Museum-Grade 50mm Deep Optical Cast with 24K Gold Leaf & Custom Brass Calligraphy',
    category: 'keepsakes',
    subCategory: 'floral_preservation',
    badge: 'IG Viral Keepsake',
    price: 4499,
    regularPrice: 5499,
    ratio: '2:1',
    viscosity: 'low',
    cureTime: '72h',
    rating: 5.0,
    reviewsCount: 418,
    inStock: true,
    stockQuantity: 18,
    lowStockThreshold: 5,
    isCustomizable: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXW-CtxPaQNBpLYiDkZiAh_3HctPzR3wSCDa6iBBPevbe8OYTRQh3MBrygeRClgewcRXZmXbGFcwCAJ8voXhr1Gis32c3Xd7f9MpmY8HuxABgInUPnavbPeSPIZtwzwMcmwPtXzx7Z63sTUGuH0-iZ0MPSphmGmleYJW3_njEtUfcbKOPB1icNTEcuIPrr9seRXtiWbBpXV0TUCSnKGRmIqqDcgv5vapJcyIzP8GkKndOeGidcCWTJWg',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBXW-CtxPaQNBpLYiDkZiAh_3HctPzR3wSCDa6iBBPevbe8OYTRQh3MBrygeRClgewcRXZmXbGFcwCAJ8voXhr1Gis32c3Xd7f9MpmY8HuxABgInUPnavbPeSPIZtwzwMcmwPtXzx7Z63sTUGuH0-iZ0MPSphmGmleYJW3_njEtUfcbKOPB1icNTEcuIPrr9seRXtiWbBpXV0TUCSnKGRmIqqDcgv5vapJcyIzP8GkKndOeGidcCWTJWg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQWPIc9RjjOm562dw3ddz6mENg7B79L8sE2vd8DXSPWjCkWBCtZKyexl_l-8s30_zToPodAS1phxSqY0nnzQm46KbX4zIIlWVcqAMUZUxTu8aXo6wvOhzgnrtxzNhJ4p8IcsNDvujKOfqx2bD5zxFyCTJsxlJllbFak3BCMsI5-K6pHgOq8f1YZRylmTnljwQMFSsYaT7CYTXj6yxL5v6Vo4kMOGvNksBROF_YEXqD2-Fp9Y88Nea_xg'
    ],
    variants: [
      { id: 'vrm-8in', label: '8" Romantic Cube (Bridal Mini)', price: 2999, regularPrice: 3699, stock: 8, sku: 'RAM-VRM-8IN' },
      { id: 'vrm-12in', label: '12" Royal Heirloom Block', price: 4499, regularPrice: 5499, stock: 7, sku: 'RAM-VRM-12IN' },
      { id: 'vrm-16in', label: '16" Gallery Mantel Frame', price: 6999, regularPrice: 8499, stock: 3, sku: 'RAM-VRM-16IN' }
    ],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-14T09:30:00Z'
  },
  {
    id: 'vk-epx-301',
    sku: 'VK-EPX-301-12K',
    name: 'UltraClear 3:1 Casting Resin Kit',
    shortName: 'UltraClear 3:1 Casting',
    subtitle: 'Optical Grade Degassed Epoxy System for Deep Art, Coasters & Floral Preservation',
    category: 'casting',
    subCategory: 'casting_3_1',
    badge: 'Bestseller',
    price: 1299,
    regularPrice: 1499,
    ratio: '3:1',
    viscosity: 'low',
    cureTime: '24h',
    rating: 4.9,
    reviewsCount: 342,
    inStock: true,
    stockQuantity: 45,
    lowStockThreshold: 10,
    isCustomizable: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRDycw3YoY4kwqRgc2RIKed3egGLaRRPS-s_Rj31II52yPo9mDwes-hs9trRWTLBtNK3kTpXaTRhlSVuTdOCl9dbdO_WTG2X7GPf1I7HYJSKSGD-a3Fgl7B6c8ro6jp7dFha0mHMnnRi-QtFlnFZ4ndGGuGaiAFgz667F1dX9gmHFfhqzuZqqbfuY7BUnC2X8WuzXjYz_F6yqBPS7AOMwiLvJ_ZgwVyGjt1XfOSW2V6nLeNup72rQpSw',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBRDycw3YoY4kwqRgc2RIKed3egGLaRRPS-s_Rj31II52yPo9mDwes-hs9trRWTLBtNK3kTpXaTRhlSVuTdOCl9dbdO_WTG2X7GPf1I7HYJSKSGD-a3Fgl7B6c8ro6jp7dFha0mHMnnRi-QtFlnFZ4ndGGuGaiAFgz667F1dX9gmHFfhqzuZqqbfuY7BUnC2X8WuzXjYz_F6yqBPS7AOMwiLvJ_ZgwVyGjt1XfOSW2V6nLeNup72rQpSw'
    ],
    variants: [
      { id: 'kit-400g', label: '400g Mini Kit', price: 549, regularPrice: 649, stock: 15, sku: 'VK-EPX-301-400G' },
      { id: 'kit-1200g', label: '1.2kg Studio Pack', price: 1299, regularPrice: 1499, stock: 20, sku: 'VK-EPX-301-1200G' },
      { id: 'kit-4000g', label: '4kg Master Pack', price: 3799, regularPrice: 5199, stock: 10, sku: 'VK-EPX-301-4000G' }
    ],
    createdAt: '2026-08-15T08:00:00Z',
    updatedAt: '2026-10-14T11:00:00Z'
  },
  {
    id: 'vk-epx-201',
    sku: 'VK-EPX-201-15K',
    name: 'Deep-Pour 2:1 River Table Optical Epoxy',
    shortName: 'Deep-Pour 2:1 Epoxy',
    subtitle: 'Exothermic-Controlled 75mm Single Pour Archival Liquid Glass',
    category: 'deep_pour',
    subCategory: 'deep_pour_2_1',
    badge: 'Pro Studio Grade',
    price: 1899,
    regularPrice: 2299,
    ratio: '2:1',
    viscosity: 'low',
    cureTime: '72h',
    rating: 4.8,
    reviewsCount: 186,
    inStock: true,
    stockQuantity: 12,
    lowStockThreshold: 4,
    isCustomizable: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5W0RxlC_qbCLiogOunZQJLwCIARNblOCu547tssvch4KcHjyQidb2Pqj42y6UPDqVUOLtfhsZVKJ8Hdx30t3WMpTJe11isaKisC_alp6Yk49cvuJIipcEzkaIHBWHiU3QefrMpytDplh-cEsce41ZOUIUGDrb6TPU5xXCEnrqTzHokQTZ0HjkbBevAv4o_E-JsEjGeJa0dnZWvbyMV104YVX9OokN7wPg58kHdnJCLaBPTQSPbqa_dg',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB5W0RxlC_qbCLiogOunZQJLwCIARNblOCu547tssvch4KcHjyQidb2Pqj42y6UPDqVUOLtfhsZVKJ8Hdx30t3WMpTJe11isaKisC_alp6Yk49cvuJIipcEzkaIHBWHiU3QefrMpytDplh-cEsce41ZOUIUGDrb6TPU5xXCEnrqTzHokQTZ0HjkbBevAv4o_E-JsEjGeJa0dnZWvbyMV104YVX9OokN7wPg58kHdnJCLaBPTQSPbqa_dg'
    ],
    variants: [
      { id: 'kit-1500g', label: '1.5kg Kit', price: 1899, regularPrice: 2299, stock: 7, sku: 'VK-EPX-201-1500G' },
      { id: 'kit-6000g', label: '6kg Bulk Pail', price: 6899, regularPrice: 8499, stock: 5, sku: 'VK-EPX-201-6000G' }
    ],
    createdAt: '2026-08-20T09:00:00Z',
    updatedAt: '2026-10-13T16:00:00Z'
  },
  {
    id: 'vk-art-ocn',
    sku: 'VK-ART-TR-OCN',
    name: 'Ocean Foam Wave Resin Platter with Teakwood Base',
    shortName: 'Ocean Wave Resin Platter',
    subtitle: 'Triple-Layered Laced Cells with Natural Reclaimed Burma Teak',
    category: 'keepsakes',
    subCategory: 'resin_decor',
    badge: 'Artisan Crafted',
    price: 3299,
    regularPrice: 3899,
    rating: 5.0,
    reviewsCount: 94,
    inStock: true,
    stockQuantity: 4,
    lowStockThreshold: 5,
    isCustomizable: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjzZFFaUlhkp3iunRIf4XTsGHQEnqYHu6pE65tBztKE7OolcCbUmdQivWEjR7Iw3kWILrY-SOL_WmRhZu9EvoUpa07FYLMMcOX4LFL9SAM8vS0iiyzGKVHV5g1yGZRA_heWpGcVykSqFyKi5Nq-kqaEqzkN_BuB4tzxCuGgOjGh1ChjcyrLAFbKcMMvhAQ2MxMA05f5fuhuKzbs1o3iByY2g2xxrgf7FqrVQmZOtXXHtlmMiEzdzwMjQ',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAjzZFFaUlhkp3iunRIf4XTsGHQEnqYHu6pE65tBztKE7OolcCbUmdQivWEjR7Iw3kWILrY-SOL_WmRhZu9EvoUpa07FYLMMcOX4LFL9SAM8vS0iiyzGKVHV5g1yGZRA_heWpGcVykSqFyKi5Nq-kqaEqzkN_BuB4tzxCuGgOjGh1ChjcyrLAFbKcMMvhAQ2MxMA05f5fuhuKzbs1o3iByY2g2xxrgf7FqrVQmZOtXXHtlmMiEzdzwMjQ'
    ],
    variants: [
      { id: 'tr-med', label: '14" Round Serving Platter', price: 3299, regularPrice: 3899, stock: 3, sku: 'VK-ART-TR-14' },
      { id: 'tr-lrg', label: '18" Rectangular Board + Brass Handles', price: 4799, regularPrice: 5699, stock: 1, sku: 'VK-ART-TR-18' }
    ],
    createdAt: '2026-09-12T14:00:00Z',
    updatedAt: '2026-10-14T08:00:00Z'
  },
  {
    id: 'vk-acc-mc',
    sku: 'VK-ACC-MC-08',
    name: 'Chameleon & Metallic Luster Mica Pigments (Set of 8)',
    shortName: 'Chameleon Mica Pigments',
    subtitle: 'Cosmetic Grade 10-60µm Fine Interference Pearls for Epoxy Pouring',
    category: 'pigments',
    price: 799,
    regularPrice: 999,
    rating: 4.7,
    reviewsCount: 78,
    inStock: true,
    stockQuantity: 28,
    lowStockThreshold: 8,
    isCustomizable: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsHygVQDC1PnFOM3bOHAJacAtodwre1FixR4hSycrhmG-F77MrskbkW2XcwL7ueawATyKCEyn1zGfWKW0u4qlBpzlo9yLqgRIf9YKzhrXNqcNxOLaCw_ID7b39Paw4KsYdkznjBV6kZikiaukQlA9VARAbHMFh-CQzYhth8LjrvcUWUFDvsv5EP0cq8ahNhihjMYhugsBrImA5bh9A-aPrJGVio28WEyvpUTiav1TvqOVONuJ4CbYZCQ',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBsHygVQDC1PnFOM3bOHAJacAtodwre1FixR4hSycrhmG-F77MrskbkW2XcwL7ueawATyKCEyn1zGfWKW0u4qlBpzlo9yLqgRIf9YKzhrXNqcNxOLaCw_ID7b39Paw4KsYdkznjBV6kZikiaukQlA9VARAbHMFh-CQzYhth8LjrvcUWUFDvsv5EP0cq8ahNhihjMYhugsBrImA5bh9A-aPrJGVio28WEyvpUTiav1TvqOVONuJ4CbYZCQ'
    ],
    variants: [
      { id: 'mc-50g', label: '8 × 10g Jars', price: 799, regularPrice: 999, stock: 28, sku: 'VK-ACC-MC-8X' }
    ],
    createdAt: '2026-09-18T11:00:00Z',
    updatedAt: '2026-10-12T10:00:00Z'
  },
  {
    id: 'vk-mld-geo',
    sku: 'VK-MLD-GEO-4X',
    name: 'Heavy-Duty Platinum Silicone Geode Coaster Mold Bundle',
    shortName: 'Silicone Geode Molds',
    subtitle: 'Tear-Resistant 50+ Demolds Flexible Molds with Natural Crystal Edges',
    category: 'molds',
    price: 899,
    regularPrice: 1199,
    rating: 4.8,
    reviewsCount: 112,
    inStock: false,
    stockQuantity: 0,
    lowStockThreshold: 5,
    isCustomizable: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALJpk3c80a1Mrf3flcRflAc828a5vcaeDV9qEpcoBm1MbDH4Y-bxGb74HPWWhNakHOEuqyW5O13zPv1s3-qmZzS8Do6MFzTpA6iF5syIOWNkt0GFBYmnLlfqBsq0BKW01eDGhAzky-UlNqL-HNmdBYEmNx5CeziUnLuAH8tovtJpetmWIK7eaibXjdWY1rHHnuoP9knfzaZ3_HrEZF6juyZi8Cv38pE2bJy5E_JfMtRMoqkkt7zFKLpA',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALJpk3c80a1Mrf3flcRflAc828a5vcaeDV9qEpcoBm1MbDH4Y-bxGb74HPWWhNakHOEuqyW5O13zPv1s3-qmZzS8Do6MFzTpA6iF5syIOWNkt0GFBYmnLlfqBsq0BKW01eDGhAzky-UlNqL-HNmdBYEmNx5CeziUnLuAH8tovtJpetmWIK7eaibXjdWY1rHHnuoP9knfzaZ3_HrEZF6juyZi8Cv38pE2bJy5E_JfMtRMoqkkt7zFKLpA'
    ],
    variants: [
      { id: 'mld-4pk', label: 'Pack of 4 Agate Geode Molds', price: 899, regularPrice: 1199, stock: 0, sku: 'VK-MLD-GEO-4PK' }
    ],
    createdAt: '2026-09-22T15:00:00Z',
    updatedAt: '2026-10-14T07:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-8921',
    orderNumber: 'VK-2026-8921',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    customerPhone: '+91 98451 22390',
    items: [
      {
        productId: 'ram-keep-001',
        productName: 'Eternal Varmala & Bridal Bouquet Time-Capsule Block',
        sku: 'RAM-VRM-12IN',
        variantId: 'vrm-12in',
        variantLabel: '12" Royal Heirloom Block',
        quantity: 1,
        unitPrice: 4499,
        totalPrice: 4499,
        customNote: 'Bridal garland pickup required on 18th Oct, Bengaluru'
      }
    ],
    subtotal: 4499,
    discountAmount: 400,
    couponCode: 'VISTARA10',
    shippingFee: 0,
    totalAmount: 4099,
    orderStatus: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    shippingAddress: {
      fullName: 'Priya Sharma',
      phone: '+91 98451 22390',
      street: '42, 14th Main, 4th Sector, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102'
    },
    carrier: 'BlueDart',
    trackingNumber: 'BD982736412IN',
    createdAt: '2026-10-14T11:20:00Z',
    updatedAt: '2026-10-14T12:00:00Z',
    timeline: [
      { status: 'new', timestamp: '2026-10-14T11:20:00Z', note: 'Order placed via Razorpay' },
      { status: 'processing', timestamp: '2026-10-14T12:00:00Z', note: 'Garland pickup scheduled with BlueDart Air' }
    ]
  },
  {
    id: 'ord-8920',
    orderNumber: 'VK-2026-8920',
    customerName: 'Vikram Mehta',
    customerEmail: 'v.mehta@studioarch.com',
    customerPhone: '+91 98200 45678',
    items: [
      {
        productId: 'vk-epx-301',
        productName: 'UltraClear 3:1 Casting Resin Kit',
        sku: 'VK-EPX-301-4000G',
        variantId: 'kit-4000g',
        variantLabel: '4kg Master Pack',
        quantity: 2,
        unitPrice: 3799,
        totalPrice: 7598
      },
      {
        productId: 'vk-acc-mc',
        productName: 'Chameleon & Metallic Luster Mica Pigments',
        sku: 'VK-ACC-MC-8X',
        quantity: 1,
        unitPrice: 799,
        totalPrice: 799
      }
    ],
    subtotal: 8397,
    discountAmount: 0,
    shippingFee: 0,
    totalAmount: 8397,
    orderStatus: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    shippingAddress: {
      fullName: 'Vikram Mehta',
      phone: '+91 98200 45678',
      street: '702, Skyline Towers, Prabhadevi',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400025'
    },
    carrier: 'Delhivery',
    trackingNumber: 'DEL773829104',
    createdAt: '2026-10-13T16:45:00Z',
    updatedAt: '2026-10-14T09:15:00Z',
    timeline: [
      { status: 'new', timestamp: '2026-10-13T16:45:00Z' },
      { status: 'processing', timestamp: '2026-10-13T18:00:00Z' },
      { status: 'packed', timestamp: '2026-10-14T07:30:00Z' },
      { status: 'shipped', timestamp: '2026-10-14T09:15:00Z', note: 'Dispatched via Delhivery Surface' }
    ]
  },
  {
    id: 'ord-8919',
    orderNumber: 'VK-2026-8919',
    customerName: 'Ananya Iyer',
    customerEmail: 'ananya.iyer@gmail.com',
    customerPhone: '+91 97412 88990',
    items: [
      {
        productId: 'vk-art-ocn',
        productName: 'Ocean Foam Wave Resin Platter with Teakwood Base',
        sku: 'VK-ART-TR-14',
        variantId: 'tr-med',
        variantLabel: '14" Round Serving Platter',
        quantity: 1,
        unitPrice: 3299,
        totalPrice: 3299
      }
    ],
    subtotal: 3299,
    discountAmount: 200,
    couponCode: 'WELCOME200',
    shippingFee: 0,
    totalAmount: 3099,
    orderStatus: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'upi',
    shippingAddress: {
      fullName: 'Ananya Iyer',
      phone: '+91 97412 88990',
      street: 'Flat 304, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103'
    },
    carrier: 'BlueDart',
    trackingNumber: 'BD981123489IN',
    createdAt: '2026-10-12T14:10:00Z',
    updatedAt: '2026-10-13T17:30:00Z',
    timeline: [
      { status: 'new', timestamp: '2026-10-12T14:10:00Z' },
      { status: 'shipped', timestamp: '2026-10-13T09:00:00Z' },
      { status: 'delivered', timestamp: '2026-10-13T17:30:00Z', note: 'Delivered to customer' }
    ]
  },
  {
    id: 'ord-8918',
    orderNumber: 'VK-2026-8918',
    customerName: 'Kunal Deshmukh',
    customerEmail: 'kunal.d@outlook.com',
    customerPhone: '+91 98901 12345',
    items: [
      {
        productId: 'vk-epx-201',
        productName: 'Deep-Pour 2:1 River Table Optical Epoxy',
        sku: 'VK-EPX-201-1500G',
        variantId: 'kit-1500g',
        variantLabel: '1.5kg Kit',
        quantity: 1,
        unitPrice: 1899,
        totalPrice: 1899
      }
    ],
    subtotal: 1899,
    discountAmount: 0,
    shippingFee: 150,
    totalAmount: 2049,
    orderStatus: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    shippingAddress: {
      fullName: 'Kunal Deshmukh',
      phone: '+91 98901 12345',
      street: 'Bungalow 12, Baner Hills Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411045'
    },
    createdAt: '2026-10-14T17:00:00Z',
    updatedAt: '2026-10-14T17:00:00Z',
    timeline: [
      { status: 'pending', timestamp: '2026-10-14T17:00:00Z', note: 'Awaiting phone verification for COD' }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-101',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98451 22390',
    registeredDate: '2026-10-10',
    lastLogin: '2026-10-14 11:15',
    totalOrders: 1,
    totalSpent: 4099,
    status: 'active',
    defaultAddress: {
      fullName: 'Priya Sharma',
      phone: '+91 98451 22390',
      street: '42, 14th Main, 4th Sector, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102'
    }
  },
  {
    id: 'cust-102',
    name: 'Vikram Mehta',
    email: 'v.mehta@studioarch.com',
    phone: '+91 98200 45678',
    registeredDate: '2026-09-02',
    lastLogin: '2026-10-13 16:30',
    totalOrders: 4,
    totalSpent: 26490,
    status: 'active',
    defaultAddress: {
      fullName: 'Vikram Mehta',
      phone: '+91 98200 45678',
      street: '702, Skyline Towers, Prabhadevi',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400025'
    }
  },
  {
    id: 'cust-103',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@gmail.com',
    phone: '+91 97412 88990',
    registeredDate: '2026-09-15',
    lastLogin: '2026-10-12 14:05',
    totalOrders: 2,
    totalSpent: 6598,
    status: 'active',
    defaultAddress: {
      fullName: 'Ananya Iyer',
      phone: '+91 97412 88990',
      street: 'Flat 304, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103'
    }
  },
  {
    id: 'cust-104',
    name: 'Kunal Deshmukh',
    email: 'kunal.d@outlook.com',
    phone: '+91 98901 12345',
    registeredDate: '2026-10-14',
    lastLogin: '2026-10-14 16:55',
    totalOrders: 1,
    totalSpent: 2049,
    status: 'active',
    defaultAddress: {
      fullName: 'Kunal Deshmukh',
      phone: '+91 98901 12345',
      street: 'Bungalow 12, Baner Hills Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411045'
    }
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-01',
    code: 'VISTARA10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 2000,
    expiryDate: '2026-12-31',
    usageCount: 42,
    usageLimit: 500,
    isActive: true
  },
  {
    id: 'cpn-02',
    code: 'WELCOME200',
    discountType: 'fixed',
    discountValue: 200,
    minOrderValue: 1500,
    expiryDate: '2026-11-30',
    usageCount: 128,
    usageLimit: 1000,
    isActive: true
  },
  {
    id: 'cpn-03',
    code: 'BRIDAL500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 4000,
    expiryDate: '2026-12-31',
    usageCount: 19,
    usageLimit: 100,
    isActive: true
  }
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-1',
    timestamp: '2026-10-14T11:20:00Z',
    productId: 'ram-keep-001',
    productName: 'Eternal Varmala & Bridal Bouquet Time-Capsule Block',
    sku: 'RAM-VRM-12IN',
    change: -1,
    newStock: 7,
    reason: 'Order Deduction',
    performedBy: 'System (VK-2026-8921)'
  },
  {
    id: 'mov-2',
    timestamp: '2026-10-13T16:45:00Z',
    productId: 'vk-epx-301',
    productName: 'UltraClear 3:1 Casting Resin Kit',
    sku: 'VK-EPX-301-4000G',
    change: -2,
    newStock: 10,
    reason: 'Order Deduction',
    performedBy: 'System (VK-2026-8920)'
  },
  {
    id: 'mov-3',
    timestamp: '2026-10-12T09:30:00Z',
    productId: 'vk-epx-301',
    productName: 'UltraClear 3:1 Casting Resin Kit',
    sku: 'VK-EPX-301-1200G',
    change: 25,
    newStock: 35,
    reason: 'Manual Restock',
    performedBy: 'Owner'
  }
];

export const INITIAL_SESSIONS: OwnerSession[] = [
  {
    id: 'sess-01',
    loginTime: '2026-10-14 17:30:00',
    ipAddress: 'Cloudflare Edge (vistara-krafts-admin.vercel.app)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    status: 'active'
  },
  {
    id: 'sess-02',
    loginTime: '2026-10-13 10:14:22',
    ipAddress: '106.51.78.192 (Bengaluru, IN)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0',
    status: 'expired'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-14 17:30:00',
    action: 'Owner Login',
    target: 'Portal Security',
    details: 'Owner logged in successfully via local credentials'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-14 12:00:00',
    action: 'Order Updated',
    target: 'VK-2026-8921',
    details: 'Status changed to processing. Pickup booked with BlueDart Air.'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-12 09:30:00',
    action: 'Stock Restock',
    target: 'VK-EPX-301-1200G',
    details: '+25 units added to UltraClear 3:1 Studio Kit'
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Vistāra Krafts',
  brandTagline: 'Resin Art Memories × Optical Epoxy Atelier',
  instagramHandle: '@resin.art.memories',
  contactEmail: 'atelier@vistarakrafts.com',
  contactPhone: '+91 98450 12345',
  currency: 'INR (₹)',
  freeShippingThreshold: 1499,
  defaultCourier: 'Delhivery Express',
  announcementBarText: '✨ Vistāra Krafts • 24h Bridal Varmala Doorstep Pickup • Free Express Shipping on orders over ₹1,499',
  announcementBarActive: true,
  lowStockAlertThreshold: 5
};
