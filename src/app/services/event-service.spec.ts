import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { EventService } from './event-service';

describe('EventService stateless list requests', () => {
  it('serializes supplied criteria and does not retain them between requests', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(EventService);
    const http = TestBed.inject(HttpTestingController);
    const pending = firstValueFrom(
      service.getEvents({ page: 2, size: 25, costFrom: 0, search: 'Alice' }),
    );
    const request = http.expectOne((request) => request.url.endsWith('/api/event'));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('search')).toBe('Alice');
    expect(request.request.params.get('costFrom')).toBe('0');
    request.flush({ content: [], pageNumber: 2, pageSize: 25, totalElements: 80 });
    await pending;
    const cleared = firstValueFrom(service.getEvents({ page: 0, search: '' }));
    const next = http.expectOne((request) => request.url.endsWith('/api/event'));
    expect(next.request.params.keys()).toEqual(['page']);
    next.flush({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0 });
    await cleared;
    http.verify();
  });
});
