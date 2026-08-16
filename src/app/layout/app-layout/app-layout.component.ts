import {
  Component,
  OnInit
} from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';

import {
  SidebarComponent
} from '../sidebar/sidebar.component';

import {
  BusinessSettings
} from '../../../core/models/business-settings.model';

import {
  BusinessSettingsService
} from '../../../core/services/business-settings.service';


@Component({
  selector: 'app-app-layout',
  standalone: true,
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
  imports: [
    RouterOutlet,
    SidebarComponent
  ]
})
export class AppLayoutComponent
  implements OnInit {

  settings:
    BusinessSettings = {

      id: 0,

      businessName:
        'Venkateshwara Fabric Works',

      headerSubtitle:
        'Operations',

      adminName:
        'Admin',

      adminSubtitle:
        'Laundry',

      logoUrl:
        null
    };


  constructor(
    private readonly businessSettingsService:
      BusinessSettingsService
  ) {}


  ngOnInit(): void {

    this.businessSettingsService
      .settings$
      .subscribe(
        (
          settings:
            BusinessSettings | null
        ) => {

          if (settings) {

            this.settings =
              settings;
          }
        }
      );
  }
}