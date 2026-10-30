import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Events } from './events';
describe('Events', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Events], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(Events);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Event portfolio');
  });
});
