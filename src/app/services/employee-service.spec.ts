import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
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

  it('preserves search, filters and sorting when changing pages and resets pages for new criteria', async () => {
    const search = service.searchEmployees('alex');
    http
      .expectOne(
        (request) =>
          request.url.endsWith('/api/employee') && request.params.get('search') === 'alex',
      )
      .flush(page);
    await search;
    const filter = service.filterEmployees({
      type: EmployeeType.CHEF,
      role: EmployeeRole.STAFF,
      status: EmployeeStatus.PENDING,
    });
    http
      .expectOne(
        (request) =>
          request.params.get('search') === 'alex' &&
          request.params.get('type') === String(EmployeeType.CHEF),
      )
      .flush(page);
    await filter;
    const sort = service.sortEmployees('salary', 'desc');
    http
      .expectOne(
        (request) =>
          request.params.get('sortBy') === 'salary' &&
          request.params.get('role') === String(EmployeeRole.STAFF),
      )
      .flush(page);
    await sort;
    const paginate = service.paginateEmployees(2, 25);
    http
      .expectOne(
        (request) =>
          request.params.get('page') === '2' &&
          request.params.get('size') === '25' &&
          request.params.get('status') === String(EmployeeStatus.PENDING) &&
          request.params.get('sortDirection') === 'desc',
      )
      .flush(page);
    await paginate;
    const clear = service.filterEmployees({ type: undefined });
    http
      .expectOne(
        (request) =>
          request.params.get('page') === '0' &&
          !request.params.has('type') &&
          request.params.get('role') === String(EmployeeRole.STAFF),
      )
      .flush(page);
    await clear;
    expect(service.getEmployeeQuery()().size).toBe(25);
  });
});
