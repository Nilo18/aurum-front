import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth-interceptor-interceptor';
import { TokenService } from '../../services/token-service';

describe('authInterceptor', () => {
  const getToken = vi.fn();
  let http: HttpTestingController;
  beforeEach(() => {
    getToken.mockReturnValue('session');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: { getToken } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it.each([
    ['http://localhost:8080/api/client', 'Bearer session'],
    ['http://localhost:8080/api/auth/login', null],
    ['http://localhost:8080/', null],
    ['https://example.com/api/client', null],
    ['http://localhost.evil.example:8080/api/client', null],
  ])('sets the expected authorization for %s', (url, authorization) => {
    TestBed.inject(HttpClient).get(url).subscribe();
    const request = http.expectOne(url);
    expect(request.request.headers.get('Authorization')).toBe(authorization);
    request.flush({});
  });
  it('passes requests through when no token exists', () => {
    getToken.mockReturnValue(null);
    TestBed.inject(HttpClient).get('http://localhost:8080/api/client').subscribe();
    const request = http.expectOne('http://localhost:8080/api/client');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});
