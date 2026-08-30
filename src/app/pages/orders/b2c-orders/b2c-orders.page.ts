import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import {
  B2COrder,
  B2COrderDetails,
  B2COrderListResponse,
  B2COrderStatus
} from '../../../../core/models/b2c-order.model';
import {
  PaymentMethod,
  PaymentRequest,
  SettlementOrder
} from '../../../../core/models/settlement.model';

interface B2cOrderView {
  id: string;
  orderNumber: string;
  status: B2COrderStatus;
  customerName: string;
  mobile: string;
  storageLabel: string;
  pickupDate: string;
  pickupSlot: string;
  deliveryDate: string;
  deliverySlot: string;
  amount: number;
  homeDelivery: boolean;
  expressDelivery: boolean;
  settled: boolean;
  createdAt: string;
  updatedAt: string;
  moreOpen?: boolean;
}

@Component({
  selector: 'app-b2c-orders',
  standalone: true,
  templateUrl: './b2c-orders.page.html',
  styleUrls: ['./b2c-orders.page.scss'],
  imports: [FormsModule]
})
export class B2cOrdersPage implements OnInit {
  loading = false;
  actionLoading = false;
  errorMessage = '';

  selectedStatus = 'All';
  customerNameSearch = '';
  orderNumberSearch = '';
  mobileSearch = '';

  statuses: string[] = [
    'All',
    'Tagged',
    'Processing At Store',
    'Ready Order',
    'Delivered',
    'Cancelled'
  ];

  orders: B2cOrderView[] = [];

  paymentModalOpen = false;
  selectedPaymentOrder: SettlementOrder | null = null;
  paymentAmount: number | null = null;
  selectedPaymentMethod: PaymentMethod = 'CASH';
  paymentReference = '';
  paymentError = '';

  paymentMethods: { label: string; value: PaymentMethod }[] = [
    { label: 'Cash', value: 'CASH' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Card', value: 'CARD' },
    { label: 'Other', value: 'OTHER' }
  ];

  readyStorageModalOpen = false;
  selectedReadyOrder: B2cOrderView | null = null;
  readyStorageLabel = '';
  readyStorageError = '';
  storageModalMode: 'MARK_READY' | 'EDIT' = 'MARK_READY';

  businessName = 'Venkateshwara Fabric Works';

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadBusinessSettings();
  }

