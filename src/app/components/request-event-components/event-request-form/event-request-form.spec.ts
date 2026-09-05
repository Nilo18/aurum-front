import { TestBed } from '@angular/core/testing';
import { EventRequestForm } from './event-request-form';

describe('EventRequestForm', () => {
  function setup() {
    const fixture = TestBed.createComponent(EventRequestForm);
    fixture.detectChanges();
    return fixture;
  }

  it('keeps incomplete requests in the form and exposes validation errors', () => {
    const fixture = setup();
    fixture.componentInstance.review();
    fixture.detectChanges();
    expect(fixture.componentInstance.reviewed()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#name').getAttribute('aria-invalid')).toBe('true');
  });

  it('rejects past dates, fractional guest counts, and invalid budgets', () => {
    const component = setup().componentInstance;
    const event = component.form.controls.event.controls;
    event.date.setValue('2000-01-01');
    event.guestCount.setValue(1.5);
    event.totalCost.setValue(-10);
    expect(event.date.invalid).toBe(true);
    expect(event.guestCount.invalid).toBe(true);
    expect(event.totalCost.invalid).toBe(true);
    event.totalCost.setValue(10.123);
    expect(event.totalCost.invalid).toBe(true);
  });

  it('reviews entity-shaped details and preserves them when editing', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    component.form.patchValue({
      client: { type: 'ORGANIZATION', name: 'Example Company', email: 'events@example.com', phone: '+14155552671' },
      event: { eventType: 'Corporate event', date: component.minDate, guestCount: 100, location: 'Tbilisi' },
    });
    component.review();
    fixture.detectChanges();
    expect(component.reviewed()).toBe(true);
    expect(component.request.client.type).toBe('ORGANIZATION');
    expect(component.request.event.status).toBe('REQUESTED');
    expect(component.request.event.totalCost).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('has not been sent or saved');
    component.edit();
    expect(component.form.controls.client.controls.name.value).toBe('Example Company');
    expect(component.reviewed()).toBe(false);
  });
});
