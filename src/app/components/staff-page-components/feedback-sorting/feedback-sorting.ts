import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeedbackQuery } from '../../../services/feedback-service';
@Component({
  selector: 'app-feedback-sorting',
  imports: [FormsModule],
  templateUrl: './feedback-sorting.html',
  styleUrl: './feedback-sorting.scss',
})
export class FeedbackSorting {
  readonly query = input<FeedbackQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<FeedbackQuery, 'sortBy' | 'sortDirection'>>();
  sort(field: string, direction: FeedbackQuery['sortDirection']) {
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : '' });
  }
}
