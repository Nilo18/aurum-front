import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient } from '@angular/common/http';
import { ClientType } from '../components/request-event-components/event-request-form/event-request.models';
import { firstValueFrom } from 'rxjs';
import { GenericResponse, OtpResponse } from './home-service';

export interface ClientDTO {
  clientType: ClientType;
  name: string;
  email: string;
  phone: string;
}

export interface EventDTO {
  eventType: string;
  date: string;         // ISO-8601 Date string format: "YYYY-MM-DD"
  totalCost?: number;   // BigDecimal maps to number (optional since it can be null)
  guestCount: number;
  location: string;
  notes?: string;       // Optional field matching nullable Java String
}

export interface EventOrderRequest {
  client: ClientDTO;
  event: EventDTO;
  menuItemIds: number[]; // Java List<Long> maps directly to number[]
  transactionKey: string;
  otp: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private backendUrlHolder = inject(BackendUrlHolderService)
  private baseUrl = this.backendUrlHolder.getBaseUrl()
  private http = inject(HttpClient)

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
}