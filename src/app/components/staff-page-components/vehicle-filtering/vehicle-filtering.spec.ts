import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleFiltering } from './vehicle-filtering';

describe('VehicleFiltering', () => {
  let component: VehicleFiltering;
  let fixture: ComponentFixture<VehicleFiltering>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [VehicleFiltering] }).compileComponents();
    fixture = TestBed.createComponent(VehicleFiltering);
    component = fixture.componentInstance;
    await fixture.whenStable();
    vi.useFakeTimers();
  });
  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('keeps drafts while typing and emits only after a pause, merging numeric fields', () => {
    const changed = vi.fn();
    component.changed.subscribe(changed);
    component.filterCapacity('passengerFrom', 1);
    vi.advanceTimersByTime(250);
    component.filterCapacity('passengerFrom', 12);
    component.filterCapacity('weightTo', 3500);
    expect(component.capacityDraft().passengerFrom).toBe(12);
    expect(changed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(399);
    expect(changed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(changed).toHaveBeenCalledExactlyOnceWith({ passengerFrom: 12, weightTo: 3500 });
  });
  it('preserves zero, clears empty values, and ignores invalid or disabled changes', () => {
    const changed = vi.fn();
    component.changed.subscribe(changed);
    component.filterCapacity('passengerFrom', 0);
    component.filterCapacity('weightTo', null);
    vi.advanceTimersByTime(400);
    expect(changed).toHaveBeenLastCalledWith({ passengerFrom: 0, weightTo: undefined });
    component.filterCapacity('passengerFrom', -1);
    vi.advanceTimersByTime(400);
    fixture.componentRef.setInput('disabled', true);
    component.filterCapacity('weightTo', 100);
    vi.advanceTimersByTime(400);
    expect(changed).toHaveBeenCalledTimes(1);
  });
  it('cancels pending numeric changes when parent filters are reset', () => {
    fixture.componentRef.setInput('query', { passengerFrom: 10 });
    fixture.detectChanges();
    component.filterCapacity('passengerFrom', 123);
    fixture.componentRef.setInput('query', {});
    fixture.detectChanges();
    const changed = vi.fn();
    component.changed.subscribe(changed);
    vi.advanceTimersByTime(400);
    expect(changed).not.toHaveBeenCalled();
    expect(component.capacityDraft().passengerFrom).toBeUndefined();
  });
  it('cancels pending emissions when destroyed', () => {
    const changed = vi.fn();
    component.changed.subscribe(changed);
    component.filterCapacity('weightFrom', 100);
    fixture.destroy();
    vi.advanceTimersByTime(400);
    expect(changed).not.toHaveBeenCalled();
  });
});
