export interface ExpressCharge {
  id: string;
  name: string;
  percentage: number;
  active: boolean;
}

export interface ExpressChargeListResponse {
  message: string;
  expressCharges: ExpressCharge[];
}

export interface ExpressChargeRequest {
  name: string;
  percentage: number;
  active: boolean;
}