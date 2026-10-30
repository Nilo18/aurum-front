import { VehicleType } from './vehicle-service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { VehicleService } from './vehicle-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('VehicleService', () => {
  let service: VehicleService;
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
    service = TestBed.inject(VehicleService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('addVehicle sends the expected POST request and returns the response', async () => {
    const result = service.addVehicle({
      type: VehicleType.TRUCK,
      passengerCapacity: 2,
      cargoWeightLimit: 1000,
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/vehicle');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      type: VehicleType.TRUCK,
      passengerCapacity: 2,
      cargoWeightLimit: 1000,
    });

    const response = { ...request.request.body, publicId: 'vehicle-1' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('addVehicle propagates backend failures to its caller', async () => {
    const result = service.addVehicle({
      type: VehicleType.TRUCK,
      passengerCapacity: 2,
      cargoWeightLimit: 1000,
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/vehicle')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('updateVehicle sends the expected PUT request and returns the response', async () => {
    const result = service.updateVehicle({
      publicId: 'vehicle-1',
      type: VehicleType.TRUCK,
      passengerCapacity: 2,
      cargoWeightLimit: 1000,
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/vehicle');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      publicId: 'vehicle-1',
      type: VehicleType.TRUCK,
      passengerCapacity: 2,
      cargoWeightLimit: 1000,
    });

    const response = { ...request.request.body, publicId: 'vehicle-1' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('updateVehicle propagates backend failures to its caller', async () => {
    const result = service.updateVehicle({
      publicId: 'vehicle-1',
      type: VehicleType.TRUCK,
      passengerCapacity: 2,
      cargoWeightLimit: 1000,
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/vehicle')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('deleteVehicle sends the expected DELETE request and returns the response', async () => {
    const result = service.deleteVehicle('vehicle-1');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/vehicle/vehicle-1');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual(null);

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('deleteVehicle propagates backend failures to its caller', async () => {
    const result = service.deleteVehicle('vehicle-1');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/vehicle/vehicle-1')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
  it('getVehicles fetches results with the expected query parameters', async () => {
    const result = firstValueFrom(
      service.getVehicles({ page: 0, size: 25, sortBy: 'name', sortDirection: 'ASC' }),
    );
    const request = http.expectOne((r) => r.url === baseUrl + '/api/vehicle');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('sortBy')).toBe('name');
    expect(request.request.params.get('sortDirection')).toBe('ASC');
    const response = { content: [], pageNumber: 0, pageSize: 25, totalElements: 0 };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getVehicles exposes HTTP failures', async () => {
    const result = firstValueFrom(service.getVehicles({}));
    const assertion = expect(result).rejects.toMatchObject({ status: 500 });
    http.expectOne(baseUrl + '/api/vehicle').flush({}, { status: 500, statusText: 'Error' });
    await assertion;
  });
  it('omits empty optional query values without dropping page zero', () => {
    service.getVehicles({ page: 0, sortBy: '', sortDirection: undefined }).subscribe();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/vehicle');
    expect(request.request.params.keys()).toEqual(['page']);
    request.flush({ content: [] });
  });
});
