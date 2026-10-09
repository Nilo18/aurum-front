import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';

export interface DashboardEventDTO {
  eventType: string; // or a union/enum type matching Event.EventType
  date: string; // ISO date string, e.g. "2026-09-08"
  guestCount: number;
  clientName: string;
}

export interface DashboardGetResponse {
  eventCount: number;
  awaitingReviewCount: number;
  portfolioValue: number;
  employeeCount: number;
  eventsInPreparation: DashboardEventDTO[];
  clientCount: number;
  vehicleCount: number;
  productCount: number;
  supplierCount: number;
  menuCount: number;
  feedbackCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private backendUrlHolder = inject(BackendUrlHolderService);
  private baseUrl = this.backendUrlHolder.getBaseUrl();
  private http = inject(HttpClient);

  getDashboardData() {
    return this.http.get<DashboardGetResponse>(`${this.baseUrl}/api/dashboard`);
  }
}
