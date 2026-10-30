import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { About } from './about';
describe('About', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [About], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('About Aurumi');
  });
});