  loadBusinessSettings(): void {
    this.apiService.getBusinessSettings().subscribe({
      next: (response: any) => {
        this.businessName = response?.businessName || 'Venkateshwara Fabric Works';
      },
      error: (error: any) => {
        console.error('Settings load error', error);
      }
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService
      .getB2COrders(this.getBackendStatus(), this.getSearchValue())
      .subscribe({
        next: (response: B2COrderListResponse) => {
          this.orders = (response.orders ?? []).map((order: B2COrder) =>
            this.toViewOrder(order)
          );
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Load B2C orders error', error);
          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load orders';
          this.loading = false;
        }
      });
  }

  private toViewOrder(order: B2COrder): B2cOrderView {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      mobile: order.mobile,
      storageLabel: order.storageLabel ?? '-',
      pickupDate: order.pickupDate ?? '-',
      pickupSlot: order.pickupTime ?? '-',
      deliveryDate: order.deliveryDate ?? '-',
      deliverySlot: order.deliveryTime ?? '-',
      amount: Number(order.totalAmount ?? 0),
      homeDelivery: order.homeDelivery,
      expressDelivery: order.expressDelivery,
      settled: order.settled,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      moreOpen: false
    };
  }

  get filteredOrders(): B2cOrderView[] {
    return this.orders.filter((order: B2cOrderView) => {
      const matchesStatus =
        this.selectedStatus === 'All' ||
        this.getStatusLabel(order.status) === this.selectedStatus;

      const orderSearch = this.orderNumberSearch.trim().toLowerCase();
      const customerSearch = this.customerNameSearch.trim().toLowerCase();
      const mobileSearch = this.mobileSearch.trim();

      const matchesOrderNumber =
        !orderSearch || order.orderNumber.toLowerCase().includes(orderSearch);

      const matchesCustomerName =
        !customerSearch ||
        (order.customerName ?? '').toLowerCase().includes(customerSearch);

      const matchesMobile =
        !mobileSearch || order.mobile.includes(mobileSearch);

      return (
        matchesStatus &&
        matchesOrderNumber &&
        matchesCustomerName &&
        matchesMobile
      );
    });
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.closeAllMoreMenus();
    this.loadOrders();
  }

  searchOrders(): void {
    this.closeAllMoreMenus();

    if (this.customerNameSearch.trim()) {
      return;
    }

    this.loadOrders();
  }

  clearFilters(): void {
    this.selectedStatus = 'All';
    this.orderNumberSearch = '';
    this.mobileSearch = '';
    this.customerNameSearch = '';
    this.closeAllMoreMenus();
    this.loadOrders();
  }

  private getSearchValue(): string {
    const orderNumber = this.orderNumberSearch.trim();
    return orderNumber || this.mobileSearch.trim();
  }

  private getBackendStatus(): B2COrderStatus | null {
    switch (this.selectedStatus) {
      case 'Tagged':
        return 'TAGGED';
      case 'Processing At Store':
        return 'PROCESSING_AT_STORE';
      case 'Ready Order':
        return 'READY_ORDER';
      case 'Delivered':
        return 'DELIVERED';
      case 'Cancelled':
        return 'CANCELLED';
      default:
        return null;
    }
  }

  getStatusLabel(status: B2COrderStatus): string {
    switch (status) {
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

  toggleMore(order: B2cOrderView): void {
    const currentState = order.moreOpen ?? false;
    this.closeAllMoreMenus();
    order.moreOpen = !currentState;
  }

  private closeAllMoreMenus(): void {
    this.orders.forEach((order: B2cOrderView) => {
      order.moreOpen = false;
    });
  }

  processAtStore(order: B2cOrderView): void {
    this.errorMessage = '';
    this.actionLoading = true;
    this.closeAllMoreMenus();

    this.apiService
      .updateB2COrderStatus(order.id, 'PROCESSING_AT_STORE')
      .subscribe({
        next: (response: B2COrder) => {
          this.updateLocalOrder(response);
          this.actionLoading = false;
        },
        error: (error: any) => {
          this.handleActionError(error, 'Unable to process order');
        }
      });
  }

  markReady(order: B2cOrderView): void {
    this.closeAllMoreMenus();
    this.errorMessage = '';
    this.readyStorageError = '';
    this.storageModalMode = 'MARK_READY';
    this.selectedReadyOrder = order;
    this.readyStorageLabel =
      order.storageLabel && order.storageLabel !== '-' ? order.storageLabel : '';
    this.readyStorageModalOpen = true;
  }

  closeReadyStorageModal(): void {
    if (this.actionLoading) {
      return;
    }

    this.readyStorageModalOpen = false;
    this.selectedReadyOrder = null;
    this.readyStorageLabel = '';
    this.readyStorageError = '';
    this.storageModalMode = 'MARK_READY';
  }

  confirmMarkReady(): void {
    if (!this.selectedReadyOrder) {
      return;
    }

    const storageLabel = this.readyStorageLabel.trim();

    if (!storageLabel) {
      this.readyStorageError = 'Storage label is required';
      return;
    }

    this.readyStorageError = '';
    this.errorMessage = '';
    this.actionLoading = true;

    const orderId = this.selectedReadyOrder.id;

    this.apiService.updateB2CStorageLabel(orderId, storageLabel).subscribe({
      next: (storageResponse: B2COrder) => {
        this.updateLocalOrder(storageResponse);

        this.apiService.markB2COrderReady(orderId).subscribe({
          next: (readyResponse: B2COrder) => {
            this.updateLocalOrder(readyResponse);
            this.actionLoading = false;
            this.readyStorageModalOpen = false;
            this.selectedReadyOrder = null;
            this.readyStorageLabel = '';
            this.readyStorageError = '';
          },
          error: (error: any) => {
            this.actionLoading = false;
            this.readyStorageError =
              error?.error?.message ||
              error?.error?.error ||
              'Storage label saved, but unable to mark order ready';
          }
        });
      },
      error: (error: any) => {
        this.actionLoading = false;
        this.readyStorageError =
          error?.error?.message ||
          error?.error?.error ||
          'Unable to update storage label';
      }
    });
  }

  markDelivered(order: B2cOrderView): void {
    this.errorMessage = '';
    this.actionLoading = true;
    this.closeAllMoreMenus();

    this.apiService.markB2COrderDelivered(order.id).subscribe({
      next: (response: B2COrder) => {
        this.updateLocalOrder(response);
        this.actionLoading = false;
      },
      error: (error: any) => {
        this.handleActionError(error, 'Unable to mark order delivered');
      }
    });
  }

  cancelOrder(order: B2cOrderView): void {
    this.errorMessage = '';
    this.actionLoading = true;
    this.closeAllMoreMenus();

    this.apiService.cancelB2COrder(order.id).subscribe({
      next: (response: B2COrder) => {
        this.updateLocalOrder(response);
        this.actionLoading = false;
      },
      error: (error: any) => {
        this.handleActionError(error, 'Unable to cancel order');
      }
    });
  }

  settleOrder(order: B2cOrderView): void {
    this.closeAllMoreMenus();
    this.errorMessage = '';
    this.paymentError = '';

    if (order.status === 'CANCELLED') {
      this.errorMessage = 'Payment cannot be added to cancelled order';
      return;
    }

    if (order.settled) {
      return;
    }

    this.actionLoading = true;

    this.apiService.getSettlementById(order.id).subscribe({
      next: (response: SettlementOrder) => {
        this.actionLoading = false;

        if (response.paymentStatus === 'SETTLED') {
          order.settled = true;
          return;
        }

        this.selectedPaymentOrder = response;
        this.paymentAmount = Number(response.balanceAmount);
        this.selectedPaymentMethod = 'CASH';
        this.paymentReference = '';
        this.paymentError = '';
        this.paymentModalOpen = true;
      },
      error: (error: any) => {
        this.handleActionError(error, 'Unable to load payment details');
      }
    });
  }

  closePaymentModal(): void {
    if (this.actionLoading) {
      return;
    }

    this.paymentModalOpen = false;
    this.selectedPaymentOrder = null;
    this.paymentAmount = null;
    this.selectedPaymentMethod = 'CASH';
    this.paymentReference = '';
    this.paymentError = '';
  }

  setFullBalance(): void {
    if (!this.selectedPaymentOrder) {
      return;
    }

    this.paymentAmount = Number(this.selectedPaymentOrder.balanceAmount);
  }

  get remainingAfterPayment(): number {
    if (!this.selectedPaymentOrder) {
      return 0;
    }

    const balance = Number(this.selectedPaymentOrder.balanceAmount ?? 0);
    const amount = Number(this.paymentAmount ?? 0);
    return Math.max(balance - amount, 0);
  }

  addPayment(): void {
    if (!this.selectedPaymentOrder) {
      return;
    }

    this.paymentError = '';

    const amount = Number(this.paymentAmount);
    const balance = Number(this.selectedPaymentOrder.balanceAmount);

    if (!amount || amount <= 0) {
      this.paymentError = 'Enter a valid payment amount';
      return;
    }

    if (amount > balance) {
      this.paymentError = 'Payment amount cannot be greater than balance amount';
      return;
    }

    const request: PaymentRequest = {
      amount,
      paymentMethod: this.selectedPaymentMethod,
      referenceNumber: this.paymentReference.trim()
        ? this.paymentReference.trim()
        : null
    };

    const orderId = this.selectedPaymentOrder.id;
    this.actionLoading = true;

    this.apiService.addSettlementPayment(orderId, request).subscribe({
      next: (response: SettlementOrder) => {
        this.actionLoading = false;

        this.orders = this.orders.map((order: B2cOrderView) => {
          if (order.id !== response.id) {
            return order;
          }

          return {
            ...order,
            settled: response.paymentStatus === 'SETTLED',
            moreOpen: false
          };
        });

        this.closePaymentModal();
      },
      error: (error: any) => {
        console.error('Add payment error', error);
        this.paymentError =
          error?.error?.message ||
          error?.error?.error ||
          'Unable to add payment';
        this.actionLoading = false;
      }
    });
  }

  reschedule(order: B2cOrderView): void {
    this.closeAllMoreMenus();

    this.router.navigate(['/app/new-walk-in'], {
      queryParams: {
        mode: 'reschedule',
        orderId: order.id
      }
    });
  }

  updateStorageLabel(order: B2cOrderView): void {
    this.closeAllMoreMenus();
    this.errorMessage = '';
    this.readyStorageError = '';
    this.storageModalMode = 'EDIT';
    this.selectedReadyOrder = order;
    this.readyStorageLabel =
      order.storageLabel && order.storageLabel !== '-' ? order.storageLabel : '';
    this.readyStorageModalOpen = true;
  }

  saveStorageLabel(): void {
    if (!this.selectedReadyOrder) {
      return;
    }

    const storageLabel = this.readyStorageLabel.trim();

    if (!storageLabel) {
      this.readyStorageError = 'Storage label is required';
      return;
    }

    this.readyStorageError = '';
    this.errorMessage = '';
    this.actionLoading = true;

    const orderId = this.selectedReadyOrder.id;

    this.apiService.updateB2CStorageLabel(orderId, storageLabel).subscribe({
      next: (response: B2COrder) => {
        this.updateLocalOrder(response);
        this.actionLoading = false;
        this.readyStorageModalOpen = false;
        this.selectedReadyOrder = null;
        this.readyStorageLabel = '';
        this.readyStorageError = '';
        this.storageModalMode = 'MARK_READY';
      },
      error: (error: any) => {
        this.actionLoading = false;
        this.readyStorageError =
          error?.error?.message ||
          error?.error?.error ||
          'Unable to update storage label';
      }
    });
  }

  tagOrder(order: B2cOrderView): void {
    this.updateStorageLabel(order);
  }

  retagOrder(order: B2cOrderView): void {
    this.closeAllMoreMenus();

    this.router.navigate(['/app/new-walk-in'], {
      queryParams: {
        mode: 'retag',
        orderId: order.id
      }
    });
  }

  callCustomer(order: B2cOrderView): void {
    if (!order.mobile) {
      return;
    }

    window.location.href = `tel:${order.mobile}`;
  }

  viewOrder(order: B2cOrderView): void {
    this.closeAllMoreMenus();
    this.errorMessage = '';

    this.apiService.getB2COrderById(order.id).subscribe({
      next: (response: B2COrderDetails) => {
        console.log('Order details', response);
      },
      error: (error: any) => {
        this.handleActionError(error, 'Unable to fetch order details');
      }
    });
  }

  billReceipt(order: B2cOrderView): void {
    this.closeAllMoreMenus();
    this.errorMessage = '';

    this.apiService.getB2COrderById(order.id).subscribe({
      next: (response: B2COrderDetails) => {
        this.printReceipt(response);
      },
      error: (error: any) => {
        this.handleActionError(error, 'Unable to load receipt');
      }
    });
  }

  reprintQr(order: B2cOrderView): void {
    this.closeAllMoreMenus();
    this.errorMessage = '';
    this.actionLoading = true;

    this.apiService.getB2COrderById(order.id).subscribe({
      next: (response: B2COrderDetails) => {
        this.actionLoading = false;
        this.printQrTags(response);
      },
      error: (error: any) => {
        this.handleActionError(error, 'Unable to load order for re-print');
      }
    });
  }

  formatAmount(amount: number): string {
    return Number(amount ?? 0).toFixed(2);
  }

private printReceipt(order: B2COrderDetails): void {
  const itemsHtml = order.items
    .map(
      item => `
        <tr>
          <td>
            ${item.productName}${item.typeName ? ` (${item.typeName})` : ''}
            <br>
            <small>${item.serviceName}</small>

            ${
              item.unit === 'KG' && Number(item.garmentCount) > 0
                ? `
                  <br>
                  <small>Garments: ${item.garmentCount}</small>
                `
                : ''
            }
          </td>

          <td style="text-align:center;">
            ${item.quantity}
          </td>

          <td style="text-align:right;">
            ₹${Number(item.unitPrice).toFixed(2)}
          </td>

          <td style="text-align:right;">
            ₹${Number(item.lineTotal).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join('');

  const printWindow = window.open(
    '',
    '_blank',
    `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`
  );

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${order.orderNumber}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 12px;
            font-family: Arial, sans-serif;
            color: #111;
            background: #fff;
          }

          .receipt {
            width: 80mm;
            margin: 0 auto;
            font-size: 12px;
          }

          .center {
            text-align: center;
          }

          .shop-name {
            font-size: 18px;
            font-weight: 700;
          }

          .divider {
            margin: 8px 0;
            border-top: 1px dashed #000;
          }

          .row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin: 4px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }

          th,
          td {
            padding: 5px 2px;
            border-bottom: 1px dashed #bbb;
            vertical-align: top;
          }

          th {
            text-align: left;
            font-size: 11px;
          }

          td {
            font-size: 11px;
          }

          small {
            font-size: 10px;
          }

          .grand-total {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #000;
            font-size: 15px;
            font-weight: 700;
          }

          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }

            body {
              padding: 4mm;
            }
          }
        </style>
      </head>

      <body>
        <div class="receipt">

          <div class="center">
            <div class="shop-name">
              ${this.businessName}
            </div>

            <div>
              Bill Receipt
            </div>
          </div>

          <div class="divider"></div>

          <div class="row">
            <span>Order</span>
            <strong>${order.orderNumber}</strong>
          </div>

          <div class="row">
            <span>Customer</span>
            <strong>${order.customer.name}</strong>
          </div>

          <div class="row">
            <span>Mobile</span>
            <strong>${order.customer.phone}</strong>
          </div>

          <div class="row">
            <span>Created At </span>
            <strong>
              ${new Date(order.createdAt).toLocaleDateString('en-GB')}
            </strong>
          </div>

          <div class="row">
            <span>Delivered Date</span>
            <strong>
              ${
                order.deliveryDate
                  ? new Date(order.deliveryDate + 'T00:00:00').toLocaleDateString('en-GB')
                  : '-'
              }
            </strong>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Rate</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="row">
            <span>Subtotal</span>
            <strong>
              ₹${Number(order.subtotal).toFixed(2)}
            </strong>
          </div>

          <div class="row">
            <span>Discount</span>
            <strong>
              -₹${Number(order.discountAmount).toFixed(2)}
            </strong>
          </div>

          <div class="row">
            <span>Express</span>
            <strong>
              ₹${Number(order.expressChargeAmount).toFixed(2)}
            </strong>
          </div>

          <div class="row grand-total">
            <span>Total</span>
            <strong>
              ₹${Number(order.totalAmount).toFixed(2)}
            </strong>
          </div>

        </div>

        <script>
          window.onload = function () {
            setTimeout(function () {
              window.focus();
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
}


private printQrTags(
  order: B2COrderDetails
): void {

  const createdDate =
    new Date(order.createdAt);

  const formattedDate =
    createdDate.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  const groupedItems =
    new Map<
      string,
      {
        productName: string;
        typeName: string;
        unit: string;
        quantity: number;
        garmentCount: number;
        serviceNames: string[];
      }
    >();

  for (const item of order.items) {

    const key = [
      item.productName,
      item.typeName ?? '',
      item.unit,
      Number(item.quantity)
    ].join('|');

    const existingItem =
      groupedItems.get(key);

    if (existingItem) {

      if (
        !existingItem.serviceNames
          .includes(item.serviceName)
      ) {

        existingItem.serviceNames.push(
          item.serviceName
        );
      }

      continue;
    }

    groupedItems.set(
      key,
      {
        productName:
          item.productName,

        typeName:
          item.typeName ?? '',

        unit:
          item.unit,

        quantity:
          Number(item.quantity),

        garmentCount:
          item.unit === 'KG'
            ? Math.max(
                1,
                Number(
                  item.garmentCount ?? 1
                )
              )
            : Math.max(
                1,
                Number(item.quantity)
              ),

        serviceNames: [
          item.serviceName
        ]
      }
    );
  }

  const groupedOrderItems =
    Array.from(
      groupedItems.values()
    );

  const totalItemCount =
    groupedOrderItems.reduce(
      (
        total,
        item
      ) => {

        if (
          item.unit === 'KG'
        ) {

          return (
            total +
            Math.max(
              1,
              Number(
                item.garmentCount ?? 1
              )
            )
          );
        }

        return (
          total +
          Math.max(
            1,
            Math.floor(
              Number(
                item.quantity ?? 1
              )
            )
          )
        );
      },
      0
    );

  const getServiceCode = (
    serviceName: string
  ): string => {

    const normalized =
      serviceName
        .trim()
        .toLowerCase();

    const serviceCodeMap:
      Record<string, string> = {

      'starching': 'ST',
      'dry clean': 'DC',
      'steam press': 'SP',
      'wash & iron': 'WI',
      'wash and iron': 'WI',
      'wash & fold': 'WF',
      'wash and fold': 'WF'
    };

    if (
      serviceCodeMap[
        normalized
      ]
    ) {

      return serviceCodeMap[
        normalized
      ];
    }

    return serviceName
      .split(' ')
      .filter(
        word =>
          word.trim()
      )
      .map(
        word =>
          word
            .charAt(0)
            .toUpperCase()
      )
      .join('');
  };

  let tagsHtml = '';

  for (
    const item
    of groupedOrderItems
  ) {

    const typeName =
      item.typeName &&
      item.typeName
        .toLowerCase() !==
        'default'
        ? item.typeName
        : '';

    const productDisplay =
      typeName
        ? `${item.productName} (${typeName})`
        : item.productName;

    const serviceCode =
      item.serviceNames
        .map(
          serviceName =>
            getServiceCode(
              serviceName
            )
        )
        .join(
          '<span class="service-divider">|</span>'
        );

    const tagCount =
      item.unit === 'KG'
        ? Math.max(
            1,
            Number(
              item.garmentCount ?? 1
            )
          )
        : Math.max(
            1,
            Math.floor(
              Number(
                item.quantity ?? 1
              )
            )
          );

    for (
      let index = 1;
      index <= tagCount;
      index++
    ) {

      tagsHtml += `
        <section class="tag">

          <div class="business-name">
            ${this.businessName}
          </div>

          <div class="customer-name">
            ${order.customer.name}
          </div>

          <div class="order-number">
            #${order.orderNumber}
          </div>

          <div class="order-date">
            ${formattedDate}
          </div>

          <div class="service-code">
            ${serviceCode}
          </div>

          <div class="product-name">
            ${productDisplay}
          </div>

          <div class="tag-number">
            T${totalItemCount}
          </div>

        </section>
      `;
    }
  }

  const printWindow =
    window.open(
      '',
      '_blank',
      `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`
    );

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>

    <html>

      <head>

        <meta charset="UTF-8">

        <title>
          Re-print Tags
        </title>

        <style>

          @page {
            size: 50mm 70mm;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            width: 50mm;
            margin: 0;
            padding: 0;
            background: #ffffff;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            color: #000000;
          }

          .tags {
            width: 50mm;
            margin: 0;
            padding: 0;
          }

          .tag {
            width: 50mm;
            height: 70mm;

            margin: 0;
            padding: 4mm 3mm;

            display: flex;
            flex-direction: column;
            align-items: center;

            text-align: center;

            overflow: hidden;

            break-after: page;
            page-break-after: always;
          }

          .tag:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .business-name {
            width: 100%;

            font-size: 10px;
            line-height: 1.2;
            font-weight: 700;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .customer-name {
            width: 100%;
            margin-top: 4mm;

            font-size: 11px;
            line-height: 1.2;
            font-weight: 700;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .order-number {
            margin-top: 2mm;

            font-size: 19px;
            line-height: 1;
            font-weight: 800;
          }

          .order-date {
            margin-top: 2mm;

            font-size: 10px;
            font-weight: 700;
          }

          .service-code {
            min-width: 20mm;
            min-height: 12mm;

            margin-top: 4mm;
            padding: 2mm;

            display: flex;
            align-items: center;
            justify-content: center;

            border:
              1.5px solid
              #000000;

            font-size: 14px;
            line-height: 1;
            font-weight: 800;

            white-space: nowrap;
          }

          .service-divider {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            margin: 0 2mm;

            font-size: 24px;
            line-height: 1;
            font-weight: 500;

            transform:
              scaleY(1.35);
          }

          .product-name {
            width: 100%;

            margin-top: 5mm;

            font-size: 12px;
            line-height: 1.2;
            font-weight: 700;

            text-transform:
              capitalize;

            overflow: hidden;
          }

          .tag-number {
            margin-top: 4mm;

            font-size: 22px;
            line-height: 1;
            font-weight: 900;
          }

          .tag::after {
            content: '';

            width: 90%;

            margin-top: 3mm;

            border-bottom:
              1px dashed
              #000000;
          }

          @media print {

            html,
            body {
              width: 50mm !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .tag {
              width: 50mm !important;
              height: 70mm !important;

              margin: 0 !important;

              break-after: page;
              page-break-after: always;
            }

            .tag:last-child {
              break-after: auto;
              page-break-after: auto;
            }
          }

        </style>

      </head>

      <body>

        <div class="tags">
          ${tagsHtml}
        </div>

        <script>

          window.onload =
            function () {

              setTimeout(
                function () {

                  window.focus();
                  window.print();

                },
                500
              );
            };

        </script>

      </body>

    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
}

  private updateLocalOrder(response: B2COrder): void {
    this.orders = this.orders.map((order: B2cOrderView) => {
      if (order.id !== response.id) {
        return order;
      }

      return {
        ...order,
        orderNumber: response.orderNumber,
        customerName: response.customerName,
        mobile: response.mobile,
        amount: Number(response.totalAmount),
        pickupDate: response.pickupDate ?? '-',
        pickupSlot: response.pickupTime ?? '-',
        deliveryDate: response.deliveryDate ?? '-',
        deliverySlot: response.deliveryTime ?? '-',
        storageLabel: response.storageLabel ?? '-',
        homeDelivery: response.homeDelivery,
        expressDelivery: response.expressDelivery,
        settled: response.settled,
        status: response.status,
        updatedAt: response.updatedAt,
        moreOpen: false
      };
    });
  }

  private handleActionError(error: any, fallbackMessage: string): void {
    console.error(fallbackMessage, error);
    this.actionLoading = false;
    this.errorMessage =
      error?.error?.message || error?.error?.error || fallbackMessage;
  }
}
