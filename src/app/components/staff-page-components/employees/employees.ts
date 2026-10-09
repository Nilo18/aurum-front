import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { human, currency } from '../shared/staff-format';
import { EmployeeService } from '../../../services/employee-service';
import { getRequestErrorMessage } from '../../../services/request-error';
import { FormValidatorService } from '../../../services/form-validator-service';
import { EmployeeQuery } from '../../../services/employee-service';
import { EmployeesFiltering } from '../employees-filtering/employees-filtering';
import { EmployeesSorting } from '../employees-sorting/employees-sorting';
import { EmployeesPagination } from '../employees-pagination/employees-pagination';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmActionModal } from '../../general-components/confirm-action-modal/confirm-action-modal';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-employees',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EmployeesFiltering,
    EmployeesSorting,
    EmployeesPagination,
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees {
  private employeeService = inject(EmployeeService);
  public formValidator = inject(FormValidatorService);
  private modalService = inject(NgbModal);
  private fb = inject(FormBuilder);
  employeeForm!: FormGroup;
  readonly human = human;
  readonly currency = currency;
  readonly employeeQuery = signal<EmployeeQuery>({
    page: 0,
    size: 10,
    search: '',
    sortBy: '',
    sortDirection: '',
  });
  readonly query = this.employeeQuery.asReadonly();
  readonly search = signal(this.query().search ?? '');
  readonly error = computed(() =>
    this.employees.error() ? 'Unable to load employees. Please try again.' : '',
  );
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  readonly confirming = signal(false);
  readonly deleting = signal<string | undefined>(undefined);
  readonly deleteError = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  readonly employees = rxResource({
    params: () => this.employeeQuery(),
    stream: ({ params }) => this.employeeService.getEmployees(params),
  });

  readonly page = computed(() => (this.employees.hasValue() ? this.employees.value() : undefined));
  readonly rows = computed(() => this.page()?.content ?? []);
  readonly busy = computed(
    () =>
      this.employees.isLoading() || this.isSubmitting() || this.confirming() || !!this.deleting(),
  );

  updateQuery(changes: Partial<EmployeeQuery>, resetPage = true) {
    this.employeeQuery.update((query) => ({
      ...query,
      ...changes,
      ...(resetPage ? { page: 0 } : {}),
    }));
  }

  searchEmployees() {
    if (this.busy()) return;
    const search = this.search().trim();
    this.search.set(search);
    this.updateQuery({ search });
  }

  retry() {
    if (this.busy()) return;
    this.employees.reload();
  }

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

  open(): void {
    this.submissionError.set('');
    this.notice.set('');
    this.employeeForm.reset({
      type: 'SALES_MANAGER',
      salary: '',
      email: '',
      role: 'ADMIN',
    });
    this.editor.set(true);
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.editor.set(false);
  }

  async deleteEmployee(email: string) {
    if (this.busy()) return;
    this.confirming.set(true);
    const modalRef = this.modalService.open(ConfirmActionModal, {
      centered: true,
      windowClass: 'aurum-confirm-action-modal',
      ariaLabelledBy: 'confirm-action-title',
      ariaDescribedBy: 'confirm-action-message',
    });

    modalRef.componentInstance.title = 'Delete employee?';
    modalRef.componentInstance.msg = `Delete ${email} from the employee collection? This action cannot be undone.`;

    try {
      if ((await modalRef.result) !== true) return;
    } catch {
      return;
    } finally {
      this.confirming.set(false);
    }

    this.deleting.set(email);
    this.deleteError.set('');
    this.notice.set('');
    try {
      const res = await this.employeeService.deleteEmployee(email);
      if (res.status < 200 || res.status >= 300) {
        this.deleteError.set(res.message || 'Unable to delete employee. Please try again.');
        return;
      }
      this.notice.set('Employee deleted.');
      const current = this.page();
      if (current) {
        this.employees.set({
          ...current,
          content: current.content.filter((employee) => employee.email !== email),
          totalElements: Math.max(0, current.totalElements - 1),
        });
      }
      const currentPage = this.page();
      if (currentPage && !currentPage.content.length && currentPage.pageNumber > 0) {
        this.updateQuery({ page: currentPage.pageNumber - 1 }, false);
      } else {
        this.employees.reload();
      }
    } catch (error) {
      this.deleteError.set(
        getRequestErrorMessage(error, 'Unable to delete employee. Please try again.'),
      );
    } finally {
      this.deleting.set(undefined);
    }
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
      this.employees.reload();
    } catch (error) {
      this.submissionError.set(
        getRequestErrorMessage(error, 'We could not send the invitation. Please try again.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
