import { TestBed } from '@angular/core/testing';
import { EventFiltering } from './event-filtering';
describe('EventFiltering', () => {
  it('emits normalized filter changes and preserves valid values', () => {
    const fixture = TestBed.createComponent(EventFiltering);
    const component = fixture.componentInstance;
    const changed = vi.fn();
    component.changed.subscribe(changed);

    component.filter('costFrom', 0);
    expect(changed).toHaveBeenLastCalledWith({ costFrom: 0 });
    component.filter('guestFrom', 1.5);
    component.filter('costFrom', -1);
    component.filter('costFrom', Infinity);
    expect(changed).toHaveBeenCalledOnce();
    component.filter('eventFrom', '');
    expect(changed).toHaveBeenLastCalledWith({ eventFrom: undefined });
    component.filter('costTo', null);
    expect(changed).toHaveBeenLastCalledWith({ costTo: undefined });
    fixture.componentRef.setInput('disabled', true);
    component.filter('costFrom', 10);
    expect(changed).toHaveBeenCalledTimes(3);
  });
});
