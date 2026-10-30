import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeedbackQuery } from '../../../services/feedback-service';
@Component({
  selector: 'app-feedback-filtering',
  imports: [FormsModule],
  templateUrl: './feedback-filtering.html',
  styleUrl: './feedback-filtering.scss',
})
export class FeedbackFiltering {
  readonly query = input<FeedbackQuery>({});
  readonly disabled = input(false);
  readonly ratings = [1, 2, 3, 4, 5];
  readonly changed = output<Partial<FeedbackQuery>>();
}
