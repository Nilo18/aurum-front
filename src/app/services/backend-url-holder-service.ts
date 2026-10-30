import { DOCUMENT, inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BackendUrlHolderService {
  private document = inject(DOCUMENT)
  private baseUrl = 'http://localhost:8080'
  private apiUrl = 'https://aurumback-6vsnq1ur.back4.app'

  isLocalHost() {
    return this.document.location.hostname === 'localhost' || this.document.location.hostname === '127.0.0.1'
  }

  getBaseUrl() {
    return this.isLocalHost()? this.baseUrl : this.apiUrl
  }
}
