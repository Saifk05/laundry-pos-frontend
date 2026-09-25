import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';

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
  imports: [CommonModule, IonIcon]
})
export class DashboardPage implements OnInit {

  loading = false;
  loadingMore = false;

  dashboard: DashboardResponse | null = null;
  deliveryDays: DashboardDeliveryDate[] = [];

  selectedOrder: DashboardOrder | null = null;
  confirmReadyOrder: DashboardOrder | null = null;
  updatingOrderId: string | null = null;

  readonly visibleDays = 6;
  readonly paginationDays = 2;

  private windowStartDate!: Date;
  private windowEndDate!: Date;

  constructor(
    private readonly apiService: ApiService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const today = this.startOfDay(new Date());

    this.windowStartDate = this.addDays(today, -1);

    this.windowEndDate = this.addDays(
      this.windowStartDate,
      this.visibleDays - 1
    );

    this.loadDashboard();
  }

  loadDashboard(): void {
    if (this.loading || this.loadingMore) return;

    this.loading = true;

    this.apiService
      .getDashboard(
        this.formatDate(this.windowStartDate),
        this.formatDate(this.windowEndDate)
      )
      .subscribe({
        next: (response: DashboardResponse) => {
          this.dashboard = response;
          this.deliveryDays = [...(response?.dates ?? [])].reverse();

          this.recalculateDashboardTotals();
          this.loading = false;
        },

        error: (error: HttpErrorResponse) => {
          console.error('Dashboard load error:', error);

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

  loadFutureDates(): void {
    if (
      this.loading ||
      this.loadingMore ||
      this.updatingOrderId
    ) {
      return;
    }

    const nextStartDate = this.addDays(
      this.windowStartDate,
      this.paginationDays
    );

    const nextEndDate = this.addDays(
      this.windowEndDate,
      this.paginationDays
    );

    this.loadDateWindow(
      nextStartDate,
      nextEndDate
    );
  }

  loadPreviousDates(): void {
    if (
      this.loading ||
      this.loadingMore ||
      this.updatingOrderId
    ) {
      return;
    }

    const previousStartDate = this.addDays(
      this.windowStartDate,
      -this.paginationDays
    );

    const previousEndDate = this.addDays(
      this.windowEndDate,
      -this.paginationDays
    );

    this.loadDateWindow(
      previousStartDate,
      previousEndDate
    );
  }

  private loadDateWindow(
    startDate: Date,
    endDate: Date
  ): void {
    this.loadingMore = true;

    this.apiService
      .getDashboard(
        this.formatDate(startDate),
        this.formatDate(endDate)
      )
      .subscribe({
        next: (response: DashboardResponse) => {
          this.dashboard = response;
          this.deliveryDays = [...(response?.dates ?? [])].reverse();

          this.windowStartDate = startDate;
          this.windowEndDate = endDate;

          this.recalculateDashboardTotals();
          this.loadingMore = false;
        },

        error: (error: HttpErrorResponse) => {
          console.error(
            'Dashboard date load error:',
            error
          );

          this.loadingMore = false;

          void this.notificationService.error(
            this.getErrorMessage(
              error,
              'Unable to load delivery dates'
            )
          );
        }
      });
  }

  get totalOrders(): number {
    return this.deliveryDays.reduce(
      (total, day) =>
        total + Number(day.totalOrders ?? 0),
      0
    );
  }

  get processingOrders(): number {
    return this.deliveryDays.reduce(
      (total, day) =>
        total + Number(day.processingOrders ?? 0),
      0
    );
  }

  get readyOrders(): number {
    return this.deliveryDays.reduce(
      (total, day) =>
        total + Number(day.readyOrders ?? 0),
      0
    );
  }

  isReadyOrder(order: DashboardOrder): boolean {
    return order.status === 'READY_ORDER';
  }

  isProcessingOrder(order: DashboardOrder): boolean {
    return order.status === 'PROCESSING_AT_STORE';
  }

  isHomeDelivery(order: DashboardOrder): boolean {
    return order.homeDelivery === true;
  }

  getStatusLabel(order: DashboardOrder): string {
    switch (order.status) {
      case 'NEW_ORDER':
        return 'New Order';

      case 'TAGGED':
        return 'Tagged';

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

  formatPieces(pieces: number): string {
    const value = Number(pieces ?? 0);

    return Number.isInteger(value)
      ? value.toString()
      : value.toFixed(2);
  }

  formatAmount(amount: number): string {
    return Number(amount ?? 0).toFixed(2);
  }

  openCallPopup(order: DashboardOrder): void {
    this.selectedOrder = order;
  }

  closeCallPopup(): void {
    this.selectedOrder = null;
  }

  callNow(): void {
    if (!this.selectedOrder) return;

    if (!this.selectedOrder.mobile) {
      void this.notificationService.warning(
        'Customer mobile number is not available'
      );
      return;
    }

    window.location.href =
      `tel:${this.selectedOrder.mobile}`;
  }

  openOrder(
    order: DashboardOrder,
    event: Event
  ): void {
    event.stopPropagation();

    void this.router.navigate(
      ['/app/b2c-orders'],
      {
        queryParams: {
          orderNo: order.orderNumber
        }
      }
    );
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

    this.updateOrderToReady(order);
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
    if (this.updatingOrderId) return;

    this.confirmReadyOrder = null;
  }

  confirmMarkReady(): void {
    if (!this.confirmReadyOrder) return;

    this.updateOrderToReady(
      this.confirmReadyOrder
    );
  }

  refresh(): void {
    if (
      this.loading ||
      this.loadingMore ||
      this.updatingOrderId
    ) {
      return;
    }

    this.loadDashboard();
  }

  private updateOrderToReady(
    order: DashboardOrder
  ): void {
    if (this.updatingOrderId) return;

    this.updatingOrderId = order.id;

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

  private recalculateDashboardTotals(): void {
    if (!this.dashboard) return;

    this.dashboard = {
      ...this.dashboard,
      dates: this.deliveryDays,
      totalOrders: this.totalOrders,
      processingOrders: this.processingOrders,
      readyOrders: this.readyOrders
    };
  }

  private startOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  private addDays(
    date: Date,
    days: number
  ): Date {
    const result = new Date(date);

    result.setDate(
      result.getDate() + days
    );

    return result;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    const message = error?.error?.message;

    if (
      typeof message === 'string' &&
      message.trim()
    ) {
      return message.trim();
    }

    const legacyMessage = error?.error?.error;

    if (
      typeof legacyMessage === 'string' &&
      legacyMessage.trim()
    ) {
      return legacyMessage.trim();
    }

    return fallback;
  }
}