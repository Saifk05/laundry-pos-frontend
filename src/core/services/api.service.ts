import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '../models/auth.model';

import {
  CustomerResponse,
  CouponResponse,
  ProductResponse,
  WalkInOrderRequest,
  OrderResponse
} from '../models/walk-in.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly baseUrl =
    `${environment.clientUrl}/api`;

  private readonly authUrl =
    `${this.baseUrl}/auth`;

  constructor(
    private readonly http: HttpClient
  ) {}

  /* =========================================
     AUTH
  ========================================= */

  register(
    request: RegisterRequest
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.authUrl}/register`,
      request
    );
  }

  login(
    request: LoginRequest
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.authUrl}/login`,
      request
    );
  }

  logout(): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.authUrl}/logout`,
      {}
    );
  }

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