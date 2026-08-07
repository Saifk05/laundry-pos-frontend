export interface CustomerResponse {
  id: string;
  name: string;
  phone: string;
}

export interface CouponResponse {
  id: string;
  code: string;
  amount: number;
  active: boolean;
}

export interface ProductServiceResponse {
  serviceId: string;
  name: string;
  price: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  category: string;
  icon: string;
  services: ProductServiceResponse[];
}

export interface WalkInOrderItemRequest {
  productId: string;
  serviceId: string;
  quantity: number;
}

export interface WalkInOrderRequest {
  customerName: string;
  customerPhone: string;

  deliveryDate: string;
  deliverySlot: string;

  homeDelivery: boolean;
  expressDelivery: boolean;

  washingArea: boolean;
  pressingArea: boolean;

  couponCode: string | null;

  items: WalkInOrderItemRequest[];
}

export interface OrderResponse {
  id: string;
  orderNumber: string;

  customerName: string;
  customerPhone: string;

  totalPieces: number;
  subtotal: number;

  couponDiscount: number;
  expressCharge: number;

  totalAmount: number;

  status: string;
  message: string;
}