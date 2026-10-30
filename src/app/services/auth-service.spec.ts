import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService, getAuthErrorMessage } from './auth-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const baseUrl = 'https://api.example.test';
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BackendUrlHolderService, useValue: { getBaseUrl: () => baseUrl } },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('verifyLoginRequest sends the expected POST request and returns the response', async () => {
    const result = service.verifyLoginRequest('guest@example.com');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/auth/verify');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'guest@example.com' });

    const response = { transactionKey: 'transaction', otp: '123456' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('verifyLoginRequest propagates backend failures to its caller', async () => {
    const result = service.verifyLoginRequest('guest@example.com');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/auth/verify')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('login sends the expected POST request and returns the response', async () => {
    const result = service.login({
      email: 'guest@example.com',
      password: 'secret',
      role: 2,
      transactionKey: 'key',
      otp: '123456',
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'guest@example.com',
      password: 'secret',
      role: 2,
      transactionKey: 'key',
      otp: '123456',
    });

    const response = { status: 200, token: 'session' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('login propagates backend failures to its caller', async () => {
    const result = service.login({
      email: 'guest@example.com',
      password: 'secret',
      role: 2,
      transactionKey: 'key',
      otp: '123456',
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/auth/login')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('loginAsDemo sends the expected GET request and returns the response', async () => {
    const result = service.loginAsDemo();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/auth/demo');
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toEqual(null);

    const response = { status: 200, token: 'session' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('loginAsDemo propagates backend failures to its caller', async () => {
    const result = service.loginAsDemo();
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/auth/demo')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
  it('logs out by removing the session and navigating home', () => {
    localStorage.setItem('auth_token', 'session');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    service.logout();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/']);
  });
  it('provides actionable network, rate-limit, and server errors', () => {
    expect(getAuthErrorMessage(new HttpErrorResponse({ status: 0 }), 'Fallback')).toContain(
      'Check your connection',
    );
    expect(getAuthErrorMessage(new HttpErrorResponse({ status: 429 }), 'Fallback')).toContain(
      'Too many attempts',
    );
    expect(
      getAuthErrorMessage(
        new HttpErrorResponse({ status: 503, error: { message: 'Internal exception' } }),
        'Fallback',
      ),
    ).toContain('temporarily unavailable');
  });

  it('uses backend messages or a fallback without exposing unexpected errors', () => {
    expect(
      getAuthErrorMessage(
        new HttpErrorResponse({ status: 400, error: { message: 'Invalid code' } }),
        'Fallback',
      ),
    ).toBe('Invalid code');
    expect(
      getAuthErrorMessage(
        new HttpErrorResponse({ status: 400, error: { message: {} } }),
        'Fallback',
      ),
    ).toBe('Fallback');
    expect(getAuthErrorMessage(new Error('Internal exception'), 'Fallback')).toBe('Fallback');
  });
});
