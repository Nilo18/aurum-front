import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { EventService } from '../../../services/event-service';
import { SuccessModal } from '../../general-components/success-modal/success-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventRequestForm } from './event-request-form';
import { CuisineType, MenuItem, MenuService } from '../../../services/menu-service';

describe('EventRequestForm', () => {
  const dishes: MenuItem[] = [
    { id: 1, name: 'Pkhali', category: 'APPETIZER', pricePerPerson: 12 },
    { id: 2, name: 'Fish', category: 'MAIN_COURSE', pricePerPerson: 30 },
    { id: 3, name: 'Baklava', category: 'DESSERT', pricePerPerson: 10 },
    { id: 4, name: 'Lemonade', category: 'DRINK', pricePerPerson: 6 },
  ];
  const getMenuItems = vi.fn();

  const verifyCreateEventRequest = vi.fn();
  const open = vi.fn();

  beforeEach(() => {
    verifyCreateEventRequest.mockReset().mockResolvedValue({ transactionKey: 'key' });
    open.mockReset().mockReturnValue({ componentInstance: {}, result: Promise.resolve('verified') });
    getMenuItems.mockReset().mockResolvedValue(dishes);
    TestBed.configureTestingModule({
      providers: [{ provide: MenuService, useValue: { getMenuItems } },
        { provide: EventService, useValue: { verifyCreateEventRequest } },
        { provide: NgbModal, useValue: { open } }],
    });
  });

  async function setup() {
    const fixture = TestBed.createComponent(EventRequestForm);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('loads backend cuisines and renders each dish once under its category', async () => {
    const fixture = await setup();
    expect(getMenuItems).toHaveBeenCalledWith(CuisineType.GENERAL);
    expect(fixture.nativeElement.querySelectorAll('.request-layout__menu-item').length).toBe(4);
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#cuisineType');
    for (const cuisine of [CuisineType.GEORGIAN, CuisineType.MEDITERRANEAN, CuisineType.GENERAL]) {
      select.value = cuisine;
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();
      expect(getMenuItems).toHaveBeenLastCalledWith(cuisine);
    }
  });

  it('preserves ID-based selections through cuisine changes and review/edit', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    fixture.nativeElement.querySelector('.request-layout__menu-item button').click();
    component.addDish({ ...dishes[0] });
    expect(component.selectedMenu()).toEqual([1]);
    getMenuItems.mockResolvedValueOnce([dishes[1]]);
    component.setCuisine(CuisineType.MEDITERRANEAN);
    await fixture.whenStable();
    component.form.patchValue({
      client: { type: 'ORGANIZATION', name: 'Company', email: 'test@example.com', phone: '+14155552671' },
      event: { eventType: 'GALA DINNER', date: component.minDate, guestCount: 10, location: 'AURUM BANQUET HALL', notes: 'Vegetarian' },
    });
    component.review();
    fixture.detectChanges();
    expect(component.reviewed()).toBe(true);
    expect(component.request.menuItemIds).toEqual([1]);
    component.request.menuItemIds.push(99);
    expect(component.selectedMenu()).toEqual([1]);
    expect(component.request.client.type).toBe('ORGANIZATION');
    expect(component.request.event).toEqual({
      eventType: 'GALA DINNER', date: component.minDate, guestCount: 10, location: 'AURUM BANQUET HALL',
      notes: 'Vegetarian', totalCost: null, status: 'REQUESTED',
    });
    expect(component.request.client).not.toHaveProperty('id');
    expect(fixture.nativeElement.querySelector('.request-layout__summary').textContent).toContain('Pkhali');
    component.edit();
    fixture.detectChanges();
    expect(component.client.name.value).toBe('Company');
    fixture.nativeElement.querySelector('.request-layout__selected-item button').click();
    expect(component.selectedMenu()).toEqual([]);
  });

  it('validates restored fields and focuses the first invalid input', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    component.review();
    fixture.detectChanges();
    expect(component.reviewed()).toBe(false);
    expect(fixture.nativeElement.querySelector('#name').getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement?.id).toBe('name');
    component.event.date.setValue('2000-01-01');
    component.event.guestCount.setValue(1.5);
    component.event.totalCost.setValue(-1);
    component.client.phone.setValue('invalid');
    expect(component.event.date.invalid).toBe(true);
    expect(component.event.guestCount.invalid).toBe(true);
    expect(component.event.totalCost.invalid).toBe(true);
    expect(component.client.phone.invalid).toBe(true);
    component.event.totalCost.setValue(1.123);
    expect(component.event.totalCost.invalid).toBe(true);
  });

  it('shows loading, handles a failed fetch and retries with an empty menu', async () => {
    let reject!: (reason: Error) => void;
    getMenuItems.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail; }));
    const fixture = TestBed.createComponent(EventRequestForm);
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.skeleton--button').length).toBe(8);
    expect(fixture.nativeElement.textContent).not.toContain('Loading dishes');
    expect(fixture.nativeElement.querySelector('.request-layout__menu').getAttribute('aria-busy')).toBe('true');
    fixture.componentInstance.addDish(dishes[0]);
    expect(fixture.componentInstance.selectedMenu()).toEqual([]);
    reject(new Error('Unavailable'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('We couldn’t load the menu');
    expect(fixture.nativeElement.querySelector('.skeleton')).toBeNull();
    getMenuItems.mockResolvedValueOnce([]);
    fixture.nativeElement.querySelector('.request-layout__menu button').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No dishes available');
    expect(fixture.nativeElement.querySelector('#name')).toBeTruthy();
  });

  it.each([
    [0, 'couldn’t connect'],
    [403, 'denied access'],
    [503, 'temporarily unavailable'],
  ])('handles HTTP %s without losing the selected IDs or dish labels', async (status, message) => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    component.addDish(dishes[0]);
    getMenuItems.mockRejectedValueOnce(new HttpErrorResponse({ status: Number(status) }));
    component.setCuisine(CuisineType.GEORGIAN);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.menuError()).toContain(message);
    expect(component.selectedMenu()).toEqual([1]);
    expect(fixture.nativeElement.querySelector('.request-layout__summary').textContent).toContain('Pkhali');
    component.addDish(dishes[1]);
    expect(component.selectedMenu()).toEqual([1]);
    component.retryMenu();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.menuError()).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.request-layout__menu-item').length).toBe(4);
  });
  it('verifies only the email and passes a snapshot of the full request to the modal', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    component.form.patchValue({
      client: { type: 'ORGANIZATION', name: 'Company', email: 'test@example.com', phone: '+14155552671' },
      event: { eventType: 'GALA DINNER', date: component.minDate, guestCount: 10, location: 'HOTEL', notes: 'Vegetarian' },
    });
    component.addDish(dishes[0]);
    await component.orderEvent();
    expect(verifyCreateEventRequest).toHaveBeenCalledExactlyOnceWith('test@example.com');
    expect(open.mock.results[0].value.componentInstance.eventInfo).toEqual({
      client: { clientType: 'ORGANIZATION', name: 'Company', email: 'test@example.com', phone: '+14155552671' },
      event: { eventType: 'GALA DINNER', date: component.minDate, guestCount: 10, location: 'HOTEL', notes: 'Vegetarian', totalCost: undefined },
      menuItemIds: [1], transactionKey: 'key',
    });
    expect(component.submitted()).toBe(true);
    expect(open).toHaveBeenCalledTimes(2);
    expect(open).toHaveBeenLastCalledWith(SuccessModal, expect.objectContaining({ windowClass: 'aurum-success-modal' }));
    await component.orderEvent();
    expect(verifyCreateEventRequest).toHaveBeenCalledTimes(1);
  });

  it('does not send verification for an invalid form', async () => {
    const fixture = await setup();
    await fixture.componentInstance.orderEvent();
    expect(verifyCreateEventRequest).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

});
