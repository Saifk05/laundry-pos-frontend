export type PickupDeliveryType = 'PICKUP' | 'DELIVERY';

export type PickupDeliveryStatus =
  | 'PENDING'
  | 'ASSIGNED_FOR_PICKUP'
  | 'OUT_FOR_PICKUP'
  | 'PICKED_UP'
  | 'RECEIVED_AT_STORE'
  | 'ASSIGNED_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export interface PickupDelivery {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  type: PickupDeliveryType;
  scheduledDate: string;
  timeSlot: string;
  status: PickupDeliveryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PickupDeliveryRequest {
  customerName: string;
  phoneNumber: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  type: PickupDeliveryType;
  scheduledDate: string;
  timeSlot: string;
}

export interface MapLocation {
  placeId: string | null;
  name: string | null;
  formattedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  originalUrl: string | null;
  resolvedUrl: string | null;
}

export interface MapLocationResponse {
  placeId: string | null;
  name: string | null;
  formattedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  originalUrl: string | null;
  resolvedUrl: string | null;
}