import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app/dashboard',
    pathMatch: 'full',
  },

  {
    path: 'app',
    loadComponent: () =>
      import('./layout/app-layout/app-layout.component')
        .then((m) => m.AppLayoutComponent),

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page')
            .then((m) => m.DashboardPage),
      },

      {
        path: 'new-walk-in',
        loadComponent: () =>
          import('./pages/orders/new-walk-in/new-walk-in.page')
            .then((m) => m.NewWalkInPage),
      },

      {
        path: 'payments',
        loadComponent: () =>
          import('./pages/payments/payments.page')
            .then((m) => m.PaymentsPage),
      },

      {
        path: 'settlement',
        loadComponent: () =>
          import('./pages/settlement/settlement.page')
            .then((m) => m.SettlementPage),
      },

      {
        path: 'b2c-orders',
        loadComponent: () =>
          import('./pages/orders/b2c-orders/b2c-orders.page')
            .then((m) => m.B2cOrdersPage),
      },

      {
        path: 'bill',
        loadComponent: () =>
          import('./pages/bill/bill.page')
            .then((m) => m.BillPage),
      },

      {
        path: 'inventory',
        loadComponent: () =>
          import('./pages/inventory/inventory.component')
            .then((m) => m.InventoryComponent),
      },

      {
        path: 'inventory/services',
        loadComponent: () =>
          import('./pages/inventory/services/services.page')
            .then((m) => m.ServicesPage),
      },

      {
        path: 'inventory/coupons',
        loadComponent: () =>
          import('./pages/inventory/coupons/coupons.page')
            .then((m) => m.CouponsPage),
      },

      {
        path: 'inventory/extra-charges',
        loadComponent: () =>
          import('./pages/inventory/extra-charges/extra-charges.page')
            .then((m) => m.ExtraChargesPage),
      },

      {
        path: 'inventory/add-product',
        loadComponent: () =>
          import('./pages/inventory/add-product/add-product.page')
            .then((m) => m.AddProductPage),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'app/dashboard',
  },
];