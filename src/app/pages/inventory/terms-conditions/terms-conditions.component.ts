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
  TermsConditionsRequest,
  TermsConditionsResponse
} from '../../../../core/models/terms-conditions.model';


@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class TermsConditionsComponent
  implements OnInit {


  termsAndConditions = '';

  loading = false;

  saving = false;

  successMessage = '';

  errorMessage = '';


  readonly defaultTerms =
    `1. Please check garments at the time of collection.
2. Stain removal is attempted but cannot be guaranteed.
3. Please retain this receipt until collection.
4. Delivery dates may vary due to unavoidable circumstances.
5. We are not responsible for items left uncollected for an extended period.`;


  constructor(
    private readonly apiService:
      ApiService
  ) {}


  ngOnInit(): void {

    this.loadTerms();
  }


  loadTerms(): void {

    this.loading = true;

    this.errorMessage = '';

    this.apiService
      .getTermsConditions()
      .subscribe({

        next: (
          response:
            TermsConditionsResponse
        ) => {

          this.loading = false;

          this.termsAndConditions =
            response.termsText?.trim()
              ? response.termsText
              : this.defaultTerms;

          localStorage.setItem(
            'receiptTermsAndConditions',
            this.termsAndConditions
          );
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Load terms error',
            error
          );

          this.loading = false;

          this.termsAndConditions =
            this.defaultTerms;

          localStorage.setItem(
            'receiptTermsAndConditions',
            this.termsAndConditions
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to load Terms & Conditions';
        }

      });
  }


  saveTerms(): void {

    const terms =
      this.termsAndConditions
        .trim();

    if (!terms) {

      this.errorMessage =
        'Terms & Conditions cannot be empty';

      return;
    }

    const request:
      TermsConditionsRequest = {

      termsText:
        terms

    };

    this.saving = true;

    this.successMessage = '';

    this.errorMessage = '';

    this.apiService
      .updateTermsConditions(
        request
      )
      .subscribe({

        next: (
          response:
            TermsConditionsResponse
        ) => {

          this.saving = false;

          this.termsAndConditions =
            response.termsText;

          localStorage.setItem(
            'receiptTermsAndConditions',
            response.termsText
          );

          this.successMessage =
            response.message ||
            'Terms & Conditions saved successfully';

          setTimeout(
            () => {

              this.successMessage =
                '';

            },
            2500
          );
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Save terms error',
            error
          );

          this.saving = false;

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to save Terms & Conditions';
        }

      });
  }


  resetTerms(): void {

    this.termsAndConditions =
      this.defaultTerms;

    this.successMessage =
      '';

    this.errorMessage =
      '';
  }

}