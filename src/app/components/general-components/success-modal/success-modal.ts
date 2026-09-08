import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-success-modal',
  imports: [],
  templateUrl: './success-modal.html',
  styleUrl: './success-modal.scss',
})
export class SuccessModal {
  private modal = inject(NgbActiveModal)
  title = 'Request successful';
  msg = 'Your request has been completed successfully.';
  buttonLabel = 'Done';

  close() {
    this.modal.close();
  }
}
