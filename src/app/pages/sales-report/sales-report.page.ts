import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';


type SalesOrderStatus =
  | 'TAGGED'
  | 'PROCESSING_AT_STORE'
  | 'READY_ORDER'
  | 'DELIVERED'
  | 'CANCELLED';


type PricingUnit =
  | 'PC'
  | 'KG';


type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'CARD'
  | 'OTHER';


interface SalesSummary {
  grossSales: number;
  discountAmount: number;
  couponDiscountAmount: number;
  expressAmount: number;
  netSales: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  totalPieces: number;
  totalWeightKg: number;
}


interface ProductSales {
  productName: string;
  quantity: number;
  unit: PricingUnit;
  orders: number;
  revenue: number;
  percentageOfSales: number;
}


interface ServiceSales {
  serviceName: string;
  orders: number;
  quantity: number;
  revenue: number;
  percentageOfSales: number;
}


interface DailySales {
  date: string;
  orders: number;
  grossSales: number;
  discountAmount: number;
  expressAmount: number;
  netSales: number;
}


interface StatusSummary {
  status: SalesOrderStatus;
  count: number;
  amount: number;
}


interface DeliverySummary {
  normalOrders: number;
  expressOrders: number;
  homeDeliveryOrders: number;
  storePickupOrders: number;
}


interface PaymentSummary {
  method: PaymentMethod;
  count: number;
  amount: number;
}


interface CustomerSales {
  customerName: string;
  mobile: string;
  orders: number;
  totalSpent: number;
}


interface SalesOrder {
  orderNumber: string;
  customerName: string;
  mobile: string;
  date: string;

  subtotal: number;
  discountAmount: number;
  couponDiscountAmount: number;
  expressAmount: number;
  totalAmount: number;

  itemCount: number;

  homeDelivery: boolean;
  expressDelivery: boolean;

  paymentMethod: PaymentMethod;
  paymentStatus:
    | 'PENDING'
    | 'PARTIAL'
    | 'PAID';

  status: SalesOrderStatus;
}


