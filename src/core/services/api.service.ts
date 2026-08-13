import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  CustomerResponse,
  WalkInOrderRequest,
  OrderResponse
} from '../models/walk-in.model';

import {
  ExpressCharge,
  ExpressChargeListResponse,
  ExpressChargeRequest
} from '../models/express-charge.model';

import {
  ProductRequest,
  ProductResponse
} from '../models/product.model';

import {
  Coupon,
  CouponListResponse,
  CouponRequest
} from '../models/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly baseUrl =
    `${environment.clientUrl}/api`;

  constructor(
    private readonly http: HttpClient
  ) {}

  /* =========================================
     CUSTOMER
  ========================================= */

  getCustomerByPhone(
    phone: string
  ): Observable<CustomerResponse> {

    return this.http.get<CustomerResponse>(
      `${this.baseUrl}/customers/phone/${phone}`
    );
  }

  /* =========================================
     COUPONS
  ========================================= */

  /* =========================================
   COUPONS
========================================= */

getCoupons(): Observable<CouponListResponse> {

  return this.http.get<CouponListResponse>(
    `${this.baseUrl}/coupons`
  );
}

getCouponById(
  couponId: string
): Observable<Coupon> {

  return this.http.get<Coupon>(
    `${this.baseUrl}/coupons/${couponId}`
  );
}

createCoupon(
  request: CouponRequest
): Observable<Coupon> {

  return this.http.post<Coupon>(
    `${this.baseUrl}/coupons`,
    request
  );
}

updateCoupon(
  couponId: string,
  request: CouponRequest
): Observable<Coupon> {

  return this.http.put<Coupon>(
    `${this.baseUrl}/coupons/${couponId}`,
    request
  );
}

deleteCoupon(
  couponId: string
): Observable<void> {

  return this.http.delete<void>(
    `${this.baseUrl}/coupons/${couponId}`
  );
}
  /* =========================================
     PRODUCTS
  ========================================= */

  getProducts(): Observable<ProductResponse[]> {

    return this.http.get<ProductResponse[]>(
      `${this.baseUrl}/products`
    );
  }

  createProduct(
    request: ProductRequest
  ): Observable<ProductResponse> {

    return this.http.post<ProductResponse>(
      `${this.baseUrl}/products`,
      request
    );
  }

  updateProductStatus(
    productId: string,
    active: boolean
  ): Observable<void> {

    return this.http.patch<void>(
      `${this.baseUrl}/products/${productId}/status`,
      {},
      {
        params: {
          active
        }
      }
    );
  }

  /* =========================================
     WALK-IN ORDER
  ========================================= */

  createWalkInOrder(
    request: WalkInOrderRequest
  ): Observable<OrderResponse> {

    return this.http.post<OrderResponse>(
      `${this.baseUrl}/orders/walk-in`,
      request
    );
  }

  /* =========================================
   EXPRESS CHARGES
========================================= */

getExpressCharges(): Observable<ExpressChargeListResponse> {

  return this.http.get<ExpressChargeListResponse>(
    `${this.baseUrl}/express-charges`
  );
}

getExpressChargeById(
  expressChargeId: string
): Observable<ExpressCharge> {

  return this.http.get<ExpressCharge>(
    `${this.baseUrl}/express-charges/${expressChargeId}`
  );
}

createExpressCharge(
  request: ExpressChargeRequest
): Observable<ExpressCharge> {

  return this.http.post<ExpressCharge>(
    `${this.baseUrl}/express-charges`,
    request
  );
}

updateExpressCharge(
  expressChargeId: string,
  request: ExpressChargeRequest
): Observable<ExpressCharge> {

  return this.http.put<ExpressCharge>(
    `${this.baseUrl}/express-charges/${expressChargeId}`,
    request
  );
}

updateExpressChargeStatus(
  expressChargeId: string,
  active: boolean
): Observable<ExpressCharge> {

  return this.http.patch<ExpressCharge>(
    `${this.baseUrl}/express-charges/${expressChargeId}/status`,
    {},
    {
      params: {
        active
      }
    }
  );
}

deleteExpressCharge(
  expressChargeId: string
): Observable<void> {

  return this.http.delete<void>(
    `${this.baseUrl}/express-charges/${expressChargeId}`
  );
}
}