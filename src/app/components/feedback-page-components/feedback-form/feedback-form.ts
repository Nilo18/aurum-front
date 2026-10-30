import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateFeedbackRequest, FeedbackService } from '../../../services/feedback-service';
import { getRequestErrorMessage } from '../../../services/request-error';

@Component({
  selector: 'app-feedback-form',
  imports: [ReactiveFormsModule],
  templateUrl: './feedback-form.html',
  styleUrl: './feedback-form.scss',
})
export class FeedbackForm {
  private formBuilder = inject(FormBuilder);
  private feedbackService = inject(FeedbackService);
  tokenHash = input.required<string>();
  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');
  readonly feedbackForm = this.formBuilder.nonNullable.group({
    tokenHash: ['', [Validators.required]],
    author: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/\S/)]],
    // commentDate: ['', Validators.required],
    rating: ['', [Validators.required, Validators.pattern(/^[1-5]$/)]],
    description: ['', [Validators.required, Validators.pattern(/\S/)]],
  });

  ngOnInit() {
    this.feedbackForm.patchValue({ tokenHash: this.tokenHash() });
  }

  fieldInvalid(field: keyof typeof this.feedbackForm.controls) {
    const control = this.feedbackForm.controls[field];
    return control.touched && control.invalid;
  }

  async createFeedback(): Promise<void> {
    if (this.isSubmitting() || this.submitted()) return;
    this.errorMessage.set('');
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    const values = this.feedbackForm.getRawValue();
    const request: CreateFeedbackRequest = { ...values, rating: Number(values.rating) };
    this.isSubmitting.set(true);
    try {
      await this.feedbackService.createFeedback(request);
      this.submitted.set(true);
    } catch (error) {
      this.errorMessage.set(
        getRequestErrorMessage(error, 'We could not send your feedback. Please try again.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
