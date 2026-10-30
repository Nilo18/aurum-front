import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Process } from './process';
describe('Process', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Process], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(Process);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('How it works');
  });
});
