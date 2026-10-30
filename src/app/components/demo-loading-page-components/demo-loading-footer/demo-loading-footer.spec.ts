import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DemoLoadingFooter } from './demo-loading-footer';
describe('DemoLoadingFooter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DemoLoadingFooter],
      providers: [provideRouter([])],
    });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(DemoLoadingFooter);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('footer').textContent).toContain(
      'AURUM · Event Management',
    );
    expect(fixture.nativeElement.textContent).toContain('The art of bringing it all together');
  });
});
