import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

interface ProductServiceForm {
  name: FormControl<string>;
  price: FormControl<number | null>;
}

interface ProductForm {
  name: FormControl<string>;
  category: FormControl<string>;
  unit: FormControl<string>;
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

  newType = '';

  readonly categories = [
    'Garments',
    'Laundry',
    'Household'
  ];

  readonly units = [
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

    name: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.maxLength(100)
        ]
      }
    ),

    category: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    unit: new FormControl(
      'PC',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    types: new FormArray<FormControl<string>>([]),

    services: new FormArray<
      FormGroup<ProductServiceForm>
    >([])
  });

  constructor(
    private readonly router: Router
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

    const alreadyExists =
      this.types.controls.some(
        control =>
          control.value.toLowerCase() ===
          value.toLowerCase()
      );

    if (alreadyExists) {
      this.newType = '';
      return;
    }

    this.types.push(
      new FormControl(
        value,
        {
          nonNullable: true
        }
      )
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

    const service =
      new FormGroup<ProductServiceForm>({

        name: new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.maxLength(100)
            ]
          }
        ),

        price: new FormControl<number | null>(
          null,
          {
            validators: [
              Validators.required,
              Validators.min(0)
            ]
          }
        )

      });

    this.services.push(service);
  }

  removeService(index: number): void {

    if (this.services.length === 1) {
      return;
    }

    this.services.removeAt(index);
  }

  cancel(): void {

    this.router.navigate([
      '/app/inventory/services'
    ]);
  }

  saveProduct(): void {

    this.submitted = true;

    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) {
      return;
    }

    const formValue =
      this.productForm.getRawValue();

    const product = {

      name: formValue.name.trim(),

      category: formValue.category,

      unit: formValue.unit,

      types: formValue.types,

      services: formValue.services.map(
        service => ({
          name: service.name.trim(),
          price: Number(service.price)
        })
      )
    };

    console.log(
      'Product ready to save:',
      product
    );
  }
}