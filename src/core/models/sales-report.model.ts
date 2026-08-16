export type SalesOrderStatus =
  | 'TAGGED'
  | 'PROCESSING_AT_STORE'
  | 'READY_ORDER'
  | 'DELIVERED'
  | 'CANCELLED';


export type SalesPricingUnit =
  | 'PC'
  | 'KG';


export interface SalesReportSummary {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  expressAmount: number;
  totalExpressOrders: number;
}


export interface SalesReportProduct {
  productName: string;
  quantity: number;
  unit: SalesPricingUnit;
  revenue: number;
}


export interface SalesReportService {
  serviceName: string;
  orders: number;
  revenue: number;
}


export interface SalesReportOrder {
  orderNumber: string;
  customerName: string;
  date: string;
  discountAmount: number;
  expressAmount: number;
  totalAmount: number;
  status: SalesOrderStatus;
}


export interface SalesReportResponse {
  startDate: string;
  endDate: string;
  summary: SalesReportSummary;
  productSales: SalesReportProduct[];
  serviceSales: SalesReportService[];
  orders: SalesReportOrder[];
}