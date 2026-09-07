import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ApiService
} from '../../../../../src/core/services/api.service';

import {
  NotificationService
} from '../../../../core/services/notification.service';

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
export class ExtraChargesPage
  implements OnInit {

  showChargeForm = false;

  editingChargeId:
    string | null =
      null;

  charges:
    ExpressCharge[] =
      [];

  loading = false;

  errorMessage = '';

  successMessage = '';

  chargeForm =
    new FormGroup<ExtraChargeForm>({

      name:
        new FormControl(
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
    private readonly apiService:
      ApiService,

    private readonly notificationService:
      NotificationService
  ) {}


  ngOnInit(): void {

    this.loadCharges();
  }


  loadCharges(): void {

    this.loading = true;

    this.apiService
      .getExpressCharges()
      .subscribe({

        next: (
          response:
            ExpressChargeListResponse
        ) => {

          this.charges =
            response.expressCharges ?? [];

          this.sortCharges();

          this.loading = false;
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          console.error(
            'Failed to load express charges:',
            error
          );

          const message =
            this.getErrorMessage(
              error,
              'Failed to load express charges'
            );

          void this.notificationService.error(
            message
          );

          this.loading = false;
        }

      });
  }


  get activeCharges(): number {

    return this.charges
      .filter(
        (
          charge:
            ExpressCharge
        ) =>
          charge.active
      )
      .length;
  }


  addCharge(): void {

    this.editingChargeId =
      null;

    this.chargeForm.reset({
      name: 'Express Delivery',
      percentage: null,
      active: true
    });

    this.showChargeForm =
      true;
  }


  editCharge(
    charge:
      ExpressCharge
  ): void {

    this.editingChargeId =
      charge.id;

    this.chargeForm.setValue({
      name:
        charge.name,

      percentage:
        charge.percentage,

      active:
        charge.active
    });

    this.showChargeForm =
      true;
  }


  closeChargeForm(): void {

    this.showChargeForm =
      false;

    this.editingChargeId =
      null;

    this.chargeForm.reset({
      name: 'Express Delivery',
      percentage: null,
      active: true
    });
  }


  saveCharge(): void {

    this.chargeForm
      .markAllAsTouched();

    if (
      this.chargeForm.invalid
    ) {

      void this.notificationService.warning(
        'Please enter valid express charge details'
      );

      return;
    }

    const value =
      this.chargeForm
        .getRawValue();

    const percentage =
      Number(
        value.percentage
      );

    const duplicate =
      this.charges.some(
        (
          charge:
            ExpressCharge
        ) =>
          Number(
            charge.percentage
          ) === percentage &&
          charge.id !==
            this.editingChargeId
      );

    if (
      duplicate
    ) {

      void this.notificationService.error(
        'This express charge percentage already exists'
      );

      return;
    }

    const request:
      ExpressChargeRequest = {

        name:
          value.name
            .trim(),

        percentage:
          percentage,

        active:
          value.active
      };

    if (
      this.editingChargeId !==
        null
    ) {

      this.updateCharge(
        this.editingChargeId,
        request
      );

      return;
    }

    this.createCharge(
      request
    );
  }


  private createCharge(
    request:
      ExpressChargeRequest
  ): void {

    this.loading =
      true;

    this.apiService
      .createExpressCharge(
        request
      )
      .subscribe({

        next: (
          charge:
            ExpressCharge
        ) => {

          this.charges = [
            ...this.charges,
            charge
          ];

          this.sortCharges();

          this.loading =
            false;

          this.closeChargeForm();

          void this.notificationService.success(
            'Express charge created successfully'
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          console.error(
            'Failed to create express charge:',
            error
          );

          const message =
            this.getErrorMessage(
              error,
              'Failed to create express charge'
            );

          void this.notificationService.error(
            message
          );

          this.loading =
            false;
        }

      });
  }


  private updateCharge(
    chargeId:
      string,

    request:
      ExpressChargeRequest
  ): void {

    this.loading =
      true;

    this.apiService
      .updateExpressCharge(
        chargeId,
        request
      )
      .subscribe({

        next: (
          updatedCharge:
            ExpressCharge
        ) => {

          this.charges =
            this.charges.map(
              (
                charge:
                  ExpressCharge
              ) =>
                charge.id ===
                  updatedCharge.id
                  ? updatedCharge
                  : charge
            );

          this.sortCharges();

          this.loading =
            false;

          this.closeChargeForm();

          void this.notificationService.success(
            'Express charge updated successfully'
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          console.error(
            'Failed to update express charge:',
            error
          );

          const message =
            this.getErrorMessage(
              error,
              'Failed to update express charge'
            );

          void this.notificationService.error(
            message
          );

          this.loading =
            false;
        }

      });
  }


  toggleStatus(
    charge:
      ExpressCharge
  ): void {

    const newStatus =
      !charge.active;

    this.apiService
      .updateExpressChargeStatus(
        charge.id,
        newStatus
      )
      .subscribe({

        next: (
          updatedCharge:
            ExpressCharge
        ) => {

          this.charges =
            this.charges.map(
              (
                item:
                  ExpressCharge
              ) =>
                item.id ===
                  updatedCharge.id
                  ? updatedCharge
                  : item
            );

          void this.notificationService.success(
            updatedCharge.active
              ? 'Express charge activated successfully'
              : 'Express charge deactivated successfully'
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          console.error(
            'Failed to update express charge status:',
            error
          );

          const message =
            this.getErrorMessage(
              error,
              'Failed to update express charge status'
            );

          void this.notificationService.error(
            message
          );
        }

      });
  }


  deleteCharge(
    charge:
      ExpressCharge
  ): void {

    this.apiService
      .deleteExpressCharge(
        charge.id
      )
      .subscribe({

        next: () => {

          this.charges =
            this.charges.map(
              (
                item:
                  ExpressCharge
              ) =>
                item.id ===
                  charge.id
                  ? {
                      ...item,
                      active: false
                    }
                  : item
            );

          void this.notificationService.success(
            'Express charge deactivated successfully'
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          console.error(
            'Failed to deactivate express charge:',
            error
          );

          const message =
            this.getErrorMessage(
              error,
              'Failed to deactivate express charge'
            );

          void this.notificationService.error(
            message
          );
        }

      });
  }


  private getErrorMessage(
    error:
      HttpErrorResponse,

    fallback:
      string
  ): string {

    const backendMessage =
      error?.error?.message;

    if (
      typeof backendMessage ===
        'string' &&
      backendMessage.trim()
    ) {

      return backendMessage.trim();
    }

    return fallback;
  }


  private sortCharges(): void {

    this.charges = [
      ...this.charges
    ].sort(
      (
        a:
          ExpressCharge,

        b:
          ExpressCharge
      ) =>
        Number(
          a.percentage
        ) -
        Number(
          b.percentage
        )
    );
  }

}