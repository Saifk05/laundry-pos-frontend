import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';


interface ExtraCharge {
  id: number;
  name: string;
  percentage: number;
  active: boolean;
}


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
export class ExtraChargesPage {

  showChargeForm = false;

  editingChargeId: number | null = null;


  /* =========================================
     DUMMY DATA - UI ONLY
  ========================================= */

  charges: ExtraCharge[] = [
    {
      id: 1,
      name: 'Express Delivery',
      percentage: 10,
      active: true
    },
    {
      id: 2,
      name: 'Express Delivery',
      percentage: 20,
      active: true
    },
    {
      id: 3,
      name: 'Express Delivery',
      percentage: 30,
      active: true
    },
    {
      id: 4,
      name: 'Express Delivery',
      percentage: 40,
      active: true
    },
    {
      id: 5,
      name: 'Express Delivery',
      percentage: 50,
      active: true
    }
  ];


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


  /* =========================================
     ACTIVE CHARGES
  ========================================= */

  get activeCharges(): number {

    return this.charges.filter(
      charge => charge.active
    ).length;
  }


  /* =========================================
     ADD
  ========================================= */

  addCharge(): void {

    this.editingChargeId = null;

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
    charge: ExtraCharge
  ): void {

    this.editingChargeId =
      charge.id;

    this.chargeForm.setValue({
      name: charge.name,
      percentage: charge.percentage,
      active: charge.active
    });

    this.showChargeForm = true;
  }


  /* =========================================
     CLOSE
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
     SAVE - UI ONLY
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
     * Do not allow duplicate percentages.
     */

    const duplicate =
      this.charges.some(
        charge =>
          charge.percentage === percentage &&
          charge.id !== this.editingChargeId
      );


    if (duplicate) {

      console.warn(
        'This express charge percentage already exists.'
      );

      return;
    }


    if (this.editingChargeId !== null) {

      const index =
        this.charges.findIndex(
          charge =>
            charge.id ===
            this.editingChargeId
        );


      if (index !== -1) {

        this.charges[index] = {

          id:
            this.editingChargeId,

          name:
            value.name.trim(),

          percentage:
            percentage,

          active:
            value.active

        };


        this.charges = [
          ...this.charges
        ];
      }

    } else {

      const charge: ExtraCharge = {

        id:
          Date.now(),

        name:
          value.name.trim(),

        percentage:
          percentage,

        active:
          value.active

      };


      this.charges = [
        ...this.charges,
        charge
      ];


      this.charges.sort(
        (a, b) =>
          a.percentage -
          b.percentage
      );


      console.log(
        'Extra charge ready to save:',
        charge
      );
    }


    this.closeChargeForm();
  }


  /* =========================================
     STATUS
  ========================================= */

  toggleStatus(
    charge: ExtraCharge
  ): void {

    charge.active =
      !charge.active;

    this.charges = [
      ...this.charges
    ];
  }

}