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

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  ApiService
} from '../../../../core/services/api.service';

import {
  CustomerResponse,
  WalkInCoupon,
  WalkInExpressCharge,
  WalkInOrderRequest,
  WalkInProduct,
  WalkInProductType,
  WalkInServicePrice,
  WalkInSetupResponse,
  OrderResponse,
  PricingUnit
} from '../../../../core/models/walk-in.model';

import {
  B2COrderDetails,
  RetagOrderRequest,
  RescheduleOrderRequest
} from '../../../../core/models/b2c-order.model';


interface SelectedOrderItem {
  id: string;
  productId: string;
  productName: string;
  typeId: string;
  typeName: string;
  serviceIds: string[];
  serviceNames: string[];
  services: WalkInServicePrice[];
  unitPrice: number;
  quantity: number;
  unit: PricingUnit;
  preferences: string[];
  comment: string;
  total: number;
}


@Component({
  selector: 'app-new-walk-in',
  standalone: true,
  templateUrl: './new-walk-in.page.html',
  styleUrls: ['./new-walk-in.page.scss'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class NewWalkInPage
  implements OnInit {

  loading = false;

  creatingOrder = false;

  customerName = '';

  customerPhone = '';

  customerId: string | null = null;

  customerExists = false;

  checkingCustomer = false;

  customerMessage = '';

  searchText = '';

  products: WalkInProduct[] = [];

  productModalOpen = false;

  editingOrderItemId:
    string | null = null;

  selectedProduct:
    WalkInProduct | null = null;

  selectedProductType:
    WalkInProductType | null = null;

  selectedServiceIds:
    string[] = [];

  selectedPreferences:
    string[] = [];

  productComment = '';

  modalQuantity = 1;

  availablePreferences:
    string[] = [
      'Normal Wash',
      'Softener',
      'No Perfume',
      'Extra Care',
      'Remove Stains'
    ];

  orderItems:
    SelectedOrderItem[] = [];

  deliveryDate = '';

  deliveryDateOptions: {
    value: string;
    label: string;
  }[] = [];

  deliveryTime = '';

  homeDelivery = false;

  expressDelivery = false;

  selectedExpressChargeId:
    string | null = null;

  expressPercentage = 0;

  expressCharges:
    WalkInExpressCharge[] = [];

  readonly deliveryTimeSlots:
    string[] = [
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

  discountAmount = 0;

  coupons:
    WalkInCoupon[] = [];

  couponDropdownOpen = false;

  couponApplied = false;

  selectedCouponId:
    string | null = null;

  couponCode = '';

  couponDiscount = 0;

  orderCreated = false;

  createdOrderNumber = '';

  createdOrder:
    OrderResponse | null = null;

  errorMessage = '';

  isRetagMode = false;

  retagOrderId:
    string | null = null;

  retagOrderNumber = '';

  loadingRetagOrder = false;

  isRescheduleMode = false;

  rescheduleOrderId:
    string | null = null;

  businessName =
    'Venkateshwara Fabric Works';


  constructor(
    private readonly apiService:
      ApiService,

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router
  ) {}


  ngOnInit(): void {

    this.initializeOrderMode();

    this.generateDeliveryDates();

    this.setDefaultDeliveryDate();

    this.loadWalkInSetup();

    this.loadBusinessSettings();
  }


  loadBusinessSettings(): void {

  this.apiService
    .getBusinessSettings()
    .subscribe({

        next: (
          response:
            any
        ) => {

          this.businessName =
            response?.businessName ||
            'Venkateshwara Fabric Works';
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Settings load error',
            error
          );
        }

      });
  }


  loadWalkInSetup(): void {

    this.loading = true;

    this.errorMessage = '';

    this.apiService
      .getWalkInSetup()
      .subscribe({

        next: (
          response:
            WalkInSetupResponse
        ) => {

          this.products =
            response.products ?? [];

          this.coupons =
            response.coupons ?? [];

          this.expressCharges =
            response.expressCharges ?? [];

          this.loading = false;

          if (
            this.isRetagMode &&
            this.retagOrderId
          ) {

            this.loadRetagOrder();

            return;
          }

          if (
            this.isRescheduleMode &&
            this.rescheduleOrderId
          ) {

            this.loadRescheduleOrder();
          }
        },

        error: (error: any) => {

          console.error(
            'Walk-in setup error',
            error
          );

          this.errorMessage =
            'Unable to load walk-in setup';

          this.loading = false;
        }

      });
  }


  private initializeOrderMode():
    void {

    const mode =
      this.route.snapshot
        .queryParamMap
        .get('mode');

    const orderId =
      this.route.snapshot
        .queryParamMap
        .get('orderId');

    this.isRetagMode =
      mode === 'retag' &&
      !!orderId;

    this.isRescheduleMode =
      mode === 'reschedule' &&
      !!orderId;

    this.retagOrderId =
      this.isRetagMode
        ? orderId
        : null;

    this.rescheduleOrderId =
      this.isRescheduleMode
        ? orderId
        : null;
  }


  private loadRetagOrder():
    void {

    if (
      !this.retagOrderId
    ) {

      return;
    }

    this.loadingRetagOrder =
      true;

    this.errorMessage =
      '';

    this.apiService
      .getB2COrderById(
        this.retagOrderId
      )
      .subscribe({

        next: (
          response:
            B2COrderDetails
        ) => {

          this.populateRetagOrder(
            response
          );

          this.loadingRetagOrder =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Load re-tag order error',
            error
          );

          this.loadingRetagOrder =
            false;

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load order for re-tag';
        }

      });
  }


  private loadRescheduleOrder():
    void {

    if (
      !this.rescheduleOrderId
    ) {

      return;
    }

    this.loadingRetagOrder =
      true;

    this.errorMessage =
      '';

    this.apiService
      .getB2COrderById(
        this.rescheduleOrderId
      )
      .subscribe({

        next: (
          response:
            B2COrderDetails
        ) => {

          this.populateRetagOrder(
            response
          );

          this.customerMessage =
            'Existing order loaded for reschedule';

          this.loadingRetagOrder =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Load reschedule order error',
            error
          );

          this.loadingRetagOrder =
            false;

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load order for reschedule';
        }

      });
  }


  private populateRetagOrder(
    order:
      B2COrderDetails
  ): void {

    this.retagOrderNumber =
      order.orderNumber;

    this.customerId =
      order.customer.id;

    this.customerName =
      order.customer.name;

    this.customerPhone =
      order.customer.phone;

    this.customerExists =
      true;

    this.customerMessage =
      'Existing order loaded for re-tag';

    this.deliveryDate =
      order.deliveryDate ?? '';

    this.deliveryTime =
      order.deliveryTime ?? '';

    this.homeDelivery =
      order.homeDelivery;

    this.orderItems =
      (order.items ?? [])
        .map(
          item => {

            const product =
              this.products.find(
                currentProduct =>
                  currentProduct.id ===
                    item.productId
              );

            const productType =
              product?.types.find(
                currentType =>
                  currentType.id ===
                    item.typeId
              );

            const configuredService =
              productType?.services.find(
                service =>
                  service.id ===
                    item.serviceId
              );

            const service =
              configuredService ??
              ({
                id:
                  item.serviceId,

                name:
                  item.serviceName,

                price:
                  Number(
                    item.unitPrice
                  ),

                active:
                  true
              } as WalkInServicePrice);

            return {

              id:
                item.id,

              productId:
                item.productId,

              productName:
                item.productName,

              typeId:
                item.typeId,

              typeName:
                item.typeName,

              serviceIds: [
                item.serviceId
              ],

              serviceNames: [
                item.serviceName
              ],

              services: [
                service
              ],

              unitPrice:
                Number(
                  item.unitPrice
                ),

              quantity:
                Number(
                  item.quantity
                ),

              unit:
                item.unit,

              preferences:
                [],

              comment:
                '',

              total:
                Number(
                  item.lineTotal
                )

            } as SelectedOrderItem;
          }
        );

    this.discountAmount =
      0;

    this.couponApplied =
      false;

    this.selectedCouponId =
      null;

    this.couponCode =
      '';

    this.couponDiscount =
      0;

    if (
      order.couponCode
    ) {

      const coupon =
        this.coupons.find(
          currentCoupon =>
            currentCoupon.code ===
              order.couponCode
        );

      this.couponApplied =
        true;

      this.selectedCouponId =
        coupon?.id ?? null;

      this.couponCode =
        order.couponCode;

      this.couponDiscount =
        Number(
          order.discountAmount ?? 0
        );

    } else {

      this.discountAmount =
        Number(
          order.discountAmount ?? 0
        );
    }

    const expressPercentage =
      Number(
        order.expressChargePercentage ??
        0
      );

    this.expressDelivery =
      expressPercentage > 0;

    this.expressPercentage =
      expressPercentage;

    if (
      this.expressDelivery
    ) {

      const expressCharge =
        this.expressCharges.find(
          charge =>
            Number(
              charge.percentage
            ) ===
            expressPercentage
        );

      this.selectedExpressChargeId =
        expressCharge?.id ?? null;

    } else {

      this.selectedExpressChargeId =
        null;
    }
  }


  cancelRetag():
    void {

    this.router.navigate(
      ['/app/b2c-orders']
    );
  }


  checkCustomer(): void {

    const phone =
      this.customerPhone.trim();

    if (!phone) {

      this.resetCustomerLookup();

      return;
    }

    if (phone.length !== 10) {

      this.customerMessage =
        'Enter valid 10 digit mobile number';

      return;
    }

    this.checkingCustomer = true;

    this.customerMessage = '';

    this.apiService
      .getCustomerByPhone(phone)
      .subscribe({

        next: (
          response:
            CustomerResponse
        ) => {

          this.checkingCustomer =
            false;

          this.customerExists =
            response.exists;

          this.customerId =
            response.id;

          if (
            response.exists &&
            response.name
          ) {

            this.customerName =
              response.name;

            this.customerMessage =
              'Existing customer found';

          } else {

            this.customerId =
              null;

            this.customerExists =
              false;

            this.customerName =
              '';

            this.customerMessage =
              'New customer';
          }
        },

        error: (error: any) => {

          console.error(
            'Customer lookup error',
            error
          );

          this.checkingCustomer =
            false;

          this.customerExists =
            false;

          this.customerId =
            null;

          if (
            error.status === 404
          ) {

            this.customerName =
              '';

            this.customerMessage =
              'New customer';

            return;
          }

          this.customerMessage =
            'Unable to check customer';
        }

      });
  }


  private resetCustomerLookup():
    void {

    this.customerId =
      null;

    this.customerExists =
      false;

    this.customerMessage =
      '';
  }


  get filteredProducts():
    WalkInProduct[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    return this.products.filter(
      (
        product:
          WalkInProduct
      ) =>

        !search ||
        product.name
          .toLowerCase()
          .includes(search)
    );
  }


  openProduct(
    product:
      WalkInProduct
  ): void {

    this.editingOrderItemId =
      null;

    this.selectedProduct =
      product;

    this.selectedProductType =
      product.types.length > 0
        ? product.types[0]
        : null;

    this.selectedServiceIds =
      [];

    this.selectedPreferences =
      [];

    this.productComment =
      '';

    this.modalQuantity =
      1;

    this.productModalOpen =
      true;
  }


  closeProductModal(): void {

    this.productModalOpen =
      false;

    this.editingOrderItemId =
      null;

    this.selectedProduct =
      null;

    this.selectedProductType =
      null;

    this.selectedServiceIds =
      [];

    this.selectedPreferences =
      [];

    this.productComment =
      '';

    this.modalQuantity =
      1;
  }


  selectProductType(
    type:
      WalkInProductType
  ): void {

    this.selectedProductType =
      type;

    this.selectedServiceIds =
      [];
  }


  get availableServices():
    WalkInServicePrice[] {

    if (
      !this.selectedProduct
    ) {

      return [];
    }

    if (
      this.selectedProductType
    ) {

      return (
        this.selectedProductType
          .services ?? []
      );
    }

    if (
      this.selectedProduct
        .types.length === 1
    ) {

      return (
        this.selectedProduct
          .types[0]
          .services ?? []
      );
    }

    return [];
  }


  toggleService(
    serviceId: string
  ): void {

    const exists =
      this.selectedServiceIds
        .includes(
          serviceId
        );

    if (exists) {

      this.selectedServiceIds =
        this.selectedServiceIds
          .filter(
            (
              id:
                string
            ) =>
              id !==
              serviceId
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
      .includes(
        serviceId
      );
  }


  togglePreference(
    preference:
      string
  ): void {

    const exists =
      this.selectedPreferences
        .includes(
          preference
        );

    if (exists) {

      this.selectedPreferences =
        this.selectedPreferences
          .filter(
            (
              item:
                string
            ) =>
              item !==
              preference
          );

      return;
    }

    this.selectedPreferences = [
      ...this.selectedPreferences,
      preference
    ];
  }


  isPreferenceSelected(
    preference:
      string
  ): boolean {

    return this.selectedPreferences
      .includes(
        preference
      );
  }


  increaseModalQuantity():
    void {

    this.modalQuantity++;
  }


  decreaseModalQuantity():
    void {

    if (
      this.modalQuantity > 1
    ) {

      this.modalQuantity--;
    }
  }


  addConfiguredProduct():
    void {

    if (
      !this.selectedProduct
    ) {

      return;
    }

    if (
      !this.selectedProductType
    ) {

      return;
    }

    if (
      this.selectedServiceIds
        .length === 0
    ) {

      return;
    }

    const selectedServices =
      this.availableServices
        .filter(
          (
            service:
              WalkInServicePrice
          ) =>
            this.selectedServiceIds
              .includes(
                service.id
              )
        );

    if (
      selectedServices.length === 0
    ) {

      return;
    }

    const unitPrice =
      selectedServices
        .reduce(
          (
            total:
              number,
            service:
              WalkInServicePrice
          ) =>
            total +
            Number(
              service.price
            ),
          0
        );

    const itemId =
      this.editingOrderItemId ??
      `${Date.now()}-${Math.random()}`;

    const item:
      SelectedOrderItem = {

      id:
        itemId,

      productId:
        this.selectedProduct.id,

      productName:
        this.selectedProduct.name,

      typeId:
        this.selectedProductType.id,

      typeName:
        this.selectedProductType.name,

      serviceIds:
        selectedServices.map(
          (
            service:
              WalkInServicePrice
          ) =>
            service.id
        ),

      serviceNames:
        selectedServices.map(
          (
            service:
              WalkInServicePrice
          ) =>
            service.name
        ),

      services:
        selectedServices,

      unitPrice:
        unitPrice,

      quantity:
        this.modalQuantity,

      unit:
        this.selectedProduct.unit,

      preferences: [
        ...this.selectedPreferences
      ],

      comment:
        this.productComment
          .trim(),

      total:
        unitPrice *
        this.modalQuantity
    };

    if (
      this.editingOrderItemId
    ) {

      this.orderItems =
        this.orderItems.map(
          (
            existingItem:
              SelectedOrderItem
          ) =>
            existingItem.id ===
            this.editingOrderItemId
              ? item
              : existingItem
        );

    } else {

      this.orderItems = [
        ...this.orderItems,
        item
      ];
    }

    this.closeProductModal();
  }


  increaseQuantity(
    item:
      SelectedOrderItem
  ): void {

    item.quantity++;

    item.total =
      item.unitPrice *
      item.quantity;
  }


  decreaseQuantity(
    item:
      SelectedOrderItem
  ): void {

    if (
      item.quantity <= 1
    ) {

      this.removeItem(
        item
      );

      return;
    }

    item.quantity--;

    item.total =
      item.unitPrice *
      item.quantity;
  }


  removeItem(
    item:
      SelectedOrderItem
  ): void {

    this.orderItems =
      this.orderItems.filter(
        (
          orderItem:
            SelectedOrderItem
        ) =>
          orderItem.id !==
          item.id
      );
  }


  get totalPieces():
    number {

    return this.orderItems
      .reduce(
        (
          total:
            number,
          item:
            SelectedOrderItem
        ) =>
          total +
          item.quantity,
        0
      );
  }


  get grossTotal():
    number {

    return this.orderItems
      .reduce(
        (
          total:
            number,
          item:
            SelectedOrderItem
        ) =>
          total +
          item.total,
        0
      );
  }


  get expressAmount():
    number {

    if (
      !this.expressDelivery ||
      this.expressPercentage <= 0
    ) {

      return 0;
    }

    const afterDiscount =
      Math.max(
        this.grossTotal -
        this.couponDiscount -
        this.discountAmount,
        0
      );

    return (
      afterDiscount *
      (
        this.expressPercentage /
        100
      )
    );
  }


  get totalDiscount():
    number {

    return (
      this.discountAmount +
      this.couponDiscount
    );
  }


  get grandTotal():
    number {

    const amount =
      this.grossTotal -
      this.totalDiscount +
      this.expressAmount;

    return Math.max(
      amount,
      0
    );
  }

get minimumDeliveryDate(): string {

  return this.formatLocalDate(
    new Date()
  );
}


get maximumDeliveryDate(): string {

  const date =
    new Date();

  date.setDate(
    date.getDate() + 9
  );

  return this.formatLocalDate(
    date
  );
}


private formatLocalDate(
  date: Date
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


  private generateDeliveryDates():
    void {

    const dates: {
      value: string;
      label: string;
    }[] = [];

    for (
      let index = 0;
      index < 10;
      index++
    ) {

      const date =
        new Date();

      date.setDate(
        date.getDate() + index
      );

      dates.push({
        value:
          this.formatLocalDate(
            date
          ),

        label:
          date.toLocaleDateString(
            'en-IN',
            {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }
          )
      });
    }

    this.deliveryDateOptions =
      dates;
  }


  onExpressDeliveryChange():
    void {

    if (
      !this.expressDelivery
    ) {

      this.selectedExpressChargeId =
        null;

      this.expressPercentage =
        0;
    }
  }


  selectExpressCharge(
    charge:
      WalkInExpressCharge
  ): void {

    if (
      !charge.active
    ) {

      return;
    }

    this.expressDelivery =
      true;

    this.selectedExpressChargeId =
      charge.id;

    this.expressPercentage =
      Number(
        charge.percentage
      );
  }


  onExpressChargeSelected(
    expressChargeId:
      string
  ): void {

    const charge =
      this.expressCharges.find(
        (
          item:
            WalkInExpressCharge
        ) =>
          item.id ===
          expressChargeId
      );

    if (
      !charge
    ) {

      this.selectedExpressChargeId =
        null;

      this.expressPercentage =
        0;

      return;
    }

    this.selectExpressCharge(
      charge
    );
  }


  selectExpressPercentage(
    percentage:
      number
  ): void {

    const charge =
      this.expressCharges.find(
        (
          item:
            WalkInExpressCharge
        ) =>
          Number(
            item.percentage
          ) ===
          Number(
            percentage
          )
      );

    if (
      !charge
    ) {

      this.selectedExpressChargeId =
        null;

      this.expressPercentage =
        0;

      return;
    }

    this.selectExpressCharge(
      charge
    );
  }


  toggleCouponDropdown():
    void {

    this.couponDropdownOpen =
      !this.couponDropdownOpen;
  }


  selectCoupon(
    coupon:
      WalkInCoupon
  ): void {

    if (
      !coupon.active
    ) {

      return;
    }

    if (
      this.grossTotal <
      Number(
        coupon.minimumOrderAmount
      )
    ) {

      this.errorMessage =
        `Minimum order amount for ${coupon.code} is ₹${coupon.minimumOrderAmount}`;

      return;
    }

    this.errorMessage =
      '';

    this.couponApplied =
      true;

    this.selectedCouponId =
      coupon.id;

    this.couponCode =
      coupon.code;

    if (
      coupon.discountType ===
      'PERCENTAGE'
    ) {

      this.couponDiscount =
        (
          this.grossTotal *
          Number(
            coupon.discountValue
          )
        ) / 100;

    } else {

      this.couponDiscount =
        Number(
          coupon.discountValue
        );
    }

    this.couponDiscount =
      Math.min(
        this.couponDiscount,
        this.grossTotal
      );

    this.couponDropdownOpen =
      false;
  }


  removeCoupon():
    void {

    this.couponApplied =
      false;

    this.selectedCouponId =
      null;

    this.couponCode =
      '';

    this.couponDiscount =
      0;

    this.couponDropdownOpen =
      false;
  }


  createOrder():
    void {

    this.errorMessage =
      '';

    if (
      this.isRescheduleMode
    ) {

      this.updateRescheduleOrder();

      return;
    }

    if (
      this.isRetagMode
    ) {

      console.log(
        '[RETAG] createOrder triggered',
        {
          orderId:
            this.retagOrderId,

          items:
            this.orderItems
        }
      );

      this.updateRetagOrder();

      return;
    }

    if (
      !this.customerPhone
        .trim()
    ) {

      this.errorMessage =
        'Customer phone is required';

      return;
    }

    if (
      this.customerPhone
        .trim()
        .length !== 10
    ) {

      this.errorMessage =
        'Enter valid 10 digit mobile number';

      return;
    }

    if (
      !this.customerName
        .trim()
    ) {

      this.errorMessage =
        'Customer name is required';

      return;
    }

    if (
      this.orderItems
        .length === 0
    ) {

      this.errorMessage =
        'Add at least one product';

      return;
    }

    if (
      !this.deliveryDate
    ) {

      this.errorMessage =
        'Delivery date is required';

      return;
    }

    if (
      !this.deliveryTime
    ) {

      this.errorMessage =
        'Delivery time is required';

      return;
    }

    if (
      this.expressDelivery &&
      !this.selectedExpressChargeId
    ) {

      this.errorMessage =
        'Select an express charge';

      return;
    }

    const items:
      WalkInOrderRequest['items'] =
      [];

    for (
      const item
      of this.orderItems
    ) {

      for (
        const service
        of item.services
      ) {

        items.push({

          productId:
            item.productId,

          typeId:
            item.typeId,

          serviceId:
            service.id,

          quantity:
            item.quantity

        });
      }
    }

const request:
  WalkInOrderRequest = {

  customer: {

    name:
      this.customerName
        .trim(),

    phone:
      this.customerPhone
        .trim()

  },

  items:
    items,

  couponId:
    this.selectedCouponId,

  expressChargeId:
    this.expressDelivery
      ? this.selectedExpressChargeId
      : null,

  deliveryDate:
    this.deliveryDate,

  deliveryTime:
    this.deliveryTime,

  homeDelivery:
    this.homeDelivery

};

    this.creatingOrder =
      true;

    this.apiService
      .createWalkInOrder(
        request
      )
      .subscribe({

        next: (
          response:
            OrderResponse
        ) => {

          this.creatingOrder =
            false;

          this.createdOrder =
            response;

          this.createdOrderNumber =
            response.orderNumber;

          this.orderCreated =
            true;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Create walk-in order error',
            error
          );

          this.creatingOrder =
            false;

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to create order';
        }

      });
  }


  private updateRescheduleOrder():
    void {

    if (
      !this.rescheduleOrderId
    ) {

      this.errorMessage =
        'Reschedule order id is missing';

      return;
    }

    if (
      !this.deliveryDate
    ) {

      this.errorMessage =
        'Delivery date is required';

      return;
    }

    if (
      !this.deliveryTime
    ) {

      this.errorMessage =
        'Delivery time is required';

      return;
    }

    const request:
      RescheduleOrderRequest = {

      deliveryDate:
        this.deliveryDate,

      deliveryTime:
        this.deliveryTime
    };

    this.creatingOrder =
      true;

    this.errorMessage =
      '';

    this.apiService
      .rescheduleB2COrder(
        this.rescheduleOrderId,
        request
      )
      .subscribe({

        next: () => {

          this.creatingOrder =
            false;

          this.router.navigate(
            ['/app/b2c-orders']
          );
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Reschedule order error',
            error
          );

          this.creatingOrder =
            false;

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to reschedule order';
        }

      });
  }


  private updateRetagOrder():
    void {

    console.log(
      '[RETAG] updateRetagOrder called'
    );

    if (
      !this.retagOrderId
    ) {

      this.errorMessage =
        'Re-tag order id is missing';

      console.error(
        '[RETAG] Missing order id'
      );

      return;
    }

    if (
      this.orderItems.length === 0
    ) {

      this.errorMessage =
        'At least one item must remain in the order';

      console.error(
        '[RETAG] No order items'
      );

      return;
    }

    const request:
      RetagOrderRequest = {

      items:
        this.orderItems.map(
          item => ({
            orderItemId:
              item.id,

            quantity:
              item.quantity
          })
        )
    };

    console.log(
      '[RETAG] Calling retagB2COrder',
      {
        orderId:
          this.retagOrderId,

        request
      }
    );

    this.creatingOrder =
      true;

    this.errorMessage =
      '';

    this.apiService
      .retagB2COrder(
        this.retagOrderId,
        request
      )
      .subscribe({

        next: (
          response:
            B2COrderDetails
        ) => {

          console.log(
            '[RETAG] API success',
            response
          );

          this.creatingOrder =
            false;

          this.createdOrderNumber =
            response.orderNumber;

          this.router.navigate(
            ['/app/b2c-orders']
          );
        },

        error: (
          error:
            any
        ) => {

          console.error(
            '[RETAG] API error',
            error
          );

          this.creatingOrder =
            false;

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to update re-tag order';
        }

      });
  }


  closeOrderModal():
    void {

    this.orderCreated =
      false;
  }

  printReceipt(): void {

  if (!this.createdOrder) {
    return;
  }

  const order =
    this.createdOrder;

  const termsAndConditions =
    localStorage.getItem(
      'receiptTermsAndConditions'
    ) ?? '';

  const termsHtml =
    termsAndConditions.trim()
      ? `
        <div class="divider"></div>

        <div class="terms">

          <div class="terms-title">
            Terms & Conditions
          </div>

          <div class="terms-content">
            ${termsAndConditions
              .split('\n')
              .filter(
                line =>
                  line.trim()
              )
              .map(
                line =>
                  `<div>${line}</div>`
              )
              .join('')}
          </div>

        </div>
      `
      : '';

  const itemsHtml =
    order.items
      .map(
        item => `
          <tr>
            <td>
              ${item.productName}
              ${item.typeName ? ` (${item.typeName})` : ''}
              <br>
              <small>
                ${item.serviceName}
              </small>
            </td>

            <td style="text-align:center;">
              ${item.quantity}
            </td>

            <td style="text-align:right;">
              ₹${Number(item.unitPrice).toFixed(2)}
            </td>

            <td style="text-align:right;">
              ₹${Number(item.lineTotal).toFixed(2)}
            </td>
          </tr>
        `
      )
      .join('');

const printWindow =
  window.open(
    '',
    '_blank',
    `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`
  );

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>

      <head>

        <title>
          Receipt
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 12px;
            font-family: Arial, sans-serif;
            color: #111;
            background: #fff;
          }

          .receipt {
            width: 80mm;
            margin: 0 auto;
            font-size: 12px;
          }

          .center {
            text-align: center;
          }

          .shop-name {
            font-size: 18px;
            font-weight: 700;
          }

          .muted {
            color: #555;
            font-size: 11px;
          }

          .divider {
            margin: 8px 0;
            border-top: 1px dashed #000;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin: 3px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }

          th,
          td {
            padding: 5px 2px;
            vertical-align: top;
            border-bottom: 1px dashed #bbb;
          }

          th {
            text-align: left;
            font-size: 11px;
          }

          td {
            font-size: 11px;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
          }

          .grand-total {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #000;
            font-size: 15px;
            font-weight: 700;
          }

          .terms {
            margin-top: 6px;
            font-size: 8px;
            line-height: 1.4;
          }

          .terms-title {
            margin-bottom: 4px;
            font-size: 9px;
            font-weight: 700;
            text-align: left;
          }

          .terms-content {
            text-align: left;
            color: #333;
          }

          .terms-content div {
            margin-bottom: 2px;
          }

          .footer {
            margin-top: 14px;
            text-align: center;
            font-size: 11px;
          }

          @media print {

            @page {
              size: 80mm auto;
              margin: 0;
            }

            body {
              padding: 4mm;
            }

          }

        </style>

      </head>

      <body>

        <div class="receipt">

          <div class="center">

            <div class="shop-name">
              ${this.businessName}
            </div>

            <div class="muted">
              Laundry Service Receipt
            </div>

          </div>

          <div class="divider"></div>

          <div class="info-row">

            <span>
              Order
            </span>

            <strong>
              #${order.orderNumber}
            </strong>

          </div>

          <div class="info-row">

            <span>
              Customer
            </span>

            <strong>
              ${order.customer.name}
            </strong>

          </div>

          <div class="info-row">

            <span>
              Mobile
            </span>

            <strong>
              ${order.customer.phone}
            </strong>

          </div>

          <div class="info-row">

            <span>
              Date
            </span>

            <strong>
              ${new Date(order.createdAt).toLocaleString()}
            </strong>

          </div>

          <div class="divider"></div>

          <table>

            <thead>

              <tr>

                <th>
                  Item
                </th>

                <th style="text-align:center;">
                  Qty
                </th>

                <th style="text-align:right;">
                  Rate
                </th>

                <th style="text-align:right;">
                  Total
                </th>

              </tr>

            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>

          </table>

          <div class="divider"></div>

          <div class="total-row">

            <span>
              Subtotal
            </span>

            <strong>
              ₹${Number(order.subtotal).toFixed(2)}
            </strong>

          </div>

          <div class="total-row">

            <span>
              Discount
            </span>

            <strong>
              -₹${Number(order.discountAmount).toFixed(2)}
            </strong>

          </div>

          <div class="total-row">

            <span>
              Express Charge
            </span>

            <strong>
              +₹${Number(order.expressChargeAmount).toFixed(2)}
            </strong>

          </div>

          <div class="total-row grand-total">

            <span>
              Total
            </span>

            <strong>
              ₹${Number(order.totalAmount).toFixed(2)}
            </strong>

          </div>

          ${termsHtml}

          <div class="footer">

            Thank you!

            <br>

            Please keep this receipt
            until collection.

          </div>

        </div>

        <script>

          window.onload = function () {
            window.print();
          };

        </script>

      </body>

    </html>
  `);

  printWindow.document.close();
}

printTag(): void {

  if (!this.createdOrder) {
    return;
  }

  const order =
    this.createdOrder;

  const createdDate =
    new Date(
      order.createdAt
    );

  const formattedDate =
    createdDate.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  const totalPieces =
    order.items
      .filter(
        item =>
          item.unit === 'PC'
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quantity
          ),
        0
      );

  let tagsHtml = '';

  for (
    const item
    of order.items
  ) {

    const typeName =
      item.typeName &&
      item.typeName
        .toLowerCase() !== 'default'
        ? item.typeName
        : '';

    const productDisplay =
      typeName
        ? `${item.productName} (${typeName})`
        : item.productName;

    const serviceCode =
      item.serviceName
        .split(' ')
        .filter(
          word =>
            word.trim()
        )
        .map(
          word =>
            word
              .charAt(0)
              .toUpperCase()
        )
        .join('');

    if (
      item.unit === 'PC'
    ) {

      const quantity =
        Math.max(
          1,
          Math.floor(
            Number(
              item.quantity
            )
          )
        );

      for (
        let index = 1;
        index <= quantity;
        index++
      ) {

        tagsHtml += `
          <section class="tag">

            <div class="business-name">
              ${this.businessName}
            </div>

            <div class="customer-name">
              ${order.customer.name}
            </div>

            <div class="order-number">
              #${order.orderNumber}
            </div>

            <div class="order-date">
              ${formattedDate}
            </div>

            <div class="service-code">
              ${serviceCode}
            </div>

            <div class="product-name">
              ${productDisplay}
            </div>

            <div class="tag-number">
              T${totalPieces}
            </div>

          </section>
        `;
      }

    } else {

      tagsHtml += `
        <section class="tag">

          <div class="business-name">
            ${this.businessName}
          </div>

          <div class="customer-name">
            ${order.customer.name}
          </div>

          <div class="order-number">
            #${order.orderNumber}
          </div>

          <div class="order-date">
            ${formattedDate}
          </div>

          <div class="service-code">
            ${serviceCode}
          </div>

          <div class="product-name">
            ${productDisplay}
          </div>

          <div class="tag-number">
            ${item.quantity} KG
          </div>

        </section>
      `;
    }
  }

  const printWindow =
    window.open(
      '',
      '_blank',
      `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`
    );

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>

    <html>

      <head>

        <meta charset="UTF-8">

        <title>
          Laundry Tags
        </title>

        <style>

          @page {
            size: 50mm 70mm;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            width: 50mm;
            margin: 0;
            padding: 0;
            background: #ffffff;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            color: #000000;
          }

          .tags {
            width: 50mm;
            margin: 0;
            padding: 0;
          }

          .tag {
            width: 50mm;
            height: 70mm;

            margin: 0;
            padding: 4mm 3mm;

            display: flex;
            flex-direction: column;
            align-items: center;

            text-align: center;

            overflow: hidden;

            break-after: page;
            page-break-after: always;
          }

          .tag:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .business-name {
            width: 100%;

            font-size: 10px;
            line-height: 1.2;

            font-weight: 700;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .customer-name {
            width: 100%;

            margin-top: 4mm;

            font-size: 11px;
            line-height: 1.2;

            font-weight: 700;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .order-number {
            margin-top: 2mm;

            font-size: 19px;
            line-height: 1;

            font-weight: 800;
          }

          .order-date {
            margin-top: 2mm;

            font-size: 10px;
            font-weight: 700;
          }

          .service-code {
            min-width: 12mm;
            height: 12mm;

            margin-top: 4mm;
            padding: 1mm;

            display: flex;
            align-items: center;
            justify-content: center;

            border: 1.5px solid #000000;

            font-size: 16px;
            font-weight: 800;
          }

          .product-name {
            width: 100%;

            margin-top: 5mm;

            font-size: 12px;
            line-height: 1.2;

            font-weight: 700;

            text-transform: capitalize;

            overflow: hidden;
          }

          .tag-number {
            margin-top: 4mm;

            font-size: 22px;
            line-height: 1;

            font-weight: 900;
          }

          .tag::after {
            content: '';

            width: 90%;

            margin-top: 3mm;

            border-bottom: 1px dashed #000000;
          }

          @media print {

            html,
            body {
              width: 50mm !important;

              margin: 0 !important;
              padding: 0 !important;
            }

            .tag {
              width: 50mm !important;
              height: 70mm !important;

              margin: 0 !important;

              break-after: page;
              page-break-after: always;
            }

            .tag:last-child {
              break-after: auto;
              page-break-after: auto;
            }

          }

        </style>

      </head>

      <body>

        <div class="tags">

          ${tagsHtml}

        </div>

        <script>

          window.onload = function () {

            setTimeout(
              function () {
                window.print();
              },
              300
            );

          };

        </script>

      </body>

    </html>
  `);

  printWindow.document.close();
}


  startNewOrder():
    void {

    if (
      this.isRetagMode ||
      this.isRescheduleMode
    ) {

      this.router.navigate(
        ['/app/new-walk-in']
      );

      return;
    }

    this.orderCreated =
      false;

    this.createdOrderNumber =
      '';

    this.createdOrder =
      null;

    this.customerName =
      '';

    this.customerPhone =
      '';

    this.customerId =
      null;

    this.customerExists =
      false;

    this.customerMessage =
      '';

    this.orderItems =
      [];

    this.homeDelivery =
      false;

    this.expressDelivery =
      false;

    this.selectedExpressChargeId =
      null;

    this.expressPercentage =
      0;

    this.deliveryTime =
      '';

    this.discountAmount =
      0;

    this.errorMessage =
      '';

    this.removeCoupon();

    this.setDefaultDeliveryDate();
  }


  private setDefaultDeliveryDate():
    void {

    const date =
      new Date();

    date.setDate(
      date.getDate() + 2
    );

    this.deliveryDate =
      this.formatLocalDate(
        date
      );
  }

  editOrderItem(
    item:
      SelectedOrderItem
  ): void {

    const product =
      this.products.find(
        (
          currentProduct:
            WalkInProduct
        ) =>
          currentProduct.id ===
          item.productId
      );

    if (
      !product
    ) {

      return;
    }

    const productType =
      product.types.find(
        (
          type:
            WalkInProductType
        ) =>
          type.id ===
          item.typeId
      );

    if (
      !productType
    ) {

      return;
    }

    this.editingOrderItemId =
      item.id;

    this.selectedProduct =
      product;

    this.selectedProductType =
      productType;

    this.selectedServiceIds = [
      ...item.serviceIds
    ];

    this.selectedPreferences = [
      ...item.preferences
    ];

    this.productComment =
      item.comment;

    this.modalQuantity =
      item.quantity;

    this.productModalOpen =
      true;
  }

}