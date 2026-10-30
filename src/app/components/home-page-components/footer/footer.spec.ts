import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from './footer';
describe('Footer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Footer], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('footer').textContent).toContain('AURUM');
    expect(fixture.nativeElement.querySelectorAll('a').length).toBeGreaterThan(0);
  });
});
