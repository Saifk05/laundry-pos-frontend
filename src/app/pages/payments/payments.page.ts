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
  HttpErrorResponse
} from '@angular/common/http';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatNativeDateModule
} from '@angular/material/core';

import {
  ApiService
} from '../../../core/services/api.service';

import {
  NotificationService
} from '../../../core/services/notification.service';

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
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class PaymentsPage
  implements OnInit {

  startDate = '';

  endDate = '';

  rangeStart:
    Date | null =
      null;

  rangeEnd:
    Date | null =
      null;

  maxDate:
    Date =
      new Date();

  loading = false;

  errorMessage = '';

  report:
    PaymentReportResponse | null =
      null;

  payments:
    PaymentDayView[] =
      [];


  constructor(
    private readonly apiService:
      ApiService,

    private readonly notificationService:
      NotificationService
  ) {}


  ngOnInit(): void {

    this.maxDate =
      this.getTodayDate();

    this.setToday();
  }


  loadPaymentReport(): void {

    if (
      !this.startDate ||
      !this.endDate
    ) {

      this.showWarning(
        'Start date and end date are required'
      );

      return;
    }

    if (
      this.startDate >
      this.endDate
    ) {

      this.showWarning(
        'Start date cannot be after end date'
      );

      return;
    }

    const today =
      this.formatLocalDate(
        this.getTodayDate()
      );

    if (
      this.startDate >
      today ||
      this.endDate >
      today
    ) {

      this.showWarning(
        'Future dates cannot be selected'
      );

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
            HttpErrorResponse
        ) => {

          console.error(
            'Payment report error',
            error
          );

          this.report =
            null;

          this.payments =
            [];

          const message =
            this.getErrorMessage(
              error,
              'Unable to load payment report'
            );

          this.errorMessage =
            message;

          void this.notificationService.error(
            message
          );

          this.loading =
            false;
        }

      });
  }


  onDateRangeChange(): void {

    if (
      !this.rangeStart ||
      !this.rangeEnd
    ) {

      return;
    }

    const today =
      this.getTodayDate();

    if (
      this.rangeStart >
      today ||
      this.rangeEnd >
      today
    ) {

      this.showWarning(
        'Future dates cannot be selected'
      );

      return;
    }

    if (
      this.rangeStart >
      this.rangeEnd
    ) {

      this.showWarning(
        'Start date cannot be after end date'
      );

      return;
    }

    this.startDate =
      this.formatLocalDate(
        this.rangeStart
      );

    this.endDate =
      this.formatLocalDate(
        this.rangeEnd
      );

    this.errorMessage =
      '';

    this.loadPaymentReport();
  }


  setToday(): void {

    const today =
      this.getTodayDate();

    this.rangeStart =
      new Date(
        today
      );

    this.rangeEnd =
      new Date(
        today
      );

    this.startDate =
      this.formatLocalDate(
        today
      );

    this.endDate =
      this.startDate;

    this.errorMessage =
      '';

    this.loadPaymentReport();
  }


  setYesterday(): void {

    const yesterday =
      this.getTodayDate();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    this.rangeStart =
      new Date(
        yesterday
      );

    this.rangeEnd =
      new Date(
        yesterday
      );

    this.startDate =
      this.formatLocalDate(
        yesterday
      );

    this.endDate =
      this.startDate;

    this.errorMessage =
      '';

    this.loadPaymentReport();
  }


  private getTodayDate():
    Date {

    const now =
      new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  }


  private formatLocalDate(
    date:
      Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );

    return `${year}-${month}-${day}`;
  }


  private showWarning(
    message:
      string
  ): void {

    this.errorMessage =
      message;

    void this.notificationService.warning(
      message
    );
  }


  private getErrorMessage(
    error:
      HttpErrorResponse,

    fallback:
      string
  ): string {

    const backendMessage =
      error?.error?.message;

    if (
      typeof backendMessage ===
        'string' &&
      backendMessage.trim()
    ) {

      return backendMessage.trim();
    }

    const legacyMessage =
      error?.error?.error;

    if (
      typeof legacyMessage ===
        'string' &&
      legacyMessage.trim()
    ) {

      return legacyMessage.trim();
    }

    return fallback;
  }


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


  toggleRow(
    payment:
      PaymentDayView
  ): void {

    payment.expanded =
      !payment.expanded;
  }


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


  getOrderDisplay(
    order:
      PaymentReportOrder
  ): string {

    return order.orderNumber;
  }


  callCustomer(
    order:
      PaymentReportOrder
  ): void {

    if (
      !order.mobile
    ) {

      void this.notificationService.warning(
        'Customer mobile number is not available'
      );

      return;
    }

    window.location.href =
      `tel:${order.mobile}`;
  }


  refresh(): void {

    this.loadPaymentReport();
  }

}