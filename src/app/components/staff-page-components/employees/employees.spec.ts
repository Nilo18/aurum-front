import { of } from 'rxjs';
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
      providers: [
        {
          provide: EmployeeService,
          useValue: {
            inviteEmployee,
            getEmployees: vi
              .fn()
              .mockReturnValue(of({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0 })),
          },
        },
      ],
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

describe('Employees reactive list query', () => {
  it('automatically fetches merged query changes and resets the page for new criteria', async () => {
    const getEmployees = vi
      .fn()
      .mockImplementation(() => of({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0 }));
    TestBed.configureTestingModule({
      imports: [Employees],
      providers: [{ provide: EmployeeService, useValue: { getEmployees } }],
    });
    const fixture = TestBed.createComponent(Employees);
    const component = fixture.componentInstance;
    await fixture.whenStable();
    expect(getEmployees).toHaveBeenCalledTimes(1);
    component.updateQuery({ page: 2, size: 25 }, false);
    await fixture.whenStable();
    expect(getEmployees).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, size: 25 }));
    component.updateQuery({ sortBy: 'salary', sortDirection: 'desc' });
    await fixture.whenStable();
    expect(getEmployees).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, size: 25, sortBy: 'salary' }),
    );
    component.search.set(' alex ');
    component.searchEmployees();
    await fixture.whenStable();
    expect(getEmployees).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'alex', sortBy: 'salary', size: 25 }),
    );
    component.updateQuery({ role: 0 });
    await fixture.whenStable();
    component.updateQuery({ role: undefined });
    await fixture.whenStable();
    expect(getEmployees).toHaveBeenLastCalledWith(
      expect.objectContaining({ role: undefined, search: 'alex' }),
    );
    const count = getEmployees.mock.calls.length;
    component.retry();
    await fixture.whenStable();
    expect(getEmployees).toHaveBeenCalledTimes(count + 1);
  });
});
