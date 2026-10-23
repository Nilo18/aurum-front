import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MenuAddDialog } from './menu-add-dialog';
import { MenuService, CuisineType } from '../../../services/menu-service';
describe('MenuAddDialog', () => {
  const addMenuItem = vi.fn();
  const updateMenuItem = vi.fn();
  const close = vi.fn();
  const item = {
    publicId: 'dish-1',
    name: 'Dish',
    category: 'APPETIZER' as const,
    type: CuisineType.GENERAL,
    pricePerPerson: 10,
  };
  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [MenuAddDialog],
      providers: [
        { provide: NgbActiveModal, useValue: { close, dismiss: vi.fn() } },
        { provide: MenuService, useValue: { addMenuItem, updateMenuItem } },
      ],
    });
  });
  it('validates required fields, name limits, and price precision', async () => {
    const fixture = TestBed.createComponent(MenuAddDialog);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    await component.save();
    expect(addMenuItem).not.toHaveBeenCalled();
    expect(component.menuForm.touched).toBe(true);
    component.menuForm.patchValue({ ...item, name: ' '.repeat(151), pricePerPerson: 1.123 });
    expect(component.menuForm.invalid).toBe(true);
    component.menuForm.patchValue({ ...item, pricePerPerson: -1 });
    expect(component.menuForm.invalid).toBe(true);
    component.menuForm.patchValue({ ...item, pricePerPerson: 0 });
    expect(component.menuForm.valid).toBe(true);
    addMenuItem.mockResolvedValue(item);
    await component.save();
    expect(addMenuItem).toHaveBeenCalledWith({ ...component.menuForm.getRawValue() });
    expect(close).toHaveBeenCalled();
  });
  it('loads edits, updates with the public ID, and retains failed values', async () => {
    const fixture = TestBed.createComponent(MenuAddDialog);
    const component = fixture.componentInstance;
    component.menuItem = item;
    fixture.detectChanges();
    updateMenuItem.mockRejectedValue(new Error('Failed'));
    await component.save();
    expect(component.submissionError()).toBeTruthy();
    expect(close).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);
    updateMenuItem.mockResolvedValue(item);
    await component.save();
    expect(updateMenuItem).toHaveBeenLastCalledWith(item);
    expect(close).toHaveBeenCalled();
  });
});
