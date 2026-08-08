import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.page')
        .then((m) => m.LandingPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page')
        .then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page')
        .then((m) => m.RegisterPage),
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
        path: 'b2c-orders',
        loadComponent: () => 
          import('./pages/orders/b2c-orders/b2c-orders.page')
            .then( m => m.B2cOrdersPage)
      },
      {
        path: 'bill',
        loadComponent: () => 
          import('./pages/bill/bill.page')
            .then( m => m.BillPage)
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];