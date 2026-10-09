import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient, HttpParams } from '@angular/common/http';
// import { ClientType } from '../components/request-event-components/event-request-form/event-request.models';
import { firstValueFrom } from 'rxjs';
import { GenericResponse, OtpResponse } from './home-service';
import { ClientDTO } from './client-service';
import { QueryFormatterService } from './query-formatter-service';

export interface EventCreationRequest {
  eventType: string;
  date: string; // ISO-8601 Date string format: "YYYY-MM-DD"
  totalCost?: number; // BigDecimal maps to number (optional since it can be null)
  guestCount: number;
  location: string;
  notes?: string; // Optional field matching nullable Java String
}

export interface EventOrderRequest {
  client: ClientDTO;
  event: EventCreationRequest;
  menuItemIds: number[]; // Java List<Long> maps directly to number[]
  transactionKey: string;
  otp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
}

export enum EventStatus {
  REQUESTED = 'REQUESTED',
  PLANNING = 'PLANNING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum EventType {
  WEDDING = 'WEDDING',
  CORPORATE_EVENT = 'CORPORATE_EVENT',
  CONFERENCE = 'CONFERENCE',
  OFFICIAL_RECEPTION = 'OFFICIAL_RECEPTION',
  ANNIVERSARY = 'ANNIVERSARY',
  BIRTHDAY = 'BIRTHDAY',
  GALA_DINNER = 'GALA_DINNER',
  PRODUCT_LAUNCH = 'PRODUCT_LAUNCH',
  PRIVATE_PARTY = 'PRIVATE_PARTY',
  OTHER = 'OTHER',
}

export enum EventLocation {
  AURUM_BANQUET_HALL = 'AURUM_BANQUET_HALL',
  AURUM_CONFERENCE_HALL = 'AURUM_CONFERENCE_HALL',
  PRIVATE_RESIDENCE = 'PRIVATE_RESIDENCE',
  PARTNER_VENUE = 'PARTNER_VENUE',
  HOTEL = 'HOTEL',
  RESTAURANT = 'RESTAURANT',
  OUTDOOR_VENUE = 'OUTDOOR_VENUE',
  HISTORICAL_VENUE = 'HISTORICAL_VENUE',
  CORPORATE_OFFICE = 'CORPORATE_OFFICE',
  OTHER = 'OTHER',
}

export interface EventDTO {
  id: number;
  clientName: string;
  eventType: EventType;
  date: string;
  totalCost: number;
  guestCount: number;
  location: EventLocation;
  status: EventStatus;
}

export interface EventQuery {
  page?: number;
  size?: number;
  eventType?: EventType;
  costFrom?: number;
  costTo?: number;
  guestFrom?: number;
  guestTo?: number;
  eventFrom?: string; // ISO თარიღის ფორმატი "YYYY-MM-DD"
  eventTo?: string; // ISO თარიღის ფორმატი "YYYY-MM-DD"
  location?: EventLocation;
  status?: EventStatus;
  sortBy?: string;
  sortDirection?: string;
  search?: string;
}

export type EventFilterKey = Exclude<
  keyof EventQuery,
  'page' | 'size' | 'sortBy' | 'sortDirection' | 'search'
>;

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private backendUrlHolder = inject(BackendUrlHolderService);
  private baseUrl = this.backendUrlHolder.getBaseUrl();
  private http = inject(HttpClient);
  private queryFormatter = inject(QueryFormatterService);

  async verifyCreateEventRequest(email: string) {
    try {
      const res = await firstValueFrom(
        this.http.post<OtpResponse>(`${this.baseUrl}/api/event/verify`, { email }),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't verify event creation: ", error);
      throw error;
    }
  }

  async createEvent(request: EventOrderRequest) {
    try {
      const res = await firstValueFrom(
        this.http.post<GenericResponse>(`${this.baseUrl}/api/event`, request),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't create event: ", error);
      throw error;
    }
  }

  getEvents(query: EventQuery) {
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(query);
    const params = new HttpParams({ fromObject: cleanedQuery });
    return this.http.get<PageResponse<EventDTO>>(`${this.baseUrl}/api/event`, { params });
  }

  async deleteEvent(id: number) {
    try {
      const res = await firstValueFrom(
        this.http.delete<GenericResponse>(`${this.baseUrl}/api/event/${id}`),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't delete event: ", error);
      throw error;
    }
  }
}
