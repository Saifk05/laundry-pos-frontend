import {
  Component,
  OnInit
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  IonIcon
} from '@ionic/angular/standalone';

import {
  addIcons
} from 'ionicons';

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
  cubeOutline,
  person,
  barChartOutline
} from 'ionicons/icons';

import {
  BusinessSettings
} from '../../../core/models/business-settings.model';

import {
  BusinessSettingsService
} from '../../../core/services/business-settings.service';


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
export class SidebarComponent
  implements OnInit {

  settings:
    BusinessSettings = {

      id: 0,

      businessName:
        '',

      whatsappDisplayName:
        '',

      headerSubtitle:
        '',

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
      cubeOutline,
      barChartOutline,
      person
    });
  }


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

    this.businessSettingsService
      .loadSettings();
  }
}