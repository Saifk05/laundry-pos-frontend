export type PricingUnit =
  | 'PC'
  | 'KG';


export type DiscountType =
  | 'FLAT'
  | 'PERCENTAGE';


export type OrderStatus =
  | 'PROCESSING_AT_STORE'
  | 'READY_ORDER'
  | 'DELIVERED'
  | 'CANCELLED';


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
}


export interface WalkInCustomerRequest {
  name: string;
  phone: string;
}


export interface WalkInOrderItemRequest {
  productId: string;
  typeId: string;
  serviceId: string;
  quantity: number;
}


export interface WalkInOrderRequest {
  customer: WalkInCustomerRequest;
  items: WalkInOrderItemRequest[];

  couponId: string | null;
  expressChargeId: string | null;

  deliveryDate: string;
  deliveryTime: string;

  homeDelivery: boolean;
}


export interface OrderCustomerResponse {
  id: string;
  name: string;
  phone: string;
}


export interface OrderItemResponse {
  id: string;

  productId: string;
  productName: string;

  typeId: string;
  typeName: string;

  serviceId: string;
  serviceName: string;

  unit: PricingUnit;

  quantity: number;

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

  expressChargePercentage: number | null;

  expressChargeAmount: number;

  totalAmount: number;

  pickupDate: string;
  pickupTime: string;

  deliveryDate: string;
  deliveryTime: string;

  storageLabel: string | null;

  homeDelivery: boolean;

  settled: boolean;

  status: OrderStatus;

  createdAt: string;
  updatedAt: string;

  message: string;
}