import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { OlaMaps } from 'olamaps-web-sdk';

import { ApiService } from '../../../core/services/api.service';
import {
  PickupDelivery,
  PickupDeliveryStatus
} from '../../../core/models/pickup-delivery.model';
import { environment } from '../../../environments/environment';

type PickupViewTab = 'MAP' | 'ORDERS';

@Component({
  selector: 'app-pickup',
  templateUrl: './pickup.page.html',
  styleUrls: ['./pickup.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule]
})
export class PickupPage implements OnInit, AfterViewInit, OnDestroy {

  activeTab: PickupViewTab = 'MAP';

  searchText = '';
  selectedDate = '';
  selectedTimeSlot = '';
  selectedStatus = '';
  selectedType: 'ALL' | 'PICKUP' | 'DELIVERY' = 'ALL';

  loading = false;
  mapLoading = true;
  mapError = '';

  pickups: PickupDelivery[] = [];
  filteredPickups: PickupDelivery[] = [];
  selectedPickup: PickupDelivery | null = null;
  statusMenuPickup: PickupDelivery | null = null;

  timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM'
  ];

  private readonly olaMaps = new OlaMaps({
    apiKey: environment.olaMapsApiKey
  });

  private map: any = null;
  private markers: any[] = [];
  private popups: any[] = [];
  private markerByPickupId = new Map<string, any>();
  private popupByPickupId = new Map<string, any>();
  private mapReady = false;

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPickupDeliveries();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.activeTab === 'MAP') {
        this.initializeMap();
      }
    }, 200);
  }

  ngOnDestroy(): void {
    this.clearMarkers();

    if (this.map?.remove) {
      this.map.remove();
    }

    this.map = null;
    this.mapReady = false;
  }

