import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Services } from './services';
describe('Services', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Services], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(Services);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Our services');
  });
});
