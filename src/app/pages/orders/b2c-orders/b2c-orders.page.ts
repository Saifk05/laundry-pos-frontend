import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface B2cOrder {
  orderNumber: string;
  status: string;

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
export class B2cOrdersPage {

  selectedStatus = 'All';

  orderNumberSearch = '';
  mobileSearch = '';

  statuses: string[] = [
    'All',
    'Cancelled',
    'New Order',
    'Unassigned Pickup',
    'Assigned Pickup',
    'Out For Pickup',
    'Pickup Done By Rider',
    'Untagged',
    'Tagged',
    'Processing At Store',
    'Processing At Vendor',
    'Ready Order',
    'Assigned Delivery',
    'Out For Delivery',
    'Delivered',
    'Not Done Pickup',
    'Not Done Delivery',
    'Cancelled By Store'
  ];

  orders: B2cOrder[] = [
    {
      orderNumber: '2081673',
      status: 'Tagged',
      customerName: 'Saifali',
      mobile: '6361632302',
      address: 'Keshwapur, Hubballi',
      storageLabel: 'A-12',
      pickupDate: '2026-08-08',
      pickupSlot: '09:00 AM - 12:00 PM',
      pickupRiderName: 'Ramesh',
      pickupRiderMobile: '9988772211',
      deliveryDate: '2026-08-10',
      deliverySlot: '06:00 PM - 09:00 PM',
      pieces: 4,
      amount: 730
    },
    {
      orderNumber: '2081411',
      status: 'Unassigned Pickup',
      customerName: 'Rahul',
      mobile: '9876543210',
      address: 'Vidya Nagar, Hubballi',
      storageLabel: '-',
      pickupDate: '2026-08-08',
      pickupSlot: '12:00 PM - 03:00 PM',
      pickupRiderName: '-',
      pickupRiderMobile: '-',
      deliveryDate: '2026-08-10',
      deliverySlot: '03:00 PM - 06:00 PM',
      pieces: 6,
      amount: 520
    },
    {
      orderNumber: '2080555',
      status: 'Tagged',
      customerName: 'Anita',
      mobile: '9123456789',
      address: 'Gokul Road, Hubballi',
      storageLabel: 'B-08',
      pickupDate: '2026-08-08',
      pickupSlot: '03:00 PM - 06:00 PM',
      pickupRiderName: 'Ramesh',
      pickupRiderMobile: '9988772211',
      deliveryDate: '2026-08-11',
      deliverySlot: '09:00 AM - 12:00 PM',
      pieces: 8,
      amount: 890
    },
    {
      orderNumber: '2080503',
      status: 'Unassigned Pickup',
      customerName: 'Pooja',
      mobile: '9012345678',
      address: 'Deshpande Nagar, Hubballi',
      storageLabel: '-',
      pickupDate: '2026-08-08',
      pickupSlot: '06:00 PM - 09:00 PM',
      pickupRiderName: '-',
      pickupRiderMobile: '-',
      deliveryDate: '2026-08-11',
      deliverySlot: '06:00 PM - 09:00 PM',
      pieces: 5,
      amount: 610
    },
    {
      orderNumber: '2080096',
      status: 'Cancelled',
      customerName: 'Arun',
      mobile: '7766554433',
      address: 'Old Hubballi',
      storageLabel: '-',
      pickupDate: '2026-08-08',
      pickupSlot: '09:00 AM - 12:00 PM',
      pickupRiderName: '-',
      pickupRiderMobile: '-',
      deliveryDate: '2026-08-10',
      deliverySlot: '09:00 AM - 12:00 PM',
      pieces: 2,
      amount: 280
    },
    {
      orderNumber: '2078427',
      status: 'Processing At Store',
      customerName: 'Sneha',
      mobile: '8899776655',
      address: 'Shirur Park, Hubballi',
      storageLabel: 'B-04',
      pickupDate: '2026-08-07',
      pickupSlot: '12:00 PM - 03:00 PM',
      pickupRiderName: 'Ramesh',
      pickupRiderMobile: '9988772211',
      deliveryDate: '2026-08-09',
      deliverySlot: '06:00 PM - 09:00 PM',
      pieces: 7,
      amount: 980
    },
    {
      orderNumber: '2078400',
      status: 'Processing At Store',
      customerName: 'Deepa',
      mobile: '7788996655',
      address: 'Navanagar, Hubballi',
      storageLabel: 'C-08',
      pickupDate: '2026-08-06',
      pickupSlot: '03:00 PM - 06:00 PM',
      pickupRiderName: 'Kiran',
      pickupRiderMobile: '9988001122',
      deliveryDate: '2026-08-08',
      deliverySlot: '06:00 PM - 09:00 PM',
      pieces: 9,
      amount: 1320
    },
    {
      orderNumber: '2078347',
      status: 'Ready Order',
      customerName: 'Rohit',
      mobile: '9900112233',
      address: 'Unkal, Hubballi',
      storageLabel: 'D-02',
      pickupDate: '2026-08-05',
      pickupSlot: '09:00 AM - 12:00 PM',
      pickupRiderName: 'Ajay',
      pickupRiderMobile: '9898981212',
      deliveryDate: '2026-08-08',
      deliverySlot: '03:00 PM - 06:00 PM',
      pieces: 3,
      amount: 480
    },
    {
      orderNumber: '2078309',
      status: 'Processing At Store',
      customerName: 'Meena',
      mobile: '8877665544',
      address: 'Akshay Colony, Hubballi',
      storageLabel: 'A-06',
      pickupDate: '2026-08-04',
      pickupSlot: '12:00 PM - 03:00 PM',
      pickupRiderName: 'Vijay',
      pickupRiderMobile: '9000012345',
      deliveryDate: '2026-08-07',
      deliverySlot: '06:00 PM - 09:00 PM',
      pieces: 10,
      amount: 1560
    },
    {
      orderNumber: '2078290',
      status: 'Delivered',
      customerName: 'Kiran',
      mobile: '9988123456',
      address: 'Hosayellapur, Dharwad',
      storageLabel: 'C-02',
      pickupDate: '2026-08-04',
      pickupSlot: '09:00 AM - 12:00 PM',
      pickupRiderName: 'Vijay',
      pickupRiderMobile: '9000012345',
      deliveryDate: '2026-08-07',
      deliverySlot: '03:00 PM - 06:00 PM',
      pieces: 6,
      amount: 870
    }
  ];

  get filteredOrders(): B2cOrder[] {

    return this.orders.filter((order) => {

      const matchesStatus =
        this.selectedStatus === 'All' ||
        order.status === this.selectedStatus;

      const matchesOrderNumber =
        !this.orderNumberSearch ||
        order.orderNumber
          .toLowerCase()
          .includes(
            this.orderNumberSearch
              .trim()
              .toLowerCase()
          );

      const matchesMobile =
        !this.mobileSearch ||
        order.mobile.includes(
          this.mobileSearch.trim()
        );

      return (
        matchesStatus &&
        matchesOrderNumber &&
        matchesMobile
      );
    });
  }

  selectStatus(status: string): void {

    this.selectedStatus = status;

    this.closeAllMoreMenus();
  }

  clearFilters(): void {

    this.selectedStatus = 'All';

    this.orderNumberSearch = '';
    this.mobileSearch = '';

    this.closeAllMoreMenus();
  }

  toggleMore(order: B2cOrder): void {

    const currentState =
      order.moreOpen ?? false;

    this.closeAllMoreMenus();

    order.moreOpen =
      !currentState;
  }

  private closeAllMoreMenus(): void {

    this.orders.forEach((order) => {
      order.moreOpen = false;
    });
  }

  /* =========================================
     MAIN ACTIONS
  ========================================= */

  assignRider(order: B2cOrder): void {

    console.log(
      'Assign rider:',
      order.orderNumber
    );
  }

  tagOrder(order: B2cOrder): void {

    console.log(
      'Tag order:',
      order.orderNumber
    );
  }

  processAtStore(order: B2cOrder): void {

    console.log(
      'Process at store:',
      order.orderNumber
    );

    order.status =
      'Processing At Store';
  }

  processAtVendor(order: B2cOrder): void {

    console.log(
      'Process at vendor:',
      order.orderNumber
    );

    order.status =
      'Processing At Vendor';
  }

  markReady(order: B2cOrder): void {

    console.log(
      'Mark ready:',
      order.orderNumber
    );

    order.status =
      'Ready Order';
  }

  markDelivered(order: B2cOrder): void {

    console.log(
      'Mark delivered:',
      order.orderNumber
    );

    order.status =
      'Delivered';
  }

  callCustomer(order: B2cOrder): void {

    console.log(
      'Call customer:',
      order.mobile
    );
  }

  retagOrder(order: B2cOrder): void {

    console.log(
      'Re-tag order:',
      order.orderNumber
    );
  }

  showPaymentQr(order: B2cOrder): void {

    console.log(
      'Show payment QR:',
      order.orderNumber
    );
  }

  viewOrder(order: B2cOrder): void {

    console.log(
      'View order:',
      order
    );
  }

  /* =========================================
     MORE MENU
  ========================================= */

  reschedule(order: B2cOrder): void {

    console.log(
      'Reschedule:',
      order.orderNumber
    );

    this.closeAllMoreMenus();
  }

  billReceipt(order: B2cOrder): void {

    console.log(
      'Bill receipt:',
      order.orderNumber
    );

    this.closeAllMoreMenus();
  }

  changeReadyStatus(order: B2cOrder): void {

    console.log(
      'Change CLT ready status:',
      order.orderNumber
    );

    this.closeAllMoreMenus();
  }

  pickupSlips(order: B2cOrder): void {

    console.log(
      'Pickup slips:',
      order.orderNumber
    );

    this.closeAllMoreMenus();
  }

  settleOrder(order: B2cOrder): void {

    console.log(
      'Settle order:',
      order.orderNumber
    );

    this.closeAllMoreMenus();
  }

  smsPaymentLink(order: B2cOrder): void {

    console.log(
      'SMS payment link:',
      order.orderNumber
    );

    this.closeAllMoreMenus();
  }
}