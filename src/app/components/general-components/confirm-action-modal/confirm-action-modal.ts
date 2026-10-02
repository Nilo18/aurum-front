import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-action-modal',
  imports: [],
  templateUrl: './confirm-action-modal.html',
  styleUrl: './confirm-action-modal.scss',
})
export class ConfirmActionModal {
  readonly modal = inject(NgbActiveModal);
  title = 'Confirm action';
  msg = 'Are you sure you want to continue?';
}
