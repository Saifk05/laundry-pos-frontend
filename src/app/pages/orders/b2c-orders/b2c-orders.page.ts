import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ApiService
} from '../../../../core/services/api.service';

import {
  B2COrder,
  B2COrderDetails,
  B2COrderListResponse,
  B2COrderStatus,
  RescheduleOrderRequest
} from '../../../../core/models/b2c-order.model';


interface B2cOrderView {

  id: string;

  orderNumber: string;

  status: B2COrderStatus;

  customerName: string;

  mobile: string;

  address: string;

  storageLabel: string;

  pickupDate: string;

  pickupSlot: string;

  pickupRiderName: string;

  pickupRiderMobile: string;

  deliveryDate: string;

  deliverySlot: string;

  pieces: number;

  amount: number;

  homeDelivery: boolean;

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
  imports: [
    FormsModule
  ]
})
export class B2cOrdersPage
  implements OnInit {

  loading = false;

  actionLoading = false;

  errorMessage = '';

  selectedStatus = 'All';

  orderNumberSearch = '';

  mobileSearch = '';

  statuses: string[] = [
    'All',
    'New Order',
    'Processing At Store',
    'Ready Order',
    'Delivered',
    'Cancelled'
  ];

  orders:
    B2cOrderView[] = [];


  constructor(
    private readonly apiService:
      ApiService
  ) {}


  ngOnInit(): void {

    this.loadOrders();
  }


  loadOrders(): void {

    this.loading = true;

    this.errorMessage = '';

    this.apiService
      .getB2COrders(
        this.getBackendStatus(),
        this.getSearchValue()
      )
      .subscribe({

        next: (
          response:
            B2COrderListResponse
        ) => {

          this.orders =
            (response.orders ?? [])
              .map(
                (
                  order:
                    B2COrder
                ) =>
                  this.toViewOrder(
                    order
                  )
              );

          this.loading = false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Load B2C orders error',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load orders';

          this.loading = false;
        }

      });
  }


  private toViewOrder(
    order:
      B2COrder
  ): B2cOrderView {

    return {

      id:
        order.id,

      orderNumber:
        order.orderNumber,

      status:
        order.status,

      customerName:
        order.customerName,

      mobile:
        order.mobile,

      address:
        '-',

      storageLabel:
        order.storageLabel ?? '-',

      pickupDate:
        order.pickupDate ?? '-',

      pickupSlot:
        order.pickupTime ?? '-',

      pickupRiderName:
        '-',

      pickupRiderMobile:
        '-',

      deliveryDate:
        order.deliveryDate ?? '-',

      deliverySlot:
        order.deliveryTime ?? '-',

      pieces:
        0,

      amount:
        Number(
          order.totalAmount ?? 0
        ),

      homeDelivery:
        order.homeDelivery,

      settled:
        order.settled,

      createdAt:
        order.createdAt,

      updatedAt:
        order.updatedAt,

      moreOpen:
        false
    };
  }


  get filteredOrders():
    B2cOrderView[] {

    return this.orders.filter(
      (
        order:
          B2cOrderView
      ) => {

        const matchesStatus =
          this.selectedStatus ===
            'All' ||
          this.getStatusLabel(
            order.status
          ) ===
            this.selectedStatus;

        const orderSearch =
          this.orderNumberSearch
            .trim()
            .toLowerCase();

        const mobileSearch =
          this.mobileSearch
            .trim();

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

        return (
          matchesStatus &&
          matchesOrderNumber &&
          matchesMobile
        );
      }
    );
  }


  selectStatus(
    status:
      string
  ): void {

    this.selectedStatus =
      status;

    this.closeAllMoreMenus();

    this.loadOrders();
  }


  searchOrders(): void {

    this.closeAllMoreMenus();

    this.loadOrders();
  }


  clearFilters(): void {

    this.selectedStatus =
      'All';

    this.orderNumberSearch =
      '';

    this.mobileSearch =
      '';

    this.closeAllMoreMenus();

    this.loadOrders();
  }


  private getSearchValue():
    string {

    const orderNumber =
      this.orderNumberSearch
        .trim();

    if (orderNumber) {

      return orderNumber;
    }

    return this.mobileSearch
      .trim();
  }


private getBackendStatus():
  B2COrderStatus | null {

  switch (
    this.selectedStatus
  ) {

    case 'New Order':

      return 'NEW_ORDER';

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

getStatusLabel(
  status:
    B2COrderStatus
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

  toggleMore(
    order:
      B2cOrderView
  ): void {

    const currentState =
      order.moreOpen ??
      false;

    this.closeAllMoreMenus();

    order.moreOpen =
      !currentState;
  }


  private closeAllMoreMenus():
    void {

    this.orders.forEach(
      (
        order:
          B2cOrderView
      ) => {

        order.moreOpen =
          false;
      }
    );
  }


  processAtStore(
    order:
      B2cOrderView
  ): void {

    this.errorMessage =
      '';

    this.actionLoading =
      true;

    this.apiService
      .updateB2COrderStatus(
        order.id,
        'PROCESSING_AT_STORE'
      )
      .subscribe({

        next: (
          response:
            B2COrder
        ) => {

          this.updateLocalOrder(
            response
          );

          this.actionLoading =
            false;
        },

        error: (
          error:
            any
        ) => {

          this.handleActionError(
            error,
            'Unable to process order'
          );
        }

      });
  }


  markReady(
    order:
      B2cOrderView
  ): void {

    this.errorMessage =
      '';

    this.actionLoading =
      true;

    this.closeAllMoreMenus();

    this.apiService
      .markB2COrderReady(
        order.id
      )
      .subscribe({

        next: (
          response:
            B2COrder
        ) => {

          this.updateLocalOrder(
            response
          );

          this.actionLoading =
            false;
        },

        error: (
          error:
            any
        ) => {

          this.handleActionError(
            error,
            'Unable to mark order ready'
          );
        }

      });
  }


  markDelivered(
    order:
      B2cOrderView
  ): void {

    this.errorMessage =
      '';

    this.actionLoading =
      true;

    this.closeAllMoreMenus();

    this.apiService
      .markB2COrderDelivered(
        order.id
      )
      .subscribe({

        next: (
          response:
            B2COrder
        ) => {

          this.updateLocalOrder(
            response
          );

          this.actionLoading =
            false;
        },

        error: (
          error:
            any
        ) => {

          this.handleActionError(
            error,
            'Unable to mark order delivered'
          );
        }

      });
  }


  cancelOrder(
    order:
      B2cOrderView
  ): void {

    this.errorMessage =
      '';

    this.actionLoading =
      true;

    this.closeAllMoreMenus();

    this.apiService
      .cancelB2COrder(
        order.id
      )
      .subscribe({

        next: (
          response:
            B2COrder
        ) => {

          this.updateLocalOrder(
            response
          );

          this.actionLoading =
            false;
        },

        error: (
          error:
            any
        ) => {

          this.handleActionError(
            error,
            'Unable to cancel order'
          );
        }

      });
  }


  settleOrder(
    order:
      B2cOrderView
  ): void {

    this.errorMessage =
      '';

    this.actionLoading =
      true;

    this.closeAllMoreMenus();

    this.apiService
      .settleB2COrder(
        order.id
      )
      .subscribe({

        next: (
          response:
            B2COrder
        ) => {

          this.updateLocalOrder(
            response
          );

          this.actionLoading =
            false;
        },

        error: (
          error:
            any
        ) => {

          this.handleActionError(
            error,
            'Unable to settle order'
          );
        }

      });
  }


  reschedule(
    order:
      B2cOrderView
  ): void {

    this.closeAllMoreMenus();

    const currentDate =
      order.deliveryDate === '-'
        ? ''
        : order.deliveryDate;

    const currentTime =
      order.deliverySlot === '-'
        ? ''
        : order.deliverySlot;

    const deliveryDate =
      window.prompt(
        'Delivery date (YYYY-MM-DD)',
        currentDate
      );

    if (
      !deliveryDate
    ) {

      return;
    }

    const deliveryTime =
      window.prompt(
        'Delivery time slot',
        currentTime
      );

    if (
      !deliveryTime
    ) {

      return;
    }

    const request:
      RescheduleOrderRequest = {

      deliveryDate:
        deliveryDate.trim(),

      deliveryTime:
        deliveryTime.trim()
    };

    this.actionLoading =
      true;

    this.errorMessage =
      '';

    this.apiService
      .rescheduleB2COrder(
        order.id,
        request
      )
      .subscribe({

        next: (
          response:
            B2COrder
        ) => {

          this.updateLocalOrder(
            response
          );

          this.actionLoading =
            false;
        },

        error: (
          error:
            any
        ) => {

          this.handleActionError(
            error,
            'Unable to reschedule order'
          );
        }

      });
  }


  updateStorageLabel(
    order:
      B2cOrderView
  ): void {

    this.closeAllMoreMenus();

    const currentValue =
      order.storageLabel === '-'
        ? ''
        : order.storageLabel;

    const storageLabel =
      window.prompt(
        'Storage label',
        currentValue
      );

    if (
      !storageLabel ||
      !storageLabel.trim()
    ) {

      return;
    }

    this.actionLoading =
      true;

    this.errorMessage =
      '';

    this.apiService
      .updateB2CStorageLabel(
        order.id,
        storageLabel.trim()
      )
      .subscribe({

        next: (
          response:
            B2COrder
        ) => {

          this.updateLocalOrder(
            response
          );

          this.actionLoading =
            false;
        },

        error: (
          error:
            any
        ) => {

          this.handleActionError(
            error,
            'Unable to update storage label'
          );
        }

      });
  }


  callCustomer(
    order:
      B2cOrderView
  ): void {

    if (
      !order.mobile
    ) {

      return;
    }

    window.location.href =
      `tel:${order.mobile}`;
  }


  viewOrder(
    order:
      B2cOrderView
  ): void {

    this.errorMessage =
      '';

    this.apiService
      .getB2COrderById(
        order.id
      )
      .subscribe({

        next: (
          response:
            B2COrderDetails
        ) => {

          console.log(
            'Order details',
            response
          );
        },

        error: (
          error:
            any
        ) => {

          this.handleActionError(
            error,
            'Unable to fetch order details'
          );
        }

      });
  }


  billReceipt(
    order:
      B2cOrderView
  ): void {

    this.closeAllMoreMenus();

    this.apiService
      .getB2COrderById(
        order.id
      )
      .subscribe({

        next: (
          response:
            B2COrderDetails
        ) => {

          this.printReceipt(
            response
          );
        },

        error: (
          error:
            any
        ) => {

          this.handleActionError(
            error,
            'Unable to load receipt'
          );
        }

      });
  }


  private printReceipt(
    order:
      B2COrderDetails
  ): void {

    const itemsHtml =
      order.items
        .map(
          item => `
            <tr>
              <td>
                ${item.productName}
                ${
                  item.typeName
                    ? ` (${item.typeName})`
                    : ''
                }
                <br>
                <small>
                  ${item.serviceName}
                </small>
              </td>

              <td style="text-align:center;">
                ${item.quantity}
              </td>

              <td style="text-align:right;">
                ₹${Number(
                  item.unitPrice
                ).toFixed(2)}
              </td>

              <td style="text-align:right;">
                ₹${Number(
                  item.lineTotal
                ).toFixed(2)}
              </td>
            </tr>
          `
        )
        .join('');

    const printWindow =
      window.open(
        '',
        '_blank',
        'width=420,height=700'
      );

    if (
      !printWindow
    ) {

      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

        <head>

          <title>
            ${order.orderNumber}
          </title>

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
                Laundry POS
              </div>

              <div>
                Bill Receipt
              </div>

            </div>

            <div class="divider"></div>

            <div class="row">
              <span>Order</span>
              <strong>
                ${order.orderNumber}
              </strong>
            </div>

            <div class="row">
              <span>Customer</span>
              <strong>
                ${order.customer.name}
              </strong>
            </div>

            <div class="row">
              <span>Mobile</span>
              <strong>
                ${order.customer.phone}
              </strong>
            </div>

            <div class="divider"></div>

            <table>

              <thead>

                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Total</th>
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
                ₹${Number(
                  order.subtotal
                ).toFixed(2)}
              </strong>
            </div>

            <div class="row">
              <span>Discount</span>
              <strong>
                -₹${Number(
                  order.discountAmount
                ).toFixed(2)}
              </strong>
            </div>

            <div class="row">
              <span>Express</span>
              <strong>
                ₹${Number(
                  order.expressChargeAmount
                ).toFixed(2)}
              </strong>
            </div>

            <div class="row grand-total">
              <span>Total</span>
              <strong>
                ₹${Number(
                  order.totalAmount
                ).toFixed(2)}
              </strong>
            </div>

          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>

        </body>

      </html>
    `);

    printWindow.document.close();
  }


  private updateLocalOrder(
    response:
      B2COrder
  ): void {

    this.orders =
      this.orders.map(
        (
          order:
            B2cOrderView
        ) => {

          if (
            order.id !==
            response.id
          ) {

            return order;
          }

          return {
            ...order,

            orderNumber:
              response.orderNumber,

            customerName:
              response.customerName,

            mobile:
              response.mobile,

            amount:
              Number(
                response.totalAmount
              ),

            pickupDate:
              response.pickupDate ??
              '-',

            pickupSlot:
              response.pickupTime ??
              '-',

            deliveryDate:
              response.deliveryDate ??
              '-',

            deliverySlot:
              response.deliveryTime ??
              '-',

            storageLabel:
              response.storageLabel ??
              '-',

            homeDelivery:
              response.homeDelivery,

            settled:
              response.settled,

            status:
              response.status,

            updatedAt:
              response.updatedAt,

            moreOpen:
              false
          };
        }
      );
  }


  private handleActionError(
    error:
      any,
    fallbackMessage:
      string
  ): void {

    console.error(
      fallbackMessage,
      error
    );

    this.actionLoading =
      false;

    this.errorMessage =
      error?.error?.message ||
      error?.error?.error ||
      fallbackMessage;
  }


  assignRider(
    order:
      B2cOrderView
  ): void {

    console.log(
      'Assign rider',
      order.orderNumber
    );
  }


  tagOrder(
    order:
      B2cOrderView
  ): void {

    this.updateStorageLabel(
      order
    );
  }


  processAtVendor(
    order:
      B2cOrderView
  ): void {

    console.log(
      'Process at vendor',
      order.orderNumber
    );
  }


  retagOrder(
    order:
      B2cOrderView
  ): void {

    this.updateStorageLabel(
      order
    );
  }


  showPaymentQr(
    order:
      B2cOrderView
  ): void {

    console.log(
      'Payment QR',
      order.orderNumber
    );
  }


  changeReadyStatus(
    order:
      B2cOrderView
  ): void {

    this.markReady(
      order
    );
  }


  // pickupSlips(
  //   order:
  //     B2cOrderView
  // ): void {

  //   console.log(
  //     'Pickup slips',
  //     order.orderNumber
  //   );

  //   this.closeAllMoreMenus();
  // }


  // smsPaymentLink(
  //   order:
  //     B2cOrderView
  // ): void {

  //   console.log(
  //     'SMS payment link',
  //     order.orderNumber
  //   );

  //   this.closeAllMoreMenus();
  // }

}