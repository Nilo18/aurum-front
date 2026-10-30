import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClientService } from './client-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('ClientService', () => {
  let service: ClientService;
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
    service = TestBed.inject(ClientService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('deleteClient sends the expected DELETE request and returns the response', async () => {
    const result = service.deleteClient('guest@example.com');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/client');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({ email: 'guest@example.com' });

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('deleteClient propagates backend failures to its caller', async () => {
    const result = service.deleteClient('guest@example.com');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/client')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
  it('getClients fetches results with the expected query parameters', async () => {
    const result = firstValueFrom(
      service.getClients({ page: 0, size: 25, sortBy: 'name', sortDirection: 'ASC' }),
    );
    const request = http.expectOne((r) => r.url === baseUrl + '/api/client');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('sortBy')).toBe('name');
    expect(request.request.params.get('sortDirection')).toBe('ASC');
    const response = { content: [], pageNumber: 0, pageSize: 25, totalElements: 0 };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getClients exposes HTTP failures', async () => {
    const result = firstValueFrom(service.getClients({}));
    const assertion = expect(result).rejects.toMatchObject({ status: 500 });
    http.expectOne(baseUrl + '/api/client').flush({}, { status: 500, statusText: 'Error' });
    await assertion;
  });
  it('omits empty optional query values without dropping page zero', () => {
    service.getClients({ page: 0, sortBy: '', sortDirection: undefined }).subscribe();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/client');
    expect(request.request.params.keys()).toEqual(['page']);
    request.flush({ content: [] });
  });
});
