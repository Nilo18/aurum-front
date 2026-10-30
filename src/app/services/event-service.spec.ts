import { EventType, EventLocation, EventStatus } from './event-service';
import { ClientType } from './client-service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EventService } from './event-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('EventService', () => {
  let service: EventService;
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
    service = TestBed.inject(EventService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('verifyCreateEventRequest sends the expected POST request and returns the response', async () => {
    const result = service.verifyCreateEventRequest('guest@example.com');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/event/verify');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'guest@example.com' });

    const response = { transactionKey: 'transaction', otp: '123456' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('verifyCreateEventRequest propagates backend failures to its caller', async () => {
    const result = service.verifyCreateEventRequest('guest@example.com');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/event/verify')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('createEvent sends the expected POST request and returns the response', async () => {
    const result = service.createEvent({
      client: {
        clientType: ClientType.PERSON,
        name: 'Guest',
        email: 'guest@example.com',
        phone: '+995555123456',
      },
      event: { eventType: 'WEDDING', date: '2027-01-01', guestCount: 50, location: 'HOTEL' },
      menuItemPublicIds: ['menu-1'],
      transactionKey: 'key',
      otp: '123456',
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/event');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      client: {
        clientType: ClientType.PERSON,
        name: 'Guest',
        email: 'guest@example.com',
        phone: '+995555123456',
      },
      event: { eventType: 'WEDDING', date: '2027-01-01', guestCount: 50, location: 'HOTEL' },
      menuItemPublicIds: ['menu-1'],
      transactionKey: 'key',
      otp: '123456',
    });

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('createEvent propagates backend failures to its caller', async () => {
    const result = service.createEvent({
      client: {
        clientType: ClientType.PERSON,
        name: 'Guest',
        email: 'guest@example.com',
        phone: '+995555123456',
      },
      event: { eventType: 'WEDDING', date: '2027-01-01', guestCount: 50, location: 'HOTEL' },
      menuItemPublicIds: ['menu-1'],
      transactionKey: 'key',
      otp: '123456',
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/event')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('updateEvent sends the expected PUT request and returns the response', async () => {
    const result = service.updateEvent({
      publicId: 'event-1',
      eventType: EventType.WEDDING,
      date: '2027-01-01',
      totalCost: 500,
      guestCount: 50,
      location: EventLocation.HOTEL,
      status: EventStatus.CONFIRMED,
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/event');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      publicId: 'event-1',
      eventType: EventType.WEDDING,
      date: '2027-01-01',
      totalCost: 500,
      guestCount: 50,
      location: EventLocation.HOTEL,
      status: EventStatus.CONFIRMED,
    });

    const response = { ...request.request.body, publicId: 'event-1' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('updateEvent propagates backend failures to its caller', async () => {
    const result = service.updateEvent({
      publicId: 'event-1',
      eventType: EventType.WEDDING,
      date: '2027-01-01',
      totalCost: 500,
      guestCount: 50,
      location: EventLocation.HOTEL,
      status: EventStatus.CONFIRMED,
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/event')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('deleteEvent sends the expected DELETE request and returns the response', async () => {
    const result = service.deleteEvent('event-1');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/event/event-1');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual(null);

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('deleteEvent propagates backend failures to its caller', async () => {
    const result = service.deleteEvent('event-1');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/event/event-1')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
  it('getEvents fetches results with the expected query parameters', async () => {
    const result = firstValueFrom(
      service.getEvents({ page: 0, size: 25, sortBy: 'name', sortDirection: 'ASC' }),
    );
    const request = http.expectOne((r) => r.url === baseUrl + '/api/event');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('sortBy')).toBe('name');
    expect(request.request.params.get('sortDirection')).toBe('ASC');
    const response = { content: [], pageNumber: 0, pageSize: 25, totalElements: 0 };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getEvents exposes HTTP failures', async () => {
    const result = firstValueFrom(service.getEvents({}));
    const assertion = expect(result).rejects.toMatchObject({ status: 500 });
    http.expectOne(baseUrl + '/api/event').flush({}, { status: 500, statusText: 'Error' });
    await assertion;
  });
  it('omits empty optional query values without dropping page zero', () => {
    service.getEvents({ page: 0, sortBy: '', sortDirection: undefined }).subscribe();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/event');
    expect(request.request.params.keys()).toEqual(['page']);
    request.flush({ content: [] });
  });
});
