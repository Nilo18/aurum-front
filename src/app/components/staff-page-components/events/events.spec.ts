import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { Events } from './events';
import { EventFiltering } from '../event-filtering/event-filtering';
import { EventSorting } from '../event-sorting/event-sorting';
import { EventPagination } from '../event-pagination/event-pagination';
import { EventStatus, PageResponse, EventDTO } from '../../../services/event-service';

describe('Events API controls', () => {
  let http: HttpTestingController;
  const page: PageResponse<EventDTO> = {
    content: [],
    pageNumber: 0,
    pageSize: 10,
    totalElements: 35,
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Events],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads the API page and replaces the resource after filtering, sorting and pagination', async () => {
    const fixture = TestBed.createComponent(Events);
    fixture.detectChanges();
    await Promise.resolve();
    http.expectOne((request) => request.url.endsWith('/api/event')).flush(page);
    await fixture.whenStable();
    expect(fixture.componentInstance.events.value()).toEqual(page);

    const filter = fixture.debugElement.query(By.directive(EventFiltering))
      .componentInstance as EventFiltering;
    const filtering = filter.filter('status', EventStatus.CONFIRMED);
    expect(fixture.componentInstance.pending()).toBe(true);
    http
      .expectOne(
        (request) =>
          request.params.get('status') === 'CONFIRMED' && request.params.get('page') === '0',
      )
      .flush({ ...page, totalElements: 23 });
    await filtering;
    await fixture.whenStable();
    expect(fixture.componentInstance.page()?.totalElements).toBe(23);

    const sorting = (
      fixture.debugElement.query(By.directive(EventSorting)).componentInstance as EventSorting
    ).sort('date', 'desc');
    http
      .expectOne(
        (request) =>
          request.params.get('sortBy') === 'date' &&
          request.params.get('sortDirection') === 'desc' &&
          request.params.get('status') === 'CONFIRMED',
      )
      .flush({ ...page, totalElements: 23 });
    await sorting;
    await fixture.whenStable();

    const pagination = fixture.debugElement.query(By.directive(EventPagination))
      .componentInstance as EventPagination;
    const paging = pagination.paginate(1);
    http
      .expectOne(
        (request) => request.params.get('page') === '1' && request.params.get('size') === '10',
      )
      .flush({ ...page, pageNumber: 1, totalElements: 23 });
    await paging;
    await fixture.whenStable();
    expect(fixture.componentInstance.page()?.pageNumber).toBe(1);
    expect(pagination.first()).toBe(11);
    expect(pagination.last()).toBe(20);
  });

  it('shows request failures and recovers through retry', async () => {
    const fixture = TestBed.createComponent(Events);
    fixture.detectChanges();
    await Promise.resolve();
    http
      .expectOne((request) => request.url.endsWith('/api/event'))
      .flush('Unavailable', { status: 500, statusText: 'Server error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    const retry = fixture.componentInstance.retry();
    http.expectOne((request) => request.url.endsWith('/api/event')).flush(page);
    await retry;
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
