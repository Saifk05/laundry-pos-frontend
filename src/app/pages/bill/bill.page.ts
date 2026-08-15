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


@Component({
  selector: 'app-bill',
  standalone: true,
  templateUrl: './bill.page.html',
  styleUrls: ['./bill.page.scss'],
  imports: [
    CommonModule,
    FormsModule
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

  createdDate =
    '';

  deliveredDate =
    '';

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

    this.loadInvoices();
  }

  loadInvoices(): void {

    this.loading =
      true;

    this.errorMessage =
      '';

    this.apiService
      .getBills()
      .subscribe({

        next: (
          response:
            BillListResponse
        ) => {

          this.response =
            response;

          this.invoices =
            response?.bills ?? [];

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

          const matchesCreatedDate =
            !this.createdDate ||

            invoice.createdAt
              .startsWith(
                this.createdDate
              );

          const matchesDeliveredDate =
            !this.deliveredDate ||

            (
              invoice.deliveredAt !==
                null &&

              invoice.deliveredAt
                .startsWith(
                  this.deliveredDate
                )
            );

          return (
            matchesOrder &&
            matchesStatus &&
            matchesCreatedDate &&
            matchesDeliveredDate
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
          a:
            Bill,
          b:
            Bill
        ) =>
          Number(
            a.grossTotal
          ) -
          Number(
            b.grossTotal
          )
      );

    } else if (
      this.sortBy ===
        'Created Date Asc'
    ) {

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

  get totalTax():
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
          invoice.tax ?? 0
        ),
      0
    );
  }

  get totalTaxable():
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
          invoice.taxableAmount ?? 0
        ),
      0
    );
  }

  get totalExpress():
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
          invoice.expressAmount ?? 0
        ),
      0
    );
  }

  get totalDiscount():
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

  clearFilters(): void {

    this.orderIdSearch =
      '';

    this.createdDate =
      '';

    this.deliveredDate =
      '';

    this.invoiceStatus =
      'ALL';

    this.sortBy =
      'Created Date Desc';
  }

  refresh(): void {

    this.loadInvoices();
  }

  receipt(
    invoice:
      Bill
  ): void {

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

}