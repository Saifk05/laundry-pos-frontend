import { Component, OnInit } from '@angular/core';

interface DashboardOrder {
  sequence: number;
  orderNumber: string;
  pieces: number;
  amount: number;
  deliveryTime: string;
  customerName: string;
  phone: string;
  ready: boolean;
  highlighted: boolean;
}

interface DeliveryDay {
  date: string;

  totalOrders: number;
  totalPieces: number;

  processingOrders: number;
  processingPieces: number;

  readyOrders: number;
  readyPieces: number;

  orders: DashboardOrder[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {

  staffPhone = '9663280710';

  selectedOrder: DashboardOrder | null = null;

  deliveryDays: DeliveryDay[] = [
    {
      date: 'Sat 8 Aug',

      totalOrders: 8,
      totalPieces: 46,

      processingOrders: 5,
      processingPieces: 31,

      readyOrders: 3,
      readyPieces: 15,

      orders: [
        {
          sequence: 1,
          orderNumber: '2079101',
          pieces: 6,
          amount: 540,
          deliveryTime: '08:00 PM',
          customerName: 'Rahul',
          phone: '9876543210',
          ready: false,
          highlighted: false
        },
        {
          sequence: 2,
          orderNumber: '2079102',
          pieces: 4,
          amount: 380,
          deliveryTime: '08:30 PM',
          customerName: 'Anita',
          phone: '9123456789',
          ready: true,
          highlighted: true
        },
        {
          sequence: 3,
          orderNumber: '2079103',
          pieces: 7,
          amount: 760,
          deliveryTime: '09:00 PM',
          customerName: 'Kiran',
          phone: '9988123456',
          ready: false,
          highlighted: false
        },
        {
          sequence: 4,
          orderNumber: '2079104',
          pieces: 5,
          amount: 610,
          deliveryTime: '09:00 PM',
          customerName: 'Sneha',
          phone: '8899776655',
          ready: true,
          highlighted: true
        }
      ]
    },

    {
      date: 'Fri 7 Aug',

      totalOrders: 11,
      totalPieces: 69,

      processingOrders: 7,
      processingPieces: 43,

      readyOrders: 4,
      readyPieces: 26,

      orders: [
        {
          sequence: 1,
          orderNumber: '2079001',
          pieces: 8,
          amount: 890,
          deliveryTime: '07:30 PM',
          customerName: 'Ajay',
          phone: '9898981212',
          ready: true,
          highlighted: true
        },
        {
          sequence: 2,
          orderNumber: '2079002',
          pieces: 3,
          amount: 325,
          deliveryTime: '08:00 PM',
          customerName: 'Pooja',
          phone: '9012345678',
          ready: false,
          highlighted: false
        },
        {
          sequence: 3,
          orderNumber: '2079003',
          pieces: 9,
          amount: 1050,
          deliveryTime: '08:30 PM',
          customerName: 'Vijay',
          phone: '9000012345',
          ready: false,
          highlighted: false
        },
        {
          sequence: 4,
          orderNumber: '2079004',
          pieces: 6,
          amount: 720,
          deliveryTime: '09:00 PM',
          customerName: 'Deepa',
          phone: '7788996655',
          ready: true,
          highlighted: true
        }
      ]
    },

    {
      date: 'Thu 6 Aug',

      totalOrders: 9,
      totalPieces: 57,

      processingOrders: 6,
      processingPieces: 37,

      readyOrders: 3,
      readyPieces: 20,

      orders: [
        {
          sequence: 1,
          orderNumber: '2078901',
          pieces: 5,
          amount: 480,
          deliveryTime: '07:00 PM',
          customerName: 'Ramesh',
          phone: '9988772211',
          ready: false,
          highlighted: false
        },
        {
          sequence: 2,
          orderNumber: '2078902',
          pieces: 7,
          amount: 810,
          deliveryTime: '08:00 PM',
          customerName: 'Nisha',
          phone: '9345678123',
          ready: true,
          highlighted: true
        },
        {
          sequence: 3,
          orderNumber: '2078903',
          pieces: 4,
          amount: 410,
          deliveryTime: '08:30 PM',
          customerName: 'Suresh',
          phone: '9445566778',
          ready: false,
          highlighted: false
        },
        {
          sequence: 4,
          orderNumber: '2078904',
          pieces: 4,
          amount: 530,
          deliveryTime: '09:00 PM',
          customerName: 'Asha',
          phone: '9556677889',
          ready: true,
          highlighted: true
        }
      ]
    },

    {
      date: 'Wed 5 Aug',

      totalOrders: 14,
      totalPieces: 91,

      processingOrders: 9,
      processingPieces: 58,

      readyOrders: 5,
      readyPieces: 33,

      orders: [
        {
          sequence: 1,
          orderNumber: '2078801',
          pieces: 10,
          amount: 1180,
          deliveryTime: '07:30 PM',
          customerName: 'Santosh',
          phone: '9667788990',
          ready: false,
          highlighted: false
        },
        {
          sequence: 2,
          orderNumber: '2078802',
          pieces: 6,
          amount: 690,
          deliveryTime: '08:00 PM',
          customerName: 'Meena',
          phone: '8877665544',
          ready: true,
          highlighted: true
        },
        {
          sequence: 3,
          orderNumber: '2078803',
          pieces: 8,
          amount: 920,
          deliveryTime: '08:30 PM',
          customerName: 'Naveen',
          phone: '9786543210',
          ready: false,
          highlighted: false
        },
        {
          sequence: 4,
          orderNumber: '2078804',
          pieces: 9,
          amount: 1120,
          deliveryTime: '09:00 PM',
          customerName: 'Kavya',
          phone: '9867543210',
          ready: true,
          highlighted: true
        }
      ]
    },

    {
      date: 'Tue 4 Aug',

      totalOrders: 12,
      totalPieces: 78,

      processingOrders: 8,
      processingPieces: 51,

      readyOrders: 4,
      readyPieces: 27,

      orders: [
        {
          sequence: 1,
          orderNumber: '2078701',
          pieces: 7,
          amount: 840,
          deliveryTime: '07:30 PM',
          customerName: 'Manoj',
          phone: '9765432101',
          ready: true,
          highlighted: true
        },
        {
          sequence: 2,
          orderNumber: '2078702',
          pieces: 5,
          amount: 590,
          deliveryTime: '08:00 PM',
          customerName: 'Rekha',
          phone: '9678901234',
          ready: false,
          highlighted: false
        },
        {
          sequence: 3,
          orderNumber: '2078703',
          pieces: 6,
          amount: 740,
          deliveryTime: '08:30 PM',
          customerName: 'Harish',
          phone: '9567890123',
          ready: false,
          highlighted: false
        },
        {
          sequence: 4,
          orderNumber: '2078704',
          pieces: 9,
          amount: 980,
          deliveryTime: '09:00 PM',
          customerName: 'Neha',
          phone: '9456789012',
          ready: true,
          highlighted: true
        }
      ]
    },

    {
      date: 'Mon 3 Aug',

      totalOrders: 4,
      totalPieces: 45,

      processingOrders: 4,
      processingPieces: 45,

      readyOrders: 0,
      readyPieces: 0,

      orders: [
        {
          sequence: 1,
          orderNumber: '2077888',
          pieces: 21,
          amount: 1882,
          deliveryTime: '08:00 PM',
          customerName: 'Komal Katawe',
          phone: '9110417574',
          ready: false,
          highlighted: false
        },
        {
          sequence: 2,
          orderNumber: '2078309',
          pieces: 10,
          amount: 1154,
          deliveryTime: '09:00 PM',
          customerName: 'Manjunath',
          phone: '9345678901',
          ready: false,
          highlighted: false
        },
        {
          sequence: 3,
          orderNumber: '2078400',
          pieces: 6,
          amount: 688,
          deliveryTime: '09:00 PM',
          customerName: 'Ritu',
          phone: '9234567890',
          ready: false,
          highlighted: false
        },
        {
          sequence: 4,
          orderNumber: '2078427',
          pieces: 8,
          amount: 1228,
          deliveryTime: '09:00 PM',
          customerName: 'Khushi',
          phone: '9123456701',
          ready: false,
          highlighted: false
        }
      ]
    }
  ];

  constructor() {}

  ngOnInit(): void {
  }

  openCallPopup(order: DashboardOrder): void {
    this.selectedOrder = order;
  }

  closeCallPopup(): void {
    this.selectedOrder = null;
  }

  callNow(): void {

    if (!this.selectedOrder) {
      return;
    }

    window.location.href =
      `tel:${this.selectedOrder.phone}`;
  }
}