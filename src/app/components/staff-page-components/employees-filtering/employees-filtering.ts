import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, effect, input, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EmployeeQuery,
  EmployeeType,
  EmployeeRole,
  EmployeeStatus,
} from '../../../services/employee-service';
@Component({
  selector: 'app-employees-filtering',
  imports: [FormsModule],
  templateUrl: './employees-filtering.html',
  styleUrl: './employees-filtering.scss',
})
export class EmployeesFiltering {
  readonly stringFormatter = inject(StringFormatterService);
  readonly query = input<EmployeeQuery>({});
  readonly disabled = input(false);
  readonly changed =
    output<Pick<EmployeeQuery, 'type' | 'role' | 'status' | 'salaryFrom' | 'salaryTo'>>();
  readonly types = Object.keys(EmployeeType).filter((key) => Number.isNaN(Number(key)));
  readonly roles = Object.keys(EmployeeRole).filter((key) => Number.isNaN(Number(key)));
  readonly statuses = Object.keys(EmployeeStatus).filter((key) => Number.isNaN(Number(key)));
  readonly salaryDraft = signal<Pick<EmployeeQuery, 'salaryFrom' | 'salaryTo'>>({});
  private previousSalary: Pick<EmployeeQuery, 'salaryFrom' | 'salaryTo'> = {};
  private pendingSalary: Pick<EmployeeQuery, 'salaryFrom' | 'salaryTo'> = {};
  private salaryTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const { salaryFrom, salaryTo } = this.query();
      if (
        salaryFrom !== this.previousSalary.salaryFrom ||
        salaryTo !== this.previousSalary.salaryTo
      ) {
        clearTimeout(this.salaryTimer);
        this.pendingSalary = {};
        this.previousSalary = { salaryFrom, salaryTo };
        this.salaryDraft.set({ salaryFrom, salaryTo });
      }
    });
  }

  ngOnDestroy() {
    clearTimeout(this.salaryTimer);
  }

  filterSalary(field: 'salaryFrom' | 'salaryTo', value: number | null) {
    if (this.disabled()) return;
    this.salaryDraft.update((draft) => ({ ...draft, [field]: value ?? undefined }));
    clearTimeout(this.salaryTimer);
    if (value !== null && (!Number.isFinite(value) || value < 0)) return;
    this.pendingSalary = { ...this.pendingSalary, [field]: value ?? undefined };
    this.salaryTimer = setTimeout(() => {
      const changes = this.pendingSalary;
      this.pendingSalary = {};
      if (!this.disabled()) this.changed.emit(changes);
    }, 400);
  }

  filter(field: 'type' | 'role' | 'status', value?: string) {
    if (this.disabled()) return;
    this.changed.emit({ [field]: value || undefined } as Pick<
      EmployeeQuery,
      'type' | 'role' | 'status'
    >);
  }
}
