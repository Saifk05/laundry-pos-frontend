import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonContent } from '@ionic/angular/standalone';

interface Pickup {
  id: number;
  fullName: string;
  mobile: string;
  address: string;
  pickupDate: string;
  pickupTime: string;
  deliveryTime: string;
  timeSlot: string;
  status: string;
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
export class PickupPage implements OnInit {

  searchText = '';
  selectedDate = '';
  selectedTimeSlot = '';
  selectedStatus = '';
  googleMapLink = '';
  mapMessage = '';

  selectedPickup: Pickup | null = null;

  mapUrl!: SafeResourceUrl;

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

  pickups: Pickup[] = [
    {
      id: 1,
      fullName: 'Rahul Desai',
      mobile: '7019286847',
      address: '123 MG Road, Indiranagar, Bengaluru',
      pickupDate: '2026-09-15',
      pickupTime: '09:00 AM',
      deliveryTime: '05:00 PM',
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'Scheduled',
      latitude: 12.9784,
      longitude: 77.6408
    },
    {
      id: 2,
      fullName: 'Priya Kulkarni',
      mobile: '9113624168',
      address: '45 12th Main, Koramangala, Bengaluru',
      pickupDate: '2026-09-15',
      pickupTime: '10:00 AM',
      deliveryTime: '06:00 PM',
      timeSlot: '10:00 AM - 11:00 AM',
      status: 'In Progress',
      latitude: 12.9352,
      longitude: 77.6245
    },
    {
      id: 3,
      fullName: 'Vishal Patil',
      mobile: '9880811661',
      address: '78 100 Feet Road, Jayanagar, Bengaluru',
      pickupDate: '2026-09-15',
      pickupTime: '11:00 AM',
      deliveryTime: '07:00 PM',
      timeSlot: '11:00 AM - 12:00 PM',
      status: 'Pending',
      latitude: 12.9250,
      longitude: 77.5938
    },
    {
      id: 4,
      fullName: 'Saifali Kalkeri',
      mobile: '6361633230',
      address: '221 HSR Layout, Sector 2, Bengaluru',
      pickupDate: '2026-09-15',
      pickupTime: '02:00 PM',
      deliveryTime: '08:00 PM',
      timeSlot: '02:00 PM - 03:00 PM',
      status: 'Scheduled',
      latitude: 12.9116,
      longitude: 77.6389
    },
    {
      id: 5,
      fullName: 'Amit Sharma',
      mobile: '9988776655',
      address: '15 Whitefield Main Road, Bengaluru',
      pickupDate: '2026-09-15',
      pickupTime: '03:00 PM',
      deliveryTime: '09:00 PM',
      timeSlot: '03:00 PM - 04:00 PM',
      status: 'Assigned',
      latitude: 12.9698,
      longitude: 77.7499
    },
    {
      id: 6,
      fullName: 'Neha Gupta',
      mobile: '8877665544',
      address: '67 Bellandur Main Road, Bengaluru',
      pickupDate: '2026-09-15',
      pickupTime: '04:00 PM',
      deliveryTime: '06:00 PM',
      timeSlot: '04:00 PM - 05:00 PM',
      status: 'Cancelled',
      latitude: 12.9304,
      longitude: 77.6784
    },
    {
      id: 7,
      fullName: 'Karan Mehta',
      mobile: '7766554433',
      address: '8 Marathahalli Outer Ring Road, Bengaluru',
      pickupDate: '2026-09-15',
      pickupTime: '05:00 PM',
      deliveryTime: '08:00 PM',
      timeSlot: '05:00 PM - 06:00 PM',
      status: 'Scheduled',
      latitude: 12.9591,
      longitude: 77.6974
    },
    {
      id: 8,
      fullName: 'Anjali Nair',
      mobile: '7654321098',
      address: '302 Electronic City Phase 1, Bengaluru',
      pickupDate: '2026-09-15',
      pickupTime: '06:00 PM',
      deliveryTime: '09:00 PM',
      timeSlot: '06:00 PM - 07:00 PM',
      status: 'Pending',
      latitude: 12.8399,
      longitude: 77.6770
    }
  ];

