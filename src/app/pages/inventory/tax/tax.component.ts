import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ApiService
} from '../../../../core/services/api.service';

import {
  NotificationService
} from '../../../../core/services/notification.service';

import {
  TaxSetting,
  TaxSettingRequest
} from '../../../../core/models/tax-setting.model';


@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class TaxComponent
  implements OnInit {

  gstNumber: string = '';

  cgstPercentage: number = 0;

  sgstPercentage: number = 0;

  isTaxInclusive: boolean = false;

  loading: boolean = false;

  saving: boolean = false;


  constructor(
    private readonly apiService:
      ApiService,

    private readonly notificationService:
      NotificationService
  ) {}


  ngOnInit(): void {

    this.loadTaxSettings();
  }


  get totalGstPercentage(): number {

    return (
      Number(this.cgstPercentage || 0) +
      Number(this.sgstPercentage || 0)
    );
  }


  toggleTaxType(): void {

    this.isTaxInclusive =
      !this.isTaxInclusive;
  }


  loadTaxSettings(): void {

    this.loading =
      true;

    this.apiService
      .getTaxSettings()
      .subscribe({

        next: (
          setting:
            TaxSetting
        ) => {

          this.gstNumber =
            setting.gstNumber ?? '';

          this.cgstPercentage =
            setting.cgstPercentage ?? 0;

          this.sgstPercentage =
            setting.sgstPercentage ?? 0;

          this.isTaxInclusive =
            setting.taxIncluded ?? false;

          this.loading =
            false;
        },


        error: (
          error
        ) => {

          console.error(
            'Failed to load tax settings:',
            error
          );

          this.loading =
            false;

          this.notificationService.error(
            'Unable to load tax settings.'
          );
        }

      });
  }


  saveTaxSettings(): void {

    if (
      this.saving
    ) {

      return;
    }


    const request:
      TaxSettingRequest = {

        gstNumber:
          this.gstNumber.trim()
            ? this.gstNumber.trim()
            : null,

        cgstPercentage:
          Number(
            this.cgstPercentage || 0
          ),

        sgstPercentage:
          Number(
            this.sgstPercentage || 0
          ),

        taxIncluded:
          this.isTaxInclusive
      };


    this.saving =
      true;


    this.apiService
      .updateTaxSettings(
        request
      )
      .subscribe({

        next: (
          setting:
            TaxSetting
        ) => {

          this.gstNumber =
            setting.gstNumber ?? '';

          this.cgstPercentage =
            setting.cgstPercentage ?? 0;

          this.sgstPercentage =
            setting.sgstPercentage ?? 0;

          this.isTaxInclusive =
            setting.taxIncluded ?? false;

          this.saving =
            false;

          this.notificationService.success(
            'Tax settings saved successfully.'
          );
        },


        error: (
          error
        ) => {

          console.error(
            'Failed to save tax settings:',
            error
          );

          this.saving =
            false;

          this.notificationService.error(
            'Unable to save tax settings.'
          );
        }

      });
  }

}