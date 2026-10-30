import { CuisineType } from './menu-service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MenuService } from './menu-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('MenuService', () => {
  let service: MenuService;
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
    service = TestBed.inject(MenuService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('getMenuItemsForRequestEventPage sends the expected GET request and returns the response', async () => {
    const result = service.getMenuItemsForRequestEventPage(CuisineType.GEORGIAN);
    const request = http.expectOne((r) => r.url === baseUrl + '/api/menu/request-event');
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toEqual(null);
    expect(request.request.params.get('cuisineType')).toBe('GEORGIAN');
    const response = [
      {
        publicId: 'menu-1',
        name: 'Salad',
        type: 'GEORGIAN',
        category: 'APPETIZER',
        pricePerPerson: 15,
      },
    ];
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getMenuItemsForRequestEventPage propagates backend failures to its caller', async () => {
    const result = service.getMenuItemsForRequestEventPage(CuisineType.GEORGIAN);
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/menu/request-event')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('addMenuItem sends the expected POST request and returns the response', async () => {
    const result = service.addMenuItem({
      name: 'Salad',
      category: 'APPETIZER',
      type: CuisineType.GEORGIAN,
      pricePerPerson: 15,
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/menu');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Salad',
      category: 'APPETIZER',
      type: CuisineType.GEORGIAN,
      pricePerPerson: 15,
    });

    const response = { ...request.request.body, publicId: 'menu-1' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('addMenuItem propagates backend failures to its caller', async () => {
    const result = service.addMenuItem({
      name: 'Salad',
      category: 'APPETIZER',
      type: CuisineType.GEORGIAN,
      pricePerPerson: 15,
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/menu')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('updateMenuItem sends the expected PUT request and returns the response', async () => {
    const result = service.updateMenuItem({
      publicId: 'menu-1',
      name: 'Salad',
      category: 'APPETIZER',
      type: CuisineType.GEORGIAN,
      pricePerPerson: 15,
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/menu');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      publicId: 'menu-1',
      name: 'Salad',
      category: 'APPETIZER',
      type: CuisineType.GEORGIAN,
      pricePerPerson: 15,
    });

    const response = { ...request.request.body, publicId: 'menu-1' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('updateMenuItem propagates backend failures to its caller', async () => {
    const result = service.updateMenuItem({
      publicId: 'menu-1',
      name: 'Salad',
      category: 'APPETIZER',
      type: CuisineType.GEORGIAN,
      pricePerPerson: 15,
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/menu')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('deleteMenuItem sends the expected DELETE request and returns the response', async () => {
    const result = service.deleteMenuItem('menu-1');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/menu/menu-1');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual(null);

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('deleteMenuItem propagates backend failures to its caller', async () => {
    const result = service.deleteMenuItem('menu-1');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/menu/menu-1')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
  it('getMenuItems fetches results with the expected query parameters', async () => {
    const result = firstValueFrom(
      service.getMenuItems({ page: 0, size: 25, sortBy: 'name', sortDirection: 'ASC' }),
    );
    const request = http.expectOne((r) => r.url === baseUrl + '/api/menu');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('sortBy')).toBe('name');
    expect(request.request.params.get('sortDirection')).toBe('ASC');
    const response = { content: [], pageNumber: 0, pageSize: 25, totalElements: 0 };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getMenuItems exposes HTTP failures', async () => {
    const result = firstValueFrom(service.getMenuItems({}));
    const assertion = expect(result).rejects.toMatchObject({ status: 500 });
    http.expectOne(baseUrl + '/api/menu').flush({}, { status: 500, statusText: 'Error' });
    await assertion;
  });
  it('omits empty optional query values without dropping page zero', () => {
    service.getMenuItems({ page: 0, sortBy: '', sortDirection: undefined }).subscribe();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/menu');
    expect(request.request.params.keys()).toEqual(['page']);
    request.flush({ content: [] });
  });
});
