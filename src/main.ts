import { bootstrapApplication } from '@angular/platform-browser';

import {
  provideRouter,
  withPreloading,
  PreloadAllModules
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import {
  provideIonicAngular
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import {
  authInterceptor
} from './core/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [

    provideIonicAngular(),

    provideRouter(
      routes,
      withPreloading(
        PreloadAllModules
      )
    ),

    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    )
  ]
});