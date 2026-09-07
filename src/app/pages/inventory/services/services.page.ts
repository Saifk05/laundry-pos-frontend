import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  FormsModule
} from '@angular/forms';

import {
  ApiService
} from '../../../../core/services/api.service';

import {
  NotificationService
} from '../../../../core/services/notification.service';

import {
  PricingUnit,
  Product,
  ProductListResponse,
  ProductRequest,
  ProductReorderRequest,
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

  selectedBulkFile: File | null = null;

  products:
    Product[] =
      [];

  expandedProducts =
    new Set<string>();


  arrangeMode =
    false;

  arrangementSaving =
    false;

  draggedProductId:
    string | null =
      null;

  arrangementSnapshot:
    Product[] =
      [];


  readonly productIcons: string[] = [
    '🧺',
    '👔',
    '👕',
    '👖',
    '🧥',
    '🥻',
    '🧶',
    '🩳',
    '👗',
    '👚',
    '🧣',
    '👜',
    '👟',
    '🧤',
    '☂️',
    '🧢',
    '🎒',
    '🩴',
    '🧦',
    '🦺',
    '🛏️',
    '🪟',
    '🧸',
    '🧹'
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
    private readonly apiService: ApiService,
    private readonly notificationService: NotificationService
  ) {}


  ngOnInit(): void {

    this.loadProducts();
  }


  loadProducts(): void {

    this.loading =
      true;

    this.apiService
      .getProducts()
      .subscribe({

        next: (
          response:
            ProductListResponse
        ) => {

          this.products =
            [
              ...(response.products ?? [])
            ].sort(
              (
                firstProduct,
                secondProduct
              ) =>
                (firstProduct.displayOrder ?? 0) -
                (secondProduct.displayOrder ?? 0)
            );

          this.loading =
            false;
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          console.error(
            'Failed to load products:',
            error
          );

          void this.notificationService.error(
            this.getErrorMessage(
              error,
              'Failed to load products'
            )
          );

          this.loading =
            false;
        }

      });
  }


  get filteredProducts():
    Product[] {

    if (
      this.arrangeMode
    ) {

      return this.products;
    }

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

    if (
      this.arrangeMode
    ) {

      return;
    }

    this.selectedUnit =
      unit;
  }


  startArrange(): void {

    if (
      this.loading ||
      this.bulkLoading ||
      this.arrangementSaving ||
      this.products.length === 0
    ) {

      return;
    }

    this.search =
      '';

    this.selectedUnit =
      'ALL';

    this.arrangementSnapshot =
      this.products.map(
        product => ({
          ...product
        })
      );

    this.draggedProductId =
      null;

    this.arrangeMode =
      true;
  }


  cancelArrange(): void {

    if (
      this.arrangementSaving
    ) {

      return;
    }

    this.products =
      this.arrangementSnapshot.map(
        product => ({
          ...product
        })
      );

    this.arrangementSnapshot =
      [];

    this.draggedProductId =
      null;

    this.arrangeMode =
      false;
  }


  onProductDragStart(
    event:
      DragEvent,
    product:
      Product
  ): void {

    if (
      !this.arrangeMode ||
      this.arrangementSaving
    ) {

      event.preventDefault();

      return;
    }

    this.draggedProductId =
      product.id;

    if (
      event.dataTransfer
    ) {

      event.dataTransfer.effectAllowed =
        'move';

      event.dataTransfer.setData(
        'text/plain',
        product.id
      );
    }
  }


  onProductDragOver(
    event:
      DragEvent
  ): void {

    if (
      !this.arrangeMode ||
      this.arrangementSaving
    ) {

      return;
    }

    event.preventDefault();

    if (
      event.dataTransfer
    ) {

      event.dataTransfer.dropEffect =
        'move';
    }
  }


  onProductDrop(
    event:
      DragEvent,
    targetProduct:
      Product
  ): void {

    if (
      !this.arrangeMode ||
      this.arrangementSaving
    ) {

      return;
    }

    event.preventDefault();

    const draggedId =
      this.draggedProductId ||
      event.dataTransfer
        ?.getData(
          'text/plain'
        );

    if (
      !draggedId ||
      draggedId === targetProduct.id
    ) {

      return;
    }

    const fromIndex =
      this.products.findIndex(
        product =>
          product.id === draggedId
      );

    const toIndex =
      this.products.findIndex(
        product =>
          product.id === targetProduct.id
      );

    if (
      fromIndex < 0 ||
      toIndex < 0
    ) {

      return;
    }

    const reorderedProducts =
      [
        ...this.products
      ];

    const [
      movedProduct
    ] =
      reorderedProducts.splice(
        fromIndex,
        1
      );

    reorderedProducts.splice(
      toIndex,
      0,
      movedProduct
    );

    this.products =
      reorderedProducts;
  }


  onProductDragEnd(): void {

    this.draggedProductId =
      null;
  }


  saveArrangement(): void {

    if (
      !this.arrangeMode ||
      this.arrangementSaving ||
      this.products.length === 0
    ) {

      return;
    }

    const request:
      ProductReorderRequest = {

      products:
        this.products.map(
          (
            product,
            index
          ) => ({

            productId:
              product.id,

            displayOrder:
              index + 1
          })
        )
    };

    this.arrangementSaving =
      true;

    this.apiService
      .reorderProducts(
        request
      )
      .subscribe({

        next: () => {

          this.products =
            this.products.map(
              (
                product,
                index
              ) => ({

                ...product,

                displayOrder:
                  index + 1
              })
            );

          this.arrangementSnapshot =
            [];

          this.draggedProductId =
            null;

          this.arrangeMode =
            false;

          this.arrangementSaving =
            false;

          void this.notificationService.success(
            'Product arrangement saved successfully'
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          console.error(
            'Failed to save product arrangement:',
            error
          );

          void this.notificationService.error(
            this.getErrorMessage(
              error,
              'Failed to save product arrangement'
            )
          );

          this.arrangementSaving =
            false;
        }

      });
  }


  addProduct(): void {

    if (
      this.arrangeMode
    ) {

      return;
    }

    this.editingProductId =
      null;

    this.resetProductForm();

    this.showProductForm =
      true;
  }


  editProduct(
    product:
      Product
  ): void {

    if (
      this.arrangeMode
    ) {

      return;
    }

    this.editingProductId =
      product.id;

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

      void this.notificationService.warning(
        'Product name is required'
      );

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

        void this.notificationService.warning(
          'Product type name is required'
        );

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

        void this.notificationService.warning(
          `At least one service is required for ${typeName}`
        );

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

      void this.notificationService.warning(
        'At least one product type is required'
      );

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

          this.products =
            [
              ...this.products,
              product
            ].sort(
              (
                firstProduct,
                secondProduct
              ) =>
                (firstProduct.displayOrder ?? 0) -
                (secondProduct.displayOrder ?? 0)
            );

          this.loading =
            false;

          this.closeProductForm();

          void this.notificationService.success(
            'Product created successfully'
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          console.error(
            'Failed to create product:',
            error
          );

          void this.notificationService.error(
            this.getErrorMessage(
              error,
              'Failed to create product'
            )
          );

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

          this.closeProductForm();

          void this.notificationService.success(
            'Product updated successfully'
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          console.error(
            'Failed to update product:',
            error
          );

          void this.notificationService.error(
            this.getErrorMessage(
              error,
              'Failed to update product'
            )
          );

          this.loading =
            false;
        }

      });
  }


  openBulkUpload(): void {

    if (
      this.arrangeMode
    ) {

      return;
    }

    this.showBulkUpload =
      true;

    this.selectedBulkFile =
      null;
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

      void this.notificationService.warning(
        'Please select a PDF file'
      );

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

      void this.notificationService.warning(
        'PDF file size cannot exceed 10 MB'
      );

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
  }


submitBulkUpload(): void {

  if (
    !this.selectedBulkFile
  ) {

    void this.notificationService.warning(
      'Please select a PDF file'
    );

    return;
  }

  this.bulkLoading =
    true;

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

        void this.notificationService.success(
          `${response.totalProducts} products processed. ${response.createdProducts} created and ${response.updatedProducts} updated.`
        );

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
          HttpErrorResponse
      ) => {

        console.error(
          'PDF bulk upload failed:',
          error
        );

        void this.notificationService.error(
          this.getErrorMessage(
            error,
            'PDF bulk upload failed'
          )
        );

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
    ).sort(
      (
        firstProduct,
        secondProduct
      ) =>
        (firstProduct.displayOrder ?? 0) -
        (secondProduct.displayOrder ?? 0)
    );
  }


  deleteProduct(
    product:
      Product
  ): void {

    if (
      this.arrangeMode
    ) {

      return;
    }


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

          void this.notificationService.success(
            'Product deactivated successfully'
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          console.error(
            'Failed to deactivate product:',
            error
          );

          void this.notificationService.error(
            this.getErrorMessage(
              error,
              'Failed to deactivate product'
            )
          );
        }

      });
  }


  manageServices(
    product:
      Product
  ): void {

    if (
      this.arrangeMode
    ) {

      return;
    }

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

    if (
      this.arrangeMode ||
      this.arrangementSaving
    ) {

      return;
    }

    this.loadProducts();
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

    const legacyMessage =
      error?.error?.error;

    if (
      typeof legacyMessage === 'string' &&
      legacyMessage.trim()
    ) {

      return legacyMessage.trim();
    }

    return fallback;
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