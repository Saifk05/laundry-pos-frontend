import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ApiService } from '../../../../../src/core/services/api.service';

import {
  Coupon,
  CouponListResponse,
  CouponRequest
} from '../../../../core/models/coupon.model';

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
export class CouponsPage implements OnInit {

  search = '';

  selectedStatus:
    'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  showCouponForm = false;

  editingCouponId: string | null = null;

  coupons: Coupon[] = [];

  loading = false;

  errorMessage = '';

  successMessage = '';

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

  constructor(
    private readonly apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  /* =========================================
     LOAD COUPONS
  ========================================= */

  loadCoupons(): void {

    this.loading = true;
    this.errorMessage = '';

    this.apiService
      .getCoupons()
      .subscribe({

        next: (
          response: CouponListResponse
        ) => {

          this.coupons =
            response.coupons ?? [];

          this.loading = false;
        },

        error: (error: any) => {

          console.error(
            'Failed to load coupons:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to load coupons';

          this.loading = false;
        }

      });
  }

  /* =========================================
     FILTER
  ========================================= */

  get filteredCoupons(): Coupon[] {

    const searchValue =
      this.search
        .trim()
        .toLowerCase();

    return this.coupons.filter(
      (coupon: Coupon) => {

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

    this.errorMessage = '';
    this.successMessage = '';

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

    this.errorMessage = '';
    this.successMessage = '';

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
     SAVE COUPON
  ========================================= */

  saveCoupon(): void {

    this.couponForm.markAllAsTouched();

    if (this.couponForm.invalid) {
      return;
    }

    const value =
      this.couponForm.getRawValue();

    const request: CouponRequest = {

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

    this.errorMessage = '';
    this.successMessage = '';

    if (this.editingCouponId !== null) {

      this.updateCoupon(
        this.editingCouponId,
        request
      );

      return;
    }

    this.createCoupon(request);
  }

  /* =========================================
     CREATE COUPON
  ========================================= */

  private createCoupon(
    request: CouponRequest
  ): void {

    this.loading = true;

    this.apiService
      .createCoupon(request)
      .subscribe({

        next: (
          coupon: Coupon
        ) => {

          this.coupons = [
            coupon,
            ...this.coupons
          ];

          this.loading = false;

          this.successMessage =
            'Coupon created successfully';

          this.closeCouponForm();
        },

        error: (error: any) => {

          console.error(
            'Failed to create coupon:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to create coupon';

          this.loading = false;
        }

      });
  }

  /* =========================================
     UPDATE COUPON
  ========================================= */

  private updateCoupon(
    couponId: string,
    request: CouponRequest
  ): void {

    this.loading = true;

    this.apiService
      .updateCoupon(
        couponId,
        request
      )
      .subscribe({

        next: (
          updatedCoupon: Coupon
        ) => {

          this.coupons =
            this.coupons.map(
              (coupon: Coupon) =>
                coupon.id ===
                updatedCoupon.id
                  ? updatedCoupon
                  : coupon
            );

          this.loading = false;

          this.successMessage =
            'Coupon updated successfully';

          this.closeCouponForm();
        },

        error: (error: any) => {

          console.error(
            'Failed to update coupon:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to update coupon';

          this.loading = false;
        }

      });
  }

  /* =========================================
     ACTIVE / INACTIVE
  ========================================= */

  toggleCouponStatus(
    coupon: Coupon
  ): void {

    const request: CouponRequest = {

      code:
        coupon.code,

      discountType:
        coupon.discountType,

      discountValue:
        coupon.discountValue,

      minimumOrderAmount:
        coupon.minimumOrderAmount,

      active:
        !coupon.active
    };

    this.apiService
      .updateCoupon(
        coupon.id,
        request
      )
      .subscribe({

        next: (
          updatedCoupon: Coupon
        ) => {

          this.coupons =
            this.coupons.map(
              (item: Coupon) =>
                item.id ===
                updatedCoupon.id
                  ? updatedCoupon
                  : item
            );

          this.successMessage =
            updatedCoupon.active
              ? 'Coupon activated successfully'
              : 'Coupon deactivated successfully';
        },

        error: (error: any) => {

          console.error(
            'Failed to update coupon status:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to update coupon status';
        }

      });
  }

  /* =========================================
     DELETE / DEACTIVATE
  ========================================= */

  deleteCoupon(
    coupon: Coupon
  ): void {

    this.apiService
      .deleteCoupon(
        coupon.id
      )
      .subscribe({

        next: () => {

          this.coupons =
            this.coupons.map(
              (item: Coupon) =>
                item.id === coupon.id
                  ? {
                      ...item,
                      active: false
                    }
                  : item
            );

          this.successMessage =
            'Coupon deactivated successfully';
        },

        error: (error: any) => {

          console.error(
            'Failed to deactivate coupon:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to deactivate coupon';
        }

      });
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

    return this.couponForm
      .controls
      .discountType
      .value === 'FLAT'
      ? '₹'
      : '%';
  }
}