import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RequestEventCta } from './request-event-cta';
describe('RequestEventCta', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RequestEventCta], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(RequestEventCta);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Individual approach');
  });
});
