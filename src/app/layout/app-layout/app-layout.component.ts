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

      whatsappDisplayName:
        'Fabric Luxury Shine',

      headerSubtitle:
        'Operations',

      adminName:
        'Admin',

      adminSubtitle:
        'Laundry',

      logoUrl:
        null
    };


  zoomLevel = 1;

  readonly minZoom = 0.7;

  readonly maxZoom = 1.3;

  readonly zoomStep = 0.1;


  constructor(
    private readonly businessSettingsService:
      BusinessSettingsService
  ) {}


  ngOnInit(): void {

    this.loadZoom();

    this.businessSettingsService
      .settings$
      .subscribe(
        (
          settings:
            BusinessSettings | null
        ) => {

          if (
            settings
          ) {

            this.settings =
              settings;
          }
        }
      );
  }


  get zoomPercentage():
    number {

    return Math.round(
      this.zoomLevel * 100
    );
  }


  zoomIn():
    void {

    if (
      this.zoomLevel >=
      this.maxZoom
    ) {

      return;
    }

    this.zoomLevel =
      Math.min(
        this.maxZoom,
        Number(
          (
            this.zoomLevel +
            this.zoomStep
          ).toFixed(1)
        )
      );

    this.saveZoom();
  }


  zoomOut():
    void {

    if (
      this.zoomLevel <=
      this.minZoom
    ) {

      return;
    }

    this.zoomLevel =
      Math.max(
        this.minZoom,
        Number(
          (
            this.zoomLevel -
            this.zoomStep
          ).toFixed(1)
        )
      );

    this.saveZoom();
  }


  resetZoom():
    void {

    this.zoomLevel =
      1;

    this.saveZoom();
  }


  private saveZoom():
    void {

    localStorage.setItem(
      'appZoomLevel',
      String(
        this.zoomLevel
      )
    );
  }


  private loadZoom():
    void {

    const savedZoom =
      localStorage.getItem(
        'appZoomLevel'
      );

    if (
      !savedZoom
    ) {

      return;
    }

    const zoom =
      Number(
        savedZoom
      );

    if (
      Number.isNaN(
        zoom
      )
    ) {

      return;
    }

    this.zoomLevel =
      Math.min(
        this.maxZoom,
        Math.max(
          this.minZoom,
          zoom
        )
      );
  }

  reloadPage(): void {
  window.location.reload();
}

}