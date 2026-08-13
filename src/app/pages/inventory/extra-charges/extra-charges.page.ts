import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ApiService } from '../../../../../src/core/services/api.service';

import {
  ExpressCharge,
  ExpressChargeListResponse,
  ExpressChargeRequest
} from '../../../../core/models/express-charge.model';


interface ExtraChargeForm {
  name: FormControl<string>;
  percentage: FormControl<number | null>;
  active: FormControl<boolean>;
}


@Component({
  selector: 'app-extra-charges',
  standalone: true,
  templateUrl: './extra-charges.page.html',
  styleUrls: ['./extra-charges.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class ExtraChargesPage implements OnInit {

  showChargeForm = false;

  editingChargeId: string | null = null;

  charges: ExpressCharge[] = [];

  loading = false;

  errorMessage = '';

  successMessage = '';


  chargeForm =
    new FormGroup<ExtraChargeForm>({

      name: new FormControl(
        'Express Delivery',
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.maxLength(100)
          ]
        }
      ),

      percentage:
        new FormControl<number | null>(
          null,
          {
            validators: [
              Validators.required,
              Validators.min(1),
              Validators.max(100)
            ]
          }
        ),

      active:
        new FormControl(
          true,
          {
            nonNullable: true
          }
        )

    });


  constructor(
    private readonly apiService: ApiService
  ) {}


  ngOnInit(): void {

    this.loadCharges();
  }


  /* =========================================
     LOAD EXPRESS CHARGES
  ========================================= */

  loadCharges(): void {

    this.loading = true;

    this.errorMessage = '';

    this.apiService
      .getExpressCharges()
      .subscribe({

        next: (
          response: ExpressChargeListResponse
        ) => {

          this.charges =
            response.expressCharges ?? [];

          this.sortCharges();

          this.loading = false;
        },

        error: (error: any) => {

          console.error(
            'Failed to load express charges:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to load express charges';

          this.loading = false;
        }

      });
  }


  /* =========================================
     ACTIVE CHARGES
  ========================================= */

  get activeCharges(): number {

    return this.charges.filter(
      (charge: ExpressCharge) =>
        charge.active
    ).length;
  }


  /* =========================================
     ADD
  ========================================= */

  addCharge(): void {

    this.editingChargeId = null;

    this.errorMessage = '';

    this.successMessage = '';

    this.chargeForm.reset({
      name: 'Express Delivery',
      percentage: null,
      active: true
    });

    this.showChargeForm = true;
  }


  /* =========================================
     EDIT
  ========================================= */

  editCharge(
    charge: ExpressCharge
  ): void {

    this.editingChargeId =
      charge.id;

    this.errorMessage = '';

    this.successMessage = '';

    this.chargeForm.setValue({

      name:
        charge.name,

      percentage:
        charge.percentage,

      active:
        charge.active

    });

    this.showChargeForm = true;
  }


  /* =========================================
     CLOSE FORM
  ========================================= */

  closeChargeForm(): void {

    this.showChargeForm = false;

    this.editingChargeId = null;

    this.chargeForm.reset({
      name: 'Express Delivery',
      percentage: null,
      active: true
    });
  }


  /* =========================================
     SAVE
  ========================================= */

  saveCharge(): void {

    this.chargeForm.markAllAsTouched();

    if (this.chargeForm.invalid) {
      return;
    }

    const value =
      this.chargeForm.getRawValue();

    const percentage =
      Number(value.percentage);

    /*
     * Frontend duplicate check.
     * Backend also prevents duplicate percentages.
     */

    const duplicate =
      this.charges.some(
        (charge: ExpressCharge) =>
          Number(charge.percentage) ===
            percentage &&
          charge.id !==
            this.editingChargeId
      );

    if (duplicate) {

      this.errorMessage =
        'This express charge percentage already exists.';

      return;
    }

    const request: ExpressChargeRequest = {

      name:
        value.name.trim(),

      percentage:
        percentage,

      active:
        value.active

    };

    this.errorMessage = '';

    this.successMessage = '';

    if (this.editingChargeId !== null) {

      this.updateCharge(
        this.editingChargeId,
        request
      );

      return;
    }

    this.createCharge(request);
  }


  /* =========================================
     CREATE
  ========================================= */

  private createCharge(
    request: ExpressChargeRequest
  ): void {

    this.loading = true;

    this.apiService
      .createExpressCharge(request)
      .subscribe({

        next: (
          charge: ExpressCharge
        ) => {

          this.charges = [
            ...this.charges,
            charge
          ];

          this.sortCharges();

          this.loading = false;

          this.successMessage =
            'Express charge created successfully';

          this.closeChargeForm();
        },

        error: (error: any) => {

          console.error(
            'Failed to create express charge:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to create express charge';

          this.loading = false;
        }

      });
  }


  /* =========================================
     UPDATE
  ========================================= */

  private updateCharge(
    chargeId: string,
    request: ExpressChargeRequest
  ): void {

    this.loading = true;

    this.apiService
      .updateExpressCharge(
        chargeId,
        request
      )
      .subscribe({

        next: (
          updatedCharge: ExpressCharge
        ) => {

          this.charges =
            this.charges.map(
              (charge: ExpressCharge) =>
                charge.id ===
                updatedCharge.id
                  ? updatedCharge
                  : charge
            );

          this.sortCharges();

          this.loading = false;

          this.successMessage =
            'Express charge updated successfully';

          this.closeChargeForm();
        },

        error: (error: any) => {

          console.error(
            'Failed to update express charge:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to update express charge';

          this.loading = false;
        }

      });
  }


  /* =========================================
     ACTIVE / INACTIVE
  ========================================= */

  toggleStatus(
    charge: ExpressCharge
  ): void {

    const newStatus =
      !charge.active;

    this.errorMessage = '';

    this.successMessage = '';

    this.apiService
      .updateExpressChargeStatus(
        charge.id,
        newStatus
      )
      .subscribe({

        next: (
          updatedCharge: ExpressCharge
        ) => {

          this.charges =
            this.charges.map(
              (item: ExpressCharge) =>
                item.id ===
                updatedCharge.id
                  ? updatedCharge
                  : item
            );

          this.successMessage =
            updatedCharge.active
              ? 'Express charge activated successfully'
              : 'Express charge deactivated successfully';
        },

        error: (error: any) => {

          console.error(
            'Failed to update express charge status:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to update express charge status';
        }

      });
  }


  /* =========================================
     DELETE / DEACTIVATE
  ========================================= */

  deleteCharge(
    charge: ExpressCharge
  ): void {

    this.errorMessage = '';

    this.successMessage = '';

    this.apiService
      .deleteExpressCharge(
        charge.id
      )
      .subscribe({

        next: () => {

          this.charges =
            this.charges.map(
              (item: ExpressCharge) =>
                item.id === charge.id
                  ? {
                      ...item,
                      active: false
                    }
                  : item
            );

          this.successMessage =
            'Express charge deactivated successfully';
        },

        error: (error: any) => {

          console.error(
            'Failed to deactivate express charge:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to deactivate express charge';
        }

      });
  }


  /* =========================================
     SORT
  ========================================= */

  private sortCharges(): void {

    this.charges = [
      ...this.charges
    ].sort(
      (
        a: ExpressCharge,
        b: ExpressCharge
      ) =>
        Number(a.percentage) -
        Number(b.percentage)
    );
  }

}