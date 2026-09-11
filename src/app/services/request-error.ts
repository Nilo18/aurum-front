import { HttpErrorResponse } from '@angular/common/http';

export function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'Unable to connect. Check your connection and try again.';
  if (error.status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (error.status >= 500) return 'The service is temporarily unavailable. Please try again later.';
  const message = typeof error.error === 'string' ? error.error : error.error?.message;
  return typeof message === 'string' && message.trim() ? message.trim() : fallback;
}
