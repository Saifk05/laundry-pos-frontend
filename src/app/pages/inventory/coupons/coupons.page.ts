import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';


interface Coupon {
  id: number;
  code: string;
  discountType: 'FLAT' | 'PERCENTAGE';
  discountValue: number;
  minimumOrderAmount: number;
  active: boolean;
}


interface CouponForm {
  code: FormControl<string>;
  discountType: FormControl<'FLAT' | 'PERCENTAGE'>;
  discountValue: FormControl<number | null>;
  minimumOrderAmount: FormControl<number | null>;
  active: FormControl<boolean>;
}


@Component({
  selector: 'app-coupons',
  standalone: true,
  templateUrl: './coupons.page.html',
  styleUrls: ['./coupons.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class CouponsPage {

  search = '';

  selectedStatus:
    'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  showCouponForm = false;

  editingCouponId: number | null = null;


  /* =========================================
     DUMMY DATA - UI ONLY
  ========================================= */

  coupons: Coupon[] = [
    {
      id: 1,
      code: 'WELCOME50',
      discountType: 'FLAT',
      discountValue: 50,
      minimumOrderAmount: 500,
      active: true
    },
    {
      id: 2,
      code: 'SAVE10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderAmount: 1000,
      active: true
    },
    {
      id: 3,
      code: 'OLD100',
      discountType: 'FLAT',
      discountValue: 100,
      minimumOrderAmount: 750,
      active: false
    }
  ];


  couponForm =
    new FormGroup<CouponForm>({

      code: new FormControl(
        '',
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.maxLength(50)
          ]
        }
      ),

      discountType:
        new FormControl<
          'FLAT' | 'PERCENTAGE'
        >(
          'FLAT',
          {
            nonNullable: true,
            validators: [
              Validators.required
            ]
          }
        ),

      discountValue:
        new FormControl<number | null>(
          null,
          {
            validators: [
              Validators.required,
              Validators.min(0.01)
            ]
          }
        ),

      minimumOrderAmount:
        new FormControl<number | null>(
          null,
          {
            validators: [
              Validators.min(0)
            ]
          }
        ),

      active:
        new FormControl(
          true,
          {
            nonNullable: true
          }
        )

    });


  /* =========================================
     FILTER
  ========================================= */

  get filteredCoupons(): Coupon[] {

    const searchValue =
      this.search
        .trim()
        .toLowerCase();


    return this.coupons.filter(
      coupon => {

        const matchesSearch =
          !searchValue ||
          coupon.code
            .toLowerCase()
            .includes(searchValue);


        const matchesStatus =
          this.selectedStatus === 'ALL' ||
          (
            this.selectedStatus === 'ACTIVE' &&
            coupon.active
          ) ||
          (
            this.selectedStatus === 'INACTIVE' &&
            !coupon.active
          );


        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }


  /* =========================================
     STATUS FILTER
  ========================================= */

  selectStatus(
    status: 'ALL' | 'ACTIVE' | 'INACTIVE'
  ): void {

    this.selectedStatus = status;
  }


  /* =========================================
     ADD COUPON
  ========================================= */

  addCoupon(): void {

    this.editingCouponId = null;

    this.couponForm.reset({
      code: '',
      discountType: 'FLAT',
      discountValue: null,
      minimumOrderAmount: null,
      active: true
    });

    this.showCouponForm = true;
  }


  /* =========================================
     EDIT COUPON
  ========================================= */

  editCoupon(
    coupon: Coupon
  ): void {

    this.editingCouponId =
      coupon.id;


    this.couponForm.setValue({

      code:
        coupon.code,

      discountType:
        coupon.discountType,

      discountValue:
        coupon.discountValue,

      minimumOrderAmount:
        coupon.minimumOrderAmount,

      active:
        coupon.active

    });


    this.showCouponForm = true;
  }


  /* =========================================
     CLOSE FORM
  ========================================= */

  closeCouponForm(): void {

    this.showCouponForm = false;

    this.editingCouponId = null;

    this.couponForm.reset({
      code: '',
      discountType: 'FLAT',
      discountValue: null,
      minimumOrderAmount: null,
      active: true
    });
  }


  /* =========================================
     SAVE - UI ONLY
  ========================================= */

  saveCoupon(): void {

    this.couponForm.markAllAsTouched();


    if (this.couponForm.invalid) {
      return;
    }


    const value =
      this.couponForm.getRawValue();


    /*
     * Temporary frontend-only behavior.
     * Later this becomes POST / PUT API.
     */

    if (this.editingCouponId !== null) {

      const index =
        this.coupons.findIndex(
          coupon =>
            coupon.id ===
            this.editingCouponId
        );


      if (index !== -1) {

        this.coupons[index] = {

          id:
            this.editingCouponId,

          code:
            value.code
              .trim()
              .toUpperCase(),

          discountType:
            value.discountType,

          discountValue:
            Number(
              value.discountValue
            ),

          minimumOrderAmount:
            Number(
              value.minimumOrderAmount ?? 0
            ),

          active:
            value.active

        };

        this.coupons = [
          ...this.coupons
        ];
      }

    } else {

      const coupon: Coupon = {

        id:
          Date.now(),

        code:
          value.code
            .trim()
            .toUpperCase(),

        discountType:
          value.discountType,

        discountValue:
          Number(
            value.discountValue
          ),

        minimumOrderAmount:
          Number(
            value.minimumOrderAmount ?? 0
          ),

        active:
          value.active

      };


      this.coupons = [
        coupon,
        ...this.coupons
      ];


      console.log(
        'Coupon ready to save:',
        coupon
      );
    }


    this.closeCouponForm();
  }


  /* =========================================
     ACTIVE / INACTIVE
  ========================================= */

  toggleCouponStatus(
    coupon: Coupon
  ): void {

    coupon.active =
      !coupon.active;

    this.coupons = [
      ...this.coupons
    ];
  }


  /* =========================================
     DISPLAY HELPERS
  ========================================= */

  getDiscountLabel(
    coupon: Coupon
  ): string {

    if (
      coupon.discountType ===
      'PERCENTAGE'
    ) {

      return `${coupon.discountValue}% OFF`;
    }


    return `₹${coupon.discountValue} OFF`;
  }


  get discountPrefix(): string {

    return this.couponForm.controls
      .discountType.value === 'FLAT'
      ? '₹'
      : '%';
  }

}