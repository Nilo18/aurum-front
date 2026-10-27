import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-feedback-form',
  imports: [ReactiveFormsModule],
  templateUrl: './feedback-form.html',
  styleUrl: './feedback-form.scss',
})
export class FeedbackForm {
  private formBuilder = inject(FormBuilder);
  readonly feedbackForm = this.formBuilder.nonNullable.group({
    author: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/\S/)]],
    comment_date: ['', Validators.required],
    rating: ['', [Validators.required, Validators.pattern(/^[1-5]$/)]],
    description: ['', [Validators.required, Validators.pattern(/\S/)]],
  });

  fieldInvalid(field: keyof typeof this.feedbackForm.controls) {
    const control = this.feedbackForm.controls[field];
    return control.touched && control.invalid;
  }
}
