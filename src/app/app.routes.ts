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
        loadComponent: () => import('./pages/orders/new-walk-in/new-walk-in.page').then( m => m.NewWalkInPage)
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },

];