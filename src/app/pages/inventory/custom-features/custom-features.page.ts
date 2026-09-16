import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-custom-features',
  templateUrl: './custom-features.page.html',
  styleUrls: ['./custom-features.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class CustomFeaturesPage implements OnInit {

  secureRetagEnabled = false;
  whatsappUpdateEnabled = false;
  retagPinConfigured = false;

  showPinModal = false;

  newPin = '';
  confirmPin = '';
  pinError = '';

  loading = false;
  savingPin = false;
  updatingSecureRetag = false;
  updatingWhatsapp = false;

  constructor(
    private readonly router: Router,
    private readonly apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  goBack(): void {
    this.router.navigateByUrl('/app/inventory');
  }

  loadSettings(): void {

    this.loading = true;

    this.apiService
      .getCustomFeatures()
      .subscribe({
        next: settings => {
          this.secureRetagEnabled =
            settings.secureRetagEnabled;

          this.retagPinConfigured =
            settings.retagPinConfigured;

          this.whatsappUpdateEnabled =
            settings.retagWhatsappEnabled;

          this.loading = false;
        },
        error: error => {
          console.error(
            'Failed to load custom features',
            error
          );

          this.loading = false;
        }
      });
  }

  onSecureRetagChange(): void {

    if (this.updatingSecureRetag) {
      return;
    }

    if (this.secureRetagEnabled) {

      if (!this.retagPinConfigured) {
        this.showPinModal = true;
        return;
      }

      this.updateSecureRetag(true);
      return;
    }

    this.updateSecureRetag(false);
  }

  onWhatsappChange(): void {

    if (this.updatingWhatsapp) {
      return;
    }

    const enabled =
      this.whatsappUpdateEnabled;

    this.updatingWhatsapp = true;

    this.apiService
      .updateRetagWhatsapp({
        enabled
      })
      .subscribe({
        next: settings => {

          this.whatsappUpdateEnabled =
            settings.retagWhatsappEnabled;

          this.updatingWhatsapp = false;
        },
        error: error => {

          console.error(
            'Failed to update WhatsApp Retag feature',
            error
          );

          this.whatsappUpdateEnabled =
            !enabled;

          this.updatingWhatsapp = false;
        }
      });
  }

  savePin(): void {

    this.pinError = '';

    if (!/^\d{6}$/.test(this.newPin)) {
      this.pinError =
        'PIN must contain exactly 6 digits.';
      return;
    }

    if (this.newPin !== this.confirmPin) {
      this.pinError =
        'PINs do not match.';
      return;
    }

    if (this.savingPin) {
      return;
    }

    this.savingPin = true;

    this.apiService
      .setRetagPin({
        pin: this.newPin,
        confirmPin: this.confirmPin
      })
      .subscribe({
        next: settings => {

          this.secureRetagEnabled =
            settings.secureRetagEnabled;

          this.retagPinConfigured =
            settings.retagPinConfigured;

          this.whatsappUpdateEnabled =
            settings.retagWhatsappEnabled;

          this.showPinModal = false;
          this.savingPin = false;

          this.resetPinForm();
        },
        error: error => {

          console.error(
            'Failed to set Retag PIN',
            error
          );

          this.pinError =
            this.getErrorMessage(
              error,
              'Unable to set Retag PIN.'
            );

          this.savingPin = false;
        }
      });
  }

  cancelPinSetup(): void {

    this.secureRetagEnabled = false;
    this.showPinModal = false;

    this.resetPinForm();
  }

  private updateSecureRetag(
    enabled: boolean
  ): void {

    this.updatingSecureRetag = true;

    this.apiService
      .updateRetagSecurity({
        enabled
      })
      .subscribe({
        next: settings => {

          this.secureRetagEnabled =
            settings.secureRetagEnabled;

          this.retagPinConfigured =
            settings.retagPinConfigured;

          this.updatingSecureRetag = false;
        },
        error: error => {

          console.error(
            'Failed to update Secure Retag',
            error
          );

          this.secureRetagEnabled =
            !enabled;

          this.updatingSecureRetag = false;
        }
      });
  }

  private resetPinForm(): void {

    this.newPin = '';
    this.confirmPin = '';
    this.pinError = '';
  }

  private getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (
      typeof error?.error?.message === 'string'
    ) {
      return error.error.message;
    }

    if (
      typeof error?.error === 'string'
    ) {
      return error.error;
    }

    return fallback;
  }

  onPinInput(
  field: 'newPin' | 'confirmPin',
  event: Event
): void {

  const input =
    event.target as HTMLInputElement;

  const value =
    input.value
      .replace(/\D/g, '')
      .slice(0, 6);

  input.value = value;
  this[field] = value;
}
}