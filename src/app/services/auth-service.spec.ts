import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService, getAuthErrorMessage } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('provides actionable network, rate-limit, and server errors', () => {
    expect(getAuthErrorMessage(new HttpErrorResponse({ status: 0 }), 'Fallback')).toContain('Check your connection');
    expect(getAuthErrorMessage(new HttpErrorResponse({ status: 429 }), 'Fallback')).toContain('Too many attempts');
    expect(getAuthErrorMessage(new HttpErrorResponse({ status: 503, error: { message: 'Internal exception' } }), 'Fallback')).toContain('temporarily unavailable');
  });

  it('uses backend messages or a fallback without exposing unexpected errors', () => {
    expect(getAuthErrorMessage(new HttpErrorResponse({ status: 400, error: { message: 'Invalid code' } }), 'Fallback')).toBe('Invalid code');
    expect(getAuthErrorMessage(new HttpErrorResponse({ status: 400, error: { message: {} } }), 'Fallback')).toBe('Fallback');
    expect(getAuthErrorMessage(new Error('Internal exception'), 'Fallback')).toBe('Fallback');
  });
});
