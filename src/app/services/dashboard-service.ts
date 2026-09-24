import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { firstValueFrom } from 'rxjs';

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

  async getDashboardData() {
    try {
      const res = await firstValueFrom(this.http.get<DashboardGetResponse>(`${this.baseUrl}/api/dashboard`))
      console.log(res)
      return res
    } catch (error) {
      console.log("Couldn't get dashboard data: ", error)
      throw error
    }
  }
}
