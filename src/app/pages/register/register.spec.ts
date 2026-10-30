import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EmployeeService } from '../../services/employee-service';
import { Register } from './register';
describe('Register', () => {
  function setup(token?: string) {
    const validateInvitation = vi.fn().mockResolvedValue({ status: 200 });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap(token ? { token } : {})) },
        },
        { provide: EmployeeService, useValue: { validateInvitation } },
      ],
    });
    const fixture = TestBed.createComponent(Register);
    return { fixture, component: fixture.componentInstance, validateInvitation };
  }
  it('explains missing invitation links without calling the API', async () => {
    const { component, validateInvitation } = setup();
    await component.ngOnInit();
    expect(component.validating()).toBe(false);
    expect(component.validationFailed()).toBe(true);
    expect(component.validationErrorMsg()).toContain('invitation link is missing');
    expect(validateInvitation).not.toHaveBeenCalled();
  });
  it('validates the invitation before showing registration', async () => {
    const { component, validateInvitation } = setup('invitation');
    await component.ngOnInit();
    expect(validateInvitation).toHaveBeenCalledWith('invitation');
    expect(component.validating()).toBe(false);
    expect(component.validationFailed()).toBe(false);
    expect(component.token).toBe('invitation');
  });
  it('reports an invalid invitation', async () => {
    const { component, validateInvitation } = setup('expired');
    validateInvitation.mockRejectedValue({ error: { error: 'Invitation expired' } });
    await component.ngOnInit();
    expect(component.validationFailed()).toBe(true);
    expect(component.validationErrorMsg()).toBe('Invitation expired');
  });
});
