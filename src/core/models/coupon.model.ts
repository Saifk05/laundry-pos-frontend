export type DiscountType =
  | 'FLAT'
  | 'PERCENTAGE';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount: number;
  active: boolean;
}

export interface CouponListResponse {
  message: string;
  coupons: Coupon[];
}

export interface CouponRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount: number;
  active: boolean;
}