setActiveTab(tab: PickupViewTab): void {
  if (this.activeTab === tab) return;

  this.activeTab = tab;
  this.statusMenuPickup = null;

  if (tab !== 'MAP') return;

  setTimeout(() => {
    if (!this.mapReady || !this.map) {
      this.initializeMap();
      return;
    }

    this.map.resize?.();

    requestAnimationFrame(() => {
      this.map.resize?.();
      this.map.triggerRepaint?.();
    });

    setTimeout(() => {
      this.map.resize?.();
      this.map.triggerRepaint?.();
    }, 250);
  }, 100);
}

  private async initializeMap(): Promise<void> {
    if (this.mapReady && this.map) {
      this.map.resize?.();
      this.refreshMapMarkers();
      return;
    }

    try {
      this.mapLoading = true;
      this.mapError = '';

      this.map = await this.olaMaps.init({
        style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
        container: 'pickupOlaMap',
        center: [77.5946, 12.9716],
        zoom: 11
      });

      this.mapReady = true;
      this.mapLoading = false;

      if (this.map?.addControl) {
        try {
          this.map.addControl(
            this.olaMaps.addNavigationControls(),
            'top-right'
          );
        } catch {}
      }

      this.refreshMapMarkers();

      setTimeout(() => {
        this.map?.resize?.();
      }, 300);

    } catch (error) {
      console.error('Failed to initialize Ola Maps', error);

      this.mapLoading = false;
      this.mapError =
        'Unable to load Ola Maps. Check the Web API key and allowed domain.';
    }
  }

  loadPickupDeliveries(): void {
    this.loading = true;

    this.apiService
      .getPickupDeliveries(this.selectedType)
      .subscribe({
        next: response => {
          this.pickups = response ?? [];
          this.applyFilters(false);
          this.loading = false;

          if (this.activeTab === 'MAP') {
            setTimeout(() => {
              this.refreshMapMarkers();
            }, 100);
          }
        },

        error: error => {
          console.error(
            'Failed to load pickup/delivery records',
            error
          );

          this.pickups = [];
          this.filteredPickups = [];
          this.selectedPickup = null;
          this.loading = false;

          this.refreshMapMarkers();
        }
      });
  }

  applyFilters(refreshMap = true): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredPickups = this.pickups.filter(pickup => {

      const matchesSearch =
        !search ||
        pickup.customerName.toLowerCase().includes(search) ||
        pickup.phoneNumber.includes(search) ||
        pickup.address.toLowerCase().includes(search);

      const matchesDate =
        !this.selectedDate ||
        pickup.scheduledDate === this.selectedDate;

      const matchesSlot =
        !this.selectedTimeSlot ||
        pickup.timeSlot === this.selectedTimeSlot;

      const matchesStatus =
        !this.selectedStatus ||
        pickup.status === this.selectedStatus;

      return (
        matchesSearch &&
        matchesDate &&
        matchesSlot &&
        matchesStatus
      );
    });

    if (
      this.selectedPickup &&
      !this.filteredPickups.some(
        pickup => pickup.id === this.selectedPickup?.id
      )
    ) {
      this.selectedPickup = null;
    }

    if (refreshMap && this.activeTab === 'MAP') {
      this.refreshMapMarkers();
    }
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedDate = '';
    this.selectedTimeSlot = '';
    this.selectedStatus = '';
    this.selectedType = 'ALL';
    this.statusMenuPickup = null;

    this.loadPickupDeliveries();
  }

  changeType(): void {
    this.statusMenuPickup = null;
    this.selectedStatus = '';
    this.loadPickupDeliveries();
  }

  openStatusMenu(pickup: PickupDelivery): void {
    if (this.statusMenuPickup?.id === pickup.id) {
      this.statusMenuPickup = null;
      return;
    }

    this.statusMenuPickup = pickup;
  }

  closeStatusMenu(): void {
    this.statusMenuPickup = null;
  }

  selectStatus(
    pickup: PickupDelivery,
    status: PickupDeliveryStatus
  ): void {
    this.statusMenuPickup = null;
    this.updateStatus(pickup, status);
  }

  getStatusLabel(status: PickupDeliveryStatus): string {
    const labels: Record<PickupDeliveryStatus, string> = {
      PENDING: 'Pending',
      ASSIGNED_FOR_PICKUP: 'Assigned for Pickup',
      OUT_FOR_PICKUP: 'Out for Pickup',
      PICKED_UP: 'Picked Up',
      RECEIVED_AT_STORE: 'Received at Store',
      ASSIGNED_FOR_DELIVERY: 'Assigned for Delivery',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered'
    };

    return labels[status];
  }

  getStatusClass(status: PickupDeliveryStatus): string {
    return status
      .toLowerCase()
      .replace(/_/g, '-');
  }

  selectPickup(pickup: PickupDelivery): void {
    this.selectedPickup = pickup;

    if (
      pickup.latitude === null ||
      pickup.longitude === null ||
      !this.mapReady ||
      !this.map
    ) {
      return;
    }

    this.closeAllPopups();

    this.map.flyTo?.({
      center: [
        pickup.longitude,
        pickup.latitude
      ],
      zoom: 16.5,
      essential: true
    });

    const popup =
      this.popupByPickupId.get(pickup.id);

    popup?.setLngLat?.([
      pickup.longitude,
      pickup.latitude
    ]);

    popup?.addTo?.(this.map);

    this.updateMarkerSelection();
  }

  resetMapView(): void {
    this.selectedPickup = null;
    this.closeAllPopups();
    this.updateMarkerSelection();
    this.fitAllMarkers();
  }

  private refreshMapMarkers(): void {
    if (!this.mapReady || !this.map) return;

    this.clearMarkers();

    const records =
      this.filteredPickups.filter(
        pickup =>
          pickup.latitude !== null &&
          pickup.longitude !== null
      );

    if (!records.length) return;

    for (const pickup of records) {
      this.addCustomerMarker(pickup);
    }

    setTimeout(() => {
      this.map?.resize?.();
      this.fitAllMarkers();
    }, 50);
  }

  private addCustomerMarker(
    pickup: PickupDelivery
  ): void {

    if (
      pickup.latitude === null ||
      pickup.longitude === null
    ) {
      return;
    }

    const element =
      this.createMarkerElement(pickup);

    const popupElement =
      this.createPopupElement(pickup);

    const popup = this.olaMaps
      .addPopup({
        offset: [0, -28],
        closeButton: false,
        closeOnClick: false,
        className: 'laundry-map-popup'
      })
      .setDOMContent(popupElement);

    const marker = this.olaMaps
      .addMarker({
        element,
        anchor: 'bottom'
      })
      .setLngLat([
        pickup.longitude,
        pickup.latitude
      ])
      .addTo(this.map);

    element.addEventListener(
      'mouseenter',
      () => {

        this.closeAllPopups();

        popup
          .setLngLat([
            pickup.longitude!,
            pickup.latitude!
          ])
          .addTo(this.map);
      }
    );

    element.addEventListener(
      'mouseleave',
      () => {

        if (
          this.selectedPickup?.id !==
          pickup.id
        ) {
          popup.remove?.();
        }
      }
    );

    element.addEventListener(
      'click',
      event => {

        event.stopPropagation();

        this.selectedPickup = pickup;

        this.closeAllPopups();

        popup
          .setLngLat([
            pickup.longitude!,
            pickup.latitude!
          ])
          .addTo(this.map);

        this.map.flyTo?.({
          center: [
            pickup.longitude!,
            pickup.latitude!
          ],
          zoom: 16.5,
          essential: true
        });

        this.updateMarkerSelection();
      }
    );

    this.markers.push(marker);
    this.popups.push(popup);

    this.markerByPickupId.set(
      pickup.id,
      marker
    );

    this.popupByPickupId.set(
      pickup.id,
      popup
    );
  }

  private createMarkerElement(
    pickup: PickupDelivery
  ): HTMLElement {

    const marker =
      document.createElement('button');

    marker.type = 'button';

    marker.className =
      `customer-map-pin ${
        pickup.type === 'PICKUP'
          ? 'pickup-pin'
          : 'delivery-pin'
      }`;

    marker.dataset['pickupId'] =
      pickup.id;

    marker.setAttribute(
      'aria-label',
      `${pickup.type}: ${pickup.customerName}`
    );

    marker.innerHTML = `
      <span class="pin-head">
        <span class="pin-icon">
          ${pickup.type === 'PICKUP' ? '↑' : '↓'}
        </span>
      </span>
      <span class="pin-point"></span>
    `;

    return marker;
  }

  private createPopupElement(
    pickup: PickupDelivery
  ): HTMLElement {

    const container =
      document.createElement('div');

    container.className =
      'customer-map-popup-content';

    const typeLabel =
      pickup.type === 'PICKUP'
        ? 'Pickup'
        : 'Delivery';

    const status =
      this.getStatusLabel(pickup.status);

    const typeClass =
      pickup.type === 'PICKUP'
        ? 'pickup'
        : 'delivery';

    container.innerHTML = `
      <div class="popup-customer-header">

        <div class="popup-avatar">
          ${this.escapeHtml(
            pickup.customerName
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div class="popup-customer-name">
          <strong>
            ${this.escapeHtml(
              pickup.customerName
            )}
          </strong>

          <span>
            ${this.escapeHtml(
              pickup.phoneNumber
            )}
          </span>
        </div>

        <span class="popup-type ${typeClass}">
          ${typeLabel}
        </span>

      </div>

      <div class="popup-address">
        <span class="popup-location-icon">●</span>

        <span>
          ${this.escapeHtml(
            pickup.address
          )}
        </span>
      </div>

      <div class="popup-meta">

        <div>
          <span>Date</span>
          <strong>
            ${this.escapeHtml(
              pickup.scheduledDate
            )}
          </strong>
        </div>

        <div>
          <span>Time</span>
          <strong>
            ${this.escapeHtml(
              pickup.timeSlot
            )}
          </strong>
        </div>

      </div>

      <div class="popup-status-row">

        <span>Status</span>

        <strong class="popup-status ${this.getStatusClass(
          pickup.status
        )}">
          ${this.escapeHtml(status)}
        </strong>

      </div>
    `;

    return container;
  }

  private updateMarkerSelection(): void {
    document
      .querySelectorAll('.customer-map-pin')
      .forEach(element => {

        const marker =
          element as HTMLElement;

        marker.classList.toggle(
          'selected',
          marker.dataset['pickupId'] ===
            this.selectedPickup?.id
        );
      });
  }

  private closeAllPopups(): void {
    for (const popup of this.popups) {
      popup?.remove?.();
    }
  }

  private clearMarkers(): void {
    this.closeAllPopups();

    for (const marker of this.markers) {
      marker?.remove?.();
    }

    this.markers = [];
    this.popups = [];

    this.markerByPickupId.clear();
    this.popupByPickupId.clear();
  }

  private fitAllMarkers(): void {
    if (!this.mapReady || !this.map) return;

    const records =
      this.filteredPickups.filter(
        pickup =>
          pickup.latitude !== null &&
          pickup.longitude !== null
      );

    if (!records.length) return;

    if (records.length === 1) {

      const pickup = records[0];

      this.map.flyTo?.({
        center: [
          pickup.longitude!,
          pickup.latitude!
        ],
        zoom: 15,
        essential: true
      });

      return;
    }

    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    for (const pickup of records) {

      const lng = pickup.longitude!;
      const lat = pickup.latitude!;

      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }

    this.map.fitBounds?.(
      [
        [minLng, minLat],
        [maxLng, maxLat]
      ],
      {
        padding: 70,
        maxZoom: 15,
        duration: 700
      }
    );
  }

  updateStatus(
    pickup: PickupDelivery,
    status: PickupDeliveryStatus
  ): void {

    if (pickup.status === status) return;

    this.apiService
      .updatePickupDeliveryStatus(
        pickup.id,
        status
      )
      .subscribe({

        next: updated => {

          const index =
            this.pickups.findIndex(
              item => item.id === updated.id
            );

          if (index !== -1) {
            this.pickups[index] = updated;
          }

          if (
            this.selectedPickup?.id ===
            updated.id
          ) {
            this.selectedPickup = updated;
          }

          this.applyFilters();
        },

        error: error => {
          console.error(
            'Failed to update status',
            error
          );
        }
      });
  }

  get pickupCount(): number {
    return this.filteredPickups.filter(
      pickup =>
        pickup.type === 'PICKUP'
    ).length;
  }

  get deliveryCount(): number {
    return this.filteredPickups.filter(
      pickup =>
        pickup.type === 'DELIVERY'
    ).length;
  }

  get mappedCount(): number {
    return this.filteredPickups.filter(
      pickup =>
        pickup.latitude !== null &&
        pickup.longitude !== null
    ).length;
  }

  private escapeHtml(value: string): string {
    const div =
      document.createElement('div');

    div.textContent = value ?? '';

    return div.innerHTML;
  }
}