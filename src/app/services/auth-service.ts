import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OtpResponse } from './home-service';

export enum EmployeeRole { OWNER, ADMIN, STAFF }

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'Unable to connect. Check your connection and try again.';
  if (error.status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (error.status >= 500) return 'The sign-in service is temporarily unavailable. Please try again later.';
  const message = error.error?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (error.status === 401 || error.status === 403) return 'We could not verify your sign-in details. Please check them and try again.';
  return fallback;
}

export interface LoginRequest {
  email: string,
  password: string,
  role: EmployeeRole
  transactionKey: string,
  otp: string
}

export interface AuthResponse {
  status: number,
  token: string
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private backendUrlHolder = inject(BackendUrlHolderService)
  private baseUrl = this.backendUrlHolder.getBaseUrl()
  private http = inject(HttpClient)

  async verifyLoginRequest(email: string) {
    try {
      const res = await firstValueFrom(this.http.post<OtpResponse>(`${this.baseUrl}/api/auth/verify`, { email }))
      return res;
    } catch (error) {
      throw error
    }
  }

  async login(request: LoginRequest) {
    try {
      const res = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, request))
      return res
    } catch (error) {
      throw error
    }
  }
}
