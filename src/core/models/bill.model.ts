export type BillStatus =
  | 'DRAFT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED';


export type BillOrderStatus =
  | 'NEW_ORDER'
  | 'PROCESSING_AT_STORE'
  | 'READY_ORDER'
  | 'DELIVERED'
  | 'CANCELLED';


export interface Bill {
  orderId: string;

  invoiceNumber: string;

  orderNumber: string;

  status: BillStatus;

  paidAmount: number;

  dueAmount: number;

  total: number;

  tax: number;

  taxableAmount: number;

  expressAmount: number;

  discountAmount: number;

  grossTotal: number;

  createdAt: string;

  paidAt: string | null;

  deliveredAt: string | null;

  orderStatus: BillOrderStatus;
}


export interface BillListResponse {
  message: string;

  totalBills: number;

  totalPaidAmount: number;

  totalDueAmount: number;

  totalAmount: number;

  totalTax: number;

  totalTaxableAmount: number;

  totalExpressAmount: number;

  totalDiscountAmount: number;

  totalGrossAmount: number;

  bills: Bill[];
}