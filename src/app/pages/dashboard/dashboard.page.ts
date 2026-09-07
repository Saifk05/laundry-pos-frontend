import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

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
export class DashboardPage implements OnInit {

  loading = false;

  dashboard: DashboardResponse | null = null;

  deliveryDays: DashboardDeliveryDate[] = [];

  selectedOrder: DashboardOrder | null = null;

  confirmReadyOrder: DashboardOrder | null = null;

  updatingOrderId: string | null = null;

  constructor(
    private readonly apiService: ApiService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    this.apiService
      .getDashboard()
      .subscribe({
        next: (response: DashboardResponse) => {
          this.dashboard = response;
          this.deliveryDays = response?.dates ?? [];
          this.loading = false;
        },

        error: (error: HttpErrorResponse) => {
          console.error(
            'Dashboard load error:',
            error
          );

          this.dashboard = null;
          this.deliveryDays = [];
          this.loading = false;

          void this.notificationService.error(
            this.getErrorMessage(
              error,
              'Unable to load dashboard'
            )
          );
        }
      });
  }

  get totalOrders(): number {
    return this.dashboard?.totalOrders ?? 0;
  }

  get processingOrders(): number {
    return this.dashboard?.processingOrders ?? 0;
  }

  get readyOrders(): number {
    return this.dashboard?.readyOrders ?? 0;
  }

  isReadyOrder(
    order: DashboardOrder
  ): boolean {
    return order.status === 'READY_ORDER';
  }

  isProcessingOrder(
    order: DashboardOrder
  ): boolean {
    return order.status === 'PROCESSING_AT_STORE';
  }

  getStatusLabel(
    order: DashboardOrder
  ): string {
    switch (order.status) {
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

  formatPieces(
    pieces: number
  ): string {
    const value =
      Number(
        pieces ?? 0
      );

    return Number.isInteger(value)
      ? value.toString()
      : value.toFixed(2);
  }

  formatAmount(
    amount: number
  ): string {
    return Number(
      amount ?? 0
    ).toFixed(2);
  }

  openCallPopup(
    order: DashboardOrder
  ): void {
    this.selectedOrder = order;
  }

  closeCallPopup(): void {
    this.selectedOrder = null;
  }

  callNow(): void {
    if (!this.selectedOrder) {
      return;
    }

    if (!this.selectedOrder.mobile) {
      void this.notificationService.warning(
        'Customer mobile number is not available'
      );

      return;
    }

    window.location.href =
      `tel:${this.selectedOrder.mobile}`;
  }

  markReady(
    order: DashboardOrder,
    event: Event
  ): void {
    event.stopPropagation();

    if (
      order.status !== 'PROCESSING_AT_STORE' ||
      this.updatingOrderId
    ) {
      return;
    }

    this.updateOrderToReady(
      order
    );
  }

  openReadyConfirmation(
    order: DashboardOrder,
    event: Event
  ): void {
    event.stopPropagation();

    if (
      order.status !== 'PROCESSING_AT_STORE' ||
      this.updatingOrderId
    ) {
      return;
    }

    this.confirmReadyOrder = order;
  }

  closeReadyConfirmation(): void {
    if (this.updatingOrderId) {
      return;
    }

    this.confirmReadyOrder = null;
  }

  confirmMarkReady(): void {
    if (!this.confirmReadyOrder) {
      return;
    }

    this.updateOrderToReady(
      this.confirmReadyOrder
    );
  }

  private updateOrderToReady(
    order: DashboardOrder
  ): void {
    if (this.updatingOrderId) {
      return;
    }

    this.updatingOrderId =
      order.id;

    this.apiService
      .updateB2COrderStatus(
        order.id,
        'READY_ORDER'
      )
      .subscribe({
        next: () => {
          this.updatingOrderId = null;
          this.confirmReadyOrder = null;

          void this.notificationService.success(
            `Order ${order.orderNumber} marked as ready`
          );

          this.loadDashboard();
        },

        error: (error: HttpErrorResponse) => {
          console.error(
            'Mark ready error:',
            error
          );

          this.updatingOrderId = null;

          void this.notificationService.error(
            this.getErrorMessage(
              error,
              'Unable to mark order ready'
            )
          );
        }
      });
  }

  refresh(): void {
    if (
      this.loading ||
      this.updatingOrderId
    ) {
      return;
    }

    this.loadDashboard();
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    const message =
      error?.error?.message;

    if (
      typeof message === 'string' &&
      message.trim()
    ) {
      return message.trim();
    }

    const legacyMessage =
      error?.error?.error;

    if (
      typeof legacyMessage === 'string' &&
      legacyMessage.trim()
    ) {
      return legacyMessage.trim();
    }

    return fallback;
  }
}