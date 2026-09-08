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
  PaymentHistoryResponse,
  PaymentMethod,
  PaymentRequest,
  PaymentStatus,
  SettlementOrder
} from '../../../core/models/settlement.model';


@Component({
  selector: 'app-settlement',
  standalone: true,
  templateUrl: './settlement.page.html',
  styleUrls: ['./settlement.page.scss'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class SettlementPage
  implements OnInit {

  loading = false;

  actionLoading = false;

  errorMessage = '';


  /* =========================================
     FILTERS
  ========================================= */

  orderNumberSearch = '';

  mobileSearch = '';

  selectedPaymentStatus = 'ALL';


  paymentStatuses = [
    {
      label: 'All',
      value: 'ALL'
    },
    {
      label: 'Pending',
      value: 'PENDING'
    },
    {
      label: 'Partially Paid',
      value: 'PARTIALLY_PAID'
    },
    {
      label: 'Settled',
      value: 'SETTLED'
    }
  ];


  /* =========================================
     DATA
  ========================================= */

  orders:
    SettlementOrder[] = [];


  /* =========================================
     ADD PAYMENT MODAL
  ========================================= */

  paymentModalOpen = false;

  selectedOrder:
    SettlementOrder | null =
      null;

  paymentAmount:
    number | null =
      null;

  selectedPaymentMethod:
    PaymentMethod =
      'CASH';

  paymentReference = '';

  paymentError = '';


  paymentMethods:
    {
      label: string;
      value: PaymentMethod;
    }[] = [
      {
        label: 'Cash',
        value: 'CASH'
      },
      {
        label: 'UPI',
        value: 'UPI'
      },
      {
        label: 'Card',
        value: 'CARD'
      },
      {
        label: 'Other',
        value: 'OTHER'
      }
    ];


  /* =========================================
     PAYMENT HISTORY
  ========================================= */

  historyModalOpen = false;

  historyLoading = false;

  historyOrder:
    SettlementOrder | null =
      null;

  paymentHistory:
    PaymentHistoryResponse | null =
      null;


  constructor(
    private readonly apiService:
      ApiService
  ) {}


  ngOnInit(): void {

    this.loadSettlements();
  }


  /* =========================================
     LOAD SETTLEMENTS
  ========================================= */

  loadSettlements(): void {

    this.loading =
      true;

    this.errorMessage =
      '';

    this.apiService
      .getSettlements()
      .subscribe({

        next: (
          response:
            SettlementOrder[]
        ) => {

          console.log(
            'Settlement API response:',
            response
          );

          this.orders =
            Array.isArray(response)
              ? response
              : [];

          this.loading =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Settlement API error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load settlements';

          this.loading =
            false;
        }

      });
  }


  /* =========================================
     FILTERED ORDERS
  ========================================= */

  get filteredOrders():
    SettlementOrder[] {

    const orderSearch =
      this.orderNumberSearch
        .trim()
        .toLowerCase();

    const mobileSearch =
      this.mobileSearch
        .trim();

    return this.orders.filter(
      (
        order:
          SettlementOrder
      ) => {

        const matchesOrderNumber =
          !orderSearch ||
          order.orderNumber
            .toLowerCase()
            .includes(
              orderSearch
            );

        const matchesMobile =
          !mobileSearch ||
          order.mobile.includes(
            mobileSearch
          );

        const matchesStatus =
          this.selectedPaymentStatus ===
            'ALL' ||
          order.paymentStatus ===
            this.selectedPaymentStatus;

        return (
          matchesOrderNumber &&
          matchesMobile &&
          matchesStatus
        );
      }
    );
  }


  /* =========================================
     SUMMARY
  ========================================= */

  get totalOrderAmount():
    number {

    return this.orders.reduce(
      (
        total:
          number,
        order:
          SettlementOrder
      ) =>
        total +
        Number(
          order.totalAmount ?? 0
        ),
      0
    );
  }


  get totalCollected():
    number {

    return this.orders.reduce(
      (
        total:
          number,
        order:
          SettlementOrder
      ) =>
        total +
        Number(
          order.paidAmount ?? 0
        ),
      0
    );
  }


  get totalPending():
    number {

    return this.orders.reduce(
      (
        total:
          number,
        order:
          SettlementOrder
      ) =>
        total +
        Number(
          order.balanceAmount ?? 0
        ),
      0
    );
  }


  get pendingOrdersCount():
    number {

    return this.orders.filter(
      (
        order:
          SettlementOrder
      ) =>
        order.paymentStatus ===
          'PENDING'
    ).length;
  }


  get partialOrdersCount():
    number {

    return this.orders.filter(
      (
        order:
          SettlementOrder
      ) =>
        order.paymentStatus ===
          'PARTIALLY_PAID'
    ).length;
  }


  get settledOrdersCount():
    number {

    return this.orders.filter(
      (
        order:
          SettlementOrder
      ) =>
        order.paymentStatus ===
          'SETTLED'
    ).length;
  }


  /* =========================================
     FILTERS
  ========================================= */

  clearFilters(): void {

    this.orderNumberSearch =
      '';

    this.mobileSearch =
      '';

    this.selectedPaymentStatus =
      'ALL';
  }


  /* =========================================
     LABELS
  ========================================= */

  getPaymentStatusLabel(
    status:
      PaymentStatus
  ): string {

    switch (
      status
    ) {

      case 'PENDING':
        return 'Pending';

      case 'PARTIALLY_PAID':
        return 'Partially Paid';

      case 'SETTLED':
        return 'Settled';

      default:
        return status;
    }
  }


  getOrderStatusLabel(
    status:
      string
  ): string {

    switch (
      status
    ) {

      case 'NEW_ORDER':
        return 'New Order';

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


  /* =========================================
     PAYMENT MODAL
  ========================================= */

  openPaymentModal(
    order:
      SettlementOrder
  ): void {

    if (
      order.paymentStatus ===
        'SETTLED'
    ) {
      return;
    }

    if (
      order.orderStatus ===
        'CANCELLED'
    ) {

      this.errorMessage =
        'Payment cannot be added to cancelled order';

      return;
    }

    this.errorMessage =
      '';

    this.paymentError =
      '';

    this.selectedOrder =
      order;

    this.paymentAmount =
      Number(
        order.balanceAmount
      );

    this.selectedPaymentMethod =
      'CASH';

    this.paymentReference =
      '';

    this.paymentModalOpen =
      true;
  }


  closePaymentModal(): void {

    if (
      this.actionLoading
    ) {
      return;
    }

    this.paymentModalOpen =
      false;

    this.selectedOrder =
      null;

    this.paymentAmount =
      null;

    this.selectedPaymentMethod =
      'CASH';

    this.paymentReference =
      '';

    this.paymentError =
      '';
  }


  setFullBalance(): void {

    if (
      !this.selectedOrder
    ) {
      return;
    }

    this.paymentAmount =
      Number(
        this.selectedOrder
          .balanceAmount
      );
  }


  get remainingAfterPayment():
    number {

    if (
      !this.selectedOrder
    ) {
      return 0;
    }

    const amount =
      Number(
        this.paymentAmount ?? 0
      );

    return Math.max(
      Number(
        this.selectedOrder
          .balanceAmount
      ) -
      amount,
      0
    );
  }


  /* =========================================
     ADD PAYMENT
  ========================================= */

  addPayment(): void {

    if (
      !this.selectedOrder
    ) {
      return;
    }

    this.paymentError =
      '';

    const amount =
      Number(
        this.paymentAmount
      );

    if (
      !amount ||
      amount <= 0
    ) {

      this.paymentError =
        'Enter a valid payment amount';

      return;
    }

    if (
      amount >
      Number(
        this.selectedOrder
          .balanceAmount
      )
    ) {

      this.paymentError =
        'Payment amount cannot be greater than balance amount';

      return;
    }

    const request:
      PaymentRequest = {

      amount:
        amount,

      paymentMethod:
        this.selectedPaymentMethod,

      referenceNumber:
        this.paymentReference
          .trim()
          ? this.paymentReference
              .trim()
          : null
    };

    const orderId =
      this.selectedOrder.id;

    this.actionLoading =
      true;

    this.apiService
      .addSettlementPayment(
        orderId,
        request
      )
      .subscribe({

        next: (
          response:
            SettlementOrder
        ) => {

          this.orders =
            this.orders.map(
              (
                order:
                  SettlementOrder
              ) =>
                order.id ===
                  response.id
                  ? response
                  : order
            );

          this.actionLoading =
            false;

          this.closePaymentModal();
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Add payment error:',
            error
          );

          this.paymentError =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to add payment';

          this.actionLoading =
            false;
        }

      });
  }


  /* =========================================
     PAYMENT HISTORY
  ========================================= */

  openPaymentHistory(
    order:
      SettlementOrder
  ): void {

    this.historyOrder =
      order;

    this.paymentHistory =
      null;

    this.historyModalOpen =
      true;

    this.historyLoading =
      true;

    this.apiService
      .getSettlementPaymentHistory(
        order.id
      )
      .subscribe({

        next: (
          response:
            PaymentHistoryResponse
        ) => {

          this.paymentHistory =
            response;

          this.historyLoading =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Payment history error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load payment history';

          this.historyLoading =
            false;

          this.historyModalOpen =
            false;
        }

      });
  }


  closePaymentHistory(): void {

    this.historyModalOpen =
      false;

    this.historyOrder =
      null;

    this.paymentHistory =
      null;

    this.historyLoading =
      false;
  }


  getPaymentMethodLabel(
    method:
      PaymentMethod
  ): string {

    switch (
      method
    ) {

      case 'CASH':
        return 'Cash';

      case 'UPI':
        return 'UPI';

      case 'CARD':
        return 'Card';

      case 'OTHER':
        return 'Other';

      default:
        return method;
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


  callCustomer(
    order:
      SettlementOrder
  ): void {

    if (
      !order.mobile
    ) {
      return;
    }

    window.location.href =
      `tel:${order.mobile}`;
  }


  viewBill(
    order:
      SettlementOrder
  ): void {

    console.log(
      'View bill',
      order
    );
  }

}