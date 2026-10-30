import { ProductCategory } from './supplier-service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SupplierService } from './supplier-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('SupplierService', () => {
  let service: SupplierService;
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
    service = TestBed.inject(SupplierService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('getSupplierNames sends the expected GET request and returns the response', async () => {
    const result = service.getSupplierNames();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/supplier/names');
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toEqual(null);

    const response = [{ publicId: 'supplier-1', name: 'Supplier' }];
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getSupplierNames propagates backend failures to its caller', async () => {
    const result = service.getSupplierNames();
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/supplier/names')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('getAvailableProductCategories sends the expected GET request and returns the response', async () => {
    const result = service.getAvailableProductCategories();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/supplier/available-categories');
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toEqual(null);

    const response = ['TABLEWARE', 'FLORALS'];
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getAvailableProductCategories propagates backend failures to its caller', async () => {
    const result = service.getAvailableProductCategories();
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/supplier/available-categories')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('addSupplier sends the expected POST request and returns the response', async () => {
    const result = service.addSupplier({
      name: 'Supplier',
      city: 'Tbilisi',
      street: 'Main',
      number: '1',
      categories: new Set([ProductCategory.TABLEWARE]),
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/supplier');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Supplier',
      city: 'Tbilisi',
      street: 'Main',
      number: '1',
      categories: ['TABLEWARE'],
    });

    const response = { ...request.request.body, publicId: 'supplier-1' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('addSupplier propagates backend failures to its caller', async () => {
    const result = service.addSupplier({
      name: 'Supplier',
      city: 'Tbilisi',
      street: 'Main',
      number: '1',
      categories: new Set([ProductCategory.TABLEWARE]),
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/supplier')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('updateSupplier sends the expected PUT request and returns the response', async () => {
    const result = service.updateSupplier({
      publicId: 'supplier-1',
      name: 'Supplier',
      city: 'Tbilisi',
      street: 'Main',
      number: '1',
      categories: new Set([ProductCategory.TABLEWARE]),
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/supplier');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      publicId: 'supplier-1',
      name: 'Supplier',
      city: 'Tbilisi',
      street: 'Main',
      number: '1',
      categories: ['TABLEWARE'],
    });

    const response = { ...request.request.body, publicId: 'supplier-1' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('updateSupplier propagates backend failures to its caller', async () => {
    const result = service.updateSupplier({
      publicId: 'supplier-1',
      name: 'Supplier',
      city: 'Tbilisi',
      street: 'Main',
      number: '1',
      categories: new Set([ProductCategory.TABLEWARE]),
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/supplier')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('deleteSupplier sends the expected DELETE request and returns the response', async () => {
    const result = service.deleteSupplier('supplier-1');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/supplier/supplier-1');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual(null);

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('deleteSupplier propagates backend failures to its caller', async () => {
    const result = service.deleteSupplier('supplier-1');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/supplier/supplier-1')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
  it('getSuppliers fetches results with the expected query parameters', async () => {
    const result = firstValueFrom(
      service.getSuppliers({ page: 0, size: 25, sortBy: 'name', sortDirection: 'ASC' }),
    );
    const request = http.expectOne((r) => r.url === baseUrl + '/api/supplier');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('sortBy')).toBe('name');
    expect(request.request.params.get('sortDirection')).toBe('ASC');
    const response = { content: [], pageNumber: 0, pageSize: 25, totalElements: 0 };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getSuppliers exposes HTTP failures', async () => {
    const result = firstValueFrom(service.getSuppliers({}));
    const assertion = expect(result).rejects.toMatchObject({ status: 500 });
    http.expectOne(baseUrl + '/api/supplier').flush({}, { status: 500, statusText: 'Error' });
    await assertion;
  });
  it('omits empty optional query values without dropping page zero', () => {
    service.getSuppliers({ page: 0, sortBy: '', sortDirection: undefined }).subscribe();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/supplier');
    expect(request.request.params.keys()).toEqual(['page']);
    request.flush({ content: [] });
  });
});
