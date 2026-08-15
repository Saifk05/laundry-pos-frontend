import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ApiService
} from '../../../core/services/api.service';

import {
  DashboardDeliveryDate,
  DashboardOrder,
  DashboardResponse
} from '../../../core/models/dashboard.model';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    CommonModule
  ]
})
export class DashboardPage
  implements OnInit {

  loading = false;

  errorMessage = '';

  dashboard:
    DashboardResponse | null =
      null;

  deliveryDays:
    DashboardDeliveryDate[] =
      [];

  selectedOrder:
    DashboardOrder | null =
      null;


  constructor(
    private readonly apiService:
      ApiService
  ) {}


  ngOnInit(): void {

    this.loadDashboard();
  }


  /* =========================================
     LOAD DASHBOARD
  ========================================= */

  loadDashboard(): void {

    this.loading =
      true;

    this.errorMessage =
      '';

    this.apiService
      .getDashboard()
      .subscribe({

        next: (
          response:
            DashboardResponse
        ) => {

          this.dashboard =
            response;

          this.deliveryDays =
            response?.dates ?? [];

          this.loading =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Dashboard load error',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load dashboard';

          this.loading =
            false;
        }

      });
  }


  /* =========================================
     SUMMARY
  ========================================= */

  get totalOrders():
    number {

    return this.dashboard
      ?.totalOrders ?? 0;
  }


  get processingOrders():
    number {

    return this.dashboard
      ?.processingOrders ?? 0;
  }


  get readyOrders():
    number {

    return this.dashboard
      ?.readyOrders ?? 0;
  }


  /* =========================================
     ORDER HELPERS
  ========================================= */

  isReadyOrder(
    order:
      DashboardOrder
  ): boolean {

    return (
      order.status ===
      'READY_ORDER'
    );
  }


  isProcessingOrder(
    order:
      DashboardOrder
  ): boolean {

    return (
      order.status ===
      'PROCESSING_AT_STORE'
    );
  }


  getStatusLabel(
    order:
      DashboardOrder
  ): string {

    switch (
      order.status
    ) {

      case 'NEW_ORDER':
        return 'New Order';

      case 'PROCESSING_AT_STORE':
        return 'Processing';

      case 'READY_ORDER':
        return 'Ready';

      case 'DELIVERED':
        return 'Delivered';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return order.status;
    }
  }


  /* =========================================
     PIECES
  ========================================= */

  formatPieces(
    pieces:
      number
  ): string {

    const value =
      Number(
        pieces ?? 0
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


  /* =========================================
     MONEY
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
     CALL POPUP
  ========================================= */

  openCallPopup(
    order:
      DashboardOrder
  ): void {

    this.selectedOrder =
      order;
  }


  closeCallPopup(): void {

    this.selectedOrder =
      null;
  }


  callNow(): void {

    if (
      !this.selectedOrder
    ) {

      return;
    }

    if (
      !this.selectedOrder.mobile
    ) {

      return;
    }

    window.location.href =
      `tel:${this.selectedOrder.mobile}`;
  }

}