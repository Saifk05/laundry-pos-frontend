import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../../core/services/api.service';

import {
  CouponResponse,
  ProductResponse,
  ProductServiceResponse,
  WalkInOrderRequest
} from '../../../../core/models/walk-in.model';

interface OrderItem {
  productId: string;
  serviceId: string;

  productName: string;
  serviceName: string;

  price: number;
  quantity: number;
  total: number;
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

  customerName = '';
  customerPhone = '';

  customerFound = false;
  newCustomer = false;
  customerMessage = '';

  searchText = '';
  selectedCategory = 'All';

  orderCreated = false;
  createdOrderNumber = '';

  deliveryDate = '';
  deliveryTime = '09:00 AM - 12:00 PM';

  homeDelivery = false;
  expressDelivery = false;

  washingArea = true;
  pressingArea = true;

  couponDropdownOpen = false;
  couponCode = '';
  couponDiscount = 0;
  couponMessage = '';
  couponApplied = false;

  loadingProducts = false;
  loadingCoupons = false;
  creatingOrder = false;

  products: ProductResponse[] = [];
  coupons: CouponResponse[] = [];

  categories: string[] = [
    'All',
    'Men',
    'Women',
    'Kids',
    'Household'
  ];

  orderItems: OrderItem[] = [];

  constructor(
    private readonly apiService: ApiService
  ) {}

  ngOnInit(): void {

    this.setDefaultDeliveryDate();

    this.loadProducts();
    this.loadCoupons();
  }

  /* =========================================
     PRODUCTS
  ========================================= */

  loadProducts(): void {

    this.loadingProducts = true;

    this.apiService
      .getProducts()
      .subscribe({
        next: (response) => {

          this.products = response;

          this.loadingProducts = false;
        },

        error: (error) => {

          console.error(
            'Unable to load products',
            error
          );

          this.products = [];

          this.loadingProducts = false;
        }
      });
  }

  get filteredProducts(): ProductResponse[] {

    return this.products.filter(
      (product) => {

        const matchesCategory =
          this.selectedCategory === 'All' ||
          product.category === this.selectedCategory;

        const matchesSearch =
          product.name
            .toLowerCase()
            .includes(
              this.searchText
                .trim()
                .toLowerCase()
            );

        return (
          matchesCategory &&
          matchesSearch
        );
      }
    );
  }

  selectCategory(
    category: string
  ): void {

    this.selectedCategory =
      category;
  }

  addProduct(
    product: ProductResponse,
    service: ProductServiceResponse
  ): void {

    const existingItem =
      this.orderItems.find(
        (item) =>
          item.productId === product.id &&
          item.serviceId === service.serviceId
      );

    if (existingItem) {

      existingItem.quantity++;

      existingItem.total =
        existingItem.quantity *
        existingItem.price;

      return;
    }

    this.orderItems.push({
      productId: product.id,
      serviceId: service.serviceId,

      productName: product.name,
      serviceName: service.name,

      price: service.price,
      quantity: 1,
      total: service.price
    });
  }

  increaseQuantity(
    item: OrderItem
  ): void {

    item.quantity++;

    item.total =
      item.quantity *
      item.price;
  }

  decreaseQuantity(
    item: OrderItem
  ): void {

    if (item.quantity <= 1) {

      this.removeItem(item);

      return;
    }

    item.quantity--;

    item.total =
      item.quantity *
      item.price;
  }

  removeItem(
    item: OrderItem
  ): void {

    this.orderItems =
      this.orderItems.filter(
        (orderItem) =>
          orderItem !== item
      );
  }

  /* =========================================
     CUSTOMER
  ========================================= */

  onPhoneChange(): void {

    this.customerPhone =
      this.customerPhone
        .replace(/\D/g, '')
        .slice(0, 10);

    this.customerFound = false;
    this.newCustomer = false;
    this.customerMessage = '';

    if (this.customerPhone.length !== 10) {

      this.customerName = '';

      return;
    }

    this.apiService
      .getCustomerByPhone(
        this.customerPhone
      )
      .subscribe({
        next: (customer) => {

          this.customerName =
            customer.name;

          this.customerFound = true;
          this.newCustomer = false;

          this.customerMessage =
            'Existing customer found';
        },

        error: (error) => {

          if (error.status === 404) {

            this.customerName = '';

            this.customerFound = false;
            this.newCustomer = true;

            this.customerMessage =
              'New customer - enter customer name';

            return;
          }

          this.customerName = '';

          this.customerFound = false;
          this.newCustomer = false;

          this.customerMessage =
            'Unable to check customer';
        }
      });
  }

  /* =========================================
     COUPONS
  ========================================= */

  loadCoupons(): void {

    this.loadingCoupons = true;

    this.apiService
      .getCoupons()
      .subscribe({
        next: (response) => {

          this.coupons = response;

          this.loadingCoupons = false;
        },

        error: (error) => {

          console.error(
            'Unable to load coupons',
            error
          );

          this.coupons = [];

          this.loadingCoupons = false;
        }
      });
  }

