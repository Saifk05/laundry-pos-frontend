import { Component, OnInit } from '@angular/core';

interface DashboardOrder {
  sequence: number;
  orderNumber: string;
  pieces: number;
  amount: number;
  deliveryTime: string;
  customerName: string;
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
          customerName: 'Komal',
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
          ready: false,
          highlighted: false
        }
      ]
    }
  ];

  constructor() {}

  ngOnInit(): void {
  }

}