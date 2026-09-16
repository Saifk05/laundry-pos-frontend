import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  homeOutline,
  walkOutline,
  calendarOutline,
  bicycleOutline,
  cartOutline,
  receiptOutline,
  cardOutline,
  cubeOutline,
  barChartOutline,
  person,
  star
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
export class SidebarComponent implements OnInit {

  settings: BusinessSettings = {
    id: 0,
    businessName: '',
    whatsappDisplayName: '',
    headerSubtitle: '',
    adminName: 'Admin',
    adminSubtitle: 'Laundry',
    logoUrl: null,
    cgstPercentage: 0,
    sgstPercentage: 0,
    taxEnabled: false,
    taxIncluded: false,

    customFeatures: {
      secureRetagEnabled: false,
      retagPinConfigured: false,
      retagWhatsappEnabled: false
    }
  };

  constructor(
    private readonly businessSettingsService:
      BusinessSettingsService
  ) {
    addIcons({
      homeOutline,
      walkOutline,
      calendarOutline,
      bicycleOutline,
      cartOutline,
      receiptOutline,
      cardOutline,
      cubeOutline,
      barChartOutline,
      person,
      star
    });
  }

  ngOnInit(): void {

    this.businessSettingsService
      .settings$
      .subscribe(settings => {

        if (settings) {
          this.settings = settings;
        }

      });

    this.businessSettingsService
      .loadSettings();
  }
}