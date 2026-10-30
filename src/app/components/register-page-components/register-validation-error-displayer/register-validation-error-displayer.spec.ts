import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterValidationErrorDisplayer } from './register-validation-error-displayer';
describe('RegisterValidationErrorDisplayer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterValidationErrorDisplayer],
      providers: [provideRouter([])],
    });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(RegisterValidationErrorDisplayer);
    fixture.componentRef.setInput('message', 'Invitation expired');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Invitation expired');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Staff invitation');
  });
});
