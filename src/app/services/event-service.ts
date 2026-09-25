import { inject, Injectable, signal } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ClientType } from '../components/request-event-components/event-request-form/event-request.models';
import { firstValueFrom } from 'rxjs';
import { GenericResponse, OtpResponse } from './home-service';

export interface ClientDTO {
  clientType: ClientType;
  name: string;
  email: string;
  phone: string;
}

export interface EventCreationRequest {
  eventType: string;
  date: string;         // ISO-8601 Date string format: "YYYY-MM-DD"
  totalCost?: number;   // BigDecimal maps to number (optional since it can be null)
  guestCount: number;
  location: string;
  notes?: string;       // Optional field matching nullable Java String
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
  REQUESTED = "REQUESTED",
  PLANNING = "PLANNING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

export enum EventType {
  WEDDING = "WEDDING",
  CORPORATE_EVENT = "CORPORATE_EVENT",
  CONFERENCE = "CONFERENCE",
  OFFICIAL_RECEPTION = "OFFICIAL_RECEPTION",
  ANNIVERSARY = "ANNIVERSARY",
  BIRTHDAY = "BIRTHDAY",
  GALA_DINNER = "GALA_DINNER",
  PRODUCT_LAUNCH = "PRODUCT_LAUNCH",
  PRIVATE_PARTY = "PRIVATE_PARTY",
  OTHER = "OTHER"
}

export enum EventLocation {
  AURUM_BANQUET_HALL = "AURUM_BANQUET_HALL",
  AURUM_CONFERENCE_HALL = "AURUM_CONFERENCE_HALL",
  PRIVATE_RESIDENCE = "PRIVATE_RESIDENCE",
  PARTNER_VENUE = "PARTNER_VENUE",
  HOTEL = "HOTEL",
  RESTAURANT = "RESTAURANT",
  OUTDOOR_VENUE = "OUTDOOR_VENUE",
  HISTORICAL_VENUE = "HISTORICAL_VENUE",
  CORPORATE_OFFICE = "CORPORATE_OFFICE",
  OTHER = "OTHER"
}

export interface EventDTO {
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
  eventTo?: string;   // ISO თარიღის ფორმატი "YYYY-MM-DD"
  location?: EventLocation;
  status?: EventStatus;
  sortBy?: string;
  sortDirection?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private backendUrlHolder = inject(BackendUrlHolderService)
  private baseUrl = this.backendUrlHolder.getBaseUrl()
  private http = inject(HttpClient)
  private eventQuery = signal<EventQuery>(
    {
      page: 0,
      size: 10,
      sortBy: "",
      sortDirection: "",
      search: ""
    }
  )

  async verifyCreateEventRequest(email: string) {
    try {
      const res = await firstValueFrom(this.http.post<OtpResponse>(`${this.baseUrl}/api/event/verify`, { email }))
      console.log(res)
      return res;
    } catch (error) {
      console.log("Couldn't verify event creation: ", error)
      throw error;
    }
  }

  async createEvent(request: EventOrderRequest) {
    try {
      const res = await firstValueFrom(this.http.post<GenericResponse>(`${this.baseUrl}/api/event`, request))
      console.log(res)
      return res;
    } catch (error) {
      console.log("Couldn't create event: ", error)
      throw error;
    }
  }

  async getEvents(query: EventQuery) {
    try {
      const cleanedQuery = this.removeEmptyProperties(query);
      const httpParams = new HttpParams({ fromObject: cleanedQuery });
      const res = await firstValueFrom(this.http.get<PageResponse<EventDTO>>(`${this.baseUrl}/api/event/verify`, 
        {
          params: httpParams
        }
      ))
      console.log(res)
      return res;
    } catch (error) {
      console.log("Couldn't verify event creation: ", error)
      throw error;
    }
  }

  private removeEmptyProperties(obj: any): any {
    const result: any = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        result[key] = String(obj[key]);
      }
    });
    return result;
  }
}