@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.page.html',
  styleUrls: ['./sales-report.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class SalesReportPage
  implements OnInit {

  startDate = '';

  endDate = '';

  loading = false;

  selectedStatus:
    SalesOrderStatus | 'ALL' =
      'ALL';

  searchText = '';


  summary:
    SalesSummary = {

      grossSales:
        58640,

      discountAmount:
        2850,

      couponDiscountAmount:
        1250,

      expressAmount:
        4685.5,

      netSales:
        59225.5,

      totalOrders:
        112,

      completedOrders:
        76,

      cancelledOrders:
        4,

      averageOrderValue:
        528.80,

      totalPieces:
        286,

      totalWeightKg:
        148.5
    };


  deliverySummary:
    DeliverySummary = {

      normalOrders:
        87,

      expressOrders:
        25,

      homeDeliveryOrders:
        31,

      storePickupOrders:
        81
    };


  statusSummary:
    StatusSummary[] = [

      {
        status:
          'TAGGED',

        count:
          12,

        amount:
          6140
      },

      {
        status:
          'PROCESSING_AT_STORE',

        count:
          13,

        amount:
          7280
      },

      {
        status:
          'READY_ORDER',

        count:
          7,

        amount:
          3860
      },

      {
        status:
          'DELIVERED',

        count:
          76,

        amount:
          41945.5
      },

      {
        status:
          'CANCELLED',

        count:
          4,

        amount:
          0
      }

    ];


  productSales:
    ProductSales[] = [

      {
        productName:
          'Laundry By Weight',

        quantity:
          148.5,

        unit:
          'KG',

        orders:
          34,

        revenue:
          26475,

        percentageOfSales:
          44.7
      },

      {
        productName:
          'Shirt',

        quantity:
          96,

        unit:
          'PC',

        orders:
          52,

        revenue:
          9850,

        percentageOfSales:
          16.6
      },

      {
        productName:
          'Trouser / Jeans',

        quantity:
          61,

        unit:
          'PC',

        orders:
          38,

        revenue:
          7930,

        percentageOfSales:
          13.4
      },

      {
        productName:
          'Jacket / Blazer',

        quantity:
          29,

        unit:
          'PC',

        orders:
          20,

        revenue:
          6120,

        percentageOfSales:
          10.3
      },

      {
        productName:
          'Socks',

        quantity:
          54,

        unit:
          'PC',

        orders:
          17,

        revenue:
          2380,

        percentageOfSales:
          4.0
      },

      {
        productName:
          'Bedsheet',

        quantity:
          22,

        unit:
          'PC',

        orders:
          14,

        revenue:
          3250,

        percentageOfSales:
          5.5
      }

    ];


  serviceSales:
    ServiceSales[] = [

      {
        serviceName:
          'Premium Laundry',

        orders:
          34,

        quantity:
          148.5,

        revenue:
          26475,

        percentageOfSales:
          44.7
      },

      {
        serviceName:
          'Dry Clean',

        orders:
          62,

        quantity:
          122,

        revenue:
          16540,

        percentageOfSales:
          27.9
      },

      {
        serviceName:
          'Steam Press',

        orders:
          41,

        quantity:
          89,

        revenue:
          8230,

        percentageOfSales:
          13.9
      },

      {
        serviceName:
          'Wash & Fold',

        orders:
          19,

        quantity:
          51,

        revenue:
          4810,

        percentageOfSales:
          8.1
      },

      {
        serviceName:
          'Wash & Iron',

        orders:
          11,

        quantity:
          29,

        revenue:
          3180,

        percentageOfSales:
          5.4
      }

    ];


  dailySales:
    DailySales[] = [

      {
        date:
          '2026-08-10',

        orders:
          12,

        grossSales:
          5720,

        discountAmount:
          220,

        expressAmount:
          390,

        netSales:
          5890
      },

      {
        date:
          '2026-08-11',

        orders:
          15,

        grossSales:
          6980,

        discountAmount:
          410,

        expressAmount:
          525,

        netSales:
          7095
      },

      {
        date:
          '2026-08-12',

        orders:
          14,

        grossSales:
          6410,

        discountAmount:
          300,

        expressAmount:
          610,

        netSales:
          6720
      },

      {
        date:
          '2026-08-13',

        orders:
          18,

        grossSales:
          8420,

        discountAmount:
          540,

        expressAmount:
          735,

        netSales:
          8615
      },

      {
        date:
          '2026-08-14',

        orders:
          17,

        grossSales:
          7920,

        discountAmount:
          450,

        expressAmount:
          820,

        netSales:
          8290
      },

      {
        date:
          '2026-08-15',

        orders:
          19,

        grossSales:
          10360,

        discountAmount:
          630,

        expressAmount:
          980,

        netSales:
          10710
      },

      {
        date:
          '2026-08-16',

        orders:
          17,

        grossSales:
          6830,

        discountAmount:
          300,

        expressAmount:
          625.5,

        netSales:
          7155.5
      }

    ];


  paymentSummary:
    PaymentSummary[] = [

      {
        method:
          'CASH',

        count:
          49,

        amount:
          26180
      },

      {
        method:
          'UPI',

        count:
          45,

        amount:
          22895.5
      },

      {
        method:
          'CARD',

        count:
          16,

        amount:
          9140
      },

      {
        method:
          'OTHER',

        count:
          2,

        amount:
          1010
      }

    ];


  topCustomers:
    CustomerSales[] = [

      {
        customerName:
          'Saifali',

        mobile:
          '6361633230',

        orders:
          12,

        totalSpent:
          8940.5
      },

      {
        customerName:
          'Qwerty',

        mobile:
          '9880811661',

        orders:
          8,

        totalSpent:
          6240
      },

      {
        customerName:
          'AWser',

        mobile:
          '7112212155',

        orders:
          7,

        totalSpent:
          5480
      },

      {
        customerName:
          'Rohan',

        mobile:
          '9845012345',

        orders:
          6,

        totalSpent:
          4920
      },

      {
        customerName:
          'Priya',

        mobile:
          '9988776655',

        orders:
          5,

        totalSpent:
          4310
      }

    ];


  orders:
    SalesOrder[] = [

      {
        orderNumber:
          'LAUNDRY-0024',

        customerName:
          'Saifali',

        mobile:
          '6361633230',

        date:
          '2026-08-16',

        subtotal:
          3575,

        discountAmount:
          0,

        couponDiscountAmount:
          0,

        expressAmount:
          1787.5,

        totalAmount:
          5362.5,

        itemCount:
          13,

        homeDelivery:
          false,

        expressDelivery:
          true,

        paymentMethod:
          'UPI',

        paymentStatus:
          'PAID',

        status:
          'TAGGED'
      },

      {
        orderNumber:
          'LAUNDRY-0023',

        customerName:
          'Rohan',

        mobile:
          '9845012345',

        date:
          '2026-08-16',

        subtotal:
          980,

        discountAmount:
          80,

        couponDiscountAmount:
          0,

        expressAmount:
          0,

        totalAmount:
          900,

        itemCount:
          6,

        homeDelivery:
          false,

        expressDelivery:
          false,

        paymentMethod:
          'CASH',

        paymentStatus:
          'PAID',

        status:
          'PROCESSING_AT_STORE'
      },

      {
        orderNumber:
          'LAUNDRY-0022',

        customerName:
          'Saifali',

        mobile:
          '6361633230',

        date:
          '2026-08-16',

        subtotal:
          850,

        discountAmount:
          50,

        couponDiscountAmount:
          0,

        expressAmount:
          0,

        totalAmount:
          800,

        itemCount:
          4,

        homeDelivery:
          true,

        expressDelivery:
          false,

        paymentMethod:
          'UPI',

        paymentStatus:
          'PARTIAL',

        status:
          'PROCESSING_AT_STORE'
      },

      {
        orderNumber:
          'LAUNDRY-0021',

        customerName:
          'Priya',

        mobile:
          '9988776655',

        date:
          '2026-08-15',

        subtotal:
          1750,

        discountAmount:
          100,

        couponDiscountAmount:
          150,

        expressAmount:
          750,

        totalAmount:
          2250,

        itemCount:
          8,

        homeDelivery:
          true,

        expressDelivery:
          true,

        paymentMethod:
          'CARD',

        paymentStatus:
          'PAID',

        status:
          'READY_ORDER'
      },

      {
        orderNumber:
          'LAUNDRY-0020',

        customerName:
          'Saifali',

        mobile:
          '6361633230',

        date:
          '2026-08-15',

        subtotal:
          1250,

        discountAmount:
          100,

        couponDiscountAmount:
          0,

        expressAmount:
          0,

        totalAmount:
          1150,

        itemCount:
          5,

        homeDelivery:
          false,

        expressDelivery:
          false,

        paymentMethod:
          'CASH',

        paymentStatus:
          'PAID',

        status:
          'DELIVERED'
      },

      {
        orderNumber:
          'LAUNDRY-0019',

        customerName:
          'Qwerty',

        mobile:
          '9880811661',

        date:
          '2026-08-15',

        subtotal:
          640,

        discountAmount:
          0,

        couponDiscountAmount:
          0,

        expressAmount:
          0,

        totalAmount:
          640,

        itemCount:
          3,

        homeDelivery:
          false,

        expressDelivery:
          false,

        paymentMethod:
          'UPI',

        paymentStatus:
          'PENDING',

        status:
          'CANCELLED'
      }

    ];


  ngOnInit(): void {

    this.setThisWeek();
  }


  get filteredOrders():
    SalesOrder[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    return this.orders.filter(
      order => {

        const matchesStatus =
          this.selectedStatus ===
            'ALL' ||
          order.status ===
            this.selectedStatus;

        const matchesSearch =
          !search ||
          order.orderNumber
            .toLowerCase()
            .includes(
              search
            ) ||
          order.customerName
            .toLowerCase()
            .includes(
              search
            ) ||
          order.mobile
            .includes(
              search
            );

        return (
          matchesStatus &&
          matchesSearch
        );
      }
    );
  }


  setToday(): void {

    const today =
      this.formatLocalDate(
        new Date()
      );

    this.startDate =
      today;

    this.endDate =
      today;
  }


  setYesterday(): void {

    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const date =
      this.formatLocalDate(
        yesterday
      );

    this.startDate =
      date;

    this.endDate =
      date;
  }


  setThisWeek(): void {

    const today =
      new Date();

    const day =
      today.getDay();

    const difference =
      day === 0
        ? -6
        : 1 - day;

    const monday =
      new Date(
        today
      );

    monday.setDate(
      today.getDate() +
      difference
    );

    this.startDate =
      this.formatLocalDate(
        monday
      );

    this.endDate =
      this.formatLocalDate(
        today
      );
  }


  setThisMonth(): void {

    const today =
      new Date();

    const firstDay =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    this.startDate =
      this.formatLocalDate(
        firstDay
      );

    this.endDate =
      this.formatLocalDate(
        today
      );
  }


  refresh(): void {

    this.loading =
      true;

    setTimeout(
      () => {

        this.loading =
          false;
      },
      500
    );
  }


  selectStatus(
    status:
      SalesOrderStatus | 'ALL'
  ): void {

    this.selectedStatus =
      status;
  }


  formatAmount(
    amount:
      number
  ): string {

    return Number(
      amount ?? 0
    ).toFixed(
      2
    );
  }


  getStatusLabel(
    status:
      SalesOrderStatus
  ): string {

    switch (
      status
    ) {

      case 'TAGGED':
        return 'Tagged';

      case 'PROCESSING_AT_STORE':
        return 'Processing At Store';

      case 'READY_ORDER':
        return 'Ready Order';

      case 'DELIVERED':
        return 'Delivered';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;
    }
  }


  getPaymentMethodLabel(
    method:
      PaymentMethod
  ): string {

    switch (
      method
    ) {

      case 'UPI':
        return 'UPI';

      case 'CASH':
        return 'Cash';

      case 'CARD':
        return 'Card';

      case 'OTHER':
        return 'Other';

      default:
        return method;
    }
  }


  getPaymentStatusLabel(
    status:
      SalesOrder['paymentStatus']
  ): string {

    switch (
      status
    ) {

      case 'PAID':
        return 'Paid';

      case 'PARTIAL':
        return 'Partial';

      case 'PENDING':
        return 'Pending';

      default:
        return status;
    }
  }


  private formatLocalDate(
    date:
      Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );

    return `${year}-${month}-${day}`;
  }

}