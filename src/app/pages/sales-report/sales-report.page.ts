import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatInputModule
} from '@angular/material/input';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter
} from '@angular/material/core';

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


const SALES_DATE_FORMATS = {

  parse: {
    dateInput: 'DD/MM/YYYY'
  },

  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY'
  }

};


class SalesDateAdapter
  extends NativeDateAdapter {

  override parse(
    value: any
  ): Date | null {

    if (
      value == null ||
      value === ''
    ) {

      return null;
    }


    if (
      value instanceof Date
    ) {

      return this.isValid(value)
        ? value
        : null;
    }


    const text =
      String(value).trim();


    const match =
      text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );


    if (!match) {

      return null;
    }


    const day =
      Number(match[1]);

    const month =
      Number(match[2]) - 1;

    const year =
      Number(match[3]);


    const date =
      new Date(
        year,
        month,
        day
      );


    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {

      return null;
    }


    return date;
  }


  override format(
    date: Date,
    displayFormat: any
  ): string {

    if (
      !this.isValid(date)
    ) {

      throw Error(
        'SalesDateAdapter: Cannot format invalid date.'
      );
    }


    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );


    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const year =
      date.getFullYear();


    return `${day}/${month}/${year}`;
  }

}


type DatePreset =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'CUSTOM';


@Component({

  selector:
    'app-sales-report',

  templateUrl:
    './sales-report.page.html',

  styleUrls: [
    './sales-report.page.scss'
  ],

  standalone:
    true,

  imports: [

    CommonModule,

    ReactiveFormsModule,

    MatFormFieldModule,

    MatDatepickerModule,

    MatInputModule,

    MatNativeDateModule

  ],

  providers: [

    {
      provide:
        DateAdapter,

      useClass:
        SalesDateAdapter
    },

    {
      provide:
        MAT_DATE_FORMATS,

      useValue:
        SALES_DATE_FORMATS
    },

    {
      provide:
        MAT_DATE_LOCALE,

      useValue:
        'en-GB'
    }

  ]

})
export class SalesReportPage
  implements OnInit {


  range =
    new FormGroup({

      start:
        new FormControl<Date | null>(
          null
        ),

      end:
        new FormControl<Date | null>(
          null
        )

    });


  activePreset:
    DatePreset =
      'TODAY';


  loading =
    false;


  errorMessage =
    '';


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

    const start =
      this.range.controls.start.value;

    const end =
      this.range.controls.end.value;


    if (
      !start ||
      !end
    ) {

      this.errorMessage =
        'Please select a complete date range.';

      return;
    }


    if (
      start.getTime() >
      end.getTime()
    ) {

      this.errorMessage =
        'From date cannot be after To date.';

      return;
    }


    const startDate =
      this.formatDateForApi(
        start
      );


    const endDate =
      this.formatDateForApi(
        end
      );


    this.loading =
      true;

    this.errorMessage =
      '';


    this.apiService
      .getSalesReport(
        startDate,
        endDate
      )
      .subscribe({

        next: (
          response:
            SalesReportResponse
        ) => {

          this.summary =
            response?.summary ??
            this.emptySummary();


          this.productSales =
            response?.productSales ??
            [];


          this.serviceSales =
            response?.serviceSales ??
            [];


          this.orders =
            response?.orders ??
            [];


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
            'Unable to load sales report.';


          this.resetReport();


          this.loading =
            false;
        }

      });

  }


  onDateRangeChange(): void {

    const start =
      this.range.controls.start.value;

    const end =
      this.range.controls.end.value;


    if (
      start &&
      end
    ) {

      this.activePreset =
        'CUSTOM';


      this.loadSalesReport();
    }

  }


  setToday(): void {

    const today =
      this.stripTime(
        new Date()
      );


    this.setRange(
      today,
      today,
      'TODAY'
    );

  }


  setYesterday(): void {

    const yesterday =
      this.stripTime(
        new Date()
      );


    yesterday.setDate(
      yesterday.getDate() - 1
    );


    this.setRange(
      yesterday,
      yesterday,
      'YESTERDAY'
    );

  }


  setThisWeek(): void {

    const today =
      this.stripTime(
        new Date()
      );


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


    this.setRange(
      monday,
      today,
      'THIS_WEEK'
    );

  }


  setThisMonth(): void {

    const today =
      this.stripTime(
        new Date()
      );


    const firstDay =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );


    this.setRange(
      firstDay,
      today,
      'THIS_MONTH'
    );

  }


  refresh(): void {

    this.loadSalesReport();
  }


  formatAmount(
    amount:
      number |
      null |
      undefined
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


  private setRange(
    start: Date,
    end: Date,
    preset: DatePreset
  ): void {

    this.activePreset =
      preset;


    this.range.setValue(
      {

        start:
          new Date(start),

        end:
          new Date(end)

      },
      {
        emitEvent:
          false
      }
    );


    this.loadSalesReport();

  }


  private stripTime(
    date: Date
  ): Date {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  }


  private formatDateForApi(
    date: Date
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


  private resetReport(): void {

    this.summary =
      this.emptySummary();


    this.productSales =
      [];


    this.serviceSales =
      [];


    this.orders =
      [];

  }


  private emptySummary():
    SalesReportSummary {

    return {

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

  }

}