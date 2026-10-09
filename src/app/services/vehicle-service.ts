import { inject, Injectable, signal } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { QueryFormatterService } from './query-formatter-service';

export interface VehicleQuery {
  page?: number;
  size?: number;
  type?: VehicleType;
  passengerFrom?: number;
  passengerTo?: number;
  weightFrom?: number;
  weightTo?: number;
  sortBy?: string;
  sortDirection?: string;
}

export enum VehicleType {
  TRUCK = 'TRUCK',
  PASSENGER_VEHICLE = 'PASSENGER_VEHICLE',
}

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private backendUrlHolder = inject(BackendUrlHolderService)
  private baseUrl = this.backendUrlHolder.getBaseUrl()
  private http = inject(HttpClient)
  private queryFormatter = inject(QueryFormatterService)
  private employeeQuery = signal<VehicleQuery>({
    page: 0,
    size: 10,
    sortBy: '',
    sortDirection: '',
  });

  getVehicles() {
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(this.employeeQuery());
    const httpParams = new HttpParams({ fromObject: cleanedQuery });
    return 
  }
}
