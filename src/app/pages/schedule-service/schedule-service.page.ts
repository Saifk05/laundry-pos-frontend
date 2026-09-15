import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  bicycleOutline,
  calendarOutline,
  callOutline,
  carOutline,
  checkmarkCircle,
  locationOutline,
  mapOutline,
  personOutline,
  searchOutline,
  timeOutline
} from 'ionicons/icons';

import { ApiService } from '../../../core/services/api.service';

import {
  MapLocationResponse,
  PickupDeliveryType
} from '../../../core/models/pickup-delivery.model';

@Component({
  selector: 'app-schedule-service',
  templateUrl: './schedule-service.page.html',
  styleUrls: ['./schedule-service.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonSpinner
  ]
})
export class ScheduleServicePage implements OnInit {

  serviceType: PickupDeliveryType = 'PICKUP';

  phoneNumber = '';
  customerName = '';
  customerId: string | null = null;

  customerChecked = false;
  customerExists = false;
  checkingCustomer = false;

  address = '';
  googleMapsLink = '';

  latitude: number | null = null;
  longitude: number | null = null;

  locationSuggestions: MapLocationResponse[] = [];

  searchingLocation = false;
  resolvingLink = false;

  scheduledDate = '';
  timeSlot = '';

  submitting = false;

  successMessage = '';
  errorMessage = '';

  readonly timeSlots = [
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
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM'
  ];

  constructor(
    private readonly apiService: ApiService
  ) {
    addIcons({
      bicycleOutline,
      calendarOutline,
      callOutline,
      carOutline,
      checkmarkCircle,
      locationOutline,
      mapOutline,
      personOutline,
      searchOutline,
      timeOutline
    });
  }

  ngOnInit(): void {
    this.scheduledDate = this.getToday();
  }

  selectServiceType(
    type: PickupDeliveryType
  ): void {

    if (this.serviceType === type) {
      return;
    }

    this.serviceType = type;

    this.timeSlot = '';
    this.clearMessages();
  }

  onPhoneInput(): void {

    this.phoneNumber = this.phoneNumber
      .replace(/\D/g, '')
      .slice(0, 10);

    this.customerChecked = false;
    this.customerExists = false;

    this.customerId = null;
    this.customerName = '';

    this.address = '';
    this.googleMapsLink = '';

    this.latitude = null;
    this.longitude = null;

    this.locationSuggestions = [];

    this.clearMessages();
  }

  checkCustomer(): void {

    this.clearMessages();

    if (this.phoneNumber.length !== 10) {
      this.errorMessage =
        'Enter a valid 10-digit mobile number.';
      return;
    }

    this.checkingCustomer = true;

    this.apiService
      .getCustomerByPhone(this.phoneNumber)
      .subscribe({

        next: (response: any) => {

          this.checkingCustomer = false;
          this.customerChecked = true;

          this.customerExists =
            response.exists === true;

          if (this.customerExists) {

            this.customerId =
              response.id ?? null;

            this.customerName =
              response.name || '';

            this.address =
              response.address || '';

            this.latitude =
              response.latitude ?? null;

            this.longitude =
              response.longitude ?? null;

            this.googleMapsLink = '';
            this.locationSuggestions = [];

          } else {

            this.customerId = null;
            this.customerName = '';

            this.address = '';
            this.latitude = null;
            this.longitude = null;

            this.googleMapsLink = '';
            this.locationSuggestions = [];
          }
        },

        error: (error) => {

          this.checkingCustomer = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to check customer.';
        }
      });
  }

  searchAddress(): void {

    this.clearMessages();

    const query =
      this.address.trim();

    this.latitude = null;
    this.longitude = null;

    if (query.length < 3) {
      this.locationSuggestions = [];
      return;
    }

    this.searchingLocation = true;

    this.apiService
      .autocompleteLocation(query)
      .subscribe({

        next: (response) => {

          this.searchingLocation = false;

          this.locationSuggestions =
            response || [];
        },

        error: () => {

          this.searchingLocation = false;
          this.locationSuggestions = [];

          this.errorMessage =
            'Unable to search location.';
        }
      });
  }

  selectLocation(
    location: MapLocationResponse
  ): void {

    this.address =
      location.formattedAddress ||
      location.name ||
      this.address;

    this.latitude =
      location.latitude ?? null;

    this.longitude =
      location.longitude ?? null;

    this.googleMapsLink = '';
    this.locationSuggestions = [];

    if (
      this.latitude === null ||
      this.longitude === null
    ) {
      this.geocodeSelectedAddress();
    }
  }

