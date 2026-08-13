import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface LaundryService {
  id: string;
  name: string;
  price: number;
  unit: 'pc' | 'kg';
}

interface LaundryProduct {
  id: string;
  name: string;
  icon: string;
  types: string[];
  services: LaundryService[];
}

interface SelectedOrderItem {
  id: string;

  productId: string;
  productName: string;

  type: string;

  serviceIds: string[];
  serviceNames: string[];

  unitPrice: number;
  quantity: number;

  unit: 'pc' | 'kg';

  preferences: string[];

  comment: string;

  total: number;
}

interface Coupon {
  code: string;
  amount: number;
  active: boolean;
}

@Component({
  selector: 'app-new-walk-in',
  standalone: true,
  templateUrl: './new-walk-in.page.html',
  styleUrls: ['./new-walk-in.page.scss'],
  imports: [
    FormsModule
  ]
})
export class NewWalkInPage implements OnInit {

  /* =========================================
     CUSTOMER
  ========================================= */

  customerName = '';

  customerPhone = '';


  /* =========================================
     PRODUCT SEARCH
  ========================================= */

  searchText = '';

  selectedLetter = 'ALL';

  letters: string[] = [
    'ALL',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ];


  /* =========================================
     PRODUCT MODAL
  ========================================= */

  productModalOpen = false;

  selectedProduct: LaundryProduct | null = null;

  selectedProductType = '';

  selectedServiceIds: string[] = [];

  selectedPreferences: string[] = [];

  productComment = '';

  modalQuantity = 1;

  availablePreferences: string[] = [
    'Normal Wash',
    'Softener',
    'No Perfume',
    'Extra Care',
    'Remove Stains'
  ];


  /* =========================================
     ORDER
  ========================================= */

  orderItems: SelectedOrderItem[] = [];


  /* =========================================
     DELIVERY
  ========================================= */

  deliveryDate = '';

  deliveryTime = '';

  homeDelivery = false;

  expressDelivery = false;

  expressPercentage = 0;

  readonly expressPercentages: number[] = [
    10,
    20,
    30,
    40,
    50
  ];

