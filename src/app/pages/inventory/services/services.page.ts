import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


interface ProductService {
  serviceId: number;
  name: string;
  price: number;
}


interface Product {
  id: number;
  name: string;
  category: string;
  icon: string;
  services: ProductService[];
}


@Component({
  selector: 'app-services',
  standalone: true,
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  imports: [
    FormsModule
  ]
})
export class ServicesPage {

  search = '';

  selectedCategory = 'All';

  loading = false;


  categories: string[] = [
    'All',
    'Garments',
    'Laundry',
    'Household'
  ];


  /* =========================================
     UI DUMMY DATA ONLY
  ========================================= */

  products: Product[] = [

    {
      id: 1,
      name: 'Shirt',
      category: 'Garments',
      icon: '👔',
      services: [
        {
          serviceId: 1,
          name: 'Dry Clean',
          price: 80
        },
        {
          serviceId: 2,
          name: 'Steam Press',
          price: 15
        },
        {
          serviceId: 3,
          name: 'Starching',
          price: 20
        }
      ]
    },

    {
      id: 2,
      name: 'T-Shirt',
      category: 'Garments',
      icon: '👕',
      services: [
        {
          serviceId: 4,
          name: 'Dry Clean',
          price: 70
        },
        {
          serviceId: 5,
          name: 'Steam Press',
          price: 15
        },
        {
          serviceId: 6,
          name: 'Starching',
          price: 20
        }
      ]
    },

    {
      id: 3,
      name: 'Trouser / Jeans',
      category: 'Garments',
      icon: '👖',
      services: [
        {
          serviceId: 7,
          name: 'Dry Clean',
          price: 80
        },
        {
          serviceId: 8,
          name: 'Steam Press',
          price: 15
        },
        {
          serviceId: 9,
          name: 'Starching',
          price: 20
        }
      ]
    },

    {
      id: 4,
      name: 'Jacket / Blazer',
      category: 'Garments',
      icon: '🧥',
      services: [
        {
          serviceId: 10,
          name: 'Dry Clean',
          price: 250
        },
        {
          serviceId: 11,
          name: 'Steam Press',
          price: 70
        }
      ]
    },

    {
      id: 5,
      name: 'Laundry By Weight',
      category: 'Laundry',
      icon: '🧺',
      services: [
        {
          serviceId: 12,
          name: 'Wash & Fold',
          price: 109
        },
        {
          serviceId: 13,
          name: 'Wash & Iron',
          price: 135
        },
        {
          serviceId: 14,
          name: 'Premium Laundry',
          price: 275
        }
      ]
    },

    {
      id: 6,
      name: 'Bedsheet',
      category: 'Household',
      icon: '🛏️',
      services: [
        {
          serviceId: 15,
          name: 'Wash',
          price: 120
        },
        {
          serviceId: 16,
          name: 'Dry Clean',
          price: 180
        }
      ]
    }

  ];


  constructor(
    private readonly router: Router
  ) {}


  /* =========================================
     FILTER PRODUCTS
  ========================================= */

  get filteredProducts(): Product[] {

    const searchValue =
      this.search
        .trim()
        .toLowerCase();


    return this.products.filter(
      product => {

        const matchesSearch =
          !searchValue ||
          product.name
            .toLowerCase()
            .includes(searchValue);


        const matchesCategory =
          this.selectedCategory === 'All' ||
          product.category ===
            this.selectedCategory;


        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }


  /* =========================================
     CATEGORY
  ========================================= */

  selectCategory(
    category: string
  ): void {

    this.selectedCategory =
      category;
  }


  /* =========================================
     ADD PRODUCT
  ========================================= */

  addProduct(): void {

    this.router.navigate([
      '/app/inventory/add-product'
    ]);
  }


  /* =========================================
     EDIT PRODUCT
  ========================================= */

  editProduct(
    product: Product
  ): void {

    console.log(
      'Edit Product',
      product
    );
  }


  /* =========================================
     MANAGE SERVICES
     TEMPORARY - EXISTING HTML USES THIS
  ========================================= */

  manageServices(
    product: Product
  ): void {

    console.log(
      'Manage Services',
      product
    );
  }


  /* =========================================
     REFRESH
  ========================================= */

  refresh(): void {

    console.log(
      'Refresh products'
    );
  }

}