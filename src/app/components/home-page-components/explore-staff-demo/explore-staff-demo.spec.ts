import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ExploreStaffDemo } from './explore-staff-demo';
describe('ExploreStaffDemo', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ExploreStaffDemo], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(ExploreStaffDemo);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('explore-staff-demo works!');
  });
});
