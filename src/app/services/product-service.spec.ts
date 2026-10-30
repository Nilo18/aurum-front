import { ProductCategory } from './product-service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductService } from './product-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('ProductService', () => {
  let service: ProductService;
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
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('addProduct sends the expected POST request and returns the response', async () => {
    const result = service.addProduct({
      productName: 'Plate',
      category: ProductCategory.TABLEWARE,
      price: 10,
      supplierPublicId: 'supplier-1',
      quantity: 20,
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/product');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      productName: 'Plate',
      category: ProductCategory.TABLEWARE,
      price: 10,
      supplierPublicId: 'supplier-1',
      quantity: 20,
    });

    const response = { ...request.request.body, publicId: 'product-1' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('addProduct propagates backend failures to its caller', async () => {
    const result = service.addProduct({
      productName: 'Plate',
      category: ProductCategory.TABLEWARE,
      price: 10,
      supplierPublicId: 'supplier-1',
      quantity: 20,
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/product')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('updateProduct sends the expected PUT request and returns the response', async () => {
    const result = service.updateProduct({
      publicId: 'product-1',
      productName: 'Plate',
      category: ProductCategory.TABLEWARE,
      price: 10,
      supplierPublicId: 'supplier-1',
      quantity: 20,
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/product');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      publicId: 'product-1',
      productName: 'Plate',
      category: ProductCategory.TABLEWARE,
      price: 10,
      supplierPublicId: 'supplier-1',
      quantity: 20,
    });

    const response = { ...request.request.body, publicId: 'product-1' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('updateProduct propagates backend failures to its caller', async () => {
    const result = service.updateProduct({
      publicId: 'product-1',
      productName: 'Plate',
      category: ProductCategory.TABLEWARE,
      price: 10,
      supplierPublicId: 'supplier-1',
      quantity: 20,
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/product')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('deleteProduct sends the expected DELETE request and returns the response', async () => {
    const result = service.deleteProduct('product-1');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/product/product-1');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual(null);

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('deleteProduct propagates backend failures to its caller', async () => {
    const result = service.deleteProduct('product-1');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/product/product-1')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
  it('getProducts fetches results with the expected query parameters', async () => {
    const result = firstValueFrom(
      service.getProducts({ page: 0, size: 25, sortBy: 'name', sortDirection: 'ASC' }),
    );
    const request = http.expectOne((r) => r.url === baseUrl + '/api/product');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('sortBy')).toBe('name');
    expect(request.request.params.get('sortDirection')).toBe('ASC');
    const response = { content: [], pageNumber: 0, pageSize: 25, totalElements: 0 };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getProducts exposes HTTP failures', async () => {
    const result = firstValueFrom(service.getProducts({}));
    const assertion = expect(result).rejects.toMatchObject({ status: 500 });
    http.expectOne(baseUrl + '/api/product').flush({}, { status: 500, statusText: 'Error' });
    await assertion;
  });
  it('omits empty optional query values without dropping page zero', () => {
    service.getProducts({ page: 0, sortBy: '', sortDirection: undefined }).subscribe();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/product');
    expect(request.request.params.keys()).toEqual(['page']);
    request.flush({ content: [] });
  });
});
