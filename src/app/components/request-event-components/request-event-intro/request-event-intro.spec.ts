import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RequestEventIntro } from './request-event-intro';
describe('RequestEventIntro', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestEventIntro],
      providers: [provideRouter([])],
    });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(RequestEventIntro);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('An exceptional event.');
  });
});
