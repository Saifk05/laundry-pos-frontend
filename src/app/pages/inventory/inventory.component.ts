import {
  Component
} from '@angular/core';

import {
  Router
} from '@angular/router';


@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {


  constructor(
    private readonly router:
      Router
  ) {}


  openServices(): void {

    this.router.navigateByUrl(
      '/app/inventory/services'
    );
  }


  openCoupons(): void {

    this.router.navigateByUrl(
      '/app/inventory/coupons'
    );
  }


  openExtraCharges(): void {

    this.router.navigateByUrl(
      '/app/inventory/extra-charges'
    );
  }


  openAdminPanel(): void {

    this.router.navigateByUrl(
      '/app/inventory/admin-panel'
    );
  }


  openTermsConditions(): void {

    this.router.navigateByUrl(
      '/app/inventory/terms-conditions'
    );
  }

}