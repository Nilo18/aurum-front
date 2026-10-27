import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { QueryFormatterService } from './query-formatter-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GenericResponse } from './home-service';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private backendUrlHolder = inject(BackendUrlHolderService);
  private queryFormatter = inject(QueryFormatterService);
  private baseUrl = this.backendUrlHolder.getBaseUrl();
  private http = inject(HttpClient);

  async validateInvitation(token: string) {
    try {
      const res = await firstValueFrom(
        this.http.post<GenericResponse>(`${this.baseUrl}/api/feedback/verify-invitation`, { token }),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't validate invitation: ", error);
      throw error;
    }
  }
}
