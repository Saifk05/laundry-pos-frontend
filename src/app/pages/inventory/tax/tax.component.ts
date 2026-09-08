import {
  Component
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';


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
export class TaxComponent {

  gstNumber: string = '';

  cgstPercentage: number = 0;

  sgstPercentage: number = 0;

  isTaxInclusive: boolean = false;


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


  saveTaxSettings(): void {

    const taxSettings = {

      gstNumber:
        this.gstNumber.trim(),

      cgstPercentage:
        Number(this.cgstPercentage),

      sgstPercentage:
        Number(this.sgstPercentage),

      totalGstPercentage:
        this.totalGstPercentage,

      taxType:
        this.isTaxInclusive
          ? 'INCLUSIVE'
          : 'EXCLUSIVE'

    };


    console.log(
      'Tax Settings:',
      taxSettings
    );
  }

}