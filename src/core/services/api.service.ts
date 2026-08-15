import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  CustomerResponse,
  WalkInOrderRequest,
  WalkInSetupResponse,
  OrderResponse
} from '../models/walk-in.model';


import {
  SettlementOrder,
  PaymentHistoryResponse,
  PaymentRequest
} from '../models/settlement.model';


import {
  Coupon,
  CouponListResponse,
  CouponRequest
} from '../models/coupon.model';

import {
  ExpressCharge,
  ExpressChargeListResponse,
  ExpressChargeRequest
} from '../models/express-charge.model';

import {
  Product,
  ProductListResponse,
  ProductRequest
} from '../models/product.model';

import {
  B2COrder,
  B2COrderDetails,
  B2COrderListResponse,
  B2COrderStatus,
  OrderStatusRequest,
  RescheduleOrderRequest
} from '../models/b2c-order.model';


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

  getCoupons():
    Observable<CouponListResponse> {

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

  getProducts():
    Observable<ProductListResponse> {

    return this.http.get<ProductListResponse>(
      `${this.baseUrl}/products`
    );
  }


  getProductById(
    productId: string
  ): Observable<Product> {

    return this.http.get<Product>(
      `${this.baseUrl}/products/${productId}`
    );
  }


  createProduct(
    request: ProductRequest
  ): Observable<Product> {

    return this.http.post<Product>(
      `${this.baseUrl}/products`,
      request
    );
  }


  updateProduct(
    productId: string,
    request: ProductRequest
  ): Observable<Product> {

    return this.http.put<Product>(
      `${this.baseUrl}/products/${productId}`,
      request
    );
  }


  deleteProduct(
    productId: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/products/${productId}`
    );
  }


  /* =========================================
     EXPRESS CHARGES
  ========================================= */

  getExpressCharges():
    Observable<ExpressChargeListResponse> {

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


  /* =========================================
     WALK-IN SETUP
  ========================================= */

  getWalkInSetup():
    Observable<WalkInSetupResponse> {

    return this.http.get<WalkInSetupResponse>(
      `${this.baseUrl}/walk-in/setup`
    );
  }


  /* =========================================
     WALK-IN ORDER
  ========================================= */

  createWalkInOrder(
    request: WalkInOrderRequest
  ): Observable<OrderResponse> {

    return this.http.post<OrderResponse>(
      `${this.baseUrl}/walk-in`,
      request
    );
  }


  /* =========================================
     B2C ORDERS
  ========================================= */

  getB2COrders(
    status?: B2COrderStatus | null,
    search?: string
  ): Observable<B2COrderListResponse> {

    const params: {
      status?: string;
      search?: string;
    } = {};

    if (status) {
      params.status = status;
    }

    if (
      search &&
      search.trim()
    ) {
      params.search =
        search.trim();
    }

    return this.http.get<B2COrderListResponse>(
      `${this.baseUrl}/orders`,
      {
        params
      }
    );
  }


  getB2COrderById(
    orderId: string
  ): Observable<B2COrderDetails> {

    return this.http.get<B2COrderDetails>(
      `${this.baseUrl}/orders/${orderId}`
    );
  }


  getB2COrderByNumber(
    orderNumber: string
  ): Observable<B2COrderDetails> {

    return this.http.get<B2COrderDetails>(
      `${this.baseUrl}/orders/number/${orderNumber}`
    );
  }


  updateB2COrderStatus(
    orderId: string,
    status: B2COrderStatus
  ): Observable<B2COrder> {

    const request:
      OrderStatusRequest = {
        status
      };

    return this.http.patch<B2COrder>(
      `${this.baseUrl}/orders/${orderId}/status`,
      request
    );
  }


  markB2COrderReady(
    orderId: string
  ): Observable<B2COrder> {

    return this.http.patch<B2COrder>(
      `${this.baseUrl}/orders/${orderId}/ready`,
      {}
    );
  }


  markB2COrderDelivered(
    orderId: string
  ): Observable<B2COrder> {

    return this.http.patch<B2COrder>(
      `${this.baseUrl}/orders/${orderId}/delivered`,
      {}
    );
  }


  cancelB2COrder(
    orderId: string
  ): Observable<B2COrder> {

    return this.http.patch<B2COrder>(
      `${this.baseUrl}/orders/${orderId}/cancel`,
      {}
    );
  }


  rescheduleB2COrder(
    orderId: string,
    request: RescheduleOrderRequest
  ): Observable<B2COrder> {

    return this.http.patch<B2COrder>(
      `${this.baseUrl}/orders/${orderId}/reschedule`,
      request
    );
  }


  settleB2COrder(
    orderId: string
  ): Observable<B2COrder> {

    return this.http.patch<B2COrder>(
      `${this.baseUrl}/orders/${orderId}/settle`,
      {}
    );
  }


  updateB2CStorageLabel(
    orderId: string,
    storageLabel: string
  ): Observable<B2COrder> {

    return this.http.patch<B2COrder>(
      `${this.baseUrl}/orders/${orderId}/storage-label`,
      {},
      {
        params: {
          storageLabel
        }
      }
    );
  }

    /* =========================================
     SETTLEMENT
  ========================================= */

  getSettlements():
    Observable<SettlementOrder[]> {

    return this.http.get<SettlementOrder[]>(
      `${this.baseUrl}/settlements`
    );
  }


  getSettlementById(
    orderId: string
  ): Observable<SettlementOrder> {

    return this.http.get<SettlementOrder>(
      `${this.baseUrl}/settlements/${orderId}`
    );
  }


  addSettlementPayment(
    orderId: string,
    request: PaymentRequest
  ): Observable<SettlementOrder> {

    return this.http.post<SettlementOrder>(
      `${this.baseUrl}/settlements/${orderId}/payments`,
      request
    );
  }


  getSettlementPaymentHistory(
    orderId: string
  ): Observable<PaymentHistoryResponse> {

    return this.http.get<PaymentHistoryResponse>(
      `${this.baseUrl}/settlements/${orderId}/payments`
    );
  }
}