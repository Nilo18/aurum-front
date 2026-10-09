import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ClientService, ClientType } from './client-service';

describe('ClientService stateless list requests', () => {
  it('serializes supplied criteria and does not retain them between requests', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(ClientService);
    const http = TestBed.inject(HttpTestingController);
    const pending = firstValueFrom(
      service.getClients({ page: 2, size: 25, type: ClientType.PERSON, search: 'Alice' }),
    );
    const request = http.expectOne((request) => request.url.endsWith('/api/client'));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('search')).toBe('Alice');
    expect(request.request.params.get('type')).toBe('PERSON');
    request.flush({ content: [], pageNumber: 2, pageSize: 25, totalElements: 80 });
    await pending;
    const cleared = firstValueFrom(service.getClients({ page: 0, search: '' }));
    const next = http.expectOne((request) => request.url.endsWith('/api/client'));
    expect(next.request.params.keys()).toEqual(['page']);
    next.flush({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0 });
    await cleared;
    http.verify();
  });
});
