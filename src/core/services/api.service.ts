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
  CustomFeatureSettings,
  RetagSecurityRequest,
  SetRetagPinRequest,
  VerifyRetagPinRequest,
  VerifyRetagPinResponse,
  ChangeRetagPinRequest,
  ResetRetagPinRequest,
  RetagWhatsappRequest
} from '../models/custom-feature.model';

import {
  PickupDelivery,
  PickupDeliveryRequest,
  PickupDeliveryStatus,
  PickupDeliveryPageResponse,
  MapLocationResponse
} from '../models/pickup-delivery.model';

import {
  TaxSetting,
  TaxSettingRequest
} from '../models/tax-setting.model';

import {
  TermsConditionsRequest,
  TermsConditionsResponse
} from '../models/terms-conditions.model';

import {
  BulkProductResponse
} from '../models/bulk-product.model';


import {
  SalesReportResponse
} from '../models/sales-report.model';

import {
  BusinessSettings,
  BusinessSettingsRequest
} from '../models/business-settings.model';

import {
  BillListResponse
} from '../models/bill.model';

import {
  PaymentReportResponse
} from '../models/payment-report.model';

import {
  DashboardResponse
} from '../models/dashboard.model';

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
  ProductRequest,
  ProductReorderRequest
} from '../models/product.model';

