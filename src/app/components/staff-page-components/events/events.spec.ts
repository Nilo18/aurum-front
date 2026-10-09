import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { Events } from './events';
import { EventFiltering } from '../event-filtering/event-filtering';
import { EventSorting } from '../event-sorting/event-sorting';
import { EventPagination } from '../event-pagination/event-pagination';
import {
  EventStatus,
  EventType,
  EventLocation,
  PageResponse,
  EventDTO,
} from '../../../services/event-service';

describe('Events API controls', () => {
  let http: HttpTestingController;
  const open = vi.fn();
  const page: PageResponse<EventDTO> = {
    content: [],
    pageNumber: 0,
    pageSize: 10,
    totalElements: 35,
  };
  beforeEach(() => {
    open.mockReset();
    TestBed.configureTestingModule({
      imports: [Events],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NgbModal, useValue: { open } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads the API page and replaces the resource after filtering, sorting and pagination', async () => {
    const fixture = TestBed.createComponent(Events);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    http.expectOne((request) => request.url.endsWith('/api/event')).flush(page);
    await fixture.whenStable();
    expect(fixture.componentInstance.events.value()).toEqual(page);

    const filter = fixture.debugElement.query(By.directive(EventFiltering))
      .componentInstance as EventFiltering;
    const filtering = filter.filter('status', EventStatus.CONFIRMED);
    fixture.detectChanges();
    expect(fixture.componentInstance.busy()).toBe(true);
    fixture.detectChanges();
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
    fixture.detectChanges();
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
    fixture.detectChanges();
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
    fixture.detectChanges();
    http
      .expectOne((request) => request.url.endsWith('/api/event'))
      .flush('Unavailable', { status: 500, statusText: 'Server error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    const retry = fixture.componentInstance.retry();
    fixture.detectChanges();
    http.expectOne((request) => request.url.endsWith('/api/event')).flush(page);
    await retry;
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
  async function loadedEvents() {
    const fixture = TestBed.createComponent(Events);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    http
      .expectOne((request) => request.url.endsWith('/api/event'))
      .flush({
        ...page,
        content: [
          {
            id: 1,
            clientName: 'Nino',
            eventType: EventType.WEDDING,
            date: '2026-10-06',
            totalCost: 100,
            guestCount: 10,
            location: EventLocation.HOTEL,
            status: EventStatus.CONFIRMED,
          },
        ],
      });
    await fixture.whenStable();
    return fixture;
  }

  it('waits for confirmation, prevents duplicate deletes, and refreshes after success', async () => {
    const fixture = await loadedEvents();
    let confirm!: (value: boolean) => void;
    open.mockReturnValue({
      componentInstance: {},
      result: new Promise((resolve) => {
        confirm = resolve;
      }),
    });
    const component = fixture.componentInstance;
    const deleting = component.delete(1);
    http.expectNone((request) => request.method === 'DELETE');
    expect(component.busy()).toBe(true);
    await component.delete(1);
    expect(open).toHaveBeenCalledTimes(1);
    confirm(true);
    await Promise.resolve();
    expect(component.deleting()).toBe(1);
    const request = http.expectOne((request) => request.method === 'DELETE');
    expect(request.request.url).toContain('/api/event/1');
    request.flush({ status: 200, message: 'Deleted' });
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    http.expectOne((request) => request.method === 'GET').flush({ ...page, totalElements: 34 });
    await deleting;
    await fixture.whenStable();
    expect(component.busy()).toBe(false);
    expect(component.rows()).toEqual([]);
    expect(component.notice()).toBe('Event deleted.');
  });

  it('does not delete when the modal is dismissed', async () => {
    const fixture = await loadedEvents();
    open.mockReturnValue({ componentInstance: {}, result: Promise.reject('cancel') });
    await fixture.componentInstance.delete(1);
    http.expectNone((request) => request.method === 'DELETE');
    expect(fixture.componentInstance.busy()).toBe(false);
    expect(fixture.componentInstance.rows()).toHaveLength(1);
  });

  it('shows backend errors and releases loading state without removing the event', async () => {
    const fixture = await loadedEvents();
    open.mockReturnValue({ componentInstance: {}, result: Promise.resolve(true) });
    const deleting = fixture.componentInstance.delete(1);
    await Promise.resolve();
    fixture.detectChanges();
    http
      .expectOne((request) => request.method === 'DELETE')
      .flush({ message: 'Event cannot be deleted.' }, { status: 409, statusText: 'Conflict' });
    await deleting;
    await fixture.whenStable();
    expect(fixture.componentInstance.busy()).toBe(false);
    expect(fixture.componentInstance.rows()).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Event cannot be deleted.',
    );
  });

  it('reports refresh failure separately after a successful deletion', async () => {
    const fixture = await loadedEvents();
    open.mockReturnValue({ componentInstance: {}, result: Promise.resolve(true) });
    const deleting = fixture.componentInstance.delete(1);
    await Promise.resolve();
    fixture.detectChanges();
    http.expectOne((request) => request.method === 'DELETE').flush({ status: 200 });
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    http
      .expectOne((request) => request.method === 'GET')
      .flush('Unavailable', { status: 500, statusText: 'Server error' });
    await deleting;
    await fixture.whenStable();
    expect(fixture.componentInstance.rows()).toEqual([]);
    expect(fixture.componentInstance.error()).toContain('Event deleted');
    expect(fixture.componentInstance.busy()).toBe(false);
  });
});
