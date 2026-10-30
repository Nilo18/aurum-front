import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Locations } from './locations';
describe('Locations', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Locations], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(Locations);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Venues & spaces');
  });
});