  private geocodeSelectedAddress(): void {

    if (!this.address.trim()) {
      return;
    }

    this.apiService
      .geocodeAddress(
        this.address.trim()
      )
      .subscribe({

        next: (response: any) => {

          const result =
            response?.geocodingResults?.[0] ||
            response?.results?.[0];

          const location =
            result?.geometry?.location;

          if (location) {

            this.latitude =
              location.lat ?? null;

            this.longitude =
              location.lng ?? null;
          }
        }
      });
  }

  resolveGoogleMapsLink(): void {

    this.clearMessages();

    if (!this.googleMapsLink.trim()) {

      this.errorMessage =
        'Paste a Google Maps link first.';

      return;
    }

    this.resolvingLink = true;

    this.apiService
      .resolveGoogleMapsLink(
        this.googleMapsLink.trim()
      )
      .subscribe({

        next: (response) => {

          this.resolvingLink = false;

          this.latitude =
            response.latitude ?? null;

          this.longitude =
            response.longitude ?? null;

          if (response.formattedAddress) {

            this.address =
              response.formattedAddress;

          } else if (response.name) {

            this.address =
              response.name;
          }

          this.locationSuggestions = [];

          if (
            this.latitude !== null &&
            this.longitude !== null &&
            !this.address
          ) {
            this.reverseGeocodeLocation();
          }
        },

        error: (error) => {

          this.resolvingLink = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to resolve Google Maps link.';
        }
      });
  }

  private reverseGeocodeLocation(): void {

    if (
      this.latitude === null ||
      this.longitude === null
    ) {
      return;
    }

    this.apiService
      .reverseGeocode(
        this.latitude,
        this.longitude
      )
      .subscribe({

        next: (response: any) => {

          const result =
            response?.results?.[0] ||
            response?.geocodingResults?.[0];

          if (result?.formatted_address) {

            this.address =
              result.formatted_address;

          } else if (
            result?.formattedAddress
          ) {

            this.address =
              result.formattedAddress;
          }
        }
      });
  }

  scheduleService(): void {

    this.clearMessages();

    if (!this.customerChecked) {

      this.errorMessage =
        'Check customer mobile number first.';

      return;
    }

    if (!this.customerName.trim()) {

      this.errorMessage =
        'Customer name is required.';

      return;
    }

    if (!this.address.trim()) {

      this.errorMessage =
        `${
          this.serviceType === 'PICKUP'
            ? 'Pickup'
            : 'Delivery'
        } address is required.`;

      return;
    }

    if (
      this.latitude === null ||
      this.longitude === null
    ) {

      this.errorMessage =
        'Select a valid location.';

      return;
    }

    if (!this.scheduledDate) {

      this.errorMessage =
        'Date is required.';

      return;
    }

    if (!this.timeSlot) {

      this.errorMessage =
        'Time slot is required.';

      return;
    }

    this.submitting = true;

    if (!this.customerExists) {
      this.createCustomerAndSchedule();
      return;
    }

    this.createService();
  }

  private createCustomerAndSchedule(): void {

    this.apiService
      .createCustomer({
        name: this.customerName.trim(),
        phone: this.phoneNumber
      })
      .subscribe({

        next: (response: any) => {

          this.customerId =
            response.id ?? null;

          this.customerExists = true;

          this.createService();
        },

        error: (error) => {

          this.submitting = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to create customer.';
        }
      });
  }

  private createService(): void {

    const request = {

      customerName:
        this.customerName.trim(),

      phoneNumber:
        this.phoneNumber,

      address:
        this.address.trim(),

      latitude:
        this.latitude,

      longitude:
        this.longitude,

      type:
        this.serviceType,

      scheduledDate:
        this.scheduledDate,

      timeSlot:
        this.timeSlot
    };

    this.apiService
      .createPickupDelivery(request)
      .subscribe({

        next: () => {

          this.submitting = false;

          this.successMessage =
            this.serviceType === 'PICKUP'
              ? 'Pickup scheduled successfully.'
              : 'Delivery scheduled successfully.';

          this.resetForm();
        },

        error: (error) => {

          this.submitting = false;

          this.errorMessage =
            error?.error?.message ||
            `Unable to schedule ${
              this.serviceType === 'PICKUP'
                ? 'pickup'
                : 'delivery'
            }.`;
        }
      });
  }

  private resetForm(): void {

    this.phoneNumber = '';
    this.customerName = '';

    this.customerId = null;

    this.customerChecked = false;
    this.customerExists = false;

    this.address = '';
    this.googleMapsLink = '';

    this.latitude = null;
    this.longitude = null;

    this.locationSuggestions = [];

    this.scheduledDate =
      this.getToday();

    this.timeSlot = '';
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private getToday(): string {

    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        today.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}