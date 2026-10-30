import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Home } from './home';
describe('Home', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-hero')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-services')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-about')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-events')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-request-event-cta')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-process')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-team')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-locations')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-contact-us')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-footer')).not.toBeNull();
  });
});
