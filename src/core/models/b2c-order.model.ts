export type B2COrderStatus =
  | 'TAGGED'
  | 'PROCESSING_AT_STORE'
  | 'READY_ORDER'
  | 'DELIVERED'
  | 'CANCELLED';

export interface B2COrder {
  id: string;
  orderNumber: string;
  customerName: string;
  mobile: string;
  totalAmount: number;
  pickupDate: string | null;
  pickupTime: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  storageLabel: string | null;
  homeDelivery: boolean;
  expressDelivery: boolean;
  settled: boolean;
  status: B2COrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface B2COrderListResponse {
  message: string;
  totalOrders: number;
  orders: B2COrder[];
}

export interface OrderStatusRequest {
  status: B2COrderStatus;
}

export interface RescheduleOrderRequest {
  deliveryDate: string;
  deliveryTime: string;
}

export interface B2COrderCustomer {
  id: string;
  name: string;
  phone: string;
}

export type PricingUnit =
  | 'PC'
  | 'KG';

export interface B2COrderItem {
  id: string;
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

export interface B2COrderDetails {
  id: string;
  orderNumber: string;
  customer: B2COrderCustomer;
  items: B2COrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  expressDelivery: boolean;
  expressChargePercentage: number | null;
  expressChargeAmount: number;
  totalAmount: number;
  pickupDate: string | null;
  pickupTime: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  storageLabel: string | null;
  homeDelivery: boolean;
  settled: boolean;
  status: B2COrderStatus;
  createdAt: string;
  updatedAt: string;
  message: string;
}

export interface RetagOrderItemRequest {
  orderItemId: string;
  quantity: number;
}

export interface RetagOrderRequest {
  items: RetagOrderItemRequest[];
}