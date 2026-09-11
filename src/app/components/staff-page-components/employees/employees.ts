import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StaffPreviewStore } from '../shared/staff-preview-store';
import { Row } from '../shared/staff-row';
import { human, currency } from '../shared/staff-format';
import { EmployeeService } from '../../../services/employee-service';
import { getRequestErrorMessage } from '../../../services/request-error';
import { FormValidatorService } from '../../../services/form-validator-service';

@Component({
  selector: 'app-employees',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees {
  private employeeService = inject(EmployeeService);
  public formValidator = inject(FormValidatorService);
  private fb = inject(FormBuilder);
  employeeForm!: FormGroup;
  readonly store = inject(StaffPreviewStore);
  readonly human = human;
  readonly currency = currency;
  readonly search = signal('');
  readonly filter = signal('');
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  readonly rows = computed(() => this.store.data().employees);
  readonly filters = computed(() =>
    Array.from(new Set(this.rows().map((row) => String(row['type'])))),
  );
  readonly filtered = computed(() =>
    this.rows().filter(
      (row) =>
        (!this.filter() || String(row['type']) === this.filter()) &&
        Object.entries(row).some(([key, value]) =>
          this.searchValue(key, value).toLowerCase().includes(this.search().toLowerCase()),
        ),
    ),
  );
  editing?: Row;
  draft: Row = {};

  ngOnInit() {
    this.employeeForm = this.fb.group({
      type: ['', [Validators.required]],
      salary: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
    });
  }

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (dialog && !dialog.open) dialog.showModal();
    });
  }

  private searchValue(key: string, value: unknown): string {
    if (key === 'salary') return this.currency(value);
    return human(value);
  }

  open(row?: Row): void {
    this.submissionError.set('');
    this.notice.set('');
    this.editing = row;
    this.draft = row
      ? { ...row }
      : {
          type: 'SALES_MANAGER',
          salary: '',
          email: '',
          role: 'ADMIN',
        };
    this.employeeForm.reset(this.draft);
    this.editor.set(true);
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.editor.set(false);
  }

  save(): void {
    const row = { ...this.draft };
    row['salary'] = Number(row['salary']);
    this.store.save('employees', row, this.editing);
    this.close();
    this.notice.set('Employee saved in this preview session.');
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting()) return;
    this.submissionError.set('');
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const request = this.employeeForm.getRawValue();
    this.isSubmitting.set(true);
    try {
      const res = await this.employeeService.inviteEmployee(request);
      if (res.status !== 200) {
        this.submissionError.set(
          res.message || 'We could not send the invitation. Please try again.',
        );
        return;
      }
      this.editor.set(false);
      this.notice.set(
        `Invitation sent to ${request.email}. They can use the email link to register.`,
      );
      this.employeeForm.reset();
    } catch (error: any) {
      this.submissionError.set(
        error.error.error
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
