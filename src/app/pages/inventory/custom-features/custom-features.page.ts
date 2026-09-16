import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
export class CustomFeaturesPage {

  secureRetagEnabled = false;
  whatsappUpdateEnabled = false;

  showPinModal = false;

  newPin = '';
  confirmPin = '';
  pinError = '';

  constructor(private readonly router: Router) {}

  goBack(): void {
    this.router.navigateByUrl('/app/inventory');
  }

  onSecureRetagChange(): void {
    if (this.secureRetagEnabled) {
      this.showPinModal = true;
      return;
    }

    this.resetPinForm();
  }

  saveDummyPin(): void {
    this.pinError = '';

    if (!/^\d{6}$/.test(this.newPin)) {
      this.pinError = 'PIN must contain exactly 6 digits.';
      return;
    }

    if (this.newPin !== this.confirmPin) {
      this.pinError = 'PINs do not match.';
      return;
    }

    console.log('Dummy Retag PIN:', this.newPin);

    this.showPinModal = false;
    this.resetPinForm();
  }

  cancelPinSetup(): void {
    this.secureRetagEnabled = false;
    this.showPinModal = false;
    this.resetPinForm();
  }

  private resetPinForm(): void {
    this.newPin = '';
    this.confirmPin = '';
    this.pinError = '';
  }
}