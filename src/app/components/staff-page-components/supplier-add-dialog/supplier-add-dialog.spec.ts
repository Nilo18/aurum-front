import { TestBed } from '@angular/core/testing';
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
        {
          provide: SupplierService,
          useValue: {
            addSupplier,
            updateSupplier,
            getAvailableProductCategories: vi
              .fn()
              .mockResolvedValue(Object.values(ProductCategory)),
          },
        },
      ],
    });
  });

  async function setup(edit = false) {
    const fixture = TestBed.createComponent(SupplierAddDialog);
    if (edit) fixture.componentInstance.supplier = supplier;
    fixture.detectChanges();
    await fixture.whenStable();
    const form = fixture.componentInstance.supplierForm;
    return { fixture, component: fixture.componentInstance, form };
  }

  it('blocks empty forms', async () => {
    const { fixture, component, form } = await setup();
    await component.save();
    expect(addSupplier).not.toHaveBeenCalled();
    expect(form.touched).toBe(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Name is required');
    expect(fixture.nativeElement.querySelector('[name=city]').getAttribute('aria-invalid')).toBe(
      'true',
    );
  });

  it('creates a supplier and closes only after saving', async () => {
    const { fixture, component, form } = await setup();
    component.supplierForm.patchValue({ ...supplier, categories: new Set(supplier.categories) });
    fixture.detectChanges();
    await fixture.whenStable();
    addSupplier.mockResolvedValue(supplier);
    await component.save();
    expect(addSupplier).toHaveBeenCalledWith(component.supplierForm.getRawValue());
    expect(updateSupplier).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith('Supplier saved.');
  });

  it('loads edits without mutating the original categories and updates the supplier', async () => {
    const { component } = await setup(true);
    component.toggleCategory(ProductCategory.TABLEWARE, true);
    expect(supplier.categories.has(ProductCategory.TABLEWARE)).toBe(false);
    updateSupplier.mockResolvedValue(supplier);
    await component.save();
    expect(updateSupplier).toHaveBeenCalledWith({
      ...component.supplierForm.getRawValue(),
      publicId: supplier.publicId,
    });
    expect(addSupplier).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith('Supplier saved.');
  });

  it('prevents duplicate saves and dismissals while saving and retains failed edits', async () => {
    const { component } = await setup(true);
    let reject!: (error: Error) => void;
    updateSupplier.mockReturnValue(
      new Promise((_, rejectRequest) => {
        reject = rejectRequest;
      }),
    );
    const pending = component.save();
    await component.save();
    component.close();
    expect(updateSupplier).toHaveBeenCalledTimes(1);
    expect(dismiss).not.toHaveBeenCalled();
    reject(new Error('Failed'));
    await pending;
    expect(close).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);
    expect(component.submissionError()).toBeTruthy();
    expect(component.supplierForm.getRawValue().name).toBe(supplier.name);
    component.close();
    expect(dismiss).toHaveBeenCalledOnce();
  });
});
