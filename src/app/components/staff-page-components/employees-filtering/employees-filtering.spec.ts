import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesFiltering } from './employees-filtering';

describe('EmployeesFiltering', () => {
  let component: EmployeesFiltering;
  let fixture: ComponentFixture<EmployeesFiltering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [EmployeesFiltering],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesFiltering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('clears enum filters and blocks changes while disabled', () => {
    const changed = vi.fn();
    component.changed.subscribe(changed);
    component.filter('type', 'CHEF');
    expect(changed).toHaveBeenLastCalledWith({ type: 'CHEF' });
    component.filter('role', '');
    expect(changed).toHaveBeenLastCalledWith({ role: undefined });
    fixture.componentRef.setInput('disabled', true);
    component.filter('status', 'PENDING');
    expect(changed).toHaveBeenCalledTimes(2);
  });
  it('debounces salary changes and preserves zero, decimals, and clearing', () => {
    vi.useFakeTimers();
    try {
      const changed = vi.fn();
      component.changed.subscribe(changed);
      component.filterSalary('salaryFrom', 1);
      vi.advanceTimersByTime(200);
      component.filterSalary('salaryFrom', 100.5);
      component.filterSalary('salaryTo', 500);
      expect(component.salaryDraft().salaryFrom).toBe(100.5);
      vi.advanceTimersByTime(399);
      expect(changed).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(changed).toHaveBeenLastCalledWith({ salaryFrom: 100.5, salaryTo: 500 });
      component.filterSalary('salaryFrom', 0);
      component.filterSalary('salaryTo', null);
      vi.advanceTimersByTime(400);
      expect(changed).toHaveBeenLastCalledWith({ salaryFrom: 0, salaryTo: undefined });
      component.filterSalary('salaryFrom', -1);
      vi.advanceTimersByTime(400);
      expect(changed).toHaveBeenCalledTimes(2);
      component.filterSalary('salaryFrom', 200);
      fixture.destroy();
      vi.advanceTimersByTime(400);
      expect(changed).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
