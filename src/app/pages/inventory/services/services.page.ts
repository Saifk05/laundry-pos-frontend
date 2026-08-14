import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../../../src/core/services/api.service';

import {
  PricingUnit,
  Product,
  ProductListResponse,
  ProductRequest,
  ProductTypeRequest
} from '../../../../core/models/product.model';


interface ProductServiceForm {
  name: string;
  price: number | null;
}


interface ProductTypeForm {
  name: string;
  services: ProductServiceForm[];
}


interface ProductFormData {
  name: string;
  unit: PricingUnit;
  types: ProductTypeForm[];
}


@Component({
  selector: 'app-services',
  standalone: true,
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class ServicesPage implements OnInit {

  search = '';

  selectedUnit:
    'ALL' | PricingUnit = 'ALL';

  loading = false;

  showProductForm = false;

  editingProductId: string | null = null;

  errorMessage = '';

  successMessage = '';

  products: Product[] = [];


  productForm: ProductFormData = {
    name: '',
    unit: 'PC',
    types: [
      {
        name: '',
        services: [
          {
            name: '',
            price: null
          }
        ]
      }
    ]
  };


  constructor(
    private readonly apiService: ApiService
  ) {}


  ngOnInit(): void {

    this.loadProducts();
  }


  /* =========================================
     LOAD PRODUCTS
  ========================================= */

  loadProducts(): void {

    this.loading = true;

    this.errorMessage = '';

    this.apiService
      .getProducts()
      .subscribe({

        next: (
          response: ProductListResponse
        ) => {

          this.products =
            response.products ?? [];

          this.loading = false;
        },

        error: (error: any) => {

          console.error(
            'Failed to load products:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to load products';

          this.loading = false;
        }

      });
  }


  /* =========================================
     FILTER PRODUCTS
  ========================================= */

  get filteredProducts(): Product[] {

    const searchValue =
      this.search
        .trim()
        .toLowerCase();

    return this.products.filter(
      (product: Product) => {

        const matchesSearch =
          !searchValue ||
          product.name
            .toLowerCase()
            .includes(searchValue);

        const matchesUnit =
          this.selectedUnit === 'ALL' ||
          product.unit ===
            this.selectedUnit;

        return (
          matchesSearch &&
          matchesUnit
        );
      }
    );
  }


  /* =========================================
     UNIT FILTER
  ========================================= */

  selectUnit(
    unit: 'ALL' | PricingUnit
  ): void {

    this.selectedUnit =
      unit;
  }


  /* =========================================
     ADD PRODUCT
  ========================================= */

  addProduct(): void {

    this.editingProductId = null;

    this.errorMessage = '';

    this.successMessage = '';

    this.productForm = {
      name: '',
      unit: 'PC',
      types: [
        {
          name: '',
          services: [
            {
              name: '',
              price: null
            }
          ]
        }
      ]
    };

    this.showProductForm = true;
  }


  /* =========================================
     EDIT PRODUCT
  ========================================= */

  editProduct(
    product: Product
  ): void {

    this.editingProductId =
      product.id;

    this.errorMessage = '';

    this.successMessage = '';

    this.productForm = {

      name:
        product.name,

      unit:
        product.unit,

      types:
        product.types.map(
          type => ({

            name:
              type.name,

            services:
              type.services.map(
                service => ({

                  name:
                    service.name,

                  price:
                    service.price

                })
              )

          })
        )

    };


    if (
      this.productForm.types.length === 0
    ) {

      this.productForm.types = [
        {
          name: '',
          services: [
            {
              name: '',
              price: null
            }
          ]
        }
      ];
    }


    this.showProductForm = true;
  }


  /* =========================================
     ADD PRODUCT TYPE
  ========================================= */

  addType(): void {

    this.productForm.types.push({
      name: '',
      services: [
        {
          name: '',
          price: null
        }
      ]
    });
  }


  /* =========================================
     REMOVE PRODUCT TYPE
  ========================================= */

  removeType(
    typeIndex: number
  ): void {

    this.productForm.types.splice(
      typeIndex,
      1
    );


    if (
      this.productForm.types.length === 0
    ) {

      this.productForm.types.push({
        name: '',
        services: [
          {
            name: '',
            price: null
          }
        ]
      });
    }
  }


  /* =========================================
     ADD SERVICE TO TYPE
  ========================================= */

  addServiceRow(
    typeIndex: number
  ): void {

    this.productForm
      .types[typeIndex]
      .services
      .push({
        name: '',
        price: null
      });
  }


  /* =========================================
     REMOVE SERVICE FROM TYPE
  ========================================= */

  removeServiceRow(
    typeIndex: number,
    serviceIndex: number
  ): void {

    const services =
      this.productForm
        .types[typeIndex]
        .services;

    services.splice(
      serviceIndex,
      1
    );


    if (
      services.length === 0
    ) {

      services.push({
        name: '',
        price: null
      });
    }
  }


  /* =========================================
     CLOSE POPUP
  ========================================= */

  closeProductForm(): void {

    this.showProductForm = false;

    this.editingProductId = null;

    this.productForm = {
      name: '',
      unit: 'PC',
      types: [
        {
          name: '',
          services: [
            {
              name: '',
              price: null
            }
          ]
        }
      ]
    };
  }


  /* =========================================
     SAVE PRODUCT
  ========================================= */

  saveProduct(): void {

    const productName =
      this.productForm
        .name
        .trim();


    if (!productName) {

      this.errorMessage =
        'Product name is required';

      return;
    }


    const validTypes:
      ProductTypeRequest[] = [];


    for (
      const type of
      this.productForm.types
    ) {

      const typeName =
        type.name.trim();


      if (!typeName) {

        this.errorMessage =
          'Product type name is required';

        return;
      }


      const validServices =
        type.services
          .filter(
            service =>
              service.name.trim() &&
              service.price !== null &&
              Number(service.price) >= 0
          );


      if (
        validServices.length === 0
      ) {

        this.errorMessage =
          `At least one service is required for ${typeName}`;

        return;
      }


      validTypes.push({

        name:
          typeName,

        services:
          validServices.map(
            service => ({

              name:
                service.name
                  .trim(),

              price:
                Number(
                  service.price
                )

            })
          )

      });
    }


    if (
      validTypes.length === 0
    ) {

      this.errorMessage =
        'At least one product type is required';

      return;
    }


    const request:
      ProductRequest = {

      name:
        productName,

      unit:
        this.productForm.unit,

      active:
        true,

      types:
        validTypes

    };


    this.errorMessage = '';

    this.successMessage = '';


    if (
      this.editingProductId !== null
    ) {

      this.updateProduct(
        this.editingProductId,
        request
      );

      return;
    }


    this.createProduct(
      request
    );
  }


  /* =========================================
     CREATE PRODUCT
  ========================================= */

  private createProduct(
    request: ProductRequest
  ): void {

    this.loading = true;


    this.apiService
      .createProduct(request)
      .subscribe({

        next: (
          product: Product
        ) => {

          this.products = [
            product,
            ...this.products
          ];

          this.loading = false;

          this.successMessage =
            'Product created successfully';

          this.closeProductForm();
        },

        error: (error: any) => {

          console.error(
            'Failed to create product:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to create product';

          this.loading = false;
        }

      });
  }


  /* =========================================
     UPDATE PRODUCT
  ========================================= */

  private updateProduct(
    productId: string,
    request: ProductRequest
  ): void {

    this.loading = true;


    this.apiService
      .updateProduct(
        productId,
        request
      )
      .subscribe({

        next: (
          updatedProduct: Product
        ) => {

          this.products =
            this.products.map(
              product =>
                product.id ===
                updatedProduct.id
                  ? updatedProduct
                  : product
            );

          this.loading = false;

          this.successMessage =
            'Product updated successfully';

          this.closeProductForm();
        },

        error: (error: any) => {

          console.error(
            'Failed to update product:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to update product';

          this.loading = false;
        }

      });
  }


  /* =========================================
     DEACTIVATE PRODUCT
  ========================================= */

  deleteProduct(
    product: Product
  ): void {

    this.errorMessage = '';

    this.successMessage = '';


    this.apiService
      .deleteProduct(
        product.id
      )
      .subscribe({

        next: () => {

          this.products =
            this.products.map(
              item =>
                item.id ===
                product.id
                  ? {
                      ...item,
                      active: false
                    }
                  : item
            );

          this.successMessage =
            'Product deactivated successfully';
        },

        error: (error: any) => {

          console.error(
            'Failed to deactivate product:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to deactivate product';
        }

      });
  }


  /* =========================================
     MANAGE PRODUCT
  ========================================= */

  manageServices(
    product: Product
  ): void {

    this.editProduct(
      product
    );
  }


  /* =========================================
     UNIT LABEL
  ========================================= */

  getUnitLabel(
    product: Product
  ): string {

    return product.unit === 'KG'
      ? 'Per KG'
      : 'Per Piece';
  }


  /* =========================================
     CHECK DEFAULT TYPE
  ========================================= */

  isDefaultType(
    typeName: string
  ): boolean {

    return typeName
      .trim()
      .toLowerCase() ===
      'default';
  }

    expandedProducts =
    new Set<string>();


  isProductExpanded(
    productId: string
  ): boolean {

    return this.expandedProducts.has(
      productId
    );
  }


  toggleProductDetails(
    productId: string
  ): void {

    if (
      this.expandedProducts.has(
        productId
      )
    ) {

      this.expandedProducts.delete(
        productId
      );

    } else {

      this.expandedProducts.add(
        productId
      );
    }

    this.expandedProducts =
      new Set(
        this.expandedProducts
      );
  }

  /* =========================================
     REFRESH
  ========================================= */

  refresh(): void {

    this.loadProducts();
  }

}