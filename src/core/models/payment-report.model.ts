export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'CARD'
  | 'OTHER';


export interface PaymentReportOrder {
  paymentId: string;

  orderId: string;

  orderNumber: string;

  customerName: string;

  mobile: string;

  amount: number;

  paymentMethod: PaymentMethod;

  referenceNumber: string | null;

  paidAt: string;
}


export interface PaymentReportDate {
  date: string;

  totalAmount: number;

  cashAmount: number;

  upiAmount: number;

  cardAmount: number;

  otherAmount: number;

  cashOrders: PaymentReportOrder[];

  upiOrders: PaymentReportOrder[];

  cardOrders: PaymentReportOrder[];

  otherOrders: PaymentReportOrder[];
}


export interface PaymentReportResponse {
  fromDate: string;

  toDate: string;

  totalAmount: number;

  cashAmount: number;

  upiAmount: number;

  cardAmount: number;

  otherAmount: number;

  dates: PaymentReportDate[];
}