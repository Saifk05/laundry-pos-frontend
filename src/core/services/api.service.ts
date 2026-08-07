
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly authUrl = `${environment.clientUrl}/api/auth`;

  constructor(
    private readonly http: HttpClient
  ) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.authUrl}/register`,
      request
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.authUrl}/login`,
      request
    );
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.authUrl}/logout`,
      {}
    );
  }
}

