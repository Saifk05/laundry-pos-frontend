export type DashboardOrderStatus =
  | 'NEW_ORDER'
  | 'PROCESSING_AT_STORE'
  | 'READY_ORDER'
  | 'DELIVERED'
  | 'CANCELLED';


export interface DashboardOrder {
  id: string;

  orderNumber: string;

  customerName: string;

  mobile: string;

  totalAmount: number;

  totalPieces: number;

  deliveryTime: string | null;

  status: DashboardOrderStatus;
}


export interface DashboardDeliveryDate {
  deliveryDate: string;

  dayLabel: string;

  totalOrders: number;

  totalPieces: number;

  processingOrders: number;

  processingPieces: number;

  readyOrders: number;

  readyPieces: number;

  orders: DashboardOrder[];
}


export interface DashboardResponse {
  totalOrders: number;

  processingOrders: number;

  readyOrders: number;

  dates: DashboardDeliveryDate[];
}