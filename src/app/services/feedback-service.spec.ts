import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FeedbackService } from './feedback-service';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('FeedbackService', () => {
  let service: FeedbackService;
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
    service = TestBed.inject(FeedbackService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('validateInvitation sends the expected POST request and returns the response', async () => {
    const result = service.validateInvitation('invite');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/feedback/verify-invitation');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ token: 'invite' });

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('validateInvitation propagates backend failures to its caller', async () => {
    const result = service.validateInvitation('invite');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/feedback/verify-invitation')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('createFeedback sends the expected POST request and returns the response', async () => {
    const result = service.createFeedback({
      tokenHash: 'invite',
      author: 'Guest',
      rating: 5,
      description: 'Excellent',
    });
    const request = http.expectOne((r) => r.url === baseUrl + '/api/feedback');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      tokenHash: 'invite',
      author: 'Guest',
      rating: 5,
      description: 'Excellent',
    });

    const response = {
      publicId: 'feedback-1',
      author: 'Guest',
      commentDate: '2026-10-30',
      rating: 5,
      description: 'Excellent',
    };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('createFeedback propagates backend failures to its caller', async () => {
    const result = service.createFeedback({
      tokenHash: 'invite',
      author: 'Guest',
      rating: 5,
      description: 'Excellent',
    });
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/feedback')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });

  it('deleteFeedback sends the expected DELETE request and returns the response', async () => {
    const result = service.deleteFeedback('feedback-1');
    const request = http.expectOne((r) => r.url === baseUrl + '/api/feedback/feedback-1');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual(null);

    const response = { status: 200, message: 'Success' };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('deleteFeedback propagates backend failures to its caller', async () => {
    const result = service.deleteFeedback('feedback-1');
    const assertion = expect(result).rejects.toMatchObject({ status: 503 });
    http
      .expectOne((r) => r.url === baseUrl + '/api/feedback/feedback-1')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
  it('getAllFeedback fetches results with the expected query parameters', async () => {
    const result = firstValueFrom(
      service.getAllFeedback({ page: 0, size: 25, sortBy: 'name', sortDirection: 'ASC' }),
    );
    const request = http.expectOne((r) => r.url === baseUrl + '/api/feedback');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('sortBy')).toBe('name');
    expect(request.request.params.get('sortDirection')).toBe('ASC');
    const response = { content: [], pageNumber: 0, pageSize: 25, totalElements: 0 };
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
  it('getAllFeedback exposes HTTP failures', async () => {
    const result = firstValueFrom(service.getAllFeedback({}));
    const assertion = expect(result).rejects.toMatchObject({ status: 500 });
    http.expectOne(baseUrl + '/api/feedback').flush({}, { status: 500, statusText: 'Error' });
    await assertion;
  });
  it('omits empty optional query values without dropping page zero', () => {
    service.getAllFeedback({ page: 0, sortBy: '', sortDirection: undefined }).subscribe();
    const request = http.expectOne((r) => r.url === baseUrl + '/api/feedback');
    expect(request.request.params.keys()).toEqual(['page']);
    request.flush({ content: [] });
  });
});
