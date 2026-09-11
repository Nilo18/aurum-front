import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Employees } from './employees';
import { EmployeeService } from '../../../services/employee-service';

describe('Employees invitation request states', () => {
  const inviteEmployee = vi.fn();
  let component: Employees;

  beforeEach(() => {
    inviteEmployee.mockReset();
    TestBed.configureTestingModule({
      imports: [Employees],
      providers: [{ provide: EmployeeService, useValue: { inviteEmployee } }],
    });
    component = TestBed.createComponent(Employees).componentInstance;
    component.ngOnInit();
    component.open();
    component.employeeForm.patchValue({ email: 'staff@example.com', salary: 100 });
  });

  it('prevents duplicate requests and closing while pending, then allows retry', async () => {
    let rejectRequest!: (reason: unknown) => void;
    inviteEmployee.mockReturnValue(
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
    );
    const pending = component.onSubmit();
    expect(component.isSubmitting()).toBe(true);
    component.close();
    expect(component.editor()).toBe(true);
    await component.onSubmit();
    expect(inviteEmployee).toHaveBeenCalledTimes(1);
    rejectRequest(new HttpErrorResponse({ status: 400, error: 'Employee already exists' }));
    await pending;
    expect(component.submissionError()).toBe('Employee already exists');
    expect(component.isSubmitting()).toBe(false);
    expect(component.employeeForm.value.email).toBe('staff@example.com');
    inviteEmployee.mockResolvedValue({ status: 200, message: 'Sent' });
    await component.onSubmit();
    expect(component.editor()).toBe(false);
    expect(component.notice()).toContain('Invitation sent to staff@example.com');
    expect(component.submissionError()).toBe('');
    component.open();
    expect(component.employeeForm.value.email).toBe('');
  });

  it('shows unsuccessful response messages without closing the editor', async () => {
    inviteEmployee.mockResolvedValue({ status: 400, message: 'Invalid employee role' });
    await component.onSubmit();
    expect(component.submissionError()).toBe('Invalid employee role');
    expect(component.editor()).toBe(true);
    expect(component.isSubmitting()).toBe(false);
    expect(component.notice()).toBe('');
  });
});
