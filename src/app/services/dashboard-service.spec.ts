import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from './dashboard-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('DashboardService', () => {
  let service: DashboardService;
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
    service = TestBed.inject(DashboardService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('getDashboardData fetches results with the expected query parameters', async () => {
    const result = firstValueFrom(service.getDashboardData());
    const request = http.expectOne((r) => r.url === baseUrl + '/api/dashboard');
    expect(request.request.method).toBe('GET');

    const response = {
      eventCount: 10,
      awaitingReviewCount: 2,
      portfolioValue: 5000,
      employeeCount: 3,
      eventsInPreparation: [],
      clientCount: 8,
      vehicleCount: 2,
      productCount: 20,
      supplierCount: 4,
      menuCount: 6,
      feedbackCount: 7,
    };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getDashboardData exposes HTTP failures', async () => {
    const result = firstValueFrom(service.getDashboardData());
    const assertion = expect(result).rejects.toMatchObject({ status: 500 });
    http.expectOne(baseUrl + '/api/dashboard').flush({}, { status: 500, statusText: 'Error' });
    await assertion;
  });
});
