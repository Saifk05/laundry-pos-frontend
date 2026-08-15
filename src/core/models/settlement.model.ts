export type PaymentStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'SETTLED';


export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'CARD'
  | 'OTHER';


export type OrderStatus =
  | 'NEW_ORDER'
  | 'PROCESSING_AT_STORE'
  | 'READY_ORDER'
  | 'DELIVERED'
  | 'CANCELLED';


export interface SettlementOrder {
  id: string;

  orderNumber: string;

  customerName: string;

  mobile: string;

  totalAmount: number;

  paidAmount: number;

  balanceAmount: number;

  paymentStatus: PaymentStatus;

  orderStatus: OrderStatus;

  createdAt: string;

  updatedAt: string;
}


export interface PaymentRequest {
  amount: number;

  paymentMethod: PaymentMethod;

  referenceNumber: string | null;
}


export interface PaymentTransaction {
  id: string;

  amount: number;

  paymentMethod: PaymentMethod;

  referenceNumber: string | null;

  paidAt: string;
}


export interface PaymentHistoryResponse {
  orderId: string;

  orderNumber: string;

  customerName: string;

  mobile: string;

  totalAmount: number;

  paidAmount: number;

  balanceAmount: number;

  paymentStatus: PaymentStatus;

  payments: PaymentTransaction[];
}