import {
  B2COrder,
  B2COrderDetails,
  B2COrderListResponse,
  B2COrderStatus,
  OrderStatusRequest,
  RescheduleOrderRequest,
  RetagOrderRequest
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


  createCustomer(
    request: {
      name: string;
      phone: string;
    }
  ): Observable<CustomerResponse> {

    return this.http.post<CustomerResponse>(
      `${this.baseUrl}/customers`,
      request
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

  reorderProducts(
    request: ProductReorderRequest
  ): Observable<void> {

    return this.http.put<void>(
      `${this.baseUrl}/products/reorder`,
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
  search?: string,
  fromDate?: string,
  toDate?: string,
  expressDelivery?: boolean | null,
  cursor?: string | null,
  limit = 10
): Observable<B2COrderListResponse> {

  const params: any = {
    status: status ?? '',
    search: search?.trim() ?? '',
    fromDate: fromDate ?? '',
    toDate: toDate ?? '',
    cursor: cursor ?? '',
    limit
  };

  if (expressDelivery !== undefined && expressDelivery !== null) {
    params.expressDelivery = expressDelivery;
  }

  return this.http.get<B2COrderListResponse>(
    `${this.baseUrl}/orders`,
    { params }
  );
}


  getB2COrderById(
    orderId: string
  ): Observable<B2COrderDetails> {

    return this.http.get<B2COrderDetails>(
      `${this.baseUrl}/orders/${orderId}`
    );
  }


  updateB2COrder(
  orderId: string,
  request: WalkInOrderRequest
): Observable<OrderResponse> {
  return this.http.put<OrderResponse>(
    `${this.baseUrl}/orders/${orderId}`,
    request
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

    getDashboard():
    Observable<DashboardResponse> {

    return this.http.get<DashboardResponse>(
      `${this.baseUrl}/dashboard`
    );
  }
  getPaymentReport(
  fromDate: string,
  toDate: string
): Observable<PaymentReportResponse> {

  return this.http.get<PaymentReportResponse>(
    `${this.baseUrl}/payments/report`,
    {
      params: {
        fromDate,
        toDate
      }
    }
  );
}

getBills(
  fromDate?: string,
  toDate?: string,
  withGst?: boolean,
  cursor?: string | null,
  limit = 10
): Observable<BillListResponse> {

  const params: any = {
    fromDate: fromDate ?? '',
    toDate: toDate ?? '',
    cursor: cursor ?? '',
    limit
  };

  if (withGst !== undefined) {
    params.withGst = withGst;
  }

  return this.http.get<BillListResponse>(
    `${this.baseUrl}/bills`,
    { params }
  );
}


downloadBillReceipt(
  orderId: string
): Observable<Blob> {

  return this.http.get(
    `${this.baseUrl}/bills/${orderId}/receipt`,
    {
      responseType: 'blob'
    }
  );
}

sendBillReceiptToWhatsApp(
  orderId: string
): Observable<string> {

  return this.http.post(
    `${this.baseUrl}/bills/${orderId}/whatsapp`,
    {},
    {
      responseType: 'text'
    }
  );
}

retagB2COrder(
  orderId: string,
  request: RetagOrderRequest
): Observable<B2COrderDetails> {

  return this.http.put<B2COrderDetails>(
    `${this.baseUrl}/orders/${orderId}/retag`,
    request
  );
}

 getBusinessSettings():
    Observable<BusinessSettings> {

    return this.http.get<BusinessSettings>(
      `${this.baseUrl}/settings`
    );
  }


  updateBusinessSettings(
    request:
      BusinessSettingsRequest
  ): Observable<BusinessSettings> {

    return this.http.put<BusinessSettings>(
      `${this.baseUrl}/settings`,
      request
    );
  }


  getSalesReport(
  startDate: string,
  endDate: string
): Observable<SalesReportResponse> {

  return this.http.get<SalesReportResponse>(
    `${this.baseUrl}/reports/sales`,
    {
      params: {
        startDate,
        endDate
      }
    }
  );
}

bulkUploadProductsPdf(
  file: File
): Observable<BulkProductResponse> {

  const formData =
    new FormData();

  formData.append(
    'file',
    file
  );

  return this.http.post<BulkProductResponse>(
    `${this.baseUrl}/products/bulk/pdf`,
    formData
  );
}

getTermsConditions():
  Observable<TermsConditionsResponse> {

  return this.http.get<TermsConditionsResponse>(
    `${this.baseUrl}/terms-conditions`
  );
}


updateTermsConditions(
  request: TermsConditionsRequest
): Observable<TermsConditionsResponse> {

  return this.http.put<TermsConditionsResponse>(
    `${this.baseUrl}/terms-conditions`,
    request
  );
}

  /* =========================================
     TAX SETTINGS
  ========================================= */

  getTaxSettings():
    Observable<TaxSetting> {

    return this.http.get<TaxSetting>(
      `${this.baseUrl}/tax-settings`
    );
  }


  updateTaxSettings(
    request: TaxSettingRequest
  ): Observable<TaxSetting> {

    return this.http.put<TaxSetting>(
      `${this.baseUrl}/tax-settings`,
      request
    );
  }

  /* =========================================
     PICKUP / DELIVERY
  ========================================= */

  createPickupDelivery(
    request: PickupDeliveryRequest
  ): Observable<PickupDelivery> {
    return this.http.post<PickupDelivery>(
      `${this.baseUrl}/v1/pickup-deliveries`,
      request
    );
  }

  getPickupDeliveries(
    filter: 'ALL' | 'PICKUP' | 'DELIVERY' = 'ALL',
    date?: string | null,
    status?: PickupDeliveryStatus | null,
    timeSlot?: string | null,
    search?: string | null,
    cursor: string | null = null,
    limit = 10
  ): Observable<PickupDeliveryPageResponse> {
    const params: any = {
      filter,
      cursor: cursor ?? '',
      limit
    };

    if (date) params.date = date;
    if (status) params.status = status;
    if (timeSlot?.trim()) params.timeSlot = timeSlot.trim();
    if (search?.trim()) params.search = search.trim();

    return this.http.get<PickupDeliveryPageResponse>(
      `${this.baseUrl}/v1/pickup-deliveries`,
      { params }
    );
  }

  getPickupDeliveryById(
    id: string
  ): Observable<PickupDelivery> {
    return this.http.get<PickupDelivery>(
      `${this.baseUrl}/v1/pickup-deliveries/${id}`
    );
  }

  updatePickupDeliveryStatus(
    id: string,
    status: PickupDeliveryStatus
  ): Observable<PickupDelivery> {
    return this.http.patch<PickupDelivery>(
      `${this.baseUrl}/v1/pickup-deliveries/${id}/status`,
      { status }
    );
  }


  /* =========================================
     MAPS
  ========================================= */

  autocompleteLocation(
    query: string
  ): Observable<MapLocationResponse[]> {

    return this.http.get<MapLocationResponse[]>(
      `${this.baseUrl}/v1/maps/autocomplete`,
      {
        params: { q: query }
      }
    );
  }


  geocodeAddress(
    address: string
  ): Observable<any> {

    return this.http.get<any>(
      `${this.baseUrl}/v1/maps/geocode`,
      {
        params: { address }
      }
    );
  }


  reverseGeocode(
    latitude: number,
    longitude: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.baseUrl}/v1/maps/reverse-geocode`,
      {
        params: {
          lat: latitude,
          lng: longitude
        }
      }
    );
  }


  resolveGoogleMapsLink(
    url: string
  ): Observable<MapLocationResponse> {

    return this.http.get<MapLocationResponse>(
      `${this.baseUrl}/v1/maps/resolve-link`,
      {
        params: { url }
      }
    );
  }

  getCustomFeatures():
  Observable<CustomFeatureSettings> {

  return this.http.get<CustomFeatureSettings>(
    `${this.baseUrl}/custom-features`
  );
}

updateRetagSecurity(
  request: RetagSecurityRequest
): Observable<CustomFeatureSettings> {

  return this.http.put<CustomFeatureSettings>(
    `${this.baseUrl}/custom-features/retag-security`,
    request
  );
}

setRetagPin(
  request: SetRetagPinRequest
): Observable<CustomFeatureSettings> {

  return this.http.post<CustomFeatureSettings>(
    `${this.baseUrl}/custom-features/retag-pin`,
    request
  );
}

verifyRetagPin(
  request: VerifyRetagPinRequest
): Observable<VerifyRetagPinResponse> {

  return this.http.post<VerifyRetagPinResponse>(
    `${this.baseUrl}/custom-features/retag-pin/verify`,
    request
  );
}

changeRetagPin(
  request: ChangeRetagPinRequest
): Observable<CustomFeatureSettings> {

  return this.http.put<CustomFeatureSettings>(
    `${this.baseUrl}/custom-features/retag-pin/change`,
    request
  );
}

resetRetagPin(
  request: ResetRetagPinRequest
): Observable<CustomFeatureSettings> {

  return this.http.put<CustomFeatureSettings>(
    `${this.baseUrl}/custom-features/retag-pin/reset`,
    request
  );
}

updateRetagWhatsapp(
  request: RetagWhatsappRequest
): Observable<CustomFeatureSettings> {

  return this.http.put<CustomFeatureSettings>(
    `${this.baseUrl}/custom-features/retag-whatsapp`,
    request
  );
}

}