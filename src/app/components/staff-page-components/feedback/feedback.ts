import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FeedbackDTO, FeedbackQuery, FeedbackService } from '../../../services/feedback-service';
import { getRequestErrorMessage } from '../../../services/request-error';
import { FeedbackSorting } from '../feedback-sorting/feedback-sorting';
import { FeedbackFiltering } from '../feedback-filtering/feedback-filtering';
import { FeedbackPagination } from '../feedback-pagination/feedback-pagination';
import { FeedbackDetailsModal } from '../feedback-details-modal/feedback-details-modal';

@Component({
  selector: 'app-feedback',
  imports: [DatePipe, FormsModule, FeedbackSorting, FeedbackFiltering, FeedbackPagination],
  templateUrl: './feedback.html',
  styleUrl: './feedback.scss',
})
export class Feedback {
  private readonly feedbackService = inject(FeedbackService);
  private readonly modal = inject(NgbModal);
  readonly feedbackQuery = signal<FeedbackQuery>({
    page: 0,
    size: 10,
    search: '',
    sortBy: '',
    sortDirection: '',
  });
  readonly feedbacks = rxResource({
    params: () => this.feedbackQuery(),
    stream: ({ params }) => this.feedbackService.getAllFeedback(params),
  });
  readonly page = computed(() => (this.feedbacks.hasValue() ? this.feedbacks.value() : undefined));
  readonly deleting = signal<string | undefined>(undefined);
  readonly busy = computed(() => this.feedbacks.isLoading() || this.deleting() !== undefined);
  readonly loadError = computed(() =>
    this.feedbacks.error()
      ? getRequestErrorMessage(this.feedbacks.error(), 'Unable to load feedback. Please try again.')
      : '',
  );
  readonly deleteError = signal('');
  readonly notice = signal('');

  updateQuery(changes: Partial<FeedbackQuery>, resetPage = true) {
    this.feedbackQuery.update((query) => ({
      ...query,
      ...changes,
      ...(resetPage ? { page: 0 } : {}),
    }));
  }

  clearFilters() {
    this.feedbackQuery.set({
      page: 0,
      size: this.feedbackQuery().size,
      search: '',
      sortBy: '',
      sortDirection: '',
    });
  }

  open(feedback: FeedbackDTO) {
    if (this.busy()) return;
    const ref = this.modal.open(FeedbackDetailsModal, {
      centered: true,
      ariaLabelledBy: 'feedback-details-title',
    });
    ref.componentInstance.feedback = feedback;
    void ref.result.catch(() => {});
  }

  async deleteFeedback(publicId: string): Promise<void> {
    if (this.busy()) return;
    this.deleting.set(publicId);
    this.deleteError.set('');
    this.notice.set('');
    try {
      const response = await this.feedbackService.deleteFeedback(publicId);
      if (response && (response.status < 200 || response.status >= 300)) {
        this.deleteError.set(response.message || 'Unable to delete feedback. Please try again.');
        return;
      }
      this.notice.set('Feedback deleted.');
      const page = this.page();
      if (page?.content.length === 1 && page.pageNumber > 0) {
        this.updateQuery({ page: page.pageNumber - 1 }, false);
      } else {
        this.feedbacks.reload();
      }
    } catch (error) {
      this.deleteError.set(
        getRequestErrorMessage(error, 'Unable to delete feedback. Please try again.'),
      );
    } finally {
      this.deleting.set(undefined);
    }
  }
}
