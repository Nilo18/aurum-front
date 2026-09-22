import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OtpResponse } from './home-service';
import { Router } from '@angular/router';
import { EmployeeRole } from './employee-service';
import { getRequestErrorMessage } from './request-error';

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const authFallback =
    error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)
      ? 'We could not verify your sign-in details. Please check them and try again.'
      : fallback;
  return getRequestErrorMessage(error, authFallback);
}

export interface LoginRequest {
  email: string;
  password: string;
  role: EmployeeRole;
  transactionKey: string;
  otp: string;
}

export interface AuthResponse {
  status: number;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private backendUrlHolder = inject(BackendUrlHolderService);
  private router = inject(Router);
  private baseUrl = this.backendUrlHolder.getBaseUrl();
  private http = inject(HttpClient);

  async verifyLoginRequest(email: string) {
    try {
      const res = await firstValueFrom(
        this.http.post<OtpResponse>(`${this.baseUrl}/api/auth/verify`, { email }),
      );
      return res;
    } catch (error) {
      throw error;
    }
  }

  async login(request: LoginRequest) {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, request),
      );
      return res;
    } catch (error) {
      console.log("Couldn't login: ", error)
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('aurum_token');
    this.router.navigate(['/']);
  }

  async loginAsDemo() {
    try {
      const res = await firstValueFrom(this.http.get<AuthResponse>(`${this.baseUrl}/api/auth/demo`))
      console.log(res)
      return res
    } catch (error) {
      console.log("Couldn't login as demo: ", error)
      throw error;
    }
  }
}