  filteredPickups: Pickup[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.selectedDate = '2026-09-15';
    this.filteredPickups = [...this.pickups];

    if (this.pickups.length) {
      this.selectPickup(this.pickups[0]);
    }
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredPickups = this.pickups.filter(p => {
      const matchesSearch =
        !search ||
        p.fullName.toLowerCase().includes(search) ||
        p.mobile.includes(search) ||
        p.address.toLowerCase().includes(search);

      const matchesDate =
        !this.selectedDate ||
        p.pickupDate === this.selectedDate;

      const matchesSlot =
        !this.selectedTimeSlot ||
        p.timeSlot === this.selectedTimeSlot;

      const matchesStatus =
        !this.selectedStatus ||
        p.status === this.selectedStatus;

      return matchesSearch &&
        matchesDate &&
        matchesSlot &&
        matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedDate = '';
    this.selectedTimeSlot = '';
    this.selectedStatus = '';
    this.filteredPickups = [...this.pickups];
  }

  setTimeSlot(slot: string): void {
    this.selectedTimeSlot = slot;
    this.applyFilters();
  }

  selectPickup(pickup: Pickup): void {
    this.selectedPickup = pickup;
    this.googleMapLink = '';
    this.mapMessage = '';

    this.setMap(
      pickup.latitude,
      pickup.longitude
    );
  }

  private setMap(lat: number, lng: number): void {
    const url =
      `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

    this.mapUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  loadGoogleMapLink(): void {
    const link = this.googleMapLink.trim();

    if (!link) {
      this.mapMessage = 'Paste a Google Maps link first.';
      return;
    }

    const coordinates = this.extractCoordinates(link);

    if (coordinates) {
      this.setMap(
        coordinates.lat,
        coordinates.lng
      );

      this.mapMessage =
        'Location loaded successfully.';

      return;
    }

    if (link.includes('maps.app.goo.gl')) {
      this.mapMessage =
        'This is a shortened Google Maps link. Use Share → Copy link from the full browser URL, or we can add backend short-link expansion.';
      return;
    }

    const locationQuery =
      this.extractLocationQuery(link);

    if (locationQuery) {
      this.setMapByQuery(locationQuery);
      this.mapMessage = 'Location loaded successfully.';
      return;
    }

    this.mapMessage =
      'Could not detect coordinates from this Google Maps link.';
  }

  private extractCoordinates(
    url: string
  ): { lat: number; lng: number } | null {

    const atMatch =
      url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (atMatch) {
      return {
        lat: Number(atMatch[1]),
        lng: Number(atMatch[2])
      };
    }

    const queryMatch =
      url.match(/[?&](?:q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (queryMatch) {
      return {
        lat: Number(queryMatch[1]),
        lng: Number(queryMatch[2])
      };
    }

    const destinationMatch =
      url.match(/[?&]destination=(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (destinationMatch) {
      return {
        lat: Number(destinationMatch[1]),
        lng: Number(destinationMatch[2])
      };
    }

    return null;
  }

  private extractLocationQuery(url: string): string | null {
    try {
      const parsed = new URL(url);

      const query =
        parsed.searchParams.get('q') ||
        parsed.searchParams.get('query') ||
        parsed.searchParams.get('destination');

      if (query) {
        return decodeURIComponent(query);
      }

      const placeMatch =
        parsed.pathname.match(/\/place\/([^/]+)/);

      if (placeMatch?.[1]) {
        return decodeURIComponent(
          placeMatch[1].replace(/\+/g, ' ')
        );
      }

      return null;

    } catch {
      return null;
    }
  }

  private setMapByQuery(query: string): void {
    const url =
      `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;

    this.mapUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getStatusClass(status: string): string {
    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  addDummyPickup(): void {
    const pickup: Pickup = {
      id: this.pickups.length + 1,
      fullName: 'New Customer',
      mobile: '9000000000',
      address: 'Bengaluru, Karnataka',
      pickupDate: '2026-09-15',
      pickupTime: '04:00 PM',
      deliveryTime: '08:00 PM',
      timeSlot: '04:00 PM - 05:00 PM',
      status: 'Pending',
      latitude: 12.9716,
      longitude: 77.5946
    };

    this.pickups.unshift(pickup);
    this.applyFilters();
    this.selectPickup(pickup);
  }
}