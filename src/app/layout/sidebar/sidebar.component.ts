import { Component } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  homeOutline,
  walkOutline,
  bicycleOutline,
  cartOutline,
  cartSharp,
  personAddOutline,
  walletOutline,
  checkmarkDoneOutline,
  receiptOutline,
  cardOutline,
  logOutOutline
} from 'ionicons/icons';

import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonIcon
  ]
})
export class SidebarComponent {

  loggingOut = false;

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {

    addIcons({
      homeOutline,
      walkOutline,
      bicycleOutline,
      cartOutline,
      cartSharp,
      personAddOutline,
      walletOutline,
      checkmarkDoneOutline,
      receiptOutline,
      cardOutline,
      logOutOutline
    });
  }

  logout(): void {

    if (this.loggingOut) {
      return;
    }

    this.loggingOut = true;

    this.apiService
      .logout()
      .subscribe({
        next: () => {

          this.clearSession();

          this.router.navigateByUrl('/');
        },

        error: () => {

          this.clearSession();

          this.router.navigateByUrl('/');
        }
      });
  }

  private clearSession(): void {

    localStorage.removeItem('activeToken');
    localStorage.removeItem('refreshToken');

    this.loggingOut = false;
  }
}