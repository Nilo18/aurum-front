import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SupplierAddDialog } from './supplier-add-dialog';
import { ProductCategory, SupplierService } from '../../../services/supplier-service';

describe('SupplierAddDialog', () => {
  const close = vi.fn();
  const dismiss = vi.fn();
  const addSupplier = vi.fn();
  const updateSupplier = vi.fn();
  const supplier = {
    publicId: 'supplier-1',
    name: 'Partner',
    city: 'Tbilisi',
    street: 'Main',
    number: '1',
    categories: new Set([ProductCategory.FLORALS]),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [SupplierAddDialog],
      providers: [
        { provide: NgbActiveModal, useValue: { close, dismiss } },
        { provide: SupplierService, useValue: { addSupplier, updateSupplier } },
      ],
    });
  });

  async function setup(edit = false) {
    const fixture = TestBed.createComponent(SupplierAddDialog);
    if (edit) fixture.componentInstance.supplier = supplier;
    fixture.detectChanges();
    await fixture.whenStable();
    const form = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
    return { fixture, component: fixture.componentInstance, form };
  }

  it('blocks empty forms', async () => {
    const { component, form } = await setup();
    await component.save(form);
    expect(addSupplier).not.toHaveBeenCalled();
    expect(form.touched).toBe(true);
    expect(component.submissionError()).toContain('required');
  });

  it('creates a supplier and closes only after saving', async () => {
    const { fixture, component, form } = await setup();
    component.draft = { ...supplier, categories: new Set(supplier.categories) };
    fixture.detectChanges();
    await fixture.whenStable();
    addSupplier.mockResolvedValue(supplier);
    await component.save(form);
    expect(addSupplier).toHaveBeenCalledWith(component.draft);
    expect(updateSupplier).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith('Supplier saved.');
  });

  it('loads edits without mutating the original categories and updates the supplier', async () => {
    const { component, form } = await setup(true);
    component.toggleCategory(ProductCategory.TABLEWARE, true);
    expect(supplier.categories.has(ProductCategory.TABLEWARE)).toBe(false);
    updateSupplier.mockResolvedValue(supplier);
    await component.save(form);
    expect(updateSupplier).toHaveBeenCalledWith({
      ...component.draft,
      publicId: supplier.publicId,
    });
    expect(addSupplier).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith('Supplier saved.');
  });

  it('prevents duplicate saves and dismissals while saving and retains failed edits', async () => {
    const { component, form } = await setup(true);
    let reject!: (error: Error) => void;
    updateSupplier.mockReturnValue(
      new Promise((_, rejectRequest) => {
        reject = rejectRequest;
      }),
    );
    const pending = component.save(form);
    await component.save(form);
    component.close();
    expect(updateSupplier).toHaveBeenCalledTimes(1);
    expect(dismiss).not.toHaveBeenCalled();
    reject(new Error('Failed'));
    await pending;
    expect(close).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);
    expect(component.submissionError()).toBeTruthy();
    expect(component.draft.name).toBe(supplier.name);
    component.close();
    expect(dismiss).toHaveBeenCalledOnce();
  });
});
