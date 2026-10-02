import { inject, Injectable, signal } from '@angular/core';
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
  private clientQuery = signal<ClientQuery>({
    page: 0,
    size: 10,
    search: '',
    sortBy: '',
    sortDirection: '',
  });

  getClientQuery() {
    return this.clientQuery.asReadonly();
  }

  searchClients(search: string) {
    this.clientQuery.update((query) => ({
      ...query,
      search: search,
      page: 0,
    }));

    return this.getClients();
  }

  filterClients(type?: ClientType) {
    this.clientQuery.update((query) => ({
      ...query,
      type: type,
      page: 0,
    }));

    return this.getClients();
  }

  sortClients(sortBy: string, sortDirection: string) {
    this.clientQuery.update((query) => ({
      ...query,
      page: 0,
      sortBy: sortBy,
      sortDirection: sortDirection,
    }));

    return this.getClients();
  }

  paginateClients(pageNumber: number, size?: number) {
    this.clientQuery.update((query) => ({
      ...query,
      page: pageNumber,
      size: size ?? query.size,
    }));

    return this.getClients();
  }

  async getClients() {
    try {
      const cleanedQuery = this.queryFormatter.removeEmptyProperties(this.clientQuery());
      const httpParams = new HttpParams({ fromObject: cleanedQuery });
      const res = await firstValueFrom(
        this.http.get<PageResponse<ClientDTO>>(`${this.baseUrl}/api/client`, {
          params: httpParams,
        }),
      );
      return res;
    } catch (error) {
      console.log("Couldn't get clients: ", error);
      throw error;
    }
  }

  deleteClient(email: string) {
    return firstValueFrom(
      this.http.delete<GenericResponse>(`${this.baseUrl}/api/client`, { body: { email } }),
    );
  }
}
