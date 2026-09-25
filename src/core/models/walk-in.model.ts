export type PricingUnit = 'PC' | 'KG';
export type DiscountType = 'FLAT' | 'PERCENTAGE';

export type OrderStatus =
  | 'TAGGED'
  | 'PROCESSING_AT_STORE'
  | 'READY_ORDER'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'SETTLED';

export interface WalkInServicePrice {
  id: string;
  name: string;
  price: number;
}

export interface WalkInProductType {
  id: string;
  name: string;
  services: WalkInServicePrice[];
}

export interface WalkInProduct {
  id: string;
  name: string;
  icon: string | null;
  unit: PricingUnit;
  active: boolean;
  types: WalkInProductType[];
}

export interface WalkInCoupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount: number;
  active: boolean;
}

export interface WalkInExpressCharge {
  id: string;
  name: string;
  percentage: number;
  active: boolean;
}

export interface WalkInSetupResponse {
  message: string;
  products: WalkInProduct[];
  coupons: WalkInCoupon[];
  expressCharges: WalkInExpressCharge[];
}

export interface CustomerResponse {
  exists: boolean;
  message: string;
  id: string | null;
  name: string | null;
  phone: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface WalkInCustomerRequest {
  name: string;
  phone: string;
}

export interface WalkInOrderItemRequest {
  itemGroupId: string;
  productId: string;
  typeId: string;
  serviceId: string;
  quantity: number;
  garmentCount: number | null;
}

export interface WalkInOrderRequest {
  customer: WalkInCustomerRequest;
  items: WalkInOrderItemRequest[];
  couponId: string | null;
  expressChargeId: string | null;
  deliveryDate: string;
  deliveryTime: string;
  homeDelivery: boolean;
  deliveryAddress: string | null;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
}

export interface OrderCustomerResponse {
  id: string;
  name: string;
  phone: string;
}

export interface OrderItemResponse {
  id: string;
  itemGroupId: string;
  productId: string;
  productName: string;
  typeId: string;
  typeName: string;
  serviceId: string;
  serviceName: string;
  unit: PricingUnit;
  quantity: number;
  garmentCount: number | null;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customer: OrderCustomerResponse;
  items: OrderItemResponse[];
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  expressDelivery: boolean;
  expressChargePercentage: number | null;
  expressChargeAmount: number;
  cgstPercentage: number;
  sgstPercentage: number;
  cgstAmount: number;
  sgstAmount: number;
  taxAmount: number;
  taxIncluded: boolean;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  pickupDate: string | null;
  pickupTime: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  storageLabel: string | null;
  homeDelivery: boolean;
  deliveryAddress: string | null;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  settled: boolean;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  message: string;
}