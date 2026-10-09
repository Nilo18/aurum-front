import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { EmployeeService, EmployeeType, EmployeeRole, EmployeeStatus } from './employee-service';

describe('EmployeeService list queries', () => {
  let service: EmployeeService;
  let http: HttpTestingController;
  const page = { content: [], pageNumber: 0, pageSize: 10, totalElements: 0 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmployeeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('serializes the supplied query and omits empty criteria without retaining previous state', async () => {
    const result = firstValueFrom(
      service.getEmployees({
        page: 2,
        size: 25,
        search: 'alex',
        type: EmployeeType.CHEF,
        role: EmployeeRole.OWNER,
        status: EmployeeStatus.PENDING,
        sortBy: 'salary',
        sortDirection: 'desc',
      }),
    );
    const request = http.expectOne((request) => request.url.endsWith('/api/employee'));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('search')).toBe('alex');
    expect(request.request.params.get('type')).toBe(String(EmployeeType.CHEF));
    expect(request.request.params.get('role')).toBe('0');
    expect(request.request.params.get('status')).toBe(String(EmployeeStatus.PENDING));
    expect(request.request.params.get('sortBy')).toBe('salary');
    expect(request.request.params.get('sortDirection')).toBe('desc');
    request.flush(page);
    expect(await result).toEqual(page);
    const cleared = firstValueFrom(service.getEmployees({ page: 0, search: '', type: undefined }));
    const next = http.expectOne((request) => request.url.endsWith('/api/employee'));
    expect(next.request.params.keys()).toEqual(['page']);
    next.flush(page);
    await cleared;
  });
});