  readonly deliveryTimeSlots: string[] = [
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


  /* =========================================
     DISCOUNT / COUPON
  ========================================= */

  discountAmount = 0;

  couponDropdownOpen = false;

  couponApplied = false;

  couponCode = '';

  couponDiscount = 0;


  /* =========================================
     ORDER SUCCESS
  ========================================= */

  orderCreated = false;

  createdOrderNumber = '';


  /* =========================================
     DUMMY COUPONS
  ========================================= */

  coupons: Coupon[] = [
    {
      code: 'WELCOME50',
      amount: 50,
      active: true
    },
    {
      code: 'FAB100',
      amount: 100,
      active: true
    },
    {
      code: 'OLD50',
      amount: 50,
      active: false
    }
  ];


  /* =========================================
     DUMMY PRODUCTS
  ========================================= */

  products: LaundryProduct[] = [

    {
      id: 'laundry-weight',

      name: 'Laundry By Weight',

      icon: '🧺',

      types: [],

      services: [
        {
          id: 'wash-fold',
          name: 'Wash & Fold',
          price: 109,
          unit: 'kg'
        },
        {
          id: 'wash-iron',
          name: 'Wash & Iron',
          price: 135,
          unit: 'kg'
        },
        {
          id: 'premium-laundry',
          name: 'Premium Laundry',
          price: 275,
          unit: 'kg'
        }
      ]
    },

    {
      id: 'shirt',

      name: 'Shirt',

      icon: '👔',

      types: [
        'Kids',
        'Silk',
        'Cotton'
      ],

      services: [
        {
          id: 'shirt-dry-clean',
          name: 'Dry Clean',
          price: 80,
          unit: 'pc'
        },
        {
          id: 'shirt-steam',
          name: 'Steam Press',
          price: 15,
          unit: 'pc'
        },
        {
          id: 'shirt-starch',
          name: 'Starching',
          price: 20,
          unit: 'pc'
        }
      ]
    },

    {
      id: 'tshirt',

      name: 'T-Shirt',

      icon: '👕',

      types: [
        'Kids',
        'Cotton',
        'Long Sleeves'
      ],

      services: [
        {
          id: 'tshirt-dry-clean',
          name: 'Dry Clean',
          price: 70,
          unit: 'pc'
        },
        {
          id: 'tshirt-steam',
          name: 'Steam Press',
          price: 15,
          unit: 'pc'
        },
        {
          id: 'tshirt-starch',
          name: 'Starching',
          price: 20,
          unit: 'pc'
        }
      ]
    },

    {
      id: 'trouser',

      name: 'Trouser / Jeans',

      icon: '👖',

      types: [
        'Kids',
        'Jeans',
        'Track',
        'Casual',
        'Formal'
      ],

      services: [
        {
          id: 'trouser-dry-clean',
          name: 'Dry Clean',
          price: 90,
          unit: 'pc'
        },
        {
          id: 'trouser-steam',
          name: 'Steam Press',
          price: 20,
          unit: 'pc'
        },
        {
          id: 'trouser-starch',
          name: 'Starching',
          price: 25,
          unit: 'pc'
        }
      ]
    },

    {
      id: 'blazer',

      name: 'Blazer',

      icon: '🥼',

      types: [
        'Men',
        'Women'
      ],

      services: [
        {
          id: 'blazer-dry-clean',
          name: 'Dry Clean',
          price: 250,
          unit: 'pc'
        },
        {
          id: 'blazer-steam',
          name: 'Steam Press',
          price: 70,
          unit: 'pc'
        }
      ]
    },

    {
      id: 'bedsheet',

      name: 'Bedsheet',

      icon: '🛏️',

      types: [
        'Single',
        'Double',
        'King'
      ],

      services: [
        {
          id: 'bedsheet-wash',
          name: 'Wash',
          price: 120,
          unit: 'pc'
        },
        {
          id: 'bedsheet-dry',
          name: 'Dry Clean',
          price: 180,
          unit: 'pc'
        }
      ]
    }

  ];


  /* =========================================
     INIT
  ========================================= */

  ngOnInit(): void {

    this.setDefaultDeliveryDate();

  }


  /* =========================================
     PRODUCT FILTER
  ========================================= */

  get filteredProducts(): LaundryProduct[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    return this.products.filter(
      product => {

        const matchesSearch =
          !search ||
          product.name
            .toLowerCase()
            .includes(search);

        const matchesLetter =
          this.selectedLetter === 'ALL' ||
          product.name
            .toUpperCase()
            .startsWith(
              this.selectedLetter
            );

        return (
          matchesSearch &&
          matchesLetter
        );
      }
    );
  }


  selectLetter(
    letter: string
  ): void {

    this.selectedLetter =
      letter;
  }


  /* =========================================
     OPEN PRODUCT MODAL
  ========================================= */

  openProduct(
    product: LaundryProduct
  ): void {

    this.selectedProduct =
      product;

    this.selectedProductType =
      product.types.length > 0
        ? product.types[0]
        : '';

    this.selectedServiceIds = [];

    this.selectedPreferences = [];

    this.productComment = '';

    this.modalQuantity = 1;

    this.productModalOpen = true;
  }


  closeProductModal(): void {

    this.productModalOpen = false;

    this.selectedProduct = null;

    this.selectedProductType = '';

    this.selectedServiceIds = [];

    this.selectedPreferences = [];

    this.productComment = '';

    this.modalQuantity = 1;
  }


  selectProductType(
    type: string
  ): void {

    this.selectedProductType =
      type;
  }


  /* =========================================
     SERVICE SELECTION
  ========================================= */

  toggleService(
    serviceId: string
  ): void {

    const exists =
      this.selectedServiceIds
        .includes(serviceId);

    if (exists) {

      this.selectedServiceIds =
        this.selectedServiceIds.filter(
          id =>
            id !== serviceId
        );

      return;
    }

    this.selectedServiceIds = [
      ...this.selectedServiceIds,
      serviceId
    ];
  }


  isServiceSelected(
    serviceId: string
  ): boolean {

    return this.selectedServiceIds
      .includes(serviceId);
  }


  /* =========================================
     PREFERENCES
  ========================================= */

  togglePreference(
    preference: string
  ): void {

    const exists =
      this.selectedPreferences
        .includes(preference);

    if (exists) {

      this.selectedPreferences =
        this.selectedPreferences.filter(
          item =>
            item !== preference
        );

      return;
    }

    this.selectedPreferences = [
      ...this.selectedPreferences,
      preference
    ];
  }


  isPreferenceSelected(
    preference: string
  ): boolean {

    return this.selectedPreferences
      .includes(preference);
  }


  /* =========================================
     MODAL QUANTITY
  ========================================= */

  increaseModalQuantity(): void {

    this.modalQuantity++;
  }


  decreaseModalQuantity(): void {

    if (
      this.modalQuantity > 1
    ) {

      this.modalQuantity--;
    }
  }


  /* =========================================
     ADD CONFIGURED PRODUCT
  ========================================= */

  addConfiguredProduct(): void {

    if (!this.selectedProduct) {
      return;
    }

    if (
      this.selectedServiceIds.length === 0
    ) {
      return;
    }

    const selectedServices =
      this.selectedProduct.services.filter(
        service =>
          this.selectedServiceIds
            .includes(service.id)
      );

    const unitPrice =
      selectedServices.reduce(
        (
          total,
          service
        ) =>
          total + service.price,
        0
      );

    const unit =
      selectedServices[0]?.unit ??
      'pc';

    const item: SelectedOrderItem = {

      id:
        `${Date.now()}-${Math.random()}`,

      productId:
        this.selectedProduct.id,

      productName:
        this.selectedProduct.name,

      type:
        this.selectedProductType,

      serviceIds:
        selectedServices.map(
          service =>
            service.id
        ),

      serviceNames:
        selectedServices.map(
          service =>
            service.name
        ),

      unitPrice,

      quantity:
        this.modalQuantity,

      unit,

      preferences:
        [
          ...this.selectedPreferences
        ],

      comment:
        this.productComment
          .trim(),

      total:
        unitPrice *
        this.modalQuantity
    };

    this.orderItems = [
      ...this.orderItems,
      item
    ];

    this.closeProductModal();
  }


  /* =========================================
     CART QUANTITY
  ========================================= */

  increaseQuantity(
    item: SelectedOrderItem
  ): void {

    item.quantity++;

    item.total =
      item.unitPrice *
      item.quantity;
  }


  decreaseQuantity(
    item: SelectedOrderItem
  ): void {

    if (
      item.quantity <= 1
    ) {

      this.removeItem(item);

      return;
    }

    item.quantity--;

    item.total =
      item.unitPrice *
      item.quantity;
  }


  removeItem(
    item: SelectedOrderItem
  ): void {

    this.orderItems =
      this.orderItems.filter(
        orderItem =>
          orderItem.id !== item.id
      );
  }


  /* =========================================
     TOTALS
  ========================================= */

  get totalPieces(): number {

    return this.orderItems.reduce(
      (
        total,
        item
      ) =>
        total + item.quantity,
      0
    );
  }


  get grossTotal(): number {

    return this.orderItems.reduce(
      (
        total,
        item
      ) =>
        total + item.total,
      0
    );
  }


  get expressAmount(): number {

    if (
      !this.expressDelivery ||
      this.expressPercentage <= 0
    ) {

      return 0;
    }

    return Math.round(
      this.grossTotal *
      (
        this.expressPercentage /
        100
      )
    );
  }


  get totalDiscount(): number {

    return (
      this.discountAmount +
      this.couponDiscount
    );
  }


  get grandTotal(): number {

    const amount =
      this.grossTotal +
      this.expressAmount -
      this.totalDiscount;

    return Math.max(
      amount,
      0
    );
  }


  /* =========================================
     DELIVERY
  ========================================= */

  get minimumDeliveryDate(): string {

    const today =
      new Date();

    return today
      .toISOString()
      .split('T')[0];
  }


  onExpressDeliveryChange(): void {

    if (!this.expressDelivery) {

      this.expressPercentage = 0;

    }
  }


  selectExpressPercentage(
    percentage: number
  ): void {

    this.expressPercentage =
      percentage;
  }


  /* =========================================
     COUPON
  ========================================= */

  toggleCouponDropdown(): void {

    this.couponDropdownOpen =
      !this.couponDropdownOpen;
  }


  selectCoupon(
    coupon: Coupon
  ): void {

    if (!coupon.active) {
      return;
    }

    this.couponApplied = true;

    this.couponCode =
      coupon.code;

    this.couponDiscount =
      coupon.amount;

    this.couponDropdownOpen =
      false;
  }


  removeCoupon(): void {

    this.couponApplied = false;

    this.couponCode = '';

    this.couponDiscount = 0;

    this.couponDropdownOpen =
      false;
  }


  /* =========================================
     CREATE ORDER - UI ONLY
  ========================================= */

  createOrder(): void {

    if (
      !this.customerName.trim() ||
      !this.customerPhone.trim() ||
      this.orderItems.length === 0
    ) {

      return;
    }

    if (!this.deliveryDate) {
      return;
    }

    if (!this.deliveryTime) {
      return;
    }

    if (
      this.expressDelivery &&
      this.expressPercentage <= 0
    ) {

      return;
    }

    this.createdOrderNumber =
      `WLK-${Date.now()
        .toString()
        .slice(-6)}`;

    this.orderCreated = true;
  }


  /* =========================================
     ORDER SUCCESS
  ========================================= */

  closeOrderModal(): void {

    this.orderCreated = false;
  }


  printReceipt(): void {

    console.log(
      'UI only - Print Receipt',
      this.createdOrderNumber
    );
  }


  printTag(): void {

    console.log(
      'UI only - Print Tag',
      this.createdOrderNumber
    );
  }


  printQrTag(): void {

    console.log(
      'UI only - Print QR Tag',
      this.createdOrderNumber
    );
  }


  startNewOrder(): void {

    this.orderCreated = false;

    this.createdOrderNumber = '';

    this.customerName = '';

    this.customerPhone = '';

    this.orderItems = [];

    this.homeDelivery = false;

    this.expressDelivery = false;

    this.expressPercentage = 0;

    this.deliveryTime = '';

    this.discountAmount = 0;

    this.removeCoupon();

    this.setDefaultDeliveryDate();
  }


  /* =========================================
     DEFAULT DELIVERY DATE
  ========================================= */

  private setDefaultDeliveryDate(): void {

    const date =
      new Date();

    date.setDate(
      date.getDate() + 2
    );

    this.deliveryDate =
      date
        .toISOString()
        .split('T')[0];
  }

}