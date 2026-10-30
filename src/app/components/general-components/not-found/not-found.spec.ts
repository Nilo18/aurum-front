import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../app.routes';
import { NotFound } from './not-found';
describe('NotFound', () => {
  it('shows the 404 message and links back to the application', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Page not found');
    expect(fixture.nativeElement.textContent).toContain('404');
    expect(fixture.nativeElement.querySelector('.not-found__link').getAttribute('href')).toBe('/');
  });
  it.each(['/missing-page', '/staff/missing-section'])(
    'handles unknown URL %s with the wildcard route',
    async (url) => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(url, NotFound);
      expect(harness.routeNativeElement?.textContent).toContain('Page not found');
    },
  );
});
