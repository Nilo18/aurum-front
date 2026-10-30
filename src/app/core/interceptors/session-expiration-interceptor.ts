import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionExpirationModal } from '../../components/general-components/session-expiration-modal/session-expiration-modal';

export const sessionExpirationInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const modal = inject(NgbModal);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const role = authService.getRole();

        const modalRef = modal.open(SessionExpirationModal, {
          centered: true,
          windowClass: 'aurum-session-expiration-modal',
          ariaLabelledBy: 'session-expiration-title',
          ariaDescribedBy: 'session-expiration-message',
          backdrop: 'static',
          keyboard: false,
          beforeDismiss: () => false,
        });

        modalRef.componentInstance.role = role;
      }

      return throwError(() => error);
    }),
  );
};
