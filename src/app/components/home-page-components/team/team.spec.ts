import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Team } from './team';
describe('Team', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Team], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(Team);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Organizational structure');
  });
});
