import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  EventDTO,
  EventLocation,
  EventService,
  EventStatus,
  EventType,
} from '../../../services/event-service';
import { FormValidatorService } from '../../../services/form-validator-service';
import { StringFormatterService } from '../../../services/string-formatter-service';
import { getRequestErrorMessage } from '../../../services/request-error';

@Component({
  selector: 'app-edit-event-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-event-dialog.html',
  styleUrl: './edit-event-dialog.scss',
})
export class EditEventDialog implements OnInit {
  readonly modal = inject(NgbActiveModal);
  private readonly service = inject(EventService);
  private readonly fb = inject(FormBuilder);
  readonly formValidator = inject(FormValidatorService);
  readonly stringFormatter = inject(StringFormatterService);
  readonly eventTypes = Object.values(EventType);
  readonly locations = Object.values(EventLocation);
  readonly statuses = Object.values(EventStatus);
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  event!: EventDTO;
  readonly eventForm = this.fb.nonNullable.group({
    eventType: [EventType.OTHER, Validators.required],
    date: ['', [Validators.required, this.formValidator.validDateValidator]],
    totalCost: [
      0,
      [Validators.required, Validators.min(0), this.formValidator.finiteNumberValidator],
    ],
    guestCount: [
      1,
      [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^\d+$/),
        this.formValidator.finiteNumberValidator,
      ],
    ],
    location: [EventLocation.OTHER, Validators.required],
    status: [EventStatus.REQUESTED, Validators.required],
  });

  private readonly formValues = toSignal(
    this.eventForm.valueChanges.pipe(map(() => this.eventForm.getRawValue())),
    { initialValue: this.eventForm.getRawValue() },
  );

  ngOnInit(): void {
    this.eventForm.patchValue(this.event);
  }

  hasChanges(): boolean {
    const values = this.formValues();
    return (Object.keys(values) as (keyof typeof values)[]).some(
      (field) => values[field] !== this.event[field],
    );
  }

  close(): void {
    if (!this.isSubmitting()) this.modal.dismiss();
  }

  async save(): Promise<void> {
    if (this.isSubmitting() || !this.hasChanges()) return;
    this.submissionError.set('');
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    try {
      const response = await this.service.updateEvent({
        ...this.eventForm.getRawValue(),
        publicId: this.event.publicId,
      });
      if (!response?.publicId) {
        this.submissionError.set('The event could not be saved. Please try again.');
        return;
      }
      this.modal.close('Event saved.');
    } catch (error) {
      this.submissionError.set(
        getRequestErrorMessage(error, 'The event could not be saved. Please try again.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
