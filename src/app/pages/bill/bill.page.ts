import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup
} from '@angular/forms';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter
} from '@angular/material/core';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  ApiService
} from '../../../core/services/api.service';

import {
  Bill,
  BillListResponse,
  BillStatus
} from '../../../core/models/bill.model';

import {
  B2COrderDetails
} from '../../../core/models/b2c-order.model';

import {
  SettlementOrder,
  PaymentMethod,
  PaymentRequest
} from '../../../core/models/settlement.model';


const BILL_DATE_FORMATS = {
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

class BillDateAdapter extends NativeDateAdapter {

  override parse(
    value: any
  ): Date | null {

    if (
      value == null ||
      value === ''
    ) {
      return null;
    }

    if (value instanceof Date) {
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

    if (!this.isValid(date)) {
      throw Error(
        'BillDateAdapter: Cannot format invalid date.'
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


@Component({
  selector: 'app-bill',
  standalone: true,
  templateUrl: './bill.page.html',
  styleUrls: ['./bill.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: BillDateAdapter
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-GB'
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: BILL_DATE_FORMATS
    }
  ]
})
export class BillPage
  implements OnInit {

  loading =
    false;

  errorMessage =
    '';

  response:
    BillListResponse | null =
      null;

  invoices:
    Bill[] =
      [];

  receiptOpen =
    false;

  receiptLoading =
    false;

  receiptError =
    '';

  selectedInvoice:
    Bill | null =
      null;

  receiptOrder:
    B2COrderDetails | null =
      null;

  receiptTermsAndConditions =
    '';

  settlementOpen =
    false;

  settlementLoading =
    false;

  paymentSubmitting =
    false;

  paymentError =
    '';

  settlementInvoice:
    Bill | null =
      null;

  settlementOrder:
    SettlementOrder | null =
      null;

  paymentAmount =
    0;

  paymentMethod:
    PaymentMethod =
      'CASH';

  referenceNumber =
    '';

  orderIdSearch =
    '';

  fromDate =
    this.getDefaultFromDate();

  toDate =
    this.getTodayDate();

  range =
    new FormGroup({
      start:
        new FormControl<Date | null>(
          this.parseLocalDate(
            this.fromDate
          )
        ),
      end:
        new FormControl<Date | null>(
          this.parseLocalDate(
            this.toDate
          )
        )
    });

  deliveredDate =
    '';

  nextCursor:
    string | null =
      null;

  currentCursor:
    string | null =
      null;

  cursorHistory:
    Array<string | null> =
      [];

  hasMore =
    false;

  pageLimit =
    10;

  readonly pageSizeOptions =
    [
      10,
      25,
      50,
      100
    ];

  invoiceStatus =
    'ALL';

  sortBy =
    'Created Date Desc';

  statuses:
    {
      label: string;
      value: 'ALL' | BillStatus;
    }[] = [
      {
        label: 'All',
        value: 'ALL'
      },
      {
        label: 'Draft',
        value: 'DRAFT'
      },
      {
        label: 'Partially Paid',
        value: 'PARTIALLY_PAID'
      },
      {
        label: 'Paid',
        value: 'PAID'
      },
      {
        label: 'Cancelled',
        value: 'CANCELLED'
      }
    ];

  sortOptions:
    string[] = [
      'Created Date Desc',
      'Created Date Asc',
      'Amount High to Low',
      'Amount Low to High'
    ];

  constructor(
    private readonly apiService:
      ApiService
  ) {
  }

  ngOnInit(): void {

    this.receiptTermsAndConditions =
      localStorage.getItem(
        'receiptTermsAndConditions'
      ) ?? '';

    this.loadInvoices();
  }

  loadInvoices(
    cursor: string | null = null
  ): void {

    this.loading =
      true;

    this.errorMessage =
      '';

    this.apiService
      .getBills(
        this.fromDate || undefined,
        this.toDate || undefined,
        cursor,
        this.pageLimit
      )
      .subscribe({

        next: (
          response:
            BillListResponse
        ) => {

          this.response =
            response;

          this.invoices =
            response?.bills ?? [];

          this.currentCursor =
            cursor;

          this.nextCursor =
            response?.nextCursor ?? null;

          this.hasMore =
            response?.hasMore ?? false;

          this.loading =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Bills load error',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load bills';

          this.loading =
            false;
        }

      });
  }

  get filteredInvoices():
    Bill[] {

    let result =
      this.invoices.filter(
        (
          invoice:
            Bill
        ) => {

          const orderSearch =
            this.orderIdSearch
              .trim()
              .toLowerCase();

          const matchesOrder =
            !orderSearch ||

            invoice.orderNumber
              .toLowerCase()
              .includes(
                orderSearch
              ) ||

            invoice.invoiceNumber
              .toLowerCase()
              .includes(
                orderSearch
              );

          const matchesStatus =
            this.invoiceStatus ===
              'ALL' ||

            invoice.status ===
              this.invoiceStatus;

          const matchesDeliveryDate =
            !this.deliveredDate ||

            (
              invoice.deliveryDate !== null &&
              invoice.deliveryDate 
                .startsWith(
                  this.deliveredDate
                )
            );

          return (
            matchesOrder &&
            matchesStatus &&
            matchesDeliveryDate
          );
        }
      );

    result =
      [...result];

    if (
      this.sortBy ===
        'Amount High to Low'
    ) {

      result.sort(
        (
          a:
            Bill,
          b:
            Bill
        ) =>
          Number(
            b.grossTotal
          ) -
          Number(
            a.grossTotal
          )
      );

    } else if (
      this.sortBy ===
        'Amount Low to High'
    ) {

      result.sort(
        (
          a: Bill,
          b: Bill
        ) => Number( a.grossTotal ) - Number( b.grossTotal )
      );

    } else if ( this.sortBy === 'Created Date Asc') {
      result.sort(
        (
          a:
            Bill,
          b:
            Bill
        ) =>
          new Date(
            a.createdAt
          ).getTime() -
          new Date(
            b.createdAt
          ).getTime()
      );

    } else {

      result.sort(
        (
          a:
            Bill,
          b:
            Bill
        ) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
    }

    return result;
  }

  get totalPaid():
    number {

    return this.filteredInvoices.reduce(
      (
        total:
          number,
        invoice:
          Bill
      ) =>
        total +
        Number(
          invoice.paidAmount ?? 0
        ),
      0
    );
  }

  get totalDue():
    number {

    return this.filteredInvoices.reduce(
      (
        total:
          number,
        invoice:
          Bill
      ) =>
        total +
        Number(
          invoice.dueAmount ?? 0
        ),
      0
    );
  }

  get totalAmount():
    number {

    return this.filteredInvoices.reduce(
      (
        total:
          number,
        invoice:
          Bill
      ) =>
        total +
        Number(
          invoice.total ?? 0
        ),
      0
    );
  }


  get totalExpress():
    number {

    return this.filteredInvoices.reduce(
      ( total: number, invoice:Bill ) =>
        total + Number( invoice.expressAmount ?? 0 ), 0
    );
  }

  get totalDiscount():
    number {

    return this.filteredInvoices.reduce(
      (
        total: number,
        invoice: Bill
      ) =>
        total +
        Number(
          invoice.discountAmount ?? 0
        ),
      0
    );
  }

  get grossTotal():
    number {

    return this.filteredInvoices.reduce(
      (
        total:
          number,
        invoice:
          Bill
      ) =>
        total +
        Number(
          invoice.grossTotal ?? 0
        ),
      0
    );
  }

  getStatusLabel(
    status:
      BillStatus
  ): string {

    switch (
      status
    ) {

      case 'DRAFT':
        return 'Draft';

      case 'PARTIALLY_PAID':
        return 'Partially Paid';

      case 'PAID':
        return 'Paid';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;
    }
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

  searchBills(): void {

    const start =
      this.range.controls.start.value;

    const end =
      this.range.controls.end.value;

    if (start && end) {
      this.fromDate =
        this.toLocalDateString(start);

      this.toDate =
        this.toLocalDateString(end);
    }

    if (
      this.fromDate &&
      this.toDate &&
      this.fromDate > this.toDate
    ) {
      this.errorMessage =
        'From date cannot be after to date';

      return;
    }

    this.errorMessage =
      '';

    this.resetPagination();
    this.loadInvoices();
  }

  applyDateFilter(): void {
    this.searchBills();
  }

  clearFilters(): void {

    this.orderIdSearch =
      '';

    this.fromDate =
      this.getDefaultFromDate();

    this.toDate =
      this.getTodayDate();

    this.range.setValue({
      start:
        this.parseLocalDate(
          this.fromDate
        ),
      end:
        this.parseLocalDate(
          this.toDate
        )
    });

    this.deliveredDate =
      '';

    this.invoiceStatus =
      'ALL';

    this.sortBy =
      'Created Date Desc';

    this.resetPagination();
    this.loadInvoices();
  }

  refresh(): void {
    this.resetPagination();
    this.loadInvoices();
  }

  onPageLimitChange(): void {
    this.resetPagination();
    this.loadInvoices();
  }

  nextPage(): void {

    if (
      this.loading ||
      !this.hasMore ||
      !this.nextCursor
    ) {
      return;
    }

    this.cursorHistory.push(
      this.currentCursor
    );

    this.loadInvoices(
      this.nextCursor
    );
  }

  previousPage(): void {

    if (
      this.loading ||
      this.cursorHistory.length === 0
    ) {
      return;
    }

    const previousCursor =
      this.cursorHistory.pop() ?? null;

    this.loadInvoices(
      previousCursor
    );
  }

  get canGoPrevious(): boolean {
    return this.cursorHistory.length > 0;
  }

  get currentPage(): number {
    return this.cursorHistory.length + 1;
  }

  receipt(
    invoice:
      Bill
  ): void {

    this.receiptTermsAndConditions =
      localStorage.getItem(
        'receiptTermsAndConditions'
      ) ?? '';

    this.selectedInvoice =
      invoice;

    this.receiptOrder =
      null;

    this.receiptError =
      '';

    this.receiptLoading =
      true;

    this.receiptOpen =
      true;

    this.apiService
      .getB2COrderById(
        invoice.orderId
      )
      .subscribe({

        next: (
          response:
            B2COrderDetails
        ) => {

          this.receiptOrder =
            response;

          this.receiptLoading =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Receipt load error',
            error
          );

          this.receiptError =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load receipt';

          this.receiptLoading =
            false;
        }

      });
  }

  closeReceipt(): void {

    this.receiptOpen =
      false;

    this.receiptLoading =
      false;

    this.receiptError =
      '';

    this.selectedInvoice =
      null;

    this.receiptOrder =
      null;
  }

  printReceipt(): void {

    if (
      !this.selectedInvoice ||
      !this.receiptOrder
    ) {

      return;
    }

    window.print();
  }

  getReceiptQuantity(
    quantity:
      number
  ): string {

    const value =
      Number(
        quantity ?? 0
      );

    if (
      Number.isInteger(
        value
      )
    ) {

      return value.toString();
    }

    return value.toFixed(
      2
    );
  }

  getReceiptUnitLabel(
    unit:
      string
  ): string {

    if (
      unit === 'KG'
    ) {

      return 'kg';
    }

    return 'pc';
  }

  settle(
    invoice:
      Bill
  ): void {

    if (
      invoice.dueAmount <= 0
    ) {

      return;
    }

    this.settlementInvoice =
      invoice;

    this.settlementOrder =
      null;

    this.paymentAmount =
      Number(
        invoice.dueAmount
      );

    this.paymentMethod =
      'CASH';

    this.referenceNumber =
      '';

    this.paymentError =
      '';

    this.settlementLoading =
      true;

    this.settlementOpen =
      true;

    this.apiService
      .getSettlementById(
        invoice.orderId
      )
      .subscribe({

        next: (
          response:
            SettlementOrder
        ) => {

          this.settlementOrder =
            response;

          this.paymentAmount =
            Number(
              response.balanceAmount ?? 0
            );

          this.settlementLoading =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Settlement load error',
            error
          );

          this.paymentError =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load settlement';

          this.settlementLoading =
            false;
        }

      });
  }

  closeSettlement(): void {

    if (
      this.paymentSubmitting
    ) {

      return;
    }

    this.settlementOpen =
      false;

    this.settlementLoading =
      false;

    this.paymentError =
      '';

    this.settlementInvoice =
      null;

    this.settlementOrder =
      null;

    this.paymentAmount =
      0;

    this.paymentMethod =
      'CASH';

    this.referenceNumber =
      '';
  }

  selectPaymentMethod(
    method:
      PaymentMethod
  ): void {

    this.paymentMethod =
      method;
  }

  payFullBalance(): void {

    if (
      this.settlementOrder
    ) {

      this.paymentAmount =
        Number(
          this.settlementOrder
            .balanceAmount ?? 0
        );

      return;
    }

    if (
      this.settlementInvoice
    ) {

      this.paymentAmount =
        Number(
          this.settlementInvoice
            .dueAmount ?? 0
        );
    }
  }

  get remainingAfterPayment():
    number {

    const balance =
      this.settlementOrder
        ? Number(
            this.settlementOrder
              .balanceAmount ?? 0
          )
        : Number(
            this.settlementInvoice
              ?.dueAmount ?? 0
          );

    const amount =
      Number(
        this.paymentAmount ?? 0
      );

    return Math.max(
      0,
      balance - amount
    );
  }

  get settlementTotalAmount():
    number {

    if (
      this.settlementOrder
    ) {

      return Number(
        this.settlementOrder
          .totalAmount ?? 0
      );
    }

    return Number(
      this.settlementInvoice
        ?.grossTotal ?? 0
    );
  }

  get settlementPaidAmount():
    number {

    if (
      this.settlementOrder
    ) {

      return Number(
        this.settlementOrder
          .paidAmount ?? 0
      );
    }

    return Number(
      this.settlementInvoice
        ?.paidAmount ?? 0
    );
  }

  get settlementBalanceAmount():
    number {

    if (
      this.settlementOrder
    ) {

      return Number(
        this.settlementOrder
          .balanceAmount ?? 0
      );
    }

    return Number(
      this.settlementInvoice
        ?.dueAmount ?? 0
    );
  }

  addPayment(): void {

    if (
      !this.settlementInvoice
    ) {

      return;
    }

    const amount =
      Number(
        this.paymentAmount
      );

    const balance =
      this.settlementBalanceAmount;

    if (
      !amount ||
      amount <= 0
    ) {

      this.paymentError =
        'Enter a valid payment amount';

      return;
    }

    if (
      amount > balance
    ) {

      this.paymentError =
        'Payment amount cannot be greater than balance';

      return;
    }

    const request:
      PaymentRequest = {

        amount,

        paymentMethod:
          this.paymentMethod,

        referenceNumber:
          this.referenceNumber
            .trim() || null
      };

    this.paymentSubmitting =
      true;

    this.paymentError =
      '';

    this.apiService
      .addSettlementPayment(
        this.settlementInvoice
          .orderId,
        request
      )
      .subscribe({

        next: () => {

          this.paymentSubmitting =
            false;

          this.closeSettlement();

          this.loadInvoices();
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Payment error',
            error
          );

          this.paymentError =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to add payment';

          this.paymentSubmitting =
            false;
        }

      });
  }

  formatOrderStatus(
    status: string
  ): string {

    return status
      ? status.split('_').join(' ')
      : '';
  }


  private resetPagination(): void {
    this.currentCursor = null;
    this.nextCursor = null;
    this.cursorHistory = [];
    this.hasMore = false;
  }

  private getTodayDate(): string {
    return this.toLocalDateString(
      new Date()
    );
  }

  private getDefaultFromDate(): string {

    const date =
      new Date();

    date.setDate(
      date.getDate() - 6
    );

    return this.toLocalDateString(
      date
    );
  }

  private toLocalDateString(
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

  private parseLocalDate(
    value: string
  ): Date {

    const [
      year,
      month,
      day
    ] =
      value
        .split('-')
        .map(Number);

    return new Date(
      year,
      month - 1,
      day
    );
  }


}