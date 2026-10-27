import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FeedbackService } from '../../services/feedback-service';
import { FeedbackForm } from '../../components/feedback-page-components/feedback-form/feedback-form';
import { LoaderComponent } from '../../components/general-components/loader-component/loader-component';

@Component({
  selector: 'app-feedback',
  imports: [LoaderComponent, FeedbackForm],
  templateUrl: './feedback.html',
  styleUrl: './feedback.scss',
})
export class Feedback {
  private route = inject(ActivatedRoute);
  private feedbackService = inject(FeedbackService);
  private destroyRef = inject(DestroyRef);
  private validationRequest = 0;
  readonly validating = signal(true);
  readonly validationFailed = signal(false);
  readonly validationErrorMsg = signal('');
  token: string | null = null;

  ngOnInit() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.token = params.get('token');
      void this.validateInvitation();
    });
  }

  async validateInvitation() {
    const request = ++this.validationRequest;
    this.validating.set(true);
    this.validationFailed.set(false);
    this.validationErrorMsg.set('');

    try {
      if (!this.token?.trim()) {
        throw new Error(
          'Your invitation link is missing. Please open the complete feedback link from your invitation email, or contact your event organizer for a new invitation.',
        );
      }
      const response = await this.feedbackService.validateInvitation(this.token);
      if (request !== this.validationRequest || this.destroyRef.destroyed) return;
      if (response.status !== 200) {
        throw new Error(response.message || 'This feedback invitation could not be verified.');
      }
    } catch (error: unknown) {
      if (request !== this.validationRequest || this.destroyRef.destroyed) return;
      const backend = (error as { error?: { error?: unknown; message?: unknown } })?.error;
      const message = backend?.error || backend?.message;
      this.validationErrorMsg.set(
        typeof message === 'string' && message.trim()
          ? message
          : error instanceof Error && error.message && !('status' in error)
            ? error.message
            : 'We couldn’t verify your invitation. Please try again or contact your event organizer for a new link.',
      );
      this.validationFailed.set(true);
    } finally {
      if (request === this.validationRequest && !this.destroyRef.destroyed) {
        this.validating.set(false);
      }
    }
  }
}
