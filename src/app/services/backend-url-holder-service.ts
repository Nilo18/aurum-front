import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BackendUrlHolderService {
  private baseUrl = 'http://localhost:8080'

  getBaseUrl() {
    return this.baseUrl
  }
}
