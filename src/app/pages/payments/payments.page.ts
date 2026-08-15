import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ApiService
} from '../../../core/services/api.service';

import {
  PaymentReportDate,
  PaymentReportOrder,
  PaymentReportResponse
} from '../../../core/models/payment-report.model';


interface PaymentDayView
  extends PaymentReportDate {

  expanded?: boolean;
}


@Component({
  selector: 'app-payments',
  standalone: true,
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class PaymentsPage
  implements OnInit {

  /* =========================================
     FILTERS
  ========================================= */

  startDate =
    '2026-08-01';

  endDate =
    '2026-12-20';


  /* =========================================
     STATE
  ========================================= */

  loading =
    false;

  errorMessage =
    '';

  report:
    PaymentReportResponse | null =
      null;

  payments:
    PaymentDayView[] =
      [];


  constructor(
    private readonly apiService:
      ApiService
  ) {}


  /* =========================================
     INIT
  ========================================= */

  ngOnInit(): void {

    this.loadPaymentReport();
  }


  /* =========================================
     LOAD REPORT
  ========================================= */

  loadPaymentReport(): void {

    if (
      !this.startDate ||
      !this.endDate
    ) {

      this.errorMessage =
        'Start date and end date are required';

      return;
    }

    if (
      this.startDate >
      this.endDate
    ) {

      this.errorMessage =
        'Start date cannot be after end date';

      return;
    }

    this.loading =
      true;

    this.errorMessage =
      '';

    this.apiService
      .getPaymentReport(
        this.startDate,
        this.endDate
      )
      .subscribe({

        next: (
          response:
            PaymentReportResponse
        ) => {

          this.report =
            response;

          this.payments =
            (response?.dates ?? [])
              .map(
                (
                  item:
                    PaymentReportDate
                ) => ({
                  ...item,
                  expanded: false
                })
              );

          this.loading =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Payment report error',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load payment report';

          this.loading =
            false;
        }

      });
  }


  /* =========================================
     TOTALS
  ========================================= */

  get totalAmount():
    number {

    return Number(
      this.report
        ?.totalAmount ?? 0
    );
  }


  get totalUpi():
    number {

    return Number(
      this.report
        ?.upiAmount ?? 0
    );
  }


  get totalCash():
    number {

    return Number(
      this.report
        ?.cashAmount ?? 0
    );
  }


  get totalCard():
    number {

    return Number(
      this.report
        ?.cardAmount ?? 0
    );
  }


  get totalOther():
    number {

    return Number(
      this.report
        ?.otherAmount ?? 0
    );
  }


  /* =========================================
     ROW
  ========================================= */

  toggleRow(
    payment:
      PaymentDayView
  ): void {

    payment.expanded =
      !payment.expanded;
  }


  /* =========================================
     PAYMENT GROUP HELPERS
  ========================================= */

  hasCashOrders(
    payment:
      PaymentDayView
  ): boolean {

    return (
      payment.cashOrders
        ?.length > 0
    );
  }


  hasUpiOrders(
    payment:
      PaymentDayView
  ): boolean {

    return (
      payment.upiOrders
        ?.length > 0
    );
  }


  hasCardOrders(
    payment:
      PaymentDayView
  ): boolean {

    return (
      payment.cardOrders
        ?.length > 0
    );
  }


  hasOtherOrders(
    payment:
      PaymentDayView
  ): boolean {

    return (
      payment.otherOrders
        ?.length > 0
    );
  }


  /* =========================================
     PAYMENT COUNT
  ========================================= */

  getPaymentCount(
    payment:
      PaymentDayView
  ): number {

    return (
      (payment.cashOrders?.length ?? 0) +
      (payment.upiOrders?.length ?? 0) +
      (payment.cardOrders?.length ?? 0) +
      (payment.otherOrders?.length ?? 0)
    );
  }


  /* =========================================
     FORMAT MONEY
  ========================================= */

  formatAmount(
    amount:
      number
  ): string {

    return Number(
      amount ?? 0
    ).toFixed(
      2
    );
  }


  /* =========================================
     ORDER DISPLAY
  ========================================= */

  getOrderDisplay(
    order:
      PaymentReportOrder
  ): string {

    return order.orderNumber;
  }


  /* =========================================
     CALL CUSTOMER
  ========================================= */

  callCustomer(
    order:
      PaymentReportOrder
  ): void {

    if (
      !order.mobile
    ) {

      return;
    }

    window.location.href =
      `tel:${order.mobile}`;
  }


  /* =========================================
     REFRESH
  ========================================= */

  refresh(): void {

    this.loadPaymentReport();
  }

}