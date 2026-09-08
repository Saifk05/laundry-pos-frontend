import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;

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
    this.errorMessage = '';
    this.loading = false;
  }

  ionViewDidEnter(): void {
    document.activeElement instanceof HTMLElement
      ? document.activeElement.blur()
      : null;
  }

  private createForm(): void {
    this.loginForm = this.formBuilder.group({
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
          Validators.required
        ]
      ]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.apiService.login(
      this.loginForm.value
    ).subscribe({
      next: (response) => {

        localStorage.setItem(
          'activeToken',
          response.token
        );

        this.loading = false;

        this.router.navigate(['/app/dashboard']);
      },
      error: (error) => {

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Invalid email or password.';
      }
    });
  }
}