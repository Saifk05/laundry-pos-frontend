export type BillStatus =
  | 'DRAFT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED';


  export type GstFilter =
  | 'ALL'
  | 'WITH_GST'
  | 'WITHOUT_GST';

export interface Bill {

  orderId: string;

  invoiceNumber: string;

  orderNumber: string;

  status: BillStatus;

  paidAmount: number;

  dueAmount: number;

  total: number;

  taxableAmount: number;

  cgstPercentage: number;

  sgstPercentage: number;

  totalTaxPercentage: number;

  cgstAmount: number;

  sgstAmount: number;

  totalTaxAmount: number;

  taxIncluded: boolean;

  expressAmount: number;

  discountAmount: number;

  grossTotal: number;

  createdAt: string;

  paidAt: string | null;

  deliveryDate: string | null;

  deliveredAt: string | null;

  orderStatus: string;
}


export interface BillListResponse {

  message: string;

  totalBills: number;

  totalPaidAmount: number;

  totalDueAmount: number;

  totalAmount: number;

  totalTaxableAmount: number;

  totalCgstAmount: number;

  totalSgstAmount: number;

  totalTaxAmount: number;

  totalExpressAmount: number;

  totalDiscountAmount: number;

  totalGrossAmount: number;

  bills: Bill[];

  nextCursor: string | null;

  hasMore: boolean;
}