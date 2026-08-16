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
  ApiService
} from '../../../../core/services/api.service';

import {
  PricingUnit,
  Product,
  ProductListResponse,
  ProductRequest,
  ProductTypeRequest
} from '../../../../core/models/product.model';

import {
  BulkProductResponse
} from '../../../../core/models/bulk-product.model';


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
  icon: string;
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
export class ServicesPage
  implements OnInit {

  search = '';

  selectedUnit:
    'ALL' | PricingUnit =
      'ALL';

  loading = false;

  bulkLoading = false;

  showProductForm = false;

  showBulkUpload = false;

  editingProductId:
    string | null =
      null;

  errorMessage = '';

  successMessage = '';

  bulkErrorMessage = '';

  bulkSuccessMessage = '';

  selectedBulkFile: File | null = null;

  products:
    Product[] =
      [];

  expandedProducts =
    new Set<string>();


  readonly productIcons:
    string[] = [
      '👕',
      '👖',
      '👗',
      '🥻',
      '🧥',
      '🧦',
      '🧺',
      '🛏️',
      '👟',
      '🧣',
      '👚',
      '🩳'
    ];


  productForm:
    ProductFormData = {

      name:
        '',

      icon:
        '',

      unit:
        'PC',

      types: [
        {
          name:
            '',

          services: [
            {
              name:
                '',

              price:
                null
            }
          ]
        }
      ]
    };


  constructor(
    private readonly apiService:
      ApiService
  ) {}


  ngOnInit(): void {

    this.loadProducts();
  }


  loadProducts(): void {

    this.loading =
      true;

    this.errorMessage =
      '';

    this.apiService
      .getProducts()
      .subscribe({

        next: (
          response:
            ProductListResponse
        ) => {

          this.products =
            response.products ?? [];

          this.loading =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Failed to load products:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Failed to load products';

          this.loading =
            false;
        }

      });
  }


  get filteredProducts():
    Product[] {

    const searchValue =
      this.search
        .trim()
        .toLowerCase();

    return this.products
      .filter(
        (
          product:
            Product
        ) => {

          const matchesSearch =
            !searchValue ||
            product.name
              .toLowerCase()
              .includes(
                searchValue
              );

          const matchesUnit =
            this.selectedUnit ===
              'ALL' ||
            product.unit ===
              this.selectedUnit;

          return (
            matchesSearch &&
            matchesUnit
          );
        }
      );
  }


  selectUnit(
    unit:
      'ALL' | PricingUnit
  ): void {

    this.selectedUnit =
      unit;
  }


  addProduct(): void {

    this.editingProductId =
      null;

    this.errorMessage =
      '';

    this.successMessage =
      '';

    this.resetProductForm();

    this.showProductForm =
      true;
  }


  editProduct(
    product:
      Product
  ): void {

    this.editingProductId =
      product.id;

    this.errorMessage =
      '';

    this.successMessage =
      '';

    this.productForm = {

      name:
        product.name,

      icon:
        product.icon ?? '',

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
      this.productForm
        .types
        .length === 0
    ) {

      this.productForm.types = [
        {
          name:
            '',

          services: [
            {
              name:
                '',

              price:
                null
            }
          ]
        }
      ];
    }


    this.showProductForm =
      true;
  }


  selectProductIcon(
    icon:
      string
  ): void {

    this.productForm.icon =
      icon;
  }


  addType(): void {

    this.productForm
      .types
      .push({

        name:
          '',

        services: [
          {
            name:
              '',

            price:
              null
          }
        ]
      });
  }


  removeType(
    typeIndex:
      number
  ): void {

    this.productForm
      .types
      .splice(
        typeIndex,
        1
      );


    if (
      this.productForm
        .types
        .length === 0
    ) {

      this.productForm
        .types
        .push({

          name:
            '',

          services: [
            {
              name:
                '',

              price:
                null
            }
          ]
        });
    }
  }


  addServiceRow(
    typeIndex:
      number
  ): void {

    this.productForm
      .types[
        typeIndex
      ]
      .services
      .push({

        name:
          '',

        price:
          null
      });
  }


  removeServiceRow(
    typeIndex:
      number,
    serviceIndex:
      number
  ): void {

    const services =
      this.productForm
        .types[
          typeIndex
        ]
        .services;


    services.splice(
      serviceIndex,
      1
    );


    if (
      services.length === 0
    ) {

      services.push({

        name:
          '',

        price:
          null
      });
    }
  }


  closeProductForm(): void {

    this.showProductForm =
      false;

    this.editingProductId =
      null;

    this.resetProductForm();
  }


  saveProduct(): void {

    const request =
      this.buildProductRequest();


    if (
      !request
    ) {

      return;
    }


    this.errorMessage =
      '';

    this.successMessage =
      '';


    if (
      this.editingProductId !==
      null
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


  private buildProductRequest():
    ProductRequest | null {

    const productName =
      this.productForm
        .name
        .trim();


    if (
      !productName
    ) {

      this.errorMessage =
        'Product name is required';

      return null;
    }


    const validTypes:
      ProductTypeRequest[] =
      [];


    for (
      const type of
      this.productForm.types
    ) {

      const typeName =
        type.name
          .trim();


      if (
        !typeName
      ) {

        this.errorMessage =
          'Product type name is required';

        return null;
      }


      const validServices =
        type.services
          .filter(
            service =>
              service.name
                .trim() &&
              service.price !==
                null &&
              Number(
                service.price
              ) >= 0
          );


      if (
        validServices.length ===
        0
      ) {

        this.errorMessage =
          `At least one service is required for ${typeName}`;

        return null;
      }


      validTypes.push({

        name:
          typeName,

        services:
          validServices
            .map(
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
      validTypes.length ===
      0
    ) {

      this.errorMessage =
        'At least one product type is required';

      return null;
    }


    return {

      name:
        productName,

      icon:
        this.productForm
          .icon
          .trim()
          ? this.productForm
              .icon
              .trim()
          : null,

      unit:
        this.productForm.unit,

      active:
        true,

      types:
        validTypes
    };
  }


  private createProduct(
    request:
      ProductRequest
  ): void {

    this.loading =
      true;


    this.apiService
      .createProduct(
        request
      )
      .subscribe({

        next: (
          product:
            Product
        ) => {

          this.products = [
            product,
            ...this.products
          ];

          this.loading =
            false;

          this.successMessage =
            'Product created successfully';

          this.closeProductForm();
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Failed to create product:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Failed to create product';

          this.loading =
            false;
        }

      });
  }


  private updateProduct(
    productId:
      string,
    request:
      ProductRequest
  ): void {

    this.loading =
      true;


    this.apiService
      .updateProduct(
        productId,
        request
      )
      .subscribe({

        next: (
          updatedProduct:
            Product
        ) => {

          this.products =
            this.products
              .map(
                product =>
                  product.id ===
                  updatedProduct.id
                    ? updatedProduct
                    : product
              );

          this.loading =
            false;

          this.successMessage =
            'Product updated successfully';

          this.closeProductForm();
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Failed to update product:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Failed to update product';

          this.loading =
            false;
        }

      });
  }


  openBulkUpload(): void {

    this.showBulkUpload =
      true;

    this.selectedBulkFile =
      null;

    this.bulkErrorMessage =
      '';

    this.bulkSuccessMessage =
      '';
  }


  closeBulkUpload(): void {

    if (
      this.bulkLoading
    ) {

      return;
    }

    this.showBulkUpload =
      false;

    this.selectedBulkFile =
      null;

    this.bulkErrorMessage =
      '';

    this.bulkSuccessMessage =
      '';
  }


  onBulkFileSelected(
    event:
      Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    const file =
      input.files?.[0];

    if (
      !file
    ) {

      return;
    }

    this.bulkErrorMessage =
      '';

    this.bulkSuccessMessage =
      '';

    const isPdf =
      file.type ===
        'application/pdf' ||
      file.name
        .toLowerCase()
        .endsWith(
          '.pdf'
        );

    if (
      !isPdf
    ) {

      this.selectedBulkFile =
        null;

      this.bulkErrorMessage =
        'Please select a PDF file';

      input.value =
        '';

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (
      file.size >
      maxSize
    ) {

      this.selectedBulkFile =
        null;

      this.bulkErrorMessage =
        'PDF file size cannot exceed 10 MB';

      input.value =
        '';

      return;
    }

    this.selectedBulkFile =
      file;
  }


  removeBulkFile(): void {

    if (
      this.bulkLoading
    ) {

      return;
    }

    this.selectedBulkFile =
      null;

    this.bulkErrorMessage =
      '';

    this.bulkSuccessMessage =
      '';
  }


submitBulkUpload(): void {

  if (
    !this.selectedBulkFile
  ) {

    this.bulkErrorMessage =
      'Please select a PDF file';

    return;
  }

  this.bulkLoading =
    true;

  this.bulkErrorMessage =
    '';

  this.bulkSuccessMessage =
    '';

  this.apiService
    .bulkUploadProductsPdf(
      this.selectedBulkFile
    )
    .subscribe({

      next: (
        response:
          BulkProductResponse
      ) => {

        this.bulkLoading =
          false;

        this.bulkSuccessMessage =
          `${response.totalProducts} products processed. ${response.createdProducts} created and ${response.updatedProducts} updated.`;

        this.products =
          this.mergeBulkProducts(
            response.products
          );

        this.selectedBulkFile =
          null;

        setTimeout(
          () => {

            this.closeBulkUpload();

          },
          700
        );
      },

      error: (
        error:
          any
      ) => {

        console.error(
          'PDF bulk upload failed:',
          error
        );

        this.bulkErrorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'PDF bulk upload failed';

        this.bulkLoading =
          false;
      }

    });
}


  private mergeBulkProducts(
    uploadedProducts:
      Product[]
  ): Product[] {

    const productMap =
      new Map<
        string,
        Product
      >();


    for (
      const product of
      this.products
    ) {

      productMap.set(
        product.id,
        product
      );
    }


    for (
      const product of
      uploadedProducts ?? []
    ) {

      productMap.set(
        product.id,
        product
      );
    }


    return Array.from(
      productMap.values()
    );
  }


  deleteProduct(
    product:
      Product
  ): void {

    this.errorMessage =
      '';

    this.successMessage =
      '';


    this.apiService
      .deleteProduct(
        product.id
      )
      .subscribe({

        next: () => {

          this.products =
            this.products
              .map(
                item =>
                  item.id ===
                  product.id
                    ? {
                        ...item,
                        active:
                          false
                      }
                    : item
              );

          this.successMessage =
            'Product deactivated successfully';
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Failed to deactivate product:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Failed to deactivate product';
        }

      });
  }


  manageServices(
    product:
      Product
  ): void {

    this.editProduct(
      product
    );
  }


  getUnitLabel(
    product:
      Product
  ): string {

    return product.unit ===
      'KG'
      ? 'Per KG'
      : 'Per Piece';
  }


  isDefaultType(
    typeName:
      string
  ): boolean {

    return typeName
      .trim()
      .toLowerCase() ===
      'default';
  }


  isProductExpanded(
    productId:
      string
  ): boolean {

    return this.expandedProducts
      .has(
        productId
      );
  }


  toggleProductDetails(
    productId:
      string
  ): void {

    if (
      this.expandedProducts
        .has(
          productId
        )
    ) {

      this.expandedProducts
        .delete(
          productId
        );

    } else {

      this.expandedProducts
        .add(
          productId
        );
    }


    this.expandedProducts =
      new Set(
        this.expandedProducts
      );
  }


  refresh(): void {

    this.loadProducts();
  }


  private resetProductForm():
    void {

    this.productForm = {

      name:
        '',

      icon:
        '',

      unit:
        'PC',

      types: [
        {

          name:
            '',

          services: [
            {

              name:
                '',

              price:
                null
            }
          ]
        }
      ]
    };
  }

}