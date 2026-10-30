import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoaderComponent } from './loader-component';
describe('LoaderComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LoaderComponent], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(LoaderComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]').getAttribute('aria-live')).toBe(
      'polite',
    );
    expect(fixture.nativeElement.textContent).toContain('AURUM staff portal');
  });
});
