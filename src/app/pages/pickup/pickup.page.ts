import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { OlaMaps } from 'olamaps-web-sdk';

import { ApiService } from '../../../core/services/api.service';
import {
  PickupDelivery,
  PickupDeliveryRequest,
  PickupDeliveryStatus,
  MapLocationResponse
} from '../../../core/models/pickup-delivery.model';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pickup',
  templateUrl: './pickup.page.html',
  styleUrls: ['./pickup.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule
  ]
})
export class PickupPage
  implements OnInit, AfterViewInit, OnDestroy {

  searchText = '';
  selectedDate = '';
  selectedTimeSlot = '';
  selectedStatus = '';
  selectedType: 'ALL' | 'PICKUP' | 'DELIVERY' = 'ALL';

  loading = false;
  savingPickup = false;
  showAddForm = false;
  searchingLocation = false;

  mapLoading = true;
  mapError = '';

  formError = '';
  newPickupGoogleMapLink = '';
  newPickupLocationMessage = '';

  pickups: PickupDelivery[] = [];
  filteredPickups: PickupDelivery[] = [];
  selectedPickup: PickupDelivery | null = null;

  locationSuggestions: MapLocationResponse[] = [];

  newPickup: PickupDeliveryRequest =
    this.createEmptyPickup();

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

  private markerByPickupId =
    new Map<string, any>();

  private popupByPickupId =
    new Map<string, any>();

  private locationSearchTimer:
    ReturnType<typeof setTimeout> | null = null;

  private mapReady = false;

  constructor(
    private readonly apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadPickupDeliveries();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeMap();
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.locationSearchTimer) {
      clearTimeout(this.locationSearchTimer);
    }

    this.clearMarkers();

    if (this.map?.remove) {
      this.map.remove();
    }

    this.map = null;
    this.mapReady = false;
  }

  private async initializeMap(): Promise<void> {
    try {
      this.mapLoading = true;
      this.mapError = '';

      this.map = await this.olaMaps.init({
        style:
          'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',

        container: 'pickupOlaMap',

        center: [
          77.5946,
          12.9716
        ],

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
        } catch {
        }
      }

      this.refreshMapMarkers();

      setTimeout(() => {
        this.map?.resize?.();
      }, 300);

    } catch (error) {
      console.error(
        'Failed to initialize Ola Maps',
        error
      );

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

          setTimeout(() => {
            this.refreshMapMarkers();
          }, 100);
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

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;

    if (this.showAddForm) {
      this.resetAddForm();
    }

    setTimeout(() => {
      this.map?.resize?.();
    }, 250);
  }

  cancelAddPickup(): void {
    this.showAddForm = false;
    this.resetAddForm();

    setTimeout(() => {
      this.map?.resize?.();
    }, 250);
  }

  private createEmptyPickup():
    PickupDeliveryRequest {

    return {
      customerName: '',
      phoneNumber: '',
      address: '',
      latitude: null,
      longitude: null,
      type: 'PICKUP',
      scheduledDate: this.getToday(),
      timeSlot: ''
    };
  }

  private resetAddForm(): void {
    this.newPickup =
      this.createEmptyPickup();

    this.newPickupGoogleMapLink = '';
    this.newPickupLocationMessage = '';

    this.locationSuggestions = [];
    this.searchingLocation = false;

    this.formError = '';
    this.savingPickup = false;

    if (this.locationSearchTimer) {
      clearTimeout(
        this.locationSearchTimer
      );

      this.locationSearchTimer = null;
    }
  }

  private getToday(): string {
    const date = new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  searchAddress(): void {
    const query =
      this.newPickup.address.trim();

    this.newPickup.latitude = null;
    this.newPickup.longitude = null;

    if (this.locationSearchTimer) {
      clearTimeout(
        this.locationSearchTimer
      );
    }

    if (query.length < 3) {
      this.locationSuggestions = [];
      this.searchingLocation = false;
      return;
    }

    this.searchingLocation = true;

    this.locationSearchTimer =
      setTimeout(() => {

        this.apiService
          .autocompleteLocation(query)
          .subscribe({
            next: response => {
              this.locationSuggestions =
                response ?? [];

              this.searchingLocation =
                false;
            },

            error: error => {
              console.error(
                'Address autocomplete failed',
                error
              );

              this.locationSuggestions = [];
              this.searchingLocation = false;
            }
          });

      }, 400);
  }

  selectLocation(
    location: MapLocationResponse
  ): void {

    const parts = [
      location.name,
      location.formattedAddress
    ].filter(
      value =>
        value &&
        value.trim()
    );

    this.newPickup.address =
      parts.join(', ') ||
      this.newPickup.address;

    this.newPickup.latitude =
      location.latitude;

    this.newPickup.longitude =
      location.longitude;

    this.locationSuggestions = [];
    this.searchingLocation = false;

    if (
      location.latitude !== null &&
      location.longitude !== null
    ) {
      this.previewLocation(
        location.latitude,
        location.longitude
      );
    }
  }

  resolveNewPickupLocation(): void {
    const link =
      this.newPickupGoogleMapLink.trim();

    if (!link) {
      this.newPickupLocationMessage =
        'Paste a Google Maps link first.';

      return;
    }

    this.newPickupLocationMessage =
      'Getting location...';

    this.apiService
      .resolveGoogleMapsLink(link)
      .subscribe({
        next: response => {

          if (
            response.latitude === null ||
            response.longitude === null
          ) {
            this.newPickupLocationMessage =
              'Location coordinates not found.';

            return;
          }

          this.newPickup.latitude =
            response.latitude;

          this.newPickup.longitude =
            response.longitude;

          if (response.formattedAddress) {
            this.newPickup.address =
              response.formattedAddress;
          }

          this.locationSuggestions = [];

          this.previewLocation(
            response.latitude,
            response.longitude
          );

          this.newPickupLocationMessage =
            'Location added successfully.';
        },

        error: error => {
          console.error(
            'Failed to resolve Google Maps location',
            error
          );

          this.newPickupLocationMessage =
            'Unable to read this Google Maps link.';
        }
      });
  }

  private previewLocation(
    latitude: number,
    longitude: number
  ): void {

    if (!this.mapReady || !this.map) {
      return;
    }

    this.map.flyTo?.({
      center: [
        longitude,
        latitude
      ],
      zoom: 16,
      essential: true
    });
  }

  savePickup(): void {
    this.formError = '';

    const customerName =
      this.newPickup.customerName.trim();

    const phoneNumber =
      this.newPickup.phoneNumber.trim();

    const address =
      this.newPickup.address.trim();

    if (!customerName) {
      this.formError =
        'Customer name is required.';
      return;
    }

    if (
      !/^\d{10}$/.test(phoneNumber)
    ) {
      this.formError =
        'Enter a valid 10 digit mobile number.';
      return;
    }

    if (!address) {
      this.formError =
        'Customer address is required.';
      return;
    }

    if (!this.newPickup.scheduledDate) {
      this.formError =
        'Scheduled date is required.';
      return;
    }

    if (!this.newPickup.timeSlot) {
      this.formError =
        'Time slot is required.';
      return;
    }

    if (
      this.newPickup.latitude === null ||
      this.newPickup.longitude === null
    ) {
      this.formError =
        'Please select or detect the customer location.';
      return;
    }

    const request:
      PickupDeliveryRequest = {

      ...this.newPickup,

      customerName,
      phoneNumber,
      address
    };

    this.savingPickup = true;

    this.apiService
      .createPickupDelivery(request)
      .subscribe({
        next: created => {

          this.savingPickup = false;
          this.showAddForm = false;

          this.resetAddForm();

          this.selectedType = 'ALL';

          this.apiService
            .getPickupDeliveries('ALL')
            .subscribe({
              next: response => {

                this.pickups =
                  response ?? [];

                this.applyFilters(false);

                this.refreshMapMarkers();

                const saved =
                  this.pickups.find(
                    pickup =>
                      pickup.id ===
                      created.id
                  );

                if (saved) {
                  setTimeout(() => {
                    this.selectPickup(saved);
                  }, 150);
                }
              },

              error: error => {
                console.error(
                  'Failed to refresh records',
                  error
                );

                this.loadPickupDeliveries();
              }
            });
        },

        error: error => {
          console.error(
            'Failed to save pickup/delivery',
            error
          );

          this.savingPickup = false;

          this.formError =
            'Unable to save pickup/delivery.';
        }
      });
  }

  applyFilters(
    refreshMap = true
  ): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    this.filteredPickups =
      this.pickups.filter(pickup => {

        const matchesSearch =
          !search ||
          pickup.customerName
            .toLowerCase()
            .includes(search) ||
          pickup.phoneNumber
            .includes(search) ||
          pickup.address
            .toLowerCase()
            .includes(search);

        const matchesDate =
          !this.selectedDate ||
          pickup.scheduledDate ===
            this.selectedDate;

        const matchesSlot =
          !this.selectedTimeSlot ||
          pickup.timeSlot ===
            this.selectedTimeSlot;

        const matchesStatus =
          !this.selectedStatus ||
          pickup.status ===
            this.selectedStatus;

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
        pickup =>
          pickup.id ===
          this.selectedPickup?.id
      )
    ) {
      this.selectedPickup = null;
    }

    if (refreshMap) {
      this.refreshMapMarkers();
    }
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedDate = '';
    this.selectedTimeSlot = '';
    this.selectedStatus = '';

    this.applyFilters();
  }

  setTimeSlot(slot: string): void {
    this.selectedTimeSlot = slot;

    this.applyFilters();
  }

  changeType(): void {
    this.loadPickupDeliveries();
  }

  selectPickup(
    pickup: PickupDelivery
  ): void {

    this.selectedPickup = pickup;

    if (
      pickup.latitude === null ||
      pickup.longitude === null
    ) {
      return;
    }

    if (!this.mapReady || !this.map) {
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
      this.popupByPickupId.get(
        pickup.id
      );

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
    if (!this.mapReady || !this.map) {
      return;
    }

    this.clearMarkers();

    const records =
      this.filteredPickups.filter(
        pickup =>
          pickup.latitude !== null &&
          pickup.longitude !== null
      );

    if (!records.length) {
      return;
    }

    for (const pickup of records) {
      this.addCustomerMarker(pickup);
    }

    setTimeout(() => {
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
          popupElement
        );

    const marker =
      this.olaMaps
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
          ${
            pickup.type === 'PICKUP'
              ? '↑'
              : '↓'
          }
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
      pickup.status
        .replace(/_/g, ' ');

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

        <span class="popup-type ${
          pickup.type === 'PICKUP'
            ? 'pickup'
            : 'delivery'
        }">
          ${typeLabel}
        </span>
      </div>

      <div class="popup-address">
        <span class="popup-location-icon">
          ●
        </span>

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
      .querySelectorAll(
        '.customer-map-pin'
      )
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
    if (!this.mapReady || !this.map) {
      return;
    }

    const records =
      this.filteredPickups.filter(
        pickup =>
          pickup.latitude !== null &&
          pickup.longitude !== null
      );

    if (!records.length) {
      return;
    }

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
      const lng =
        pickup.longitude!;

      const lat =
        pickup.latitude!;

      minLng =
        Math.min(minLng, lng);

      maxLng =
        Math.max(maxLng, lng);

      minLat =
        Math.min(minLat, lat);

      maxLat =
        Math.max(maxLat, lat);
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

    if (pickup.status === status) {
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
                item.id === updated.id
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

  getStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replace(/_/g, '-');
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

  private escapeHtml(
    value: string
  ): string {

    const div =
      document.createElement('div');

    div.textContent =
      value ?? '';

    return div.innerHTML;
  }
}