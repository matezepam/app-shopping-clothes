import type {
  AdminProduct,
  ReturnRequest,
  SalesPoint,
} from "../types/admin";

export const categoryOptions = [
  "T-Shirts",
  "Hoodies",
  "Pants",
  "Caps",
  "Sneakers",
  "Accessories",
];

export const statusOptions = [
  { value: "active", label: "Activo" },
  { value: "draft", label: "Borrador" },
  { value: "disabled", label: "Desactivado" },
] as const;

export const emptyProduct: AdminProduct = {
  id: "",
  slug: "",
  name: "",
  category: "T-Shirts",
  collection: "",
  shortDescription: "",
  description: "",
  status: "active",
  images: [],
  tags: [],
  featured: false,
  createdAt: new Date().toISOString().slice(0, 10),
  variants: [
    {
      id: "variant_demo_1",
      sku: "",
      colorName: "Black",
      colorHex: "#111827",
      size: "M",
      price: 0,
      stock: 0,
    },
  ],
};

export const initialProducts: AdminProduct[] = [
  {
    id: "prod_roses_oversized_tshirt",
    slug: "camiseta-oversize-rosas",
    name: "Camiseta Oversize Rosas",
    category: "T-Shirts",
    collection: "Rosas",
    shortDescription: "Camiseta oversize con diseño floral urbano.",
    description:
      "Camiseta oversize de algodón premium con estampado de rosas. Ideal para outfits streetwear, disponible en varios colores y tallas.",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=900&auto=format&fit=crop",
    ],
    tags: ["rosas", "oversize", "streetwear"],
    featured: true,
    createdAt: "2026-05-21",
    variants: [
      {
        id: "var_roses_black_s",
        sku: "TSH-ROS-BLA-S",
        colorName: "Black",
        colorHex: "#111827",
        size: "S",
        price: 29.99,
        stock: 8,
      },
      {
        id: "var_roses_black_m",
        sku: "TSH-ROS-BLA-M",
        colorName: "Black",
        colorHex: "#111827",
        size: "M",
        price: 29.99,
        stock: 12,
      },
      {
        id: "var_roses_pink_s",
        sku: "TSH-ROS-PIN-S",
        colorName: "Pink",
        colorHex: "#f9a8d4",
        size: "S",
        price: 31.99,
        stock: 4,
      },
      {
        id: "var_roses_pink_m",
        sku: "TSH-ROS-PIN-M",
        colorName: "Pink",
        colorHex: "#f9a8d4",
        size: "M",
        price: 31.99,
        stock: 6,
      },
    ],
  },
  {
    id: "prod_black_oversized_hoodie",
    slug: "black-oversized-hoodie",
    name: "Black Oversized Hoodie",
    category: "Hoodies",
    collection: "Urban Basic",
    shortDescription: "Hoodie negro oversize de algodón premium.",
    description:
      "Hoodie oversize con capucha ajustable, bolsillo frontal y acabado premium para uso diario.",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=900&auto=format&fit=crop",
    ],
    tags: ["hoodie", "black", "urban"],
    featured: true,
    createdAt: "2026-05-18",
    variants: [
      {
        id: "var_hoodie_black_m",
        sku: "HOO-URB-BLA-M",
        colorName: "Black",
        colorHex: "#020617",
        size: "M",
        price: 59.99,
        stock: 10,
      },
      {
        id: "var_hoodie_black_l",
        sku: "HOO-URB-BLA-L",
        colorName: "Black",
        colorHex: "#020617",
        size: "L",
        price: 59.99,
        stock: 5,
      },
      {
        id: "var_hoodie_gray_m",
        sku: "HOO-URB-GRA-M",
        colorName: "Gray",
        colorHex: "#6b7280",
        size: "M",
        price: 59.99,
        stock: 3,
      },
    ],
  },
  {
    id: "prod_eagle_classic_cap",
    slug: "eagle-classic-cap",
    name: "Eagle Classic Cap",
    category: "Caps",
    collection: "Eagle Essentials",
    shortDescription: "Gorra clásica con bordado frontal.",
    description:
      "Gorra ajustable con bordado premium, estructura clásica y diseño limpio.",
    status: "draft",
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=900&auto=format&fit=crop",
    ],
    tags: ["cap", "eagle", "classic"],
    featured: false,
    createdAt: "2026-05-15",
    variants: [
      {
        id: "var_cap_black_os",
        sku: "CAP-EAG-BLA-OS",
        colorName: "Black",
        colorHex: "#111827",
        size: "One Size",
        price: 24.99,
        stock: 7,
      },
    ],
  },
];

export const initialReturns: ReturnRequest[] = [
  {
    id: "RET-2026-0001",
    orderId: "ORD-2026-0015",
    productId: "prod_roses_oversized_tshirt",
    variantSku: "TSH-ROS-BLA-M",
    customerEmail: "cliente@example.com",
    productName: "Camiseta Oversize Rosas",
    quantity: 1,
    reason: "El cliente solicitó cambio de talla.",
    status: "pending",
    createdAt: "2026-05-29",
  },
  {
    id: "RET-2026-0002",
    orderId: "ORD-2026-0018",
    productId: "prod_black_oversized_hoodie",
    variantSku: "HOO-URB-GRA-M",
    customerEmail: "mateo@example.com",
    productName: "Black Oversized Hoodie",
    quantity: 1,
    reason: "El color no coincidió con lo esperado.",
    status: "approved",
    createdAt: "2026-05-30",
  },
];

export const revenueByDay: SalesPoint[] = [
  { day: "Lun", value: 420 },
  { day: "Mar", value: 690 },
  { day: "Mié", value: 510 },
  { day: "Jue", value: 880 },
  { day: "Vie", value: 730 },
  { day: "Sáb", value: 1100 },
  { day: "Dom", value: 940 },
];