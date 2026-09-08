import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../../../core/services/api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  PricingUnit,
  Product,
  ProductRequest,
  ProductServiceRequest
} from '../../../../core/models/product.model';

interface ProductServiceForm {
  name: FormControl<string>;
  price: FormControl<number | null>;
}

interface ProductForm {
  name: FormControl<string>;
  unit: FormControl<PricingUnit>;
  types: FormArray<FormControl<string>>;
  services: FormArray<FormGroup<ProductServiceForm>>;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AddProductPage {

  submitted = false;
  loading = false;
  newType = '';

  readonly units: {
    value: PricingUnit;
    label: string;
  }[] = [
    {
      value: 'PC',
      label: 'Per Piece'
    },
    {
      value: 'KG',
      label: 'Per KG'
    }
  ];

  productForm = new FormGroup<ProductForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(100)
      ]
    }),

    unit: new FormControl<PricingUnit>('PC', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    types: new FormArray<FormControl<string>>([]),

    services:
      new FormArray<FormGroup<ProductServiceForm>>([])
  });

  constructor(
    private readonly router: Router,
    private readonly apiService: ApiService,
    private readonly notificationService: NotificationService
  ) {
    this.addService();
  }

  get types(): FormArray<FormControl<string>> {
    return this.productForm.controls.types;
  }

  get services(): FormArray<FormGroup<ProductServiceForm>> {
    return this.productForm.controls.services;
  }

  addType(): void {
    const value = this.newType.trim();

    if (!value) {
      return;
    }

    const exists =
      this.types.controls.some(
        control =>
          control.value.trim().toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {
      void this.notificationService.warning(
        'Product type already exists'
      );

      this.newType = '';
      return;
    }

    this.types.push(
      new FormControl(value, {
        nonNullable: true
      })
    );

    this.newType = '';
  }

  removeType(index: number): void {
    this.types.removeAt(index);
  }

  onTypeKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addType();
    }
  }

  addService(): void {
    this.services.push(
      new FormGroup<ProductServiceForm>({
        name: new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.maxLength(100)
          ]
        }),

        price: new FormControl<number | null>(
          null,
          {
            validators: [
              Validators.required,
              Validators.min(0)
            ]
          }
        )
      })
    );
  }

  removeService(index: number): void {
    if (this.services.length === 1) {
      void this.notificationService.warning(
        'At least one service is required'
      );

      return;
    }

    this.services.removeAt(index);
  }

  cancel(): void {
    if (this.loading) {
      return;
    }

    this.router.navigate([
      '/app/inventory/services'
    ]);
  }

  saveProduct(): void {
    if (this.loading) {
      return;
    }

    this.submitted = true;
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) {
      void this.notificationService.warning(
        'Please complete all required product details'
      );

      return;
    }

    const formValue =
      this.productForm.getRawValue();

    const services: ProductServiceRequest[] =
      formValue.services.map(
        service => ({
          name: service.name.trim(),
          price: Number(service.price)
        })
      );

    const duplicateService =
      services.some(
        (service, index, list) =>
          list.findIndex(
            item =>
              item.name.toLowerCase() ===
              service.name.toLowerCase()
          ) !== index
      );

    if (duplicateService) {
      void this.notificationService.warning(
        'Duplicate services are not allowed'
      );

      return;
    }

    const typeNames =
      formValue.types
        .map(type => type.trim())
        .filter(Boolean);

    const request: ProductRequest = {
      name: formValue.name.trim(),
      icon: null,
      unit: formValue.unit,
      active: true,

      types: (
        typeNames.length > 0
          ? typeNames
          : ['Regular']
      ).map(
        type => ({
          name: type,
          services: services.map(
            service => ({
              ...service
            })
          )
        })
      )
    };

    this.loading = true;

    this.apiService
      .createProduct(request)
      .subscribe({
        next: (_product: Product) => {
          this.loading = false;

          void this.notificationService.success(
            'Product created successfully'
          );

          this.router.navigate([
            '/app/inventory/services'
          ]);
        },

        error: (error: HttpErrorResponse) => {
          console.error(
            'Failed to create product:',
            error
          );

          this.loading = false;

          void this.notificationService.error(
            this.getErrorMessage(
              error,
              'Failed to create product'
            )
          );
        }
      });
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    const message =
      error?.error?.message;

    if (
      typeof message === 'string' &&
      message.trim()
    ) {
      return message.trim();
    }

    return fallback;
  }
}