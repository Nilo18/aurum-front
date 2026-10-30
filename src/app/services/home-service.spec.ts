import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomeService } from './home-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('HomeService', () => {
  let service: HomeService;
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
    service = TestBed.inject(HomeService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('verifyContactRequest sends the expected POST request and returns the response', async () => {
    const result = service.verifyContactRequest('guest@example.com');
    const request = http.expectOne((r) => r.url === baseUrl + '/verify-contact-request');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'guest@example.com' });

    const response = { transactionKey: 'transaction', otp: '123456' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('verifyContactRequest propagates backend failures to its caller', async () => {
    const result = service.verifyContactRequest('guest@example.com');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/verify-contact-request')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('sendContactMessage sends the expected POST request and returns the response', async () => {
    const result = service.sendContactMessage({
      fullName: 'Guest',
      phoneNumber: '+995555123456',
      emailAddress: 'guest@example.com',
      message: 'Hello',
      transactionKey: 'key',
      otp: '123456',
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/contact');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      fullName: 'Guest',
      phoneNumber: '+995555123456',
      emailAddress: 'guest@example.com',
      message: 'Hello',
      transactionKey: 'key',
      otp: '123456',
    });

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('sendContactMessage propagates backend failures to its caller', async () => {
    const result = service.sendContactMessage({
      fullName: 'Guest',
      phoneNumber: '+995555123456',
      emailAddress: 'guest@example.com',
      message: 'Hello',
      transactionKey: 'key',
      otp: '123456',
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/contact')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
});
