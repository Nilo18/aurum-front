import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductAddDialog } from './product-add-dialog';
import { ProductCategory, ProductService } from '../../../services/product-service';
import { SupplierService } from '../../../services/supplier-service';

describe('ProductAddDialog', () => {
  const close = vi.fn();
  const dismiss = vi.fn();
  const addProduct = vi.fn();
  const updateProduct = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [ProductAddDialog],
      providers: [
        { provide: NgbActiveModal, useValue: { close, dismiss } },
        { provide: ProductService, useValue: { addProduct, updateProduct } },
        {
          provide: SupplierService,
          useValue: { getSupplierNames: async () => [{ id: 7, name: 'Supplier' }] },
        },
      ],
    });
  });

  it('populates edits on initialization and saves the original publicId with edited values', async () => {
    const fixture = TestBed.createComponent(ProductAddDialog);
    const component = fixture.componentInstance;
    component.product = {
      publicId: 'product-42',
      productName: 'Plate',
      category: ProductCategory.TABLEWARE,
      price: 0,
      supplierId: 7,
      quantity: 0,
    };
    await fixture.whenStable();
    expect(component.productForm.getRawValue()).toEqual({
      productName: 'Plate',
      category: ProductCategory.TABLEWARE,
      price: 0,
      supplierId: 7,
      quantity: 0,
    });
    component.productForm.patchValue({ price: 12 });
    updateProduct.mockResolvedValueOnce({ publicId: 'product-42' });
    await component.save();
    expect(updateProduct).toHaveBeenCalledWith({ ...component.product, price: 12 });
    expect(addProduct).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith('Product saved.');
  });

  it('blocks invalid submissions and keeps values available for retry after a failed create', async () => {
    const fixture = TestBed.createComponent(ProductAddDialog);
    const component = fixture.componentInstance;
    await fixture.whenStable();
    await component.save();
    expect(addProduct).not.toHaveBeenCalled();
    component.productForm.patchValue({
      productName: 'Plate',
      price: 12,
      supplierId: 7,
      quantity: 0,
    });
    addProduct.mockRejectedValueOnce(new Error('offline'));
    await component.save();
    expect(close).not.toHaveBeenCalled();
    expect(component.submissionError()).toBeTruthy();
    expect(component.isSubmitting()).toBe(false);
    expect(component.productForm.value.price).toBe(12);
    addProduct.mockResolvedValueOnce({ publicId: 'product-42' });
    await component.save();
    expect(close).toHaveBeenCalledWith('Product saved.');
  });
});
