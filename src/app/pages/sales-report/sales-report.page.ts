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
  SalesReportOrder,
  SalesReportProduct,
  SalesReportResponse,
  SalesReportService,
  SalesReportSummary
} from '../../../core/models/sales-report.model';


@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.page.html',
  styleUrls: ['./sales-report.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class SalesReportPage
  implements OnInit {

  startDate = '';

  endDate = '';

  loading = false;

  errorMessage = '';


  summary:
    SalesReportSummary = {

      totalSales:
        0,

      totalOrders:
        0,

      averageOrderValue:
        0,

      expressAmount:
        0,

      totalExpressOrders:
        0
    };


  productSales:
    SalesReportProduct[] =
      [];


  serviceSales:
    SalesReportService[] =
      [];


  orders:
    SalesReportOrder[] =
      [];


  constructor(
    private readonly apiService:
      ApiService
  ) {}


  ngOnInit(): void {

    this.setToday();
  }


  loadSalesReport(): void {

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
      .getSalesReport(
        this.startDate,
        this.endDate
      )
      .subscribe({

        next: (
          response:
            SalesReportResponse
        ) => {

          this.summary =
            response.summary;

          this.productSales =
            response.productSales ?? [];

          this.serviceSales =
            response.serviceSales ?? [];

          this.orders =
            response.orders ?? [];

          this.loading =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Sales report error',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load sales report';

          this.resetReport();

          this.loading =
            false;
        }

      });
  }


  setToday(): void {

    const today =
      this.formatLocalDate(
        new Date()
      );

    this.startDate =
      today;

    this.endDate =
      today;

    this.loadSalesReport();
  }


  setYesterday(): void {

    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const date =
      this.formatLocalDate(
        yesterday
      );

    this.startDate =
      date;

    this.endDate =
      date;

    this.loadSalesReport();
  }


  setThisWeek(): void {

    const today =
      new Date();

    const day =
      today.getDay();

    const difference =
      day === 0
        ? -6
        : 1 - day;

    const monday =
      new Date(
        today
      );

    monday.setDate(
      today.getDate() +
      difference
    );

    this.startDate =
      this.formatLocalDate(
        monday
      );

    this.endDate =
      this.formatLocalDate(
        today
      );

    this.loadSalesReport();
  }


  setThisMonth(): void {

    const today =
      new Date();

    const firstDay =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    this.startDate =
      this.formatLocalDate(
        firstDay
      );

    this.endDate =
      this.formatLocalDate(
        today
      );

    this.loadSalesReport();
  }


  refresh(): void {

    this.loadSalesReport();
  }


  onDateChange(): void {

    if (
      this.startDate &&
      this.endDate
    ) {

      this.loadSalesReport();
    }
  }


  formatAmount(
    amount:
      number | null | undefined
  ): string {

    return Number(
      amount ?? 0
    ).toFixed(
      2
    );
  }


  getStatusLabel(
    status:
      SalesReportOrder['status']
  ): string {

    switch (
      status
    ) {

      case 'TAGGED':
        return 'Tagged';

      case 'PROCESSING_AT_STORE':
        return 'Processing At Store';

      case 'READY_ORDER':
        return 'Ready Order';

      case 'DELIVERED':
        return 'Delivered';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;
    }
  }


  private resetReport(): void {

    this.summary = {

      totalSales:
        0,

      totalOrders:
        0,

      averageOrderValue:
        0,

      expressAmount:
        0,

      totalExpressOrders:
        0
    };

    this.productSales =
      [];

    this.serviceSales =
      [];

    this.orders =
      [];
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

}