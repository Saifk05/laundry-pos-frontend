import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  CustomerResponse,
  CouponResponse,
  WalkInOrderRequest,
  OrderResponse
} from '../models/walk-in.model';

import {
  ProductRequest,
  ProductResponse
} from '../models/product.model';

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

  getCoupons(): Observable<CouponResponse[]> {

    return this.http.get<CouponResponse[]>(
      `${this.baseUrl}/coupons`
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
}