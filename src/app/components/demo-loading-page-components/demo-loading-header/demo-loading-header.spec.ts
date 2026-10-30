import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DemoLoadingHeader } from './demo-loading-header';
describe('DemoLoadingHeader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DemoLoadingHeader],
      providers: [provideRouter([])],
    });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(DemoLoadingHeader);
    fixture.detectChanges();
    await fixture.whenStable();
    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(2);
    for (const link of links) expect(link.getAttribute('href')).toBe('/');
    expect(links[1].textContent).toContain('Back to website');
  });
});
