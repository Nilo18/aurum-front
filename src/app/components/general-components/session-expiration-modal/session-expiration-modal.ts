import { Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeRole } from '../../../services/employee-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-expiration-modal',
  imports: [],
  templateUrl: './session-expiration-modal.html',
  styleUrl: './session-expiration-modal.scss',
})
export class SessionExpirationModal {
  private modal = inject(NgbActiveModal);
  private router = inject(Router);
  role: EmployeeRole | null = null;
  redirecting = signal(false);
  redirectFailed = signal(false);

  async redirectUser() {
    if (this.redirecting()) return;

    this.redirecting.set(true);
    this.redirectFailed.set(false);

    try {
      localStorage.removeItem('auth_token');
      const destination = this.role === EmployeeRole.DEMO ? '/' : '/staff-login';
      const navigated = await this.router.navigate([destination], { replaceUrl: true });

      if (navigated) {
        this.modal.close();
      } else {
        this.redirectFailed.set(true);
      }
    } catch {
      this.redirectFailed.set(true);
    } finally {
      this.redirecting.set(false);
    }
  }
}
