import { of as emptyPageResult } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { Suppliers } from './suppliers';
import { SupplierAddDialog } from '../supplier-add-dialog/supplier-add-dialog';
import { SupplierService } from '../../../services/supplier-service';

describe('Suppliers modal', () => {
  it('opens the supplier dialog and refreshes after saving', async () => {
    let complete!: (message: string) => void;
    const modalRef = {
      componentInstance: { isSubmitting: () => false, supplier: undefined },
      result: new Promise<string>((resolve) => {
        complete = resolve;
      }),
    };
    const open = vi.fn().mockReturnValue(modalRef);
    const getSuppliers = vi.fn().mockReturnValue(
      of({
        content: [],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
      }),
    );
    TestBed.configureTestingModule({
      imports: [Suppliers],
      providers: [
        { provide: NgbModal, useValue: { open } },
        { provide: SupplierService, useValue: { getSuppliers } },
      ],
    });
    const fixture = TestBed.createComponent(Suppliers);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const reload = vi.spyOn(component.suppliers, 'reload');
    component.open();
    expect(open).toHaveBeenCalledWith(
      SupplierAddDialog,
      expect.objectContaining({
        ariaLabelledBy: 'supplier-editor-title',
        windowClass: 'aurum-supplier-modal',
      }),
    );
    const options = open.mock.calls[0][1];
    expect(options.beforeDismiss()).toBe(true);
    modalRef.componentInstance.isSubmitting = () => true;
    expect(options.beforeDismiss()).toBe(false);
    complete('Supplier saved.');
    await fixture.whenStable();
    expect(component.notice()).toBe('Supplier saved.');
    expect(reload).toHaveBeenCalledOnce();
  });
});

describe('Suppliers deletion', () => {
  async function setup(pageNumber = 0) {
    const deleteSupplier = vi.fn();
    const getSuppliers = vi.fn().mockReturnValue(
      of({
        content: [
          {
            publicId: 'supplier-1',
            name: 'Partner',
            city: 'Tbilisi',
            street: 'Main',
            number: '1',
            categories: new Set(),
          },
        ],
        pageNumber,
        pageSize: 10,
        totalElements: pageNumber * 10 + 1,
      }),
    );
    TestBed.configureTestingModule({
      imports: [Suppliers],
      providers: [
        { provide: NgbModal, useValue: { open: vi.fn() } },
        { provide: SupplierService, useValue: { getSuppliers, deleteSupplier } },
      ],
    });
    const fixture = TestBed.createComponent(Suppliers);
    fixture.componentInstance.updateQuery({ page: pageNumber }, false);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const reload = vi.spyOn(component.suppliers, 'reload');
    return { fixture, component, deleteSupplier, reload };
  }

  it('groups edit and delete actions and prevents duplicate deletion while pending', async () => {
    const { fixture, component, deleteSupplier, reload } = await setup();
    let finish!: (value: { status: number; message: string }) => void;
    deleteSupplier.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const actions = fixture.nativeElement.querySelector('.suppliers__actions');
    expect(actions.querySelectorAll('button')).toHaveLength(2);
    actions.querySelector('.suppliers__delete-btn').click();
    fixture.detectChanges();
    expect(actions.textContent).toContain('Deleting');
    expect(
      Array.from(actions.querySelectorAll('button')).every(
        (button) => (button as HTMLButtonElement).disabled,
      ),
    ).toBe(true);
    await component.deleteSupplier('supplier-1');
    expect(deleteSupplier).toHaveBeenCalledTimes(1);
    finish({ status: 200, message: 'Deleted' });
    await fixture.whenStable();
    expect(reload).toHaveBeenCalledOnce();
    expect(component.notice()).toBe('Supplier deleted.');
    expect(component.deleting()).toBeUndefined();
  });

  it('moves back one page when the last supplier on that page is deleted', async () => {
    const { fixture, component, deleteSupplier, reload } = await setup(1);
    deleteSupplier.mockResolvedValue({ status: 200, message: 'Deleted' });
    await component.deleteSupplier('supplier-1');
    expect(component.supplierQuery().page).toBe(0);
    expect(reload).not.toHaveBeenCalled();
    await fixture.whenStable();
  });

  it('keeps the list and displays failed deletion responses and network errors', async () => {
    const { component, deleteSupplier, reload } = await setup();
    deleteSupplier.mockResolvedValueOnce({ status: 409, message: 'Supplier is in use.' });
    await component.deleteSupplier('supplier-1');
    expect(component.deleteError()).toBe('Supplier is in use.');
    expect(reload).not.toHaveBeenCalled();
    deleteSupplier.mockRejectedValueOnce(new Error('Network error'));
    await component.deleteSupplier('supplier-1');
    expect(component.deleteError()).toBeTruthy();
    expect(component.notice()).toBe('');
    expect(component.deleting()).toBeUndefined();
    expect(reload).not.toHaveBeenCalled();
  });
});

describe('Suppliers query state', () => {
  it('resets pagination for new criteria and preserves criteria during paging', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SupplierService,
          useValue: {
            getSuppliers: () =>
              emptyPageResult({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0 }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(Suppliers);
    const component = fixture.componentInstance;
    component.updateQuery({ page: 3, size: 25 }, false);
    component.updateQuery({ sortBy: 'name', sortDirection: 'ASC' });
    expect(component.supplierQuery()).toMatchObject({
      page: 0,
      size: 25,
      sortBy: 'name',
      sortDirection: 'ASC',
    });
    component.updateQuery({ page: 2 }, false);
    expect(component.supplierQuery()).toMatchObject({
      page: 2,
      size: 25,
      sortBy: 'name',
      sortDirection: 'ASC',
    });
  });
});
