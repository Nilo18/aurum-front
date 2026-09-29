import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EventService } from './event-service';

describe('EventService query transformations', () => {
  let service: EventService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EventService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('preserves size, resets filtered/search pages and omits cleared values', async () => {
    service.getEventQuery().set({ page: 3, size: 25, costFrom: 0 });
    let pending = service.paginateEvents(2);
    const pagination = http.expectOne((request) => request.params.get('page') === '2');
    expect(pagination.request.params.get('size')).toBe('25');
    expect(pagination.request.params.get('costFrom')).toBe('0');
    expect(pagination.request.params.has('set')).toBe(false);
    pagination.flush({ content: [], pageNumber: 2, pageSize: 25, totalElements: 80 });
    await pending;
    pending = service.filterEvents('costFrom', undefined);
    const filtering = http.expectOne((request) => request.params.get('page') === '0');
    expect(filtering.request.params.has('costFrom')).toBe(false);
    filtering.flush({ content: [], pageNumber: 0, pageSize: 25, totalElements: 80 });
    await pending;
    service.getEventQuery().update((query) => ({ ...query, page: 2 }));
    pending = service.searchEvents('Alice');
    http
      .expectOne(
        (request) => request.params.get('page') === '0' && request.params.get('search') === 'Alice',
      )
      .flush({ content: [], pageNumber: 0, pageSize: 25, totalElements: 0 });
    await pending;
  });
});
