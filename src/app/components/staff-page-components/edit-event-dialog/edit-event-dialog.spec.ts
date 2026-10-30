import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditEventDialog } from './edit-event-dialog';
import {
  EventLocation,
  EventService,
  EventStatus,
  EventType,
} from '../../../services/event-service';

describe('EditEventDialog', () => {
  const close = vi.fn();
  const dismiss = vi.fn();
  const updateEvent = vi.fn();
  const event = {
    publicId: 'event-1',
    clientName: 'Nino',
    eventType: EventType.WEDDING,
    date: '2026-10-06',
    totalCost: 100,
    guestCount: 10,
    location: EventLocation.HOTEL,
    status: EventStatus.CONFIRMED,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [EditEventDialog],
      providers: [
        { provide: NgbActiveModal, useValue: { close, dismiss } },
        { provide: EventService, useValue: { updateEvent } },
      ],
    });
  });

  async function setup() {
    const fixture = TestBed.createComponent(EditEventDialog);
    fixture.componentInstance.event = { ...event };
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance };
  }

  it('prefills the event and submits only the update request fields', async () => {
    const { component } = await setup();
    component.eventForm.patchValue({ guestCount: 20 });
    expect(event.guestCount).toBe(10);
    updateEvent.mockResolvedValue(event);
    await component.save();
    expect(updateEvent).toHaveBeenCalledWith({
      ...component.eventForm.getRawValue(),
      publicId: event.publicId,
    });
    expect(updateEvent.mock.calls[0][0]).not.toHaveProperty('clientName');
    expect(close).toHaveBeenCalledWith('Event saved.');
  });

  it('blocks unchanged values and disables saving again when edits are reverted', async () => {
    const { component, fixture } = await setup();
    const saveButton = () =>
      fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(saveButton().disabled).toBe(true);
    await component.save();
    expect(updateEvent).not.toHaveBeenCalled();
    component.eventForm.patchValue({ guestCount: 20 });
    fixture.detectChanges();
    expect(saveButton().disabled).toBe(false);
    component.eventForm.patchValue({ guestCount: event.guestCount });
    component.eventForm.markAsDirty();
    fixture.detectChanges();
    expect(saveButton().disabled).toBe(true);
    await component.save();
    expect(updateEvent).not.toHaveBeenCalled();
  });
  it('rejects invalid dates, costs and fractional guests', async () => {
    const { component, fixture } = await setup();
    component.eventForm.patchValue({ date: '2026-02-30', totalCost: -1, guestCount: 1.5 });
    await component.save();
    fixture.detectChanges();
    expect(updateEvent).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('[role=alert]')).toHaveLength(3);
  });

  it('blocks duplicate saves and dismissal, and preserves edits after failure', async () => {
    const { component } = await setup();
    let reject!: (reason: Error) => void;
    updateEvent.mockReturnValue(
      new Promise((_, rejectRequest) => {
        reject = rejectRequest;
      }),
    );
    component.eventForm.patchValue({ guestCount: 20 });
    const pending = component.save();
    await component.save();
    component.close();
    expect(updateEvent).toHaveBeenCalledTimes(1);
    expect(dismiss).not.toHaveBeenCalled();
    reject(new Error('Failed'));
    await pending;
    expect(close).not.toHaveBeenCalled();
    expect(component.submissionError()).toBeTruthy();
    expect(component.isSubmitting()).toBe(false);
    expect(component.eventForm.controls.guestCount.value).toBe(20);
    component.close();
    expect(dismiss).toHaveBeenCalledOnce();
  });
  it.each([EventStatus.COMPLETED, EventStatus.CANCELLED, EventStatus.REJECTED])(
    'blocks saving an event already marked %s even when its form status changes',
    async (status) => {
      const { component, fixture } = await setup();
      component.event = { ...event, status };
      component.eventForm.patchValue({ guestCount: 20, status: EventStatus.CONFIRMED });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
      await component.save();
      expect(updateEvent).not.toHaveBeenCalled();
    },
  );

  it.each([EventStatus.COMPLETED, EventStatus.CANCELLED, EventStatus.REJECTED])(
    'allows an active event to transition to %s',
    async (status) => {
      const { component, fixture } = await setup();
      component.eventForm.patchValue({ status });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
      updateEvent.mockResolvedValue({ ...event, status });
      await component.save();
      expect(updateEvent).toHaveBeenCalledOnce();
    },
  );

  it('keeps the editor open during submission and permits dismissal afterwards', () => {
    const fixture = TestBed.createComponent(EditEventDialog);
    const component = fixture.componentInstance;
    const dismissModal = vi.spyOn(TestBed.inject(NgbActiveModal), 'dismiss');
    component.isSubmitting.set(true);
    component.close();
    expect(dismissModal).not.toHaveBeenCalled();
    component.isSubmitting.set(false);
    component.close();
    expect(dismissModal).toHaveBeenCalledOnce();
  });
});
