import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FeedbackDTO } from '../../../services/feedback-service';
@Component({
  selector: 'app-feedback-details-modal',
  imports: [DatePipe],
  templateUrl: './feedback-details-modal.html',
  styleUrl: './feedback-details-modal.scss',
})
export class FeedbackDetailsModal {
  readonly modal = inject(NgbActiveModal);
  feedback?: FeedbackDTO;
}
