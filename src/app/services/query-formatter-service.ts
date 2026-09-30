import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QueryFormatterService {
  removeEmptyProperties(obj: any): any {
    const result: any = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        result[key] = String(obj[key]);
      }
    });
    return result;
  }
}
