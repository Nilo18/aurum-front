import { HttpErrorResponse } from '@angular/common/http';
import { getRequestErrorMessage } from './request-error';
import { getAuthErrorMessage } from './auth-service';

describe('request error messages', () => {
  it('shows plain-text and structured backend errors', () => {
    for (const error of ['Invitation expired', { message: 'Invitation expired' }]) {
      expect(
        getRequestErrorMessage(new HttpErrorResponse({ status: 400, error }), 'Fallback'),
      ).toBe('Invitation expired');
      expect(getAuthErrorMessage(new HttpErrorResponse({ status: 400, error }), 'Fallback')).toBe(
        'Invitation expired',
      );
    }
  });
  it('provides useful fallbacks for connection errors and unexpected responses', () => {
    expect(getRequestErrorMessage(new HttpErrorResponse({ status: 0 }), 'Fallback')).toContain(
      'connection',
    );
    expect(
      getRequestErrorMessage(
        new HttpErrorResponse({ status: 500, error: 'Internal details' }),
        'Fallback',
      ),
    ).toContain('temporarily unavailable');
    expect(getRequestErrorMessage(new Error('Internal details'), 'Fallback')).toBe('Fallback');
  });
});
