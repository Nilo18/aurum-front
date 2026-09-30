import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { Clients } from './clients';
import { ClientsFiltering } from '../clients-filtering/clients-filtering';
import { ClientsSorting } from '../clients-sorting/clients-sorting';
import { ClientsPagination } from '../clients-pagination/clients-pagination';
import { PageResponse } from '../../../services/event-service';
import { ClientType, ClientDTO } from '../../../services/client-service';

describe('Clients API controls', () => {
  let http: HttpTestingController;
  const page: PageResponse<ClientDTO> = {
    content: [],
    pageNumber: 0,
    pageSize: 10,
    totalElements: 35,
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Clients],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads the API page and replaces the resource after filtering, sorting and pagination', async () => {
    const fixture = TestBed.createComponent(Clients);
    fixture.detectChanges();
    await Promise.resolve();
    http.expectOne((request) => request.url.endsWith('/api/client')).flush(page);
    await fixture.whenStable();
    expect(fixture.componentInstance.clients.value()).toEqual(page);

    const filter = fixture.debugElement.query(By.directive(ClientsFiltering))
      .componentInstance as ClientsFiltering;
    const filtering = filter.filter(ClientType.PERSON);
    expect(fixture.componentInstance.pending()).toBe(true);
    http
      .expectOne(
        (request) => request.params.get('type') === 'PERSON' && request.params.get('page') === '0',
      )
      .flush({ ...page, totalElements: 23 });
    await filtering;
    await fixture.whenStable();
    expect(fixture.componentInstance.page()?.totalElements).toBe(23);

    const sorting = (
      fixture.debugElement.query(By.directive(ClientsSorting)).componentInstance as ClientsSorting
    ).sort('name', 'desc');
    http
      .expectOne(
        (request) =>
          request.params.get('sortBy') === 'name' &&
          request.params.get('sortDirection') === 'desc' &&
          request.params.get('type') === 'PERSON',
      )
      .flush({ ...page, totalElements: 23 });
    await sorting;
    await fixture.whenStable();

    const pagination = fixture.debugElement.query(By.directive(ClientsPagination))
      .componentInstance as ClientsPagination;
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

  it('resets pages for search, cleared filters and page-size changes', async () => {
    const fixture = TestBed.createComponent(Clients);
    fixture.detectChanges();
    await Promise.resolve();
    http
      .expectOne((request) => request.url.endsWith('/api/client'))
      .flush({ ...page, pageNumber: 2 });
    await fixture.whenStable();
    fixture.componentInstance.search.set('  Nino  ');
    const searching = fixture.componentInstance.searchClients();
    http
      .expectOne(
        (request) => request.params.get('search') === 'Nino' && request.params.get('page') === '0',
      )
      .flush(page);
    await searching;
    await fixture.whenStable();
    const filter = fixture.debugElement.query(By.directive(ClientsFiltering))
      .componentInstance as ClientsFiltering;
    const clearing = filter.filter(undefined);
    http
      .expectOne(
        (request) => !request.params.has('type') && request.params.get('search') === 'Nino',
      )
      .flush(page);
    await clearing;
    await fixture.whenStable();
    const pagination = fixture.debugElement.query(By.directive(ClientsPagination))
      .componentInstance as ClientsPagination;
    const resizing = pagination.paginate(0, 25);
    http
      .expectOne(
        (request) => request.params.get('size') === '25' && request.params.get('page') === '0',
      )
      .flush({ ...page, pageSize: 25 });
    await resizing;
    await fixture.whenStable();
    expect(pagination.last()).toBe(25);
    const failing = pagination.paginate(1);
    http
      .expectOne((request) => request.params.get('page') === '1')
      .flush('Unavailable', { status: 500, statusText: 'Server error' });
    await failing;
    await fixture.whenStable();
    expect(pagination.pageNumber()).toBe(0);
    expect(fixture.componentInstance.busy()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('shows request failures and recovers through retry', async () => {
    const fixture = TestBed.createComponent(Clients);
    fixture.detectChanges();
    await Promise.resolve();
    http
      .expectOne((request) => request.url.endsWith('/api/client'))
      .flush('Unavailable', { status: 500, statusText: 'Server error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    const retry = fixture.componentInstance.retry();
    http.expectOne((request) => request.url.endsWith('/api/client')).flush(page);
    await retry;
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
