import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PageResponse } from './event-service';
import { QueryFormatterService } from './query-formatter-service';
import { GenericResponse } from './home-service';

export enum ClientType {
  PERSON = 'PERSON',
  ORGANIZATION = 'ORGANIZATION',
}

export interface ClientDTO {
  clientType: ClientType;
  name: string;
  email: string;
  phone: string;
}

export interface ClientQuery {
  page?: number;
  size?: number;
  search?: string;
  type?: ClientType;
  sortBy?: string;
  sortDirection?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private backendUrlHolder = inject(BackendUrlHolderService);
  private baseUrl = this.backendUrlHolder.getBaseUrl();
  private http = inject(HttpClient);
  private queryFormatter = inject(QueryFormatterService);

  getClients(query: ClientQuery) {
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(query);
    const params = new HttpParams({ fromObject: cleanedQuery });
    return this.http.get<PageResponse<ClientDTO>>(`${this.baseUrl}/api/client`, { params });
  }

  deleteClient(email: string) {
    return firstValueFrom(
      this.http.delete<GenericResponse>(`${this.baseUrl}/api/client`, { body: { email } }),
    );
  }
}
