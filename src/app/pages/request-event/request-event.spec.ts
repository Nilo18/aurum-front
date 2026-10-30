import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RequestEvent } from './request-event';
describe('RequestEvent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestEvent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(RequestEvent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-request-event-intro')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-event-request-form')).not.toBeNull();
  });
});
