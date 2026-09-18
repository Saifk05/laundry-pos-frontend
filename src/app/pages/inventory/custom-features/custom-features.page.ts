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
  imports: [CommonModule, FormsModule]
})
export class CustomFeaturesPage implements OnInit {

  secureRetagEnabled = false;
  whatsappUpdateEnabled = false;
  retagPinConfigured = false;

  showPinModal = false;
  showChangePinModal = false;
  showForgotPinModal = false;

  newPin = '';
  confirmPin = '';
  pinError = '';

  currentPin = '';
  changeNewPin = '';
  changeConfirmPin = '';
  changePinError = '';

  resetNewPin = '';
  resetConfirmPin = '';
  resetPinError = '';

  loading = false;
  savingPin = false;
  changingPin = false;
  resettingPin = false;
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

    this.apiService.getCustomFeatures().subscribe({
      next: settings => {
        this.applySettings(settings);
        this.loading = false;
      },
      error: error => {
        console.error('Failed to load custom features', error);
        this.loading = false;
      }
    });
  }

  onSecureRetagChange(): void {
    if (this.updatingSecureRetag) return;

    if (this.secureRetagEnabled && !this.retagPinConfigured) {
      this.showPinModal = true;
      return;
    }

    this.updateSecureRetag(this.secureRetagEnabled);
  }

  onWhatsappChange(): void {
    if (this.updatingWhatsapp) return;

    const enabled = this.whatsappUpdateEnabled;
    this.updatingWhatsapp = true;

    this.apiService.updateRetagWhatsapp({ enabled }).subscribe({
      next: settings => {
        this.applySettings(settings);
        this.updatingWhatsapp = false;
      },
      error: error => {
        console.error('Failed to update WhatsApp Retag feature', error);
        this.whatsappUpdateEnabled = !enabled;
        this.updatingWhatsapp = false;
      }
    });
  }

  savePin(): void {
    this.pinError = '';

    if (!this.isValidPin(this.newPin)) {
      this.pinError = 'PIN must contain exactly 6 digits.';
      return;
    }

    if (this.newPin !== this.confirmPin) {
      this.pinError = 'PINs do not match.';
      return;
    }

    if (this.savingPin) return;

    this.savingPin = true;

    this.apiService.setRetagPin({
      pin: this.newPin,
      confirmPin: this.confirmPin
    }).subscribe({
      next: settings => {
        this.applySettings(settings);
        this.showPinModal = false;
        this.savingPin = false;
        this.resetPinForm();
      },
      error: error => {
        console.error('Failed to set Retag PIN', error);
        this.pinError = this.getErrorMessage(error, 'Unable to set Retag PIN.');
        this.savingPin = false;
      }
    });
  }

  cancelPinSetup(): void {
    if (this.savingPin) return;

    this.secureRetagEnabled = false;
    this.showPinModal = false;
    this.resetPinForm();
  }

  openChangePin(): void {
    this.resetChangePinForm();
    this.showChangePinModal = true;
  }

  closeChangePin(): void {
    if (this.changingPin) return;

    this.showChangePinModal = false;
    this.resetChangePinForm();
  }

  changePin(): void {
    this.changePinError = '';

    if (!this.isValidPin(this.currentPin)) {
      this.changePinError = 'Current PIN must contain exactly 6 digits.';
      return;
    }

    if (!this.isValidPin(this.changeNewPin)) {
      this.changePinError = 'New PIN must contain exactly 6 digits.';
      return;
    }

    if (this.changeNewPin !== this.changeConfirmPin) {
      this.changePinError = 'New PINs do not match.';
      return;
    }

    if (this.currentPin === this.changeNewPin) {
      this.changePinError = 'New PIN must be different from current PIN.';
      return;
    }

    if (this.changingPin) return;

    this.changingPin = true;

    this.apiService.changeRetagPin({
      currentPin: this.currentPin,
      newPin: this.changeNewPin,
      confirmNewPin: this.changeConfirmPin
    }).subscribe({
      next: settings => {
        this.applySettings(settings);
        this.changingPin = false;
        this.showChangePinModal = false;
        this.resetChangePinForm();
      },
      error: error => {
        console.error('Failed to change Retag PIN', error);
        this.changePinError = this.getErrorMessage(
          error,
          'Unable to change Retag PIN.'
        );
        this.changingPin = false;
      }
    });
  }

  openForgotPin(): void {
    this.resetForgotPinForm();
    this.showForgotPinModal = true;
  }

  closeForgotPin(): void {
    if (this.resettingPin) return;

    this.showForgotPinModal = false;
    this.resetForgotPinForm();
  }

  resetPin(): void {
    this.resetPinError = '';

    if (!this.isValidPin(this.resetNewPin)) {
      this.resetPinError = 'New PIN must contain exactly 6 digits.';
      return;
    }

    if (this.resetNewPin !== this.resetConfirmPin) {
      this.resetPinError = 'PINs do not match.';
      return;
    }

    if (this.resettingPin) return;

    this.resettingPin = true;

    this.apiService.resetRetagPin({
      newPin: this.resetNewPin,
      confirmNewPin: this.resetConfirmPin
    }).subscribe({
      next: settings => {
        this.applySettings(settings);
        this.resettingPin = false;
        this.showForgotPinModal = false;
        this.resetForgotPinForm();
      },
      error: error => {
        console.error('Failed to reset Retag PIN', error);
        this.resetPinError = this.getErrorMessage(
          error,
          'Unable to reset Retag PIN.'
        );
        this.resettingPin = false;
      }
    });
  }

  onPinInput(
    field:
      | 'newPin'
      | 'confirmPin'
      | 'currentPin'
      | 'changeNewPin'
      | 'changeConfirmPin'
      | 'resetNewPin'
      | 'resetConfirmPin',
    event: Event
  ): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 6);

    input.value = value;
    this[field] = value;

    if (field === 'newPin' || field === 'confirmPin') {
      this.pinError = '';
    }

    if (
      field === 'currentPin' ||
      field === 'changeNewPin' ||
      field === 'changeConfirmPin'
    ) {
      this.changePinError = '';
    }

    if (
      field === 'resetNewPin' ||
      field === 'resetConfirmPin'
    ) {
      this.resetPinError = '';
    }
  }

  private updateSecureRetag(enabled: boolean): void {
    this.updatingSecureRetag = true;

    this.apiService.updateRetagSecurity({ enabled }).subscribe({
      next: settings => {
        this.applySettings(settings);
        this.updatingSecureRetag = false;
      },
      error: error => {
        console.error('Failed to update Secure Retag', error);
        this.secureRetagEnabled = !enabled;
        this.updatingSecureRetag = false;
      }
    });
  }

  private applySettings(settings: any): void {
    this.secureRetagEnabled = settings.secureRetagEnabled;
    this.retagPinConfigured = settings.retagPinConfigured;
    this.whatsappUpdateEnabled = settings.retagWhatsappEnabled;
  }

  private isValidPin(pin: string): boolean {
    return /^\d{6}$/.test(pin);
  }

  private resetPinForm(): void {
    this.newPin = '';
    this.confirmPin = '';
    this.pinError = '';
  }

  private resetChangePinForm(): void {
    this.currentPin = '';
    this.changeNewPin = '';
    this.changeConfirmPin = '';
    this.changePinError = '';
  }

  private resetForgotPinForm(): void {
    this.resetNewPin = '';
    this.resetConfirmPin = '';
    this.resetPinError = '';
  }

  private getErrorMessage(error: any, fallback: string): string {
    if (typeof error?.error?.message === 'string') {
      return error.error.message;
    }

    if (typeof error?.error === 'string') {
      return error.error;
    }

    return fallback;
  }
}