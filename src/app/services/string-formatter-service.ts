import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StringFormatterService {
  human(value: unknown): string {
    const text = String(value ?? '');
    return text.includes('_') || text === text.toUpperCase()
      ? text
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/^./, (character) => character.toUpperCase())
      : text;
  }
  currency(value: unknown): string {
    return (
      '₾ ' +
      Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  }
}
