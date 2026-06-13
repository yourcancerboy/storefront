import type { User, Product, ProductVariant, ProductImage, Order, OrderItem, Category, Promotion, Payment, Shipment } from "@prisma/client";

export type { User, Product, ProductVariant, ProductImage, Order, OrderItem, Category, Promotion, Payment, Shipment };

export type ProductWithDetails = Product & {
  variants: ProductVariant[];
  images: ProductImage[];
  category: Category | null;
  reviews: { rating: number }[];
};

export type OrderWithDetails = Order & {
  items: (OrderItem & { product: Product; variant: ProductVariant })[];
  payment: Payment | null;
  shipment: Shipment | null;
  user: User;
};

export type CartItemWithDetails = {
  id: string;
  quantity: number;
  product: ProductWithDetails;
  variant: ProductVariant;
};

export type UserRole = "BUYER" | "SUPER_ADMIN" | "FINANCE" | "OPERATIONS" | "CUSTOMER_SERVICE";

export type RolePermissions = {
  canViewOrders: boolean;
  canEditOrders: boolean;
  canViewProducts: boolean;
  canEditProducts: boolean;
  canViewFinancials: boolean;
  canViewShipping: boolean;
  canEditShipping: boolean;
  canManagePromotions: boolean;
  canManageUsers: boolean;
  canViewInsights: boolean;
  canManageSettings: boolean;
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  BUYER: {
    canViewOrders: false, canEditOrders: false, canViewProducts: false,
    canEditProducts: false, canViewFinancials: false, canViewShipping: false,
    canEditShipping: false, canManagePromotions: false, canManageUsers: false,
    canViewInsights: false, canManageSettings: false,
  },
  SUPER_ADMIN: {
    canViewOrders: true, canEditOrders: true, canViewProducts: true,
    canEditProducts: true, canViewFinancials: true, canViewShipping: true,
    canEditShipping: true, canManagePromotions: true, canManageUsers: true,
    canViewInsights: true, canManageSettings: true,
  },
  FINANCE: {
    canViewOrders: true, canEditOrders: true, canViewProducts: false,
    canEditProducts: false, canViewFinancials: true, canViewShipping: false,
    canEditShipping: false, canManagePromotions: false, canManageUsers: false,
    canViewInsights: true, canManageSettings: false,
  },
  OPERATIONS: {
    canViewOrders: true, canEditOrders: true, canViewProducts: true,
    canEditProducts: true, canViewFinancials: false, canViewShipping: true,
    canEditShipping: true, canManagePromotions: true, canManageUsers: false,
    canViewInsights: true, canManageSettings: false,
  },
  CUSTOMER_SERVICE: {
    canViewOrders: true, canEditOrders: false, canViewProducts: false,
    canEditProducts: false, canViewFinancials: false, canViewShipping: true,
    canEditShipping: false, canManagePromotions: false, canManageUsers: false,
    canViewInsights: false, canManageSettings: false,
  },
};
