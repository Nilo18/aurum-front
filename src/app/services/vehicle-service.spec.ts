import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { VehicleService, VehicleType } from './vehicle-service';

describe('VehicleService', () => {
  it('requests the vehicle endpoint with filters and preserves zero capacities', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const result = firstValueFrom(
      TestBed.inject(VehicleService).getVehicles({
        page: 0,
        size: 25,
        type: VehicleType.TRUCK,
        passengerFrom: 0,
        weightTo: 3500,
        sortBy: 'cargoWeightLimit',
        sortDirection: 'desc',
      }),
    );
    const request = http.expectOne((request) => request.url.endsWith('/api/vehicle'));
    expect(request.request.params.get('passengerFrom')).toBe('0');
    expect(request.request.params.get('type')).toBe('TRUCK');
    expect(request.request.params.get('weightTo')).toBe('3500');
    expect(request.request.params.get('sortBy')).toBe('cargoWeightLimit');
    request.flush({ content: [], pageNumber: 0, pageSize: 25, totalElements: 0 });
    await result;
    http.verify();
  });
});
