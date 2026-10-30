import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EmployeeService } from './employee-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('EmployeeService', () => {
  let service: EmployeeService;
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
    service = TestBed.inject(EmployeeService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('inviteEmployee sends the expected POST request and returns the response', async () => {
    const result = service.inviteEmployee({
      type: 0,
      salary: 1200,
      email: 'staff@example.com',
      role: 2,
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/employee/invite');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      type: 0,
      salary: 1200,
      email: 'staff@example.com',
      role: 2,
    });

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('inviteEmployee propagates backend failures to its caller', async () => {
    const result = service.inviteEmployee({
      type: 0,
      salary: 1200,
      email: 'staff@example.com',
      role: 2,
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/employee/invite')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('validateInvitation sends the expected POST request and returns the response', async () => {
    const result = service.validateInvitation('invite');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/employee/validate-invite');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ token: 'invite' });

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('validateInvitation propagates backend failures to its caller', async () => {
    const result = service.validateInvitation('invite');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/employee/validate-invite')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('completeRegistration sends the expected POST request and returns the response', async () => {
    const result = service.completeRegistration({
      token: 'invite',
      name: 'Nino',
      password: 'secret',
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/employee/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ token: 'invite', name: 'Nino', password: 'secret' });

    const response = { status: 200, token: 'session' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('completeRegistration propagates backend failures to its caller', async () => {
    const result = service.completeRegistration({
      token: 'invite',
      name: 'Nino',
      password: 'secret',
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/employee/register')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('deleteEmployee sends the expected DELETE request and returns the response', async () => {
    const result = service.deleteEmployee('staff@example.com');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/employee');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({ email: 'staff@example.com' });

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('deleteEmployee propagates backend failures to its caller', async () => {
    const result = service.deleteEmployee('staff@example.com');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/employee')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
  it('getEmployees fetches results with the expected query parameters', async () => {
    const result = firstValueFrom(
      service.getEmployees({ page: 0, size: 25, sortBy: 'name', sortDirection: 'ASC' }),
    );
    const request = http.expectOne((r) => r.url === baseUrl + '/api/employee');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('sortBy')).toBe('name');
    expect(request.request.params.get('sortDirection')).toBe('ASC');
    const response = { content: [], pageNumber: 0, pageSize: 25, totalElements: 0 };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getEmployees exposes HTTP failures', async () => {
    const result = firstValueFrom(service.getEmployees({}));
    const assertion = expect(result).rejects.toMatchObject({ status: 500 });
    http.expectOne(baseUrl + '/api/employee').flush({}, { status: 500, statusText: 'Error' });
    await assertion;
  });
  it('omits empty optional query values without dropping page zero', () => {
    service.getEmployees({ page: 0, sortBy: '', sortDirection: undefined }).subscribe();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/employee');
    expect(request.request.params.keys()).toEqual(['page']);
    request.flush({ content: [] });
  });
});
