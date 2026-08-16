import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  BusinessSettings,
  BusinessSettingsRequest
} from '../../../../core/models/business-settings.model';

import {
  BusinessSettingsService
} from '../../../../core/services/business-settings.service';


@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class AdminPanelComponent
  implements OnInit {

  loading = false;

  saving = false;

  businessName = '';

  headerSubtitle = '';

  adminName = '';

  adminSubtitle = '';

  logoUrl = '';

  errorMessage = '';

  successMessage = '';


  constructor(
    private readonly businessSettingsService:
      BusinessSettingsService
  ) {}


  ngOnInit(): void {

    this.loadSettings();
  }


  loadSettings(): void {

    this.loading =
      true;

    this.errorMessage =
      '';

    this.businessSettingsService
      .getSettings()
      .subscribe({

        next: (
          response:
            BusinessSettings
        ) => {

          this.businessName =
            response.businessName ?? '';

          this.headerSubtitle =
            response.headerSubtitle ?? '';

          this.adminName =
            response.adminName ?? '';

          this.adminSubtitle =
            response.adminSubtitle ?? '';

          this.logoUrl =
            response.logoUrl ?? '';

          this.loading =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Load business settings error',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load business settings';

          this.loading =
            false;
        }

      });
  }


  saveSettings(): void {

    this.errorMessage =
      '';

    this.successMessage =
      '';

    if (
      !this.businessName.trim()
    ) {

      this.errorMessage =
        'Business name is required';

      return;
    }

    if (
      !this.adminName.trim()
    ) {

      this.errorMessage =
        'Admin name is required';

      return;
    }

    const request:
      BusinessSettingsRequest = {

      businessName:
        this.businessName.trim(),

      headerSubtitle:
        this.headerSubtitle.trim(),

      adminName:
        this.adminName.trim(),

      adminSubtitle:
        this.adminSubtitle.trim(),

      logoUrl:
        this.logoUrl.trim()
          ? this.logoUrl.trim()
          : null
    };

    this.saving =
      true;

    this.businessSettingsService
      .updateSettings(
        request
      )
      .subscribe({

        next: (
          response:
            BusinessSettings
        ) => {

          this.businessName =
            response.businessName;

          this.headerSubtitle =
            response.headerSubtitle;

          this.adminName =
            response.adminName;

          this.adminSubtitle =
            response.adminSubtitle;

          this.logoUrl =
            response.logoUrl ?? '';

          this.successMessage =
            'Business settings updated successfully';

          this.saving =
            false;
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Update business settings error',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to update business settings';

          this.saving =
            false;
        }

      });
  }
}