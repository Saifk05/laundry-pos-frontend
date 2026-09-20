import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDateFormats,
  MatNativeDateModule,
  NativeDateAdapter
} from '@angular/material/core';
import { OlaMaps } from 'olamaps-web-sdk';
import { ApiService } from 'src/core/services/api.service';
import {
  PickupDelivery,
  PickupDeliveryStatus
} from 'src/core/models/pickup-delivery.model';
import { environment } from 'src/environments/environment';

interface MapCluster {
  pickups: PickupDelivery[];
  latitude: number;
  longitude: number;
}

class DdMmYyyyDateAdapter extends NativeDateAdapter {
  override format(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  override parse(value: any): Date | null {
    if (!value) return null;

    if (value instanceof Date) return value;

    if (typeof value === 'string') {
      const parts = value.trim().split('/');

      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]);
        const year = Number(parts[2]);

        const date = new Date(year, month - 1, day);

        if (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
) {
          return date;
        }
      }
    }

    return null;
  }
}

const DD_MM_YYYY_FORMATS: MatDateFormats = {
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

@Component({
  selector: 'app-pickup',
  templateUrl: './pickup.page.html',
  styleUrls: ['./pickup.page.scss'],
  standalone: true,
  imports: [
    IonContent,
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
      useClass: DdMmYyyyDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: DD_MM_YYYY_FORMATS
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-GB'
    }
]
})
export class PickupPage implements OnInit, AfterViewInit, OnDestroy {
  searchText = '';
  selectedDate = new FormControl<Date | null>(new Date());
  selectedTimeSlot = '';
  selectedStatus = '';
  selectedType: 'ALL' | 'PICKUP' | 'DELIVERY' = 'ALL';
  hoveredPickupId: string | null = null;
  loading = false;
  mapLoading = true;
  mapError = '';

  pickups: PickupDelivery[] = [];
  filteredPickups: PickupDelivery[] = [];
  selectedPickup: PickupDelivery | null = null;
  statusMenuPickup: PickupDelivery | null = null;