  toggleCouponDropdown(): void {

    this.couponDropdownOpen =
      !this.couponDropdownOpen;
  }

  selectCoupon(
    coupon: CouponResponse
  ): void {

    if (!coupon.active) {
      return;
    }

    this.couponCode =
      coupon.code;

    this.couponDiscount =
      coupon.amount;

    this.couponApplied = true;
    this.couponDropdownOpen = false;

    this.couponMessage =
      `${coupon.code} applied - ₹${coupon.amount} discount`;
  }

  applyCoupon(): void {

    const code =
      this.couponCode
        .trim()
        .toUpperCase();

    if (!code) {

      this.couponDiscount = 0;
      this.couponApplied = false;

      this.couponMessage =
        'Enter a coupon code';

      return;
    }

    const coupon =
      this.coupons.find(
        (item) =>
          item.code.toUpperCase() === code
      );

    if (!coupon) {

      this.couponDiscount = 0;
      this.couponApplied = false;

      this.couponMessage =
        'Invalid coupon code';

      return;
    }

    if (!coupon.active) {

      this.couponDiscount = 0;
      this.couponApplied = false;

      this.couponMessage =
        'This coupon is currently inactive';

      return;
    }

    this.selectCoupon(coupon);
  }

  removeCoupon(): void {

    this.couponCode = '';
    this.couponDiscount = 0;

    this.couponApplied = false;
    this.couponMessage = '';

    this.couponDropdownOpen = false;
  }

  /* =========================================
     TOTALS
  ========================================= */

  get totalPieces(): number {

    return this.orderItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }

  get subtotal(): number {

    return this.orderItems.reduce(
      (total, item) =>
        total + item.total,
      0
    );
  }

  get grandTotal(): number {

    let total =
      this.subtotal -
      this.couponDiscount;

    if (this.expressDelivery) {
      total += 100;
    }

    return Math.max(
      total,
      0
    );
  }

  /* =========================================
     CREATE ORDER
  ========================================= */

  createOrder(): void {

    if (this.creatingOrder) {
      return;
    }

    if (!this.customerPhone.trim()) {

      this.customerMessage =
        'Enter customer phone number';

      return;
    }

    if (
      this.customerPhone.length !== 10
    ) {

      this.customerMessage =
        'Enter a valid 10 digit phone number';

      return;
    }

    if (!this.customerName.trim()) {

      this.customerMessage =
        'Enter customer name';

      return;
    }

    if (this.orderItems.length === 0) {
      return;
    }

    if (!this.deliveryDate) {
      return;
    }

    const request: WalkInOrderRequest = {

      customerName:
        this.customerName.trim(),

      customerPhone:
        this.customerPhone.trim(),

      deliveryDate:
        this.deliveryDate,

      deliverySlot:
        this.deliveryTime,

      homeDelivery:
        this.homeDelivery,

      expressDelivery:
        this.expressDelivery,

      washingArea:
        this.washingArea,

      pressingArea:
        this.pressingArea,

      couponCode:
        this.couponApplied
          ? this.couponCode
          : null,

      items:
        this.orderItems.map(
          (item) => ({
            productId:
              item.productId,

            serviceId:
              item.serviceId,

            quantity:
              item.quantity
          })
        )
    };

    this.creatingOrder = true;

    this.apiService
      .createWalkInOrder(request)
      .subscribe({
        next: (response) => {

          this.creatingOrder = false;

          this.createdOrderNumber =
            response.orderNumber;

          this.couponDiscount =
            response.couponDiscount;

          this.orderCreated = true;
        },

        error: (error) => {

          this.creatingOrder = false;

          console.error(
            'Unable to create order',
            error
          );
        }
      });
  }

  /* =========================================
     SUCCESS MODAL
  ========================================= */

  closeOrderModal(): void {

    this.orderCreated = false;

    this.resetOrder();
  }

  printReceipt(): void {

    console.log(
      'Print receipt:',
      this.createdOrderNumber
    );
  }

  printTag(): void {

    console.log(
      'Print tag:',
      this.createdOrderNumber
    );
  }

  printQrTag(): void {

    console.log(
      'Print QR tag:',
      this.createdOrderNumber
    );
  }

  /* =========================================
     RESET ORDER
  ========================================= */

  private resetOrder(): void {

    this.customerName = '';
    this.customerPhone = '';

    this.customerFound = false;
    this.newCustomer = false;
    this.customerMessage = '';

    this.orderItems = [];

    this.homeDelivery = false;
    this.expressDelivery = false;

    this.washingArea = true;
    this.pressingArea = true;

    this.couponCode = '';
    this.couponDiscount = 0;
    this.couponMessage = '';
    this.couponApplied = false;
    this.couponDropdownOpen = false;

    this.deliveryTime =
      '09:00 AM - 12:00 PM';

    this.createdOrderNumber = '';

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