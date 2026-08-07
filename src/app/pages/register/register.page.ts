import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOffOutline,
  eyeOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class RegisterPage implements OnInit {

  registerForm!: FormGroup;

  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      arrowBackOutline
    });
  }

  ngOnInit(): void {
    this.createForm();
  }

  ionViewWillEnter(): void {
    this.loading = false;
    this.errorMessage = '';
    this.showPassword = false;
  }

  private createForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: [
        '',
        [
          Validators.required
        ]
      ],
      lastName: [
        '',
        [
          Validators.required
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  register(): void {

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.apiService.register(
      this.registerForm.value
    ).subscribe({
      next: (response) => {

        localStorage.setItem(
          'activeToken',
          response.token
        );

        this.loading = false;

        this.router.navigate(['/dashboard']);
      },
      error: (error) => {

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to create account.';
      }
    });
  }
}