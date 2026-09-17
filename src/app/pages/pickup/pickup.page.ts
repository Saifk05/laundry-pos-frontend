import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { OlaMaps } from 'olamaps-web-sdk';
import { ApiService } from '../../../core/services/api.service';
import { PickupDelivery, PickupDeliveryStatus } from '../../../core/models/pickup-delivery.model';
import { environment } from '../../../environments/environment';

type PickupViewTab = 'MAP' | 'ORDERS';

interface MapCluster {
  pickups: PickupDelivery[];
  latitude: number;
  longitude: number;
}

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

  private readonly olaMaps = new OlaMaps({ apiKey: environment.olaMapsApiKey });
  private map: any = null;
  private mapReady = false;
  private markers: any[] = [];
  private popups: any[] = [];
  private popupByPickupId = new Map<string, any>();
  private zoomListenerRegistered = false;
  private renderTimer: any = null;

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPickupDeliveries();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.activeTab === 'MAP') this.initializeMap();
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.renderTimer) clearTimeout(this.renderTimer);
    this.clearMarkers();
    this.map?.remove?.();
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
        this.renderMarkers();
      }, 250);
    }, 100);
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

      this.map = await this.olaMaps.init({
        style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
        container: 'pickupOlaMap',
        center: [77.5946, 12.9716],
        zoom: 11
      });

      this.mapReady = true;
      this.mapLoading = false;

      try {
        this.map.addControl?.(this.olaMaps.addNavigationControls(), 'top-right');
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
      if (this.renderTimer) clearTimeout(this.renderTimer);
      this.renderTimer = setTimeout(() => this.renderMarkers(), 50);
    });
  }

  loadPickupDeliveries(): void {
    this.loading = true;

    this.apiService.getPickupDeliveries(this.selectedType).subscribe({
      next: response => {
        this.pickups = response ?? [];
        this.applyFilters(false);
        this.loading = false;

        if (this.activeTab === 'MAP') {
          setTimeout(() => this.renderMarkers(), 100);
        }
      },
      error: () => {
        this.pickups = [];
        this.filteredPickups = [];
        this.selectedPickup = null;
        this.loading = false;
        this.renderMarkers();
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

      const matchesDate = !this.selectedDate || pickup.scheduledDate === this.selectedDate;
      const matchesSlot = !this.selectedTimeSlot || pickup.timeSlot === this.selectedTimeSlot;
      const matchesStatus = !this.selectedStatus || pickup.status === this.selectedStatus;

      return matchesSearch && matchesDate && matchesSlot && matchesStatus;
    });

    if (this.selectedPickup && !this.filteredPickups.some(p => p.id === this.selectedPickup?.id)) {
      this.selectedPickup = null;
    }

    if (refreshMap && this.activeTab === 'MAP') this.renderMarkers();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedDate = '';
    this.selectedTimeSlot = '';
    this.selectedStatus = '';
    this.selectedType = 'ALL';
    this.statusMenuPickup = null;
    this.selectedPickup = null;
    this.loadPickupDeliveries();
  }

  changeType(): void {
    this.statusMenuPickup = null;
    this.selectedStatus = '';
    this.loadPickupDeliveries();
  }

  openStatusMenu(pickup: PickupDelivery): void {
    this.statusMenuPickup = this.statusMenuPickup?.id === pickup.id ? null : pickup;
  }

  closeStatusMenu(): void {
    this.statusMenuPickup = null;
  }

  selectStatus(pickup: PickupDelivery, status: PickupDeliveryStatus): void {
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
    return status.toLowerCase().replace(/_/g, '-');
  }

  private getMappedRecords(): PickupDelivery[] {
    return this.filteredPickups.filter(p => {
      if (p.latitude === null || p.longitude === null) return false;

      const lat = Number(p.latitude);
      const lng = Number(p.longitude);

      return Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;
    });
  }

  private renderMarkers(): void {
    if (!this.mapReady || !this.map) return;

    this.clearMarkers();

    const records = this.getMappedRecords();
    if (!records.length) return;

    const zoom = Number(this.map.getZoom?.() ?? 11);
    const clusters = this.createClusters(records, zoom);

    for (const cluster of clusters) {
      if (cluster.pickups.length === 1) {
        this.addCustomerMarker(cluster.pickups[0]);
      } else {
        this.addClusterMarker(cluster);
      }
    }

    this.updateMarkerSelection();
  }

  private createClusters(records: PickupDelivery[], zoom: number): MapCluster[] {
    if (zoom >= 14) {
      return records.map(p => ({
        pickups: [p],
        latitude: Number(p.latitude),
        longitude: Number(p.longitude)
      }));
    }

    const clusters: MapCluster[] = [];
    const threshold = this.getClusterThreshold(zoom);

    for (const pickup of records) {
      const lat = Number(pickup.latitude);
      const lng = Number(pickup.longitude);

      let nearest: MapCluster | null = null;
      let nearestDistance = Infinity;

      for (const cluster of clusters) {
        const distance = this.distance(lat, lng, cluster.latitude, cluster.longitude);

        if (distance <= threshold && distance < nearestDistance) {
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

      nearest.latitude =
        nearest.pickups.reduce((sum, p) => sum + Number(p.latitude), 0) /
        nearest.pickups.length;

      nearest.longitude =
        nearest.pickups.reduce((sum, p) => sum + Number(p.longitude), 0) /
        nearest.pickups.length;
    }

    return clusters;
  }

  private getClusterThreshold(zoom: number): number {
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

  private distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const r = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

    return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRadians(value: number): number {
    return value * (Math.PI / 180);
  }

  private addClusterMarker(cluster: MapCluster): void {
    if (cluster.pickups.length === 1) {
      this.addCustomerMarker(cluster.pickups[0]);
      return;
    }

    const element = document.createElement('button');

    element.type = 'button';
    element.className = 'customer-cluster-marker';
    element.setAttribute('aria-label', `${cluster.pickups.length} locations`);
    element.innerHTML = `<span>${cluster.pickups.length}</span>`;

    Object.assign(element.style, {
      width: '46px',
      height: '46px',
      borderRadius: '50%',
      border: '4px solid #ffffff',
      background: '#2563eb',
      color: '#ffffff',
      fontWeight: '800',
      fontSize: '15px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 3px 10px rgba(0,0,0,.25)'
    });

    const marker = this.olaMaps
      .addMarker({ element, anchor: 'center' })
      .setLngLat([cluster.longitude, cluster.latitude])
      .addTo(this.map);

    element.addEventListener('click', event => {
      event.stopPropagation();

      const currentZoom = Number(this.map.getZoom?.() ?? 10);

      this.map.flyTo?.({
        center: [cluster.longitude, cluster.latitude],
        zoom: Math.min(currentZoom + 2, 16),
        essential: true
      });
    });

    this.markers.push(marker);
  }

  private addCustomerMarker(pickup: PickupDelivery): void {
    if (pickup.latitude === null || pickup.longitude === null) return;

    const lat = Number(pickup.latitude);
    const lng = Number(pickup.longitude);
    const element = this.createMarkerElement(pickup);

    const popup = this.olaMaps
      .addPopup({
        offset: [0, -28],
        closeButton: false,
        closeOnClick: false,
        className: 'laundry-map-popup'
      })
      .setDOMContent(this.createPopupElement(pickup));

    const marker = this.olaMaps
      .addMarker({ element, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(this.map);

    element.addEventListener('mouseenter', () => {
      this.closeAllPopups();
      popup.setLngLat([lng, lat]).addTo(this.map);
    });

    element.addEventListener('mouseleave', () => {
      if (this.selectedPickup?.id !== pickup.id) popup.remove?.();
    });

    element.addEventListener('click', event => {
      event.stopPropagation();

      this.selectedPickup = pickup;
      this.closeAllPopups();

      popup.setLngLat([lng, lat]).addTo(this.map);

      this.map.flyTo?.({
        center: [lng, lat],
        zoom: 16.5,
        essential: true
      });

      this.updateMarkerSelection();
    });

    this.markers.push(marker);
    this.popups.push(popup);
    this.popupByPickupId.set(pickup.id, popup);
  }

  private createMarkerElement(pickup: PickupDelivery): HTMLElement {
    const marker = document.createElement('button');

    marker.type = 'button';
    marker.className =
      `customer-map-pin ${pickup.type === 'PICKUP' ? 'pickup-pin' : 'delivery-pin'}`;

    marker.dataset['pickupId'] = pickup.id;
    marker.setAttribute('aria-label', `${pickup.type}: ${pickup.customerName}`);

    marker.innerHTML = `
      <span class="pin-head">
        <span class="pin-icon">${pickup.type === 'PICKUP' ? '↑' : '↓'}</span>
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
        <strong class="popup-status ${this.getStatusClass(pickup.status)}">
          ${this.escapeHtml(status)}
        </strong>
      </div>
    `;

    return container;
  }

  selectPickup(pickup: PickupDelivery): void {
    this.selectedPickup = pickup;

    if (
      pickup.latitude === null ||
      pickup.longitude === null ||
      !this.mapReady ||
      !this.map
    ) return;

    this.closeAllPopups();

    this.map.flyTo?.({
      center: [Number(pickup.longitude), Number(pickup.latitude)],
      zoom: 16.5,
      essential: true
    });

    setTimeout(() => {
      this.renderMarkers();

      setTimeout(() => {
        const popup = this.popupByPickupId.get(pickup.id);

        popup
          ?.setLngLat?.([Number(pickup.longitude), Number(pickup.latitude)])
          ?.addTo?.(this.map);

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
    document.querySelectorAll('.customer-map-pin').forEach(element => {
      const marker = element as HTMLElement;

      marker.classList.toggle(
        'selected',
        marker.dataset['pickupId'] === this.selectedPickup?.id
      );
    });
  }

  private closeAllPopups(): void {
    for (const popup of this.popups) popup?.remove?.();
  }

  private clearMarkers(): void {
    this.closeAllPopups();

    for (const marker of this.markers) marker?.remove?.();

    this.markers = [];
    this.popups = [];
    this.popupByPickupId.clear();
  }

  private fitAllMarkers(): void {
    if (!this.mapReady || !this.map) return;

    const records = this.getMappedRecords();
    if (!records.length) return;

    if (records.length === 1) {
      const pickup = records[0];

      this.map.flyTo?.({
        center: [Number(pickup.longitude), Number(pickup.latitude)],
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
      const lng = Number(pickup.longitude);
      const lat = Number(pickup.latitude);

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

  updateStatus(pickup: PickupDelivery, status: PickupDeliveryStatus): void {
    if (pickup.status === status) return;

    this.apiService.updatePickupDeliveryStatus(pickup.id, status).subscribe({
      next: updated => {
        const index = this.pickups.findIndex(item => item.id === updated.id);

        if (index !== -1) this.pickups[index] = updated;
        if (this.selectedPickup?.id === updated.id) this.selectedPickup = updated;

        this.applyFilters();
      }
    });
  }

  get pickupCount(): number {
    return this.filteredPickups.filter(p => p.type === 'PICKUP').length;
  }

  get deliveryCount(): number {
    return this.filteredPickups.filter(p => p.type === 'DELIVERY').length;
  }

  get mappedCount(): number {
    return this.getMappedRecords().length;
  }

  private escapeHtml(value: string): string {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
  }
}