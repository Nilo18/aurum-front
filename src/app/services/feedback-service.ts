import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { QueryFormatterService } from './query-formatter-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GenericResponse } from './home-service';
import { PageResponse } from './event-service';

export interface CreateFeedbackRequest {
  tokenHash: string;
  author: string;
  // commentDate: string;
  rating: number;
  description: string;
}

export interface FeedbackDTO {
  publicId: string;
  author: string;
  commentDate: string;
  rating: number;
  description: string;
}

export interface FeedbackQuery {
  page?: number;
  size?: number;
  ratingFrom?: 1 | 2 | 3 | 4 | 5;
  ratingTo?: 1 | 2 | 3 | 4 | 5;
  commentFrom?: string;
  commentTo?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: '' | 'ASC' | 'DESC';
}

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
        this.http.post<GenericResponse>(`${this.baseUrl}/api/feedback/verify-invitation`, {
          token,
        }),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't validate invitation: ", error);
      throw error;
    }
  }

  async createFeedback(request: CreateFeedbackRequest) {
    try {
      const res = await firstValueFrom(
        this.http.post<FeedbackDTO>(`${this.baseUrl}/api/feedback`, request),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't create feedback: ", error);
      throw error;
    }
  }

  deleteFeedback(publicId: string) {
    return firstValueFrom(
      this.http.delete<GenericResponse>(
        `${this.baseUrl}/api/feedback/${encodeURIComponent(publicId)}`,
      ),
    );
  }

  getAllFeedback(query: FeedbackQuery) {
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(query);
    const params = new HttpParams({ fromObject: cleanedQuery });
    const res = this.http.get<PageResponse<FeedbackDTO>>(`${this.baseUrl}/api/feedback`, {
      params,
    });
    return res;
  }
}