  pageSize = 10;
  currentPage = 1;
  nextCursor: string | null = null;
  hasMore = false;
  cursorHistory: (string | null)[] = [null];
  totalRecords = 0;
  totalPickupCount = 0;
  totalDeliveryCount = 0;
  totalMappedCount = 0;
  timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM'
  ];

  private readonly olaMaps = new OlaMaps({
    apiKey: environment.olaMapsApiKey
  });

  private map: any = null;
  private mapReady = false;
  private markers: any[] = [];
  private popups: any[] = [];
  private popupByPickupId = new Map<string, any>();
  private zoomListenerRegistered = false;
  private renderTimer: any = null;

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
) {}

  ngOnInit(): void {
    this.selectedDate.setValue(new Date(), {
      emitEvent: false
    });

    this.loadPickupDeliveries();
  }

  ngAfterViewInit():void{setTimeout(()=>this.initializeMap(),200);}

  ngOnDestroy(): void {
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
    }

    this.clearMarkers();

    this.map?.remove?.();

    this.map = null;
    this.mapReady = false;
  }

  private async initializeMap(): Promise<void> {
    if (this.mapReady && this.map) {
      this.map.resize?.();
      this.renderMarkers();
      return;
    }

    try {
      this.mapLoading = true;
      this.mapError = '';
        this.map=await this.olaMaps.init({
          style:'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
          container:'pickupOlaMap',
          center:[77.5946,12.9716],
          zoom:11
        });
      this.mapReady = true;
      this.mapLoading = false;

      try {
        this.map.addControl?.(
          this.olaMaps.addNavigationControls(),
          'top-right'
);
      } catch {}

      this.registerMapEvents();

      setTimeout(() => {
        this.map?.resize?.();
        this.renderMarkers();
        this.fitAllMarkers();
      }, 300);
    } catch {
      this.mapLoading = false;
      this.mapError = 'Unable to initialize Ola Maps.';
    }
  }

  private registerMapEvents(): void {
    if (!this.map || this.zoomListenerRegistered) return;

    this.zoomListenerRegistered = true;

    this.map.on?.('zoomend', () => {
      if (this.renderTimer) {
        clearTimeout(this.renderTimer);
      }

      this.renderTimer = setTimeout(
        () => this.renderMarkers(),
        50
);
    });
  }

  loadPickupDeliveries(
    cursor: string | null = null,
    page = 1
): void {
    if (this.loading) return;

    this.loading = true;

    this.apiService
      .getPickupDeliveries(
        this.selectedType,
        this.formatApiDate(this.selectedDate.value),
        (this.selectedStatus || null) as PickupDeliveryStatus | null,
        this.selectedTimeSlot || null,
        this.searchText.trim() || null,
        cursor,
        this.pageSize
)
      .subscribe({
        next: response => {
          this.pickups = response.items ?? [];
          this.nextCursor = response.nextCursor ?? null;
          this.hasMore = response.hasMore ?? false;
          this.totalRecords = response.total ?? 0;
          this.totalPickupCount = response.pickupCount ?? 0;
          this.totalDeliveryCount = response.deliveryCount ?? 0;
          this.totalMappedCount = response.mappedCount ?? 0;
          this.currentPage = page;

          this.applyFilters(false);

          this.loading = false;

          setTimeout(()=>{this.map?.resize?.();this.renderMarkers();this.fitAllMarkers();},100);
        },
        error: error => {
          console.error(
            'Unable to load pickup/delivery records:',
            error
);

          this.pickups = [];
          this.filteredPickups = [];
          this.selectedPickup = null;
          this.nextCursor = null;
          this.hasMore = false;
          this.totalRecords = 0;
          this.totalPickupCount = 0;
          this.totalDeliveryCount = 0;
          this.totalMappedCount = 0;
          this.loading = false;

          this.renderMarkers();
        }
      });
  }

  nextPage(): void {
    if (
      this.loading ||
      !this.hasMore ||
      !this.nextCursor
) {
      return;
    }

    const page = this.currentPage + 1;

    this.cursorHistory[page - 1] =
      this.nextCursor;

    this.loadPickupDeliveries(
      this.nextCursor,
      page
);
  }

  previousPage(): void {
    if (
      this.loading ||
      this.currentPage <= 1
) {
      return;
    }

    const page = this.currentPage - 1;

    const cursor =
      this.cursorHistory[page - 1] ?? null;

    this.loadPickupDeliveries(
      cursor,
      page
);
  }

  changePageSize(): void {
    this.resetPagination();
    this.loadPickupDeliveries(null, 1);
  }

  private resetPagination(): void {
    this.currentPage = 1;
    this.nextCursor = null;
    this.hasMore = false;
    this.cursorHistory = [null];
  }

  applyFilters(refreshMap = true): void {
  const search = this.searchText.trim().toLowerCase();
  const selectedDate = this.selectedDate.value;

  this.filteredPickups = this.pickups.filter(pickup => {

    const matchesSearch =
      !search ||
      pickup.customerName.toLowerCase().includes(search) ||
      pickup.phoneNumber.includes(search) ||
      pickup.address.toLowerCase().includes(search);

    const pickupDate = this.parseLocalDate(
      pickup.scheduledDate
);

    const matchesDate =
      !selectedDate ||
      (
        pickupDate.getFullYear() === selectedDate.getFullYear() &&
        pickupDate.getMonth() === selectedDate.getMonth() &&
        pickupDate.getDate() === selectedDate.getDate()
);

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
      item => item.id === this.selectedPickup?.id
)
) {
    this.selectedPickup = null;
  }

  if(refreshMap&&this.mapReady){this.renderMarkers();}
  }

  private parseLocalDate(
    value: string
): Date {
    const [year, month, day] =
      value.split('-').map(Number);

    return new Date(
      year,
      month - 1,
      day,
      0,
      0,
      0,
      0
);
  }

  private formatApiDate(date: Date | null): string | null {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  filterChanged(): void {
    this.statusMenuPickup = null;
    this.selectedPickup = null;
    this.resetPagination();
    this.loadPickupDeliveries(null, 1);
  }

  clearFilters(): void {
    this.searchText = '';

    this.selectedDate.setValue(
      new Date(),
      {
        emitEvent: false
      }
);

    this.selectedTimeSlot = '';
    this.selectedStatus = '';
    this.selectedType = 'ALL';
    this.statusMenuPickup = null;
    this.selectedPickup = null;

    this.resetPagination();

    this.loadPickupDeliveries(
      null,
      1
);
  }

  changeType(): void {
    this.statusMenuPickup = null;
    this.selectedStatus = '';
    this.selectedPickup = null;

    this.resetPagination();

    this.loadPickupDeliveries(
      null,
      1
);
  }

  openStatusMenu(
    pickup: PickupDelivery
): void {
    this.statusMenuPickup =
      this.statusMenuPickup?.id === pickup.id
        ? null
        : pickup;
  }

  closeStatusMenu(): void {
    this.statusMenuPickup = null;
  }

  selectStatus(
    pickup: PickupDelivery,
    status: PickupDeliveryStatus
): void {
    this.statusMenuPickup = null;

    this.updateStatus(
      pickup,
      status
);
  }

  getStatusLabel(
    status: PickupDeliveryStatus
): string {
    const labels:
      Record<
        PickupDeliveryStatus,
        string
      > = {
        PENDING: 'Pending',
        PICKED_UP: 'Picked Up',
        OUT_FOR_DELIVERY:
          'Out for Delivery',
        DELIVERED: 'Delivered',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled'
      };

    return labels[status];
  }

  getStatusClass(
    status: PickupDeliveryStatus
): string {
    return status
      .toLowerCase()
      .replace(/_/g, '-');
  }
  getNextStatus(pickup: PickupDelivery): PickupDeliveryStatus | null {
    if (pickup.type === 'PICKUP') {
      return pickup.status === 'PENDING' ? 'PICKED_UP' : null;
    }

    if (pickup.status === 'PENDING') return 'OUT_FOR_DELIVERY';
    if (pickup.status === 'OUT_FOR_DELIVERY') return 'DELIVERED';

    return null;
  }

  getNextStatusLabel(pickup: PickupDelivery): string {
    const status = this.getNextStatus(pickup);
    if (!status) return '';

    const labels: Partial<Record<PickupDeliveryStatus, string>> = {
      PICKED_UP: 'Mark Picked Up',
      OUT_FOR_DELIVERY: 'Mark Out for Delivery',
      DELIVERED: 'Mark Delivered'
    };

    return labels[status] ?? this.getStatusLabel(status);
  }

  getNextStatusButtonLabel(pickup: PickupDelivery): string {
    const status = this.getNextStatus(pickup);
    if (!status) return '';

    const labels: Partial<Record<PickupDeliveryStatus, string>> = {
      PICKED_UP: 'PICKED UP',
      OUT_FOR_DELIVERY: 'OUT FOR DELIVERY',
      DELIVERED: 'DELIVERED'
    };

    return labels[status] ?? this.getStatusLabel(status).toUpperCase();
  }

  canCancelPickup(pickup: PickupDelivery): boolean {
    return pickup.type === 'PICKUP' && pickup.status === 'PENDING';
  }

  cancelPickup(pickup: PickupDelivery): void {
    if (!this.canCancelPickup(pickup)) return;
    this.selectStatus(pickup, 'CANCELLED');
  }

  advanceStatus(pickup: PickupDelivery): void {
    const status = this.getNextStatus(pickup);
    if (status) this.updateStatus(pickup, status);
  }

  canCreateOrder(pickup: PickupDelivery): boolean {
    return pickup.type === 'PICKUP' && pickup.status === 'PICKED_UP';
  }

  createOrder(pickup: PickupDelivery): void {
    if (!this.canCreateOrder(pickup)) return;

    this.router.navigate(['/app/new-walk-in'], {
      queryParams: { pickupId: pickup.id }
    });
  }


private getMappedRecords(): PickupDelivery[] {
  return this.filteredPickups.filter(pickup => {

    // Do not display cancelled records on the map
    if (pickup.status === 'CANCELLED') {
      return false;
    }

    if (
      pickup.latitude === null ||
      pickup.longitude === null
) {
      return false;
    }

    const lat = Number(pickup.latitude);
    const lng = Number(pickup.longitude);

    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
);
  });
}

  private renderMarkers(): void {
    if (
      !this.mapReady ||
      !this.map
) {
      return;
    }

    this.clearMarkers();

    const records =
      this.getMappedRecords();

    if (!records.length) return;

    const zoom =
      Number(
        this.map.getZoom?.() ?? 11
);

    const clusters =
      this.createClusters(
        records,
        zoom
);

    for (const cluster of clusters) {
      if ( cluster.pickups.length === 1) {
        this.addCustomerMarker(
          cluster.pickups[0]
);
      } else {
        this.addClusterMarker(
          cluster
);
      }}
    this.updateMarkerSelection();
  }

  private createClusters(records: PickupDelivery[], zoom: number): MapCluster[] {
    if (zoom >= 14) {
      return records.map(
        pickup => ({ pickups: [pickup],
          latitude: Number( pickup.latitude),
          longitude:Number( pickup.longitude)
        })
);
    }

    const clusters: MapCluster[] = [];
    const threshold = this.getClusterThreshold(zoom);
    for (const pickup of records) {
      const lat = Number(pickup.latitude);
      const lng = Number(pickup.longitude);
      let nearest: MapCluster | null = null;
      let nearestDistance =  Infinity;

      for (const cluster of clusters) {
        const distance =
          this.distance(
            lat,
            lng,
            cluster.latitude,
            cluster.longitude
);

        if (
          distance <= threshold &&
          distance < nearestDistance) {
          nearest = cluster;
          nearestDistance = distance;
        }
      }

      if (!nearest) {
        clusters.push({
          pickups: [pickup],
          latitude: lat,
          longitude: lng
        });
        continue;
      }

      nearest.pickups.push(pickup);
      nearest.latitude = nearest.pickups.reduce(
          (sum, item) =>  sum +  Number(item.latitude), 0) /
        nearest.pickups.length;
      nearest.longitude = nearest.pickups.reduce(
          (sum, item) => sum + Number(item.longitude), 0) /
        nearest.pickups.length;
    }
    return clusters;
  }
  private getClusterThreshold( zoom: number): number {
    if (zoom <= 4) return 900;
    if (zoom <= 5) return 600;
    if (zoom <= 6) return 350;
    if (zoom <= 7) return 180;
    if (zoom <= 8) return 100;
    if (zoom <= 9) return 55;
    if (zoom <= 10) return 30;
    if (zoom <= 11) return 15;
    if (zoom <= 12) return 7;
    if (zoom <= 13) return 3;
    return 0;
  }

  private distance( lat1: number,lng1: number, lat2: number, lng2: number ): number {
    const r = 6371;
    const dLat = this.toRadians( lat2 - lat1 );
    const dLng = this.toRadians( lng2 - lng1 );
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos( this.toRadians(lat1) ) * Math.cos( this.toRadians(lat2)) * Math.sin( dLng / 2) ** 2;
    return ( r * 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1 - a)));
  }

  private toRadians( value: number ): number {
    return ( value *(Math.PI / 180));
  }

  private addClusterMarker(
    cluster: MapCluster
): void {
    if (
      cluster.pickups.length === 1
) {
      this.addCustomerMarker(
        cluster.pickups[0]
);

      return;
    }

    const element =
      document.createElement(
        'button'
);

    element.type = 'button';

    element.className =
      'customer-cluster-marker';

    element.setAttribute(
      'aria-label',
      `${cluster.pickups.length} locations`
);

    element.innerHTML =
      `<span>${cluster.pickups.length}</span>`;

    Object.assign(
      element.style,
      {
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        border:
          '4px solid #ffffff',
        background: '#2563eb',
        color: '#ffffff',
        fontWeight: '800',
        fontSize: '15px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          'center',
        boxShadow:
          '0 3px 10px rgba(0,0,0,.25)'
      }
);

    const marker =
      this.olaMaps
        .addMarker({
          element,
          anchor: 'center'
        })
        .setLngLat([
          cluster.longitude,
          cluster.latitude
])
        .addTo(this.map);

    element.addEventListener(
      'click',
      event => {
        event.stopPropagation();

        const currentZoom =
          Number(
            this.map.getZoom?.() ??
              10
);

        this.map.flyTo?.({
          center: [
            cluster.longitude,
            cluster.latitude
],
          zoom: Math.min(
            currentZoom + 2,
            16
),
          essential: true
        });
      }
);

    this.markers.push(marker);
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

    const lat =
      Number(pickup.latitude);

    const lng =
      Number(pickup.longitude);

    const element =
      this.createMarkerElement(
        pickup
);

    const popup =
      this.olaMaps
        .addPopup({
          offset: [0, -28],
          closeButton: false,
          closeOnClick: false,
          className:
            'laundry-map-popup'
        })
        .setDOMContent(
          this.createPopupElement(
            pickup
)
);

    const marker =
      this.olaMaps
        .addMarker({
          element,
          anchor: 'bottom'
        })
        .setLngLat([
          lng,
          lat
])
        .addTo(this.map);

    element.addEventListener('mouseenter', () => {
    this.hoveredPickupId = pickup.id;
    this.highlightHoveredRow();

    this.closeAllPopups();

    popup
      .setLngLat([lng, lat])
      .addTo(this.map);
  });

  element.addEventListener('mouseleave', () => {
    this.hoveredPickupId = null;
    this.highlightHoveredRow();

    if (this.selectedPickup?.id !== pickup.id) {
      popup.remove?.();
    }
  });

  

    element.addEventListener(
      'click',
      event => {
        event.stopPropagation();

        this.selectedPickup =
          pickup;

        this.closeAllPopups();

        popup
          .setLngLat([
            lng,
            lat
])
          .addTo(this.map);

        this.map.flyTo?.({
          center: [
            lng,
            lat
],
          zoom: 16.5,
          essential: true
        });

        this.updateMarkerSelection();
      }
);

    this.markers.push(marker);
    this.popups.push(popup);

    this.popupByPickupId.set(
      pickup.id,
      popup
);
  }

  private createMarkerElement(
    pickup: PickupDelivery
): HTMLElement {
    const marker =
      document.createElement(
        'button'
);

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
          ${
            pickup.type ===
            'PICKUP'
              ? '↑'
              : '↓'
          }
        </span>
      </span>
      <span class="pin-point"></span>
    `;

    return marker;
  }
  private createPopupElement(pickup: PickupDelivery): HTMLElement {
    const container = document.createElement('div');
    const typeLabel = pickup.type === 'PICKUP' ? 'Pickup' : 'Delivery';
    const typeClass = pickup.type === 'PICKUP' ? 'pickup' : 'delivery';
    const status = this.getStatusLabel(pickup.status);
    const nextStatus = this.getNextStatus(pickup);
    const canCreateOrder = this.canCreateOrder(pickup);
    const canCancel = this.canCancelPickup(pickup);

    container.className = 'customer-map-popup-content';

    container.innerHTML = `
      <div class="popup-customer-header">
        <div class="popup-avatar">${this.escapeHtml(pickup.customerName.charAt(0).toUpperCase())}</div>
        <div class="popup-customer-name">
          <strong>${this.escapeHtml(pickup.customerName)}</strong>
          <span>${this.escapeHtml(pickup.phoneNumber)}</span>
        </div>
        <span class="popup-type ${typeClass}">${typeLabel}</span>
      </div>

      <div class="popup-address">
        <span class="popup-location-icon">●</span>
        <span>${this.escapeHtml(pickup.address)}</span>
      </div>

      <div class="popup-meta">
        <div>
          <span>Date</span>
          <strong>${this.escapeHtml(pickup.scheduledDate)}</strong>
        </div>
        <div>
          <span>Time</span>
          <strong>${this.escapeHtml(pickup.timeSlot)}</strong>
        </div>
      </div>

      <div class="popup-status-row">
        <span>Status</span>
        <strong class="popup-status ${this.getStatusClass(pickup.status)}">${this.escapeHtml(status)}</strong>
      </div>

      ${
        nextStatus || canCreateOrder || canCancel
          ? `<div class="popup-action-section">
              ${
                nextStatus
                  ? `<button type="button" class="popup-status-action" data-popup-action="next-status">
                       ${this.escapeHtml(this.getNextStatusButtonLabel(pickup))}
                     </button>`
                  : ''
              }
              ${
                canCreateOrder
                  ? `<button type="button" class="popup-create-order-action" data-popup-action="create-order">
                       CREATE ORDER
                     </button>`
                  : ''
              }
              ${
                canCancel
                  ? `<button type="button" class="popup-cancel-action" data-popup-action="cancel">
                       CANCEL
                     </button>`
                  : ''
              }
            </div>`
          : ''
      }
    `;

    const nextStatusButton =
      container.querySelector<HTMLButtonElement>('[data-popup-action="next-status"]');

    nextStatusButton?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      const next = this.getNextStatus(pickup);
      if (!next) return;

      nextStatusButton.disabled = true;
      this.updateStatus(pickup, next);
    });

    const createOrderButton =
      container.querySelector<HTMLButtonElement>('[data-popup-action="create-order"]');

    createOrderButton?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.createOrder(pickup);
    });

    const cancelButton =
      container.querySelector<HTMLButtonElement>('[data-popup-action="cancel"]');

    cancelButton?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      cancelButton.disabled = true;
      this.cancelPickup(pickup);
    });

    return container;
  }


  selectPickup(
    pickup: PickupDelivery
): void {
    this.selectedPickup = pickup;

    if (
      pickup.latitude === null || pickup.longitude === null || !this.mapReady ||!this.map
) { return; }

    this.closeAllPopups();
    this.map.flyTo?.({
      center: [Number(pickup.longitude), Number(pickup.latitude)],
      zoom: 16.5, essential: true
    });

    setTimeout(() => {
      this.renderMarkers();
      setTimeout(() => { const popup = this.popupByPickupId.get(pickup.id);
        popup
          ?.setLngLat?.([
            Number(
              pickup.longitude
),
            Number(
              pickup.latitude
)
])
          ?.addTo?.(
            this.map
);

        this.updateMarkerSelection();
      }, 100);
    }, 500);
  }

  resetMapView(): void {
    this.selectedPickup = null;
    this.closeAllPopups();
    this.fitAllMarkers();
  }

  private updateMarkerSelection(): void {
    document .querySelectorAll( '.customer-map-pin' )
      .forEach(element => {
        const marker = element as HTMLElement;
        marker.classList.toggle( 'selected', marker.dataset['pickupId' ] === this.selectedPickup?.id );
      });
  }

  private highlightHoveredRow(): void {
    document.querySelectorAll<HTMLElement>('[data-pickup-row-id]').forEach(row => {
      const active = row.dataset['pickupRowId'] === this.hoveredPickupId;
      row.classList.toggle('map-pin-hovered', active);
      row.classList.toggle('map-pin-hovered-pickup', active && row.dataset['pickupType'] === 'PICKUP');
      row.classList.toggle('map-pin-hovered-delivery', active && row.dataset['pickupType'] === 'DELIVERY');
    });

    if (!this.hoveredPickupId) return;

    document.querySelector<HTMLElement>(
      `[data-pickup-row-id="${this.hoveredPickupId}"]`
    )?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }

  private closeAllPopups(): void {
    for (
      const popup of this.popups
) {
      popup?.remove?.();
    }
  }

  private clearMarkers(): void {
    this.closeAllPopups();
    for (const marker of this.markers) { marker?.remove?.(); }
    this.markers = [];
    this.popups = [];
    this.popupByPickupId.clear();
  }

  private fitAllMarkers(): void {
    if (!this.mapReady || !this.map) { return; }
    const records = this.getMappedRecords();
    if (!records.length) return;
    if (records.length === 1) {
      const pickup = records[0];
      this.map.flyTo?.({
        center: [
          Number(
            pickup.longitude
),
          Number(
            pickup.latitude
)
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

    for (
      const pickup of records
) {
      const lng =
        Number(
          pickup.longitude
);

      const lat =
        Number(
          pickup.latitude
);

      minLng =
        Math.min(
          minLng,
          lng
);

      maxLng =
        Math.max(
          maxLng,
          lng
);

      minLat =
        Math.min(
          minLat,
          lat
);

      maxLat =
        Math.max(
          maxLat,
          lat
);
    }

    this.map.fitBounds?.(
      [
        [
          minLng,
          minLat
],
        [
          maxLng,
          maxLat
]
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
    if (
      pickup.status === status
) {
      return;
    }

    this.apiService
      .updatePickupDeliveryStatus(
        pickup.id,
        status
)
      .subscribe({
        next: updated => {
          const index =
            this.pickups.findIndex(
              item =>
                item.id ===
                updated.id
);

          if (index !== -1) {
            this.pickups[index] =
              updated;
          }

          if (
            this.selectedPickup?.id ===
            updated.id
) {
            this.selectedPickup =
              updated;
          }

          this.statusMenuPickup =
            null;

          this.resetPagination();
          this.loadPickupDeliveries(null, 1);
        },
        error: error => {
          console.error(
            'Unable to update pickup/delivery status:',
            error
);

          this.statusMenuPickup =
            null;
        }
      });
  }

  get pickupCount(): number {
    return this.totalPickupCount;
  }

  get deliveryCount(): number {
    return this.totalDeliveryCount;
  }

  get mappedCount(): number {
    return this.totalMappedCount;
  }

  get totalCount(): number {
    return this.totalRecords;
  }

  private escapeHtml(value: string): string {
    const div = document.createElement( 'div' );
    div.textContent = value ?? '';
    return div.innerHTML;
  }